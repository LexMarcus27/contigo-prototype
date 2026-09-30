import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import vm from "node:vm"
import ts from "typescript"

// Exercise the actual TypeScript source without adding a test-runner dependency.
function loadSource(name, dependencies = {}) {
  const source = readFileSync(new URL(`../src/${name}.ts`, import.meta.url), "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, { exports, require: (path) => dependencies[path] })
  return exports
}

const journey = loadSource("journey")
const notifications = loadSource("notifications", { "./journey": journey })
const { createRandomNotification, NOTIFICATION_TEMPLATES, notificationStyle } = notifications

test("five types, at most three examples each, and a warm questions subtype", () => {
  const types = new Set(NOTIFICATION_TEMPLATES.map((template) => template.type))
  assert.equal(types.size, 5)
  for (const type of types) {
    const count = NOTIFICATION_TEMPLATES.filter((template) => template.type === type).length
    assert.ok(count >= 2 && count <= 3)
  }
  const closeness = NOTIFICATION_TEMPLATES.find((template) => template.subtype === "closeness")
  assert.equal(closeness.type, "questions")
  assert.equal(notificationStyle(closeness).background, "#F8ECD4")
  assert.ok(NOTIFICATION_TEMPLATES.some((template) => template.showType))
  assert.ok(NOTIFICATION_TEMPLATES.some((template) => !template.showType))
  assert.equal(new Set([...types].map((type) => notificationStyle({ type }).background)).size, 5)
})

test("empty, pending, accepted-but-inactive, and revoked networks only get general reminders", () => {
  const demo = journey.createDemoJourney()
  const inactive = { ...demo, associations: demo.associations.map((association) => ({ ...association, active: false })) }
  const pending = { ...demo, people: demo.people.map((person) => ({ ...person, invitationStatus: "pending" })) }
  for (const state of [journey.EMPTY_JOURNEY, inactive, pending]) {
    for (let i = 0; i < 100; i++) {
      const notification = createRandomNotification(state)
      assert.equal(notification.type, "reminder")
      assert.equal(notification.personId, undefined)
      assert.ok(!notification.text.includes("XXX"))
    }
  }
})

test("every selected example replaces XXX with an active linked person", () => {
  const demo = journey.createDemoJourney()
  const seen = new Set()
  for (let typeIndex = 0; typeIndex < 5; typeIndex++) {
    for (const exampleRandom of [0, 0.4, 0.99]) {
      const values = [typeIndex / 5 + 0.01, exampleRandom, 0.99]
      const notification = createRandomNotification(demo, undefined, () => values.shift())
      seen.add(notification.id)
      assert.ok(!notification.text.includes("XXX"))
      if (notification.type !== "reminder") {
        assert.equal(notification.personId, "demo-m")
        assert.equal(notification.personName, "M.")
        assert.ok(journey.canStrengthenRelationship(demo, notification.personId))
        if (notification.action === "questions") assert.ok(notification.question)
      }
    }
  }
  assert.equal(seen.size, 11)
})

test("random selection can use either active person, never a pending or inactive one", () => {
  const demo = journey.createDemoJourney()
  demo.associations[1].active = true
  for (const [randomPerson, expectedPerson] of [[0, "demo-m"], [0.99, "demo-carmen"]]) {
    const values = [0.6, 0, randomPerson]
    const notification = createRandomNotification(demo, undefined, () => values.shift())
    assert.equal(notification.personId, expectedPerson)
  }
})

test("the previous template is not emitted again immediately", () => {
  const demo = journey.createDemoJourney()
  for (const template of NOTIFICATION_TEMPLATES) {
    for (const value of [0, 0.5, 0.99]) {
      assert.notEqual(createRandomNotification(demo, template.id, () => value).id, template.id)
    }
  }
})

test("all notification text and category labels have readable contrast", () => {
  const luminance = (hex) => {
    const rgb = hex.match(/[a-f\d]{2}/gi).map((channel) => parseInt(channel, 16) / 255)
      .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
  }
  for (const style of Object.values(notifications.NOTIFICATION_STYLES)) {
    for (const color of [style.accent, "#3A3238"]) {
      const values = [luminance(style.background), luminance(color)].sort((a, b) => b - a)
      const contrast = (values[0] + 0.05) / (values[1] + 0.05)
      assert.ok(contrast >= 4.5, `${style.label}: ${color} contrast ${contrast.toFixed(2)}`)
    }
  }
})
