import { canStrengthenRelationship, CURRENT_PCS_ID, validCaregivers, type JourneyState } from "./journey"

// Official nine-item daily bank supplied after evaluator review. The two
// ideation items only normalize the source's mixed tú/usted address to tú.
export const EMA_VERSION = "daily-nine-v2"
export const EMA_TIME_WINDOW = "Pensando en hoy, desde que te despertaste hasta ahora"
export const EMA_REFERENCE_HELP = "Podrás cambiar esta elección en Conoce tu red → Tu mapa de red. Abre la ficha de una persona cercana vinculada y elige Seleccionar para registro EMA."
export const EMA_ITEMS = [
  { id: "daily-ideation-01", kind: "binary", block: "self", text: "Hoy, ¿has pensado en hacer algo para terminar con tu vida?" },
  { id: "daily-ideation-02", kind: "binary", block: "self", text: "Hoy, ¿has pensado en cómo podrías terminar con tu vida?" },
  { id: "daily-ideation-03", kind: "binary", block: "self", text: "Hoy, ¿has tenido la intención, aunque sea mínima, de llevar a cabo estos pensamientos?" },
  { id: "daily-relationship-01", kind: "range", block: "relationship", text: "Hoy te has sentido cómodo/a contándole a esta persona cosas que no les cuentas a otras personas." },
  { id: "daily-relationship-02", kind: "range", block: "relationship", text: "Hoy has sido abierto y cariñoso con esta persona." },
  { id: "daily-relationship-03", kind: "range", block: "relationship", text: "Hoy has expresado a esta persona tus sentimientos hacia ella." },
  { id: "daily-connection-01", kind: "range", block: "connection", text: "Hoy, ha sido fácil relacionarme con otros." },
  { id: "daily-connection-02", kind: "range", block: "connection", text: "Hoy, he tenido a alguien con quien compartir mis sentimientos." },
  { id: "daily-connection-03", kind: "range", block: "connection", text: "Hoy, me ha sido fácil conectar con otros cuando lo he necesitado." },
] as const

export type EmaAnswer = boolean | number | null
export interface EmaReference {
  pcsId: string
  personId: string
  caregiverId: string
  associationId: string
}
export interface EmaDraft {
  version: typeof EMA_VERSION
  day: string
  reference: EmaReference | null
  relationshipOmission: "no-active-link" | null
  answers: EmaAnswer[]
  questionIndex: number
  completed: boolean
}

export function emaDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function createEmaDraft(reference: EmaReference | null = null, day = emaDayKey()): EmaDraft {
  return { version: EMA_VERSION, day, reference: reference ? { ...reference } : null, relationshipOmission: null, answers: EMA_ITEMS.map(() => null), questionIndex: 0, completed: false }
}

export function emaQuestionIndices(draft: EmaDraft): number[] {
  return EMA_ITEMS.flatMap((item, index) => draft.relationshipOmission === "no-active-link" && item.block === "relationship" ? [] : [index])
}

// An explicit choice for this daily record; the saved person preference is untouched.
export function omitEmaRelationship(draft: EmaDraft, state: JourneyState): EmaDraft {
  if (draft.completed || draft.relationshipOmission === "no-active-link" || validCaregivers(state).length > 0) return draft
  return {
    ...draft, reference: null, relationshipOmission: "no-active-link",
    answers: draft.answers.map((answer, index) => EMA_ITEMS[index].block === "relationship" ? null : answer),
    questionIndex: EMA_ITEMS[draft.questionIndex].block === "relationship" ? 6 : draft.questionIndex,
  }
}

export function emaReferenceForPerson(state: JourneyState, personId: string): EmaReference | null {
  if (!canStrengthenRelationship(state, personId)) return null
  const person = state.people.find(item => item.id === personId)!
  const association = state.associations.find(item => item.personId === personId && item.caregiverId === person.caregiverId && item.pcsId === CURRENT_PCS_ID && item.active)!
  return { pcsId: CURRENT_PCS_ID, personId, caregiverId: person.caregiverId!, associationId: association.id }
}

export function sameEmaReference(first: EmaReference | null, second: EmaReference | null) {
  return first === null ? second === null : second !== null && first.personId === second.personId && first.caregiverId === second.caregiverId && first.associationId === second.associationId && first.pcsId === second.pcsId
}

export function isEmaReferenceActive(state: JourneyState, reference: EmaReference | null) {
  return reference !== null && sameEmaReference(emaReferenceForPerson(state, reference.personId), reference)
}

// Persist the reference preference only, never EMA responses or a default scale value.
export function parseEmaReference(saved: string | null): EmaReference | null {
  try {
    const value = JSON.parse(saved ?? "null") as unknown
    if (!value || typeof value !== "object") return null
    const record = value as Record<string, unknown>
    if (record.pcsId !== CURRENT_PCS_ID || !["personId", "caregiverId", "associationId"].every(key => typeof record[key] === "string" && (record[key] as string).length > 0)) return null
    return { pcsId: CURRENT_PCS_ID, personId: record.personId as string, caregiverId: record.caregiverId as string, associationId: record.associationId as string }
  } catch { return null }
}

export function isEmaAnswer(index: number, answer: unknown): answer is boolean | number {
  const item = EMA_ITEMS[index]
  if (!Number.isInteger(index) || !item) return false
  return item.kind === "binary" ? typeof answer === "boolean" : typeof answer === "number" && Number.isFinite(answer) && answer >= 0 && answer <= 100
}

export function setEmaAnswer(draft: EmaDraft, index: number, answer: boolean | number): EmaDraft {
  if (draft.completed || !isEmaAnswer(index, answer) || !emaQuestionIndices(draft).includes(index)) return draft
  return { ...draft, answers: draft.answers.map((value, itemIndex) => itemIndex === index ? answer : value) }
}

export function answeredEmaCount(draft: EmaDraft) {
  return emaQuestionIndices(draft).reduce((count, index) => count + (isEmaAnswer(index, draft.answers[index]) ? 1 : 0), 0)
}

export function canCompleteEma(draft: EmaDraft) {
  const omitted = draft.relationshipOmission === "no-active-link"
  const validContext = omitted ? draft.reference === null && EMA_ITEMS.every((item, index) => item.block !== "relationship" || draft.answers[index] === null) : draft.reference !== null
  return draft.version === EMA_VERSION && validContext && draft.answers.length === EMA_ITEMS.length && answeredEmaCount(draft) === emaQuestionIndices(draft).length
}

export function prepareEmaDay(draft: EmaDraft, reference: EmaReference | null, day = emaDayKey()): EmaDraft {
  if (draft.version !== EMA_VERSION || draft.day !== day) return createEmaDraft(reference, day)
  return draft
}

export function changeEmaReference(draft: EmaDraft, reference: EmaReference): EmaDraft {
  if (draft.completed || draft.relationshipOmission === "no-active-link" || sameEmaReference(draft.reference, reference)) return draft
  return { ...draft, reference: { ...reference }, answers: draft.answers.map((answer, index) => EMA_ITEMS[index].block === "relationship" ? null : answer), questionIndex: Math.min(draft.questionIndex, 3) }
}
