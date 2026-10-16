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
const ema = loadSource("ema", { "./journey": journey })
const active = journey.createDemoJourney()
const reference = ema.emaReferenceForPerson(active, "demo-m")
const otherActive = { ...active, associations: active.associations.map(item => ({ ...item, active: true })) }
const otherReference = ema.emaReferenceForPerson(otherActive, "demo-carmen")
const start = () => ema.createEmaDraft(reference, "2026-10-15")
function fill(draft) {
  for (let index = 0; index < 9; index++) draft = ema.setEmaAnswer(draft, index, index < 3 ? false : 0)
  return draft
}

test("the daily official bank has three binary items followed by two blocks of three ranges", () => {
  assert.equal(ema.EMA_ITEMS.length, 9)
  assert.equal(new Set(ema.EMA_ITEMS.map(item => item.id)).size, 9)
  assert.deepEqual(Array.from(ema.EMA_ITEMS.map(item => item.kind)), ["binary", "binary", "binary", "range", "range", "range", "range", "range", "range"])
  assert.equal(ema.EMA_ITEMS.filter(item => item.block === "relationship").length, 3)
  assert.equal(ema.EMA_ITEMS[8].text, "Hoy, me ha sido fácil conectar con otros cuando lo he necesitado.")
  assert.match(ema.EMA_TIME_WINDOW, /desde que te despertaste hasta ahora/)
  assert.ok(ema.EMA_ITEMS.every(item => item.text.startsWith("Hoy")))
})

test("a daily record starts directly with all nine answers empty and no selected scale value", () => {
  const draft = start()
  assert.equal(draft.questionIndex, 0)
  assert.equal(draft.answers.length, 9)
  assert.ok(draft.answers.every(value => value === null))
  assert.equal(Object.hasOwn(draft, "showBank"), false)
  assert.equal(ema.answeredEmaCount(draft), 0)
  assert.equal(ema.canCompleteEma(draft), false)
  draft.answers[0] = true
  assert.equal(start().answers[0], null)
})

test("No and the Nada cierta endpoint count as explicit answers, while null does not", () => {
  let draft = start()
  draft = ema.setEmaAnswer(draft, 0, false)
  draft = ema.setEmaAnswer(draft, 3, 0)
  assert.equal(ema.answeredEmaCount(draft), 2)
  assert.equal(draft.answers[0], false)
  assert.equal(draft.answers[3], 0)
  const full = fill(start())
  assert.equal(ema.answeredEmaCount(full), 9)
  assert.equal(ema.canCompleteEma(full), true)
  assert.equal(ema.canCompleteEma({ ...full, reference: null }), false)
  assert.equal(ema.canCompleteEma({ ...full, answers: full.answers.slice(0, 8) }), false)
})

test("binary and range answer types cannot be mixed, and invalid values cannot alter the draft", () => {
  const draft = start()
  for (const value of [0, 1, 100, "Sí", null, undefined]) assert.equal(ema.setEmaAnswer(draft, 0, value), draft)
  for (const value of [true, false, -1, 101, NaN, Infinity, "50", null]) assert.equal(ema.setEmaAnswer(draft, 3, value), draft)
  for (const index of [-1, 9, 0.5, NaN]) assert.equal(ema.setEmaAnswer(draft, index, false), draft)
  assert.equal(ema.setEmaAnswer(draft, 3, 100).answers[3], 100)
  assert.equal(ema.setEmaAnswer({ ...draft, completed: true }, 0, true).answers[0], null)
})

test("a reference requires acceptance and the exact PCS, caregiver, person and active association", () => {
  assert.ok(reference)
  for (const id of ["demo-alex", "demo-carmen", "demo-lu", "demo-sam", "missing"]) assert.equal(ema.emaReferenceForPerson(active, id), null)
  assert.equal(ema.isEmaReferenceActive(active, reference), true)
  for (const field of ["pcsId", "caregiverId", "personId", "associationId"]) assert.equal(ema.isEmaReferenceActive(active, { ...reference, [field]: "other" }), false)
  const revoked = { ...active, associations: [] }
  assert.equal(ema.isEmaReferenceActive(revoked, reference), false)
  const relinked = { ...active, associations: active.associations.map(item => ({ ...item, id: "new-association" })) }
  assert.equal(ema.isEmaReferenceActive(relinked, reference), false)
  assert.equal(ema.isEmaReferenceActive(active, null), false)
  assert.equal(ema.isEmaReferenceActive({ ...active, selectedPersonId: "demo-alex" }, reference), true)
})

test("the saved preference reloads as IDs only, rejecting malformed or another PCS's data", () => {
  const parsed = ema.parseEmaReference(JSON.stringify({ ...reference, answers: [true, 100], questionIndex: 4 }))
  assert.equal(ema.sameEmaReference(reference, parsed), true)
  assert.equal(Object.hasOwn(parsed, "answers"), false)
  assert.equal(Object.hasOwn(parsed, "questionIndex"), false)
  for (const value of [null, "bad json", "null", "[]", "{}", JSON.stringify({ ...reference, pcsId: "other-pcs" }), JSON.stringify({ ...reference, associationId: "" })]) assert.equal(ema.parseEmaReference(value), null)
})

