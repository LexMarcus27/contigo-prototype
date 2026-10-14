import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import vm from "node:vm"
import ts from "typescript"

function loadSource(name, dependencies = {}) {
  const source = readFileSync(new URL(`../src/${name}.ts`, import.meta.url), "utf8")
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText
  const exports = {}
  vm.runInNewContext(compiled, { exports, require: path => dependencies[path] })
  return exports
}
const journey = loadSource("journey")
const caregiver = loadSource("caregiver", { "./journey": journey })
const caring = loadSource("caring-messages", { "./journey": journey, "./caregiver": caregiver })
const active = caregiver.simulateCaregiverLink(journey.EMPTY_JOURNEY, "active")
const sender = caregiver.DEMO_CAREGIVER.id

test("reflection selections preserve the message and private notes, with independent empty drafts", () => {
  const draft = caring.createCaringDraft()
  draft.text = "Mensaje escrito por mí"
  draft.notes[1] = "Nota privada"
  const selected = caring.toggleCaringQuestion(draft, 1)
  assert.equal(selected.selectedQuestions.join(), "1")
  assert.equal(draft.selectedQuestions.length, 0)
  assert.equal(selected.text, draft.text)
  assert.equal(selected.notes[1], "Nota privada")
  const unselected = caring.toggleCaringQuestion(selected, 1)
  assert.equal(unselected.selectedQuestions.length, 0)
  assert.equal(unselected.notes[1], "Nota privada")
  for (const index of [-1, 8, 0.5, NaN]) assert.equal(caring.toggleCaringQuestion(draft, index), draft)
  assert.equal(caring.createCaringDraft().notes[1], undefined)
})

test("adding an example appends to existing writing rather than overwriting it", () => {
  const original = { ...caring.createCaringDraft(), text: "Mi mensaje original" }
  const result = caring.appendCaringIdea(original, " Una idea ")
  assert.equal(original.text, "Mi mensaje original")
  assert.equal(result.text, "Mi mensaje original\n\nUna idea")
  assert.equal(caring.appendCaringIdea(original, "  "), original)
})

test("simulated delivery records the exact active sender and recipient, never private reflection notes", () => {
  const snapshot = JSON.stringify(active)
  const message = caring.createSimulatedCaringMessage(active, sender, "  Mensaje de prueba  ", "message-1")
  assert.equal(message.text, "Mensaje de prueba")
  assert.equal(message.pcsId, journey.CURRENT_PCS_ID)
  assert.equal(message.caregiverId, sender)
  assert.equal(message.associationId, "association-home-marta")
  assert.equal(message.delivery, "simulated")
  assert.equal(Object.hasOwn(message, "notes"), false)
  assert.equal(Object.hasOwn(message, "selectedQuestions"), false)
  assert.equal(JSON.stringify(active), snapshot)
  assert.equal(caring.createSimulatedCaringMessage(active, sender, "  ", "message-2"), null)
  assert.equal(caring.createSimulatedCaringMessage(active, sender, "Texto", ""), null)
})

test("acceptance alone, revocation, and another caregiver cannot simulate a delivery", () => {
  for (const state of [journey.EMPTY_JOURNEY, caregiver.simulateCaregiverLink(active, "accepted-only"), caregiver.simulateCaregiverLink(active, "revoked")]) {
    assert.equal(caring.createSimulatedCaringMessage(state, sender, "Texto", "message-1"), null)
  }
  assert.equal(caring.createSimulatedCaringMessage(active, "unrelated-caregiver", "Texto", "message-1"), null)
})

test("the PCS inbox isolates people and associations and hides messages after revocation", () => {
  const message = caring.createSimulatedCaringMessage(active, sender, "Texto", "message-1")
  const wrong = [
    { ...message, pcsId: "other-pcs" },
    { ...message, personId: "other-person" },
    { ...message, associationId: "other-association" },
    { ...message, caregiverId: "other-caregiver" },
  ]
  assert.equal(caring.visibleCaringMessages(active, [message, ...wrong]).length, 1)
  assert.equal(caring.visibleCaringMessages(active, [message], "other-pcs").length, 0)
  assert.equal(caring.visibleCaringMessages(caregiver.simulateCaregiverLink(active, "revoked"), [message]).length, 0)
})

test("draft keys isolate the caregiver, PCS, person, and exact association", () => {
  const context = caregiver.caregiverContext(active, sender)
  const key = caring.caringDraftKey(context)
  for (const field of ["caregiverId", "pcsId", "personId", "associationId"]) {
    assert.notEqual(caring.caringDraftKey({ ...context, [field]: "other" }), key)
  }
})
