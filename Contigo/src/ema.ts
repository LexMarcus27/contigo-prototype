// Full review bank from US APP JITAI EMA.docx. Item 13 uses the wording
// supplied by Lex to complete the truncated source. No daily sampling or
// clinical scoring is applied in this evaluation prototype.
export const EMA_INSTRUCTION = "Indica qué tanto te sientes así en este momento."
export const EMA_ITEMS = [
  { id: "ema-01", text: "La vida no vale la pena para mí." },
  { id: "ema-02", text: "Tengo más razones para morir que para vivir." },
  { id: "ema-03", text: "Pienso en quitarme la vida." },
  { id: "ema-04", text: "Quiero morir." },
  { id: "ema-05", text: "Me ha sido fácil conectar con otros cuando lo he necesitado." },
  { id: "ema-06", text: "He tenido a alguien con quien compartir mis sentimientos." },
  { id: "ema-07", text: "Ha sido fácil relacionarme con otros." },
  { id: "ema-08", text: "Últimamente siento que soy una carga para la gente cercana a mí." },
  { id: "ema-09", text: "Últimamente me siento desconectado de la gente." },
  { id: "ema-10", text: "¿Ha pensado en hacer algo para terminar con su vida (matarse/suicidarse)?" },
  { id: "ema-11", text: "¿Ha pensado en cómo podría terminar con su vida (matarse/suicidarse)?" },
  { id: "ema-12", text: "¿Ha tenido la intención, aunque sea mínima, de llevar a cabo estos pensamientos (matarse/suicidarse)?" },
  { id: "ema-13", text: "¿Ha planeado los detalles de cómo, cuándo y dónde llevarlo a cabo?" },
] as const

export const EMA_SCALE = [1, 2, 3, 4, 5, 6, 7] as const
export type EmaValue = (typeof EMA_SCALE)[number]

export interface EmaDraft {
  answers: (EmaValue | null)[]
  questionIndex: number
  showBank: boolean
  completed: boolean
}

export function createEmaDraft(): EmaDraft {
  return { answers: EMA_ITEMS.map(() => null), questionIndex: 0, showBank: true, completed: false }
}

export function emaScaleLabel(value: EmaValue) {
  if (value === 1) return "1 · Nada o muy poco"
  if (value === 7) return "7 · Extremadamente"
  return String(value)
}

export function setEmaAnswer(draft: EmaDraft, questionIndex: number, value: EmaValue): EmaDraft {
  if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= EMA_ITEMS.length || !EMA_SCALE.includes(value)) {
    return draft
  }
  return {
    ...draft,
    answers: draft.answers.map((answer, index) => index === questionIndex ? value : answer),
    completed: false,
  }
}

export function answeredEmaCount(draft: EmaDraft) {
  return EMA_ITEMS.reduce((count, _, index) => count + (EMA_SCALE.includes(draft.answers[index] as EmaValue) ? 1 : 0), 0)
}

export function canCompleteEma(draft: EmaDraft) {
  return draft.answers.length === EMA_ITEMS.length && answeredEmaCount(draft) === EMA_ITEMS.length
}
