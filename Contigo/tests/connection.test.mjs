import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import vm from "node:vm"
import ts from "typescript"

function loadSource(name, dependencies = {}) {
  const source = readFileSync(
    new URL(`../src/${name}.ts`, import.meta.url),
    "utf8",
  )
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    require: (path) => dependencies[path],
  })
  return exports
}
const journey = loadSource("journey")
const connection = loadSource("connection", { "./journey": journey })

test("another step visits every available function once and wraps to the start", () => {
  let step = "message"
  const visited = []
  for (let index = 0; index < connection.CONNECTION_STEPS.length; index++) {
    visited.push(step)
    step = connection.nextConnectionStep(step)
  }
  assert.equal(new Set(visited).size, 5)
  assert.deepEqual(visited, Array.from(connection.CONNECTION_STEPS))
  assert.equal(step, "message")
  assert.equal(
    connection.connectionStepContent("received").tile,
    "Ver mensajes de cuidado",
  )
  assert.equal(
    connection.connectionStepContent("message").tile,
    "Escribir mensaje para tejer cercanía",
  )
})

test("all person-specific actions require the exact active association at launch", () => {
  const state = journey.createDemoJourney()
  const snapshot = JSON.stringify(state)
  for (const action of ["message", "contact", "meeting"]) {
    assert.equal(
      connection.connectionLaunch(state, "demo-m", action).personId,
      "demo-m",
    )
    for (const id of [
      "demo-alex",
      "demo-carmen",
      "demo-lu",
      "demo-sam",
      "missing",
    ])
      assert.equal(connection.connectionLaunch(state, id, action), null)
    const revoked = {
      ...state,
      associations: state.associations.map((item) => ({
        ...item,
        active: false,
      })),
    }
    assert.equal(connection.connectionLaunch(revoked, "demo-m", action), null)
    const otherPcs = {
      ...state,
      associations: state.associations.map((item) => ({
        ...item,
        pcsId: "another-pcs",
      })),
    }
    assert.equal(connection.connectionLaunch(otherPcs, "demo-m", action), null)
  }
  assert.equal(connection.connectionLaunch(state, "demo-m", "received"), null)
  assert.equal(JSON.stringify(state), snapshot)
})
