import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import vm from "node:vm"
import ts from "typescript"

function loadSource(name, dependencies = {}) {
  const source = readFileSync(new URL(`../src/${name}.ts`, import.meta.url), "utf8")
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText
  const exports = {}
  vm.runInNewContext(compiled, { exports, require: (path) => dependencies[path] })
  return exports
}
const journey = loadSource("journey")
const { caregiverContext, simulateCaregiverLink, DEMO_CAREGIVER } = loadSource("caregiver", { "./journey": journey })

test("caregiver access requires acceptance and the exact active caregiver/PCS/person association", () => {
  const linked = simulateCaregiverLink(journey.EMPTY_JOURNEY, "active")
  const context = caregiverContext(linked, DEMO_CAREGIVER.id)
  assert.equal(context.pcsName, "Sofía")
  assert.equal(context.caregiverName, "Marta")
  assert.equal(caregiverContext(linked, "another-caregiver"), null)
  for (const change of [{ pcsId: "another-pcs" }, { caregiverId: "another-caregiver" }, { personId: "another-person" }, { active: false }]) {
    const altered = { ...linked, associations: linked.associations.map((a) => ({ ...a, ...change })) }
    assert.equal(caregiverContext(altered, DEMO_CAREGIVER.id), null)
  }
  const pending = { ...linked, people: linked.people.map((p) => ({ ...p, invitationStatus: "pending" })) }
  assert.equal(caregiverContext(pending, DEMO_CAREGIVER.id), null)
})

test("empty, accepted-only, and revoked states cannot expose linked tools", () => {
  assert.equal(caregiverContext(journey.EMPTY_JOURNEY, DEMO_CAREGIVER.id), null)
  for (const mode of ["accepted-only", "revoked"]) {
    assert.equal(caregiverContext(simulateCaregiverLink(journey.EMPTY_JOURNEY, mode), DEMO_CAREGIVER.id), null)
  }
  const active = simulateCaregiverLink(journey.EMPTY_JOURNEY, "active")
  assert.equal(caregiverContext(simulateCaregiverLink(active, "revoked"), DEMO_CAREGIVER.id), null)
})

test("demo simulations preserve the existing PCS map and do not mutate their input", () => {
  const original = journey.createDemoJourney()
  const snapshot = JSON.stringify(original)
  let result = simulateCaregiverLink(original, "active")
  assert.equal(JSON.stringify(original), snapshot)
  assert.equal(result.onboardingStatus, original.onboardingStatus)
  assert.equal(result.selectedPersonId, original.selectedPersonId)
  for (const person of original.people) assert.equal(result.people.find((p) => p.id === person.id), person)
  for (const association of original.associations) assert.ok(result.associations.includes(association))
  result = simulateCaregiverLink(result, "accepted-only")
  result = simulateCaregiverLink(result, "active")
  assert.equal(result.people.filter((p) => p.caregiverId === DEMO_CAREGIVER.id).length, 1)
  assert.equal(result.associations.filter((a) => a.caregiverId === DEMO_CAREGIVER.id).length, 1)
})

test("switching caregiver identity resolves only that caregiver's association", () => {
  const result = simulateCaregiverLink(journey.createDemoJourney(), "active")
  assert.equal(caregiverContext(result, "caregiver-m").caregiverName, "M.")
  assert.equal(caregiverContext(result, "caregiver-carmen"), null)
  assert.equal(caregiverContext(result, DEMO_CAREGIVER.id).caregiverName, "Marta")
})
