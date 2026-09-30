import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import vm from "node:vm"
import ts from "typescript"

const source = readFileSync(new URL("../src/ema.ts", import.meta.url), "utf8")
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText
const ema = {}
vm.runInNewContext(compiled, { exports: ema })
const { EMA_ITEMS, EMA_SCALE, EMA_INSTRUCTION, createEmaDraft, setEmaAnswer, answeredEmaCount, canCompleteEma, emaScaleLabel } = ema

test("the entire source bank is available in order, including the completed last item", () => {
  assert.equal(EMA_ITEMS.length, 13)
  assert.equal(new Set(EMA_ITEMS.map((item) => item.id)).size, 13)
  assert.equal(EMA_ITEMS[0].text, "La vida no vale la pena para mí.")
  assert.equal(EMA_ITEMS[4].text, "Me ha sido fácil conectar con otros cuando lo he necesitado.")
  assert.equal(EMA_ITEMS[12].text, "¿Ha planeado los detalles de cómo, cuándo y dónde llevarlo a cabo?")
  assert.ok(EMA_ITEMS.every((item) => !item.text.includes("[[")))
})

test("the source instruction and seven-point scale are preserved without invented intermediate labels", () => {
  assert.equal(EMA_INSTRUCTION, "Indica qué tanto te sientes así en este momento.")
  assert.deepEqual(Array.from(EMA_SCALE), [1, 2, 3, 4, 5, 6, 7])
  assert.equal(emaScaleLabel(1), "1 · Nada o muy poco")
  assert.equal(emaScaleLabel(7), "7 · Extremadamente")
  for (const value of [2, 3, 4, 5, 6]) assert.equal(emaScaleLabel(value), String(value))
})

test("the review starts with all questions visible and no preselected answers", () => {
  const draft = createEmaDraft()
  assert.equal(draft.showBank, true)
  assert.equal(draft.questionIndex, 0)
  assert.equal(draft.answers.length, 13)
  assert.ok(draft.answers.every((answer) => answer === null))
  assert.equal(answeredEmaCount(draft), 0)
  assert.equal(canCompleteEma(draft), false)
})

test("answers are updated by item, not appended when revisiting an earlier question", () => {
  const original = createEmaDraft()
  const first = setEmaAnswer(original, 0, 1)
  const later = setEmaAnswer(first, 12, 7)
  const edited = setEmaAnswer(later, 0, 6)
  assert.equal(original.answers[0], null)
  assert.equal(first.answers[0], 1)
  assert.equal(edited.answers[0], 6)
  assert.equal(edited.answers[12], 7)
  assert.equal(edited.answers.length, 13)
  assert.equal(answeredEmaCount(edited), 2)
})

test("invalid indices and answers cannot corrupt the draft", () => {
  const draft = createEmaDraft()
  for (const index of [-1, 13, 0.5, NaN]) assert.equal(setEmaAnswer(draft, index, 1), draft)
  for (const value of [0, 8, 2.5, NaN, "1", null]) assert.equal(setEmaAnswer(draft, 0, value), draft)
})

test("completion requires valid answers to all 13 questions, not just three", () => {
  let draft = createEmaDraft()
  for (let index = 0; index < EMA_ITEMS.length; index++) {
    assert.equal(canCompleteEma(draft), false)
    draft = setEmaAnswer(draft, index, index % 7 + 1)
    assert.equal(answeredEmaCount(draft), index + 1)
  }
  assert.equal(canCompleteEma(draft), true)
  assert.equal(setEmaAnswer({ ...draft, completed: true }, 0, 7).completed, false)
  assert.equal(canCompleteEma({ ...draft, answers: [1, 2, 3] }), false)
})

test("the app keeps EMA data separate from localStorage and uses the new form and result screens", () => {
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8")
  assert.match(app, /useState\(createEmaDraft\)/)
  assert.match(app, /case 3:\s+return <EmaScreen/)
  assert.match(app, /case 4:\s+return <EmaScreen[^\n]+view="result"/)
  assert.doesNotMatch(app, /JSON\.stringify\(emaDraft\)/)
  assert.match(app, /JSON\.stringify\(journey\)/)
})