test("returning the same day resumes the draft; a new local day starts nine empty items with the saved person", () => {
  const draft = fill(start())
  assert.equal(ema.prepareEmaDay(draft, otherReference, "2026-10-15"), draft)
  const tomorrow = ema.prepareEmaDay(draft, otherReference, "2026-10-16")
  assert.equal(ema.answeredEmaCount(tomorrow), 0)
  assert.equal(tomorrow.questionIndex, 0)
  assert.equal(tomorrow.completed, false)
  assert.equal(ema.sameEmaReference(tomorrow.reference, otherReference), true)
  assert.equal(ema.emaDayKey(new Date(2026, 9, 15, 23, 59)), "2026-10-15")
  assert.equal(ema.emaDayKey(new Date(2026, 9, 16, 0, 0)), "2026-10-16")
})

test("a confirmed person change clears only the relationship block of an unfinished record", () => {
  const original = { ...fill(start()), questionIndex: 5 }
  const changed = ema.changeEmaReference(original, otherReference)
  assert.equal(ema.sameEmaReference(changed.reference, otherReference), true)
  assert.deepEqual(Array.from(changed.answers), [false, false, false, null, null, null, 0, 0, 0])
  assert.equal(changed.questionIndex, 3)
  assert.equal(ema.changeEmaReference({ ...original, questionIndex: 8 }, otherReference).questionIndex, 3)
  assert.equal(original.answers[3], 0)
  assert.equal(ema.changeEmaReference(original, reference), original)
})

test("a completed record keeps its original person; the new preference applies to the next day", () => {
  const completed = { ...fill(start()), completed: true }
  assert.equal(ema.changeEmaReference(completed, otherReference), completed)
  assert.equal(ema.sameEmaReference(completed.reference, reference), true)
  const tomorrow = ema.prepareEmaDay(completed, otherReference, "2026-10-16")
  assert.equal(ema.sameEmaReference(tomorrow.reference, otherReference), true)
})

test("the app persists the EMA preference separately and never serializes clinical answers", () => {
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8")
  assert.match(app, /JSON\.stringify\(emaReference\)/)
  assert.doesNotMatch(app, /JSON\.stringify\(emaDraft\)/)
  assert.match(app, /-ema-reference/)
  assert.match(app, /JSON\.stringify\(journey\)/)
})

test("without any active linked person, today's record can contain exactly the six personal and connection items", () => {
  const original = ema.createEmaDraft(null, "2026-10-15")
  const skipped = ema.omitEmaRelationship(original, journey.EMPTY_JOURNEY)
  assert.equal(skipped.relationshipOmission, "no-active-link")
  assert.equal(skipped.reference, null)
  assert.deepEqual(Array.from(ema.emaQuestionIndices(skipped)), [0, 1, 2, 6, 7, 8])
  assert.equal(ema.canCompleteEma(skipped), false)
  const completed = fill(skipped)
  assert.equal(ema.answeredEmaCount(completed), 6)
  assert.equal(ema.canCompleteEma(completed), true)
  assert.deepEqual(Array.from(completed.answers), [false, false, false, null, null, null, 0, 0, 0])
  assert.equal(ema.setEmaAnswer(skipped, 3, 50), skipped)
  assert.equal(original.relationshipOmission, null)
  assert.equal(ema.canCompleteEma({ ...completed, answers: [false, false, false, 0, 0, 0, 0, 0, 0] }), false)
})

test("the block cannot be omitted when a valid linked person exists, but inactive associations do not block omission", () => {
  const draft = start()
  assert.equal(ema.omitEmaRelationship(draft, active), draft)
  assert.equal(ema.omitEmaRelationship(draft, otherActive), draft)
  const inactive = { ...active, associations: active.associations.map(item => ({ ...item, active: false })) }
  const original = { ...fill(draft), questionIndex: 4 }
  const skipped = ema.omitEmaRelationship(original, inactive)
  assert.equal(skipped.reference, null)
  assert.equal(skipped.questionIndex, 6)
  assert.deepEqual(Array.from(skipped.answers), [false, false, false, null, null, null, 0, 0, 0])
  const completed = { ...original, completed: true }
  assert.equal(ema.omitEmaRelationship(completed, inactive), completed)
})

test("omission lasts only for this day and does not add relationship questions if a person is linked midway", () => {
  const skipped = ema.omitEmaRelationship(ema.createEmaDraft(null, "2026-10-15"), journey.EMPTY_JOURNEY)
  assert.equal(ema.changeEmaReference(skipped, reference), skipped)
  assert.equal(ema.prepareEmaDay(skipped, reference, "2026-10-15"), skipped)
  const tomorrow = ema.prepareEmaDay(skipped, reference, "2026-10-16")
  assert.equal(tomorrow.relationshipOmission, null)
  assert.equal(ema.sameEmaReference(tomorrow.reference, reference), true)
  assert.equal(ema.emaQuestionIndices(tomorrow).length, 9)
  assert.equal(ema.answeredEmaCount(tomorrow), 0)
  const withoutLinkTomorrow = ema.prepareEmaDay(skipped, null, "2026-10-16")
  assert.equal(withoutLinkTomorrow.relationshipOmission, null)
  assert.equal(ema.canCompleteEma(fill(withoutLinkTomorrow)), false)
})
