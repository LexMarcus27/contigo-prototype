import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import vm from "node:vm"
import ts from "typescript"

const source = readFileSync(new URL("../src/safety-plan.ts", import.meta.url), "utf8")
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText
const safetyPlan = {}
vm.runInNewContext(compiled, { exports: safetyPlan })
const { createSafetyPlanDraft, safetyPlanHasInformation } = safetyPlan

test("a new plan has no saved sections, people, activities, or environment text", () => {
  const plan = createSafetyPlanDraft()
  assert.equal(plan.stepTexts.length, 4)
  assert.ok(plan.stepTexts.every(text => text === ""))
  assert.equal(plan.contacts.length, 0)
  assert.equal(plan.activities.length, 0)
  assert.equal(plan.environment, "")
  assert.equal(safetyPlanHasInformation(plan), false)
})

test("any saved part of an incomplete plan enables the return-to-plan action", () => {
  const empty = createSafetyPlanDraft()
  assert.equal(safetyPlanHasInformation({ ...empty, stepTexts: ["  ", "", "", ""], environment: "\n" }), false)
  for (let index = 0; index < 4; index++) {
    const stepTexts = [...empty.stepTexts]
    stepTexts[index] = "Información de prueba"
    assert.equal(safetyPlanHasInformation({ ...empty, stepTexts }), true)
  }
  assert.equal(safetyPlanHasInformation({ ...empty, contacts: [{ name: "Contacto de prueba", label: "", phone: "" }] }), true)
  assert.equal(safetyPlanHasInformation({ ...empty, activities: ["Actividad de prueba"] }), true)
  assert.equal(safetyPlanHasInformation({ ...empty, environment: "Información de prueba" }), true)
})

test("switching demo scenarios creates independent drafts without leaking example or edited data", () => {
  const example = createSafetyPlanDraft(true)
  assert.equal(safetyPlanHasInformation(example), true)
  assert.equal(example.contacts.length, 2)
  assert.equal(example.activities.length, 2)
  const snapshot = JSON.stringify(example)
  const empty = createSafetyPlanDraft(false)
  empty.stepTexts[0] = "Información de prueba"
  empty.activities.push("Actividad de prueba")
  assert.equal(JSON.stringify(example), snapshot)
  example.contacts[0].name = "Nombre modificado"
  assert.equal(createSafetyPlanDraft(true).contacts[0].name, "Mamá")
  assert.equal(safetyPlanHasInformation(createSafetyPlanDraft(false)), false)
})
