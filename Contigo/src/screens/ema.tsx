import { useEffect, useRef, useState } from "react"
import {
  answeredEmaCount, canCompleteEma, emaDayKey, isEmaAnswer,
  isEmaReferenceActive, prepareEmaDay, setEmaAnswer, emaQuestionIndices, omitEmaRelationship,
  EMA_ITEMS, EMA_REFERENCE_HELP, EMA_TIME_WINDOW,
  type EmaAnswer, type EmaDraft, type EmaReference,
} from "../ema"
import { validCaregivers, type JourneyState } from "../journey"
import { Btn, FloatingSupportBtn, Ic, Modal, StatusBar } from "../ui"
import { type ConnectionStep } from "../connection"
import CompanionNote from "../components/companion-note"

interface EmaProps {
  navigate: (screen: number) => void
  draft: EmaDraft
  setDraft: (next: EmaDraft | ((current: EmaDraft) => EmaDraft)) => void
  journey: JourneyState
  referencePreference: EmaReference | null
  onSelectReference: (personId: string) => boolean
  onOpenNetwork: () => void
  view?: "form" | "result"
  onConnectionStep: (step: ConnectionStep, personId?: string) => void
}

function EmaRange({ value, onChange }: { value: EmaAnswer; onChange: (value: number) => void }) {
  const answer = typeof value === "number" ? value : null
  return <fieldset className={`ema-continuous-card ${answer === null ? "is-unanswered" : ""}`} aria-labelledby="ema-current-question">
    <legend className="sr-only">Indica qué tan cierta es esta frase</legend>
    <input type="range" min={0} max={100} step={1} value={answer ?? 50}
      aria-labelledby="ema-current-question" aria-describedby="ema-range-help"
      aria-valuetext={answer === null ? "Sin responder" : answer === 0 ? "Nada cierta" : answer === 100 ? "Completamente cierta" : `${answer} de 100`}
      style={{ backgroundImage: answer === null ? "linear-gradient(#D0E3EE, #D0E3EE)" : `linear-gradient(to right, #3174A1 ${answer}%, #D0E3EE ${answer}%)` }}
      onChange={event => onChange(Number(event.target.value))}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return
        const box = event.currentTarget.getBoundingClientRect()
        onChange(Math.round(Math.max(0, Math.min(100, (event.clientX - box.left - 18) / Math.max(1, box.width - 36) * 100))))
      }}
      onPointerUp={event => { if (event.isPrimary && event.button === 0) onChange(Number(event.currentTarget.value)) }}
      onKeyDown={event => {
        if (answer !== null) return
        const initial: Record<string, number> = { ArrowLeft: 49, ArrowDown: 49, ArrowRight: 51, ArrowUp: 51, Home: 0, End: 100, PageDown: 40, PageUp: 60, Enter: 50, " ": 50 }
        if (Object.prototype.hasOwnProperty.call(initial, event.key)) { event.preventDefault(); onChange(initial[event.key]) }
      }} />
    <div className="ema-thread-endpoints"><span>Nada cierta</span><span>Completamente cierta</span></div>
    <p id="ema-range-help" className="ema-control-help">{answer === null ? "Toca o mueve la barra para responder." : "Puedes ajustar tu respuesta antes de continuar."}<span className="sr-only"> Con teclado, usa las flechas para ajustar, Inicio para Nada cierta y Fin para Completamente cierta.</span></p>
  </fieldset>
}

export default function EmaScreen({ navigate, draft, setDraft, journey, referencePreference, onSelectReference, onOpenNetwork, view = "form", onConnectionStep }: EmaProps) {
  const [showExit, setShowExit] = useState(false)
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [notice, setNotice] = useState("")
  const scroller = useRef<HTMLElement>(null)
  const questionHeading = useRef<HTMLHeadingElement>(null)
  const people = validCaregivers(journey)
  const omittedRelationship = draft.relationshipOmission === "no-active-link"
  const questionIndices = emaQuestionIndices(draft)
  const position = questionIndices.indexOf(draft.questionIndex)
  const question = EMA_ITEMS[draft.questionIndex]
  const selected = draft.answers[draft.questionIndex]
  const complete = canCompleteEma(draft)
  const activeReference = isEmaReferenceActive(journey, draft.reference)
  const referenceName = journey.people.find(person => person.id === draft.reference?.personId)?.name ?? "la persona de tu registro"
  const showResult = view === "result" || draft.completed
  const choosing = !referencePreference && !showResult && !omittedRelationship
  const candidate = people.find(person => person.id === candidateId)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    questionHeading.current?.focus({ preventScroll: true })
  }, [draft.questionIndex, choosing, showResult, activeReference, omittedRelationship])

  const continueWithoutReference = () => {
    setDraft(current => omitEmaRelationship(prepareEmaDay(current, referencePreference), journey))
  }

  const next = () => {
    if (draft.day !== emaDayKey()) {
      setDraft(current => prepareEmaDay(current, referencePreference))
      setNotice("Comenzó un nuevo día. Puedes hacer el registro de hoy.")
      return
    }
    if ((!activeReference && !omittedRelationship) || !isEmaAnswer(draft.questionIndex, selected)) return
    if (position < questionIndices.length - 1) setDraft(current => ({ ...current, questionIndex: questionIndices[position + 1] }))
    else if (complete) { setDraft(current => ({ ...current, completed: true })); navigate(4) }
  }

  if (showResult) return <div className="pcs-internal-screen">
    <StatusBar />
    <main className="pcs-internal-scroller pcs-result-content">
      <h1 className="sr-only">Opciones para acercarte a tu tejido</h1>
      <CompanionNote affection><p>{draft.completed ? "Gracias por contarme, Sofía." : "Puedes acercarte a tu tejido, Sofía."} ¿Te serviría sentirte acompañada? Elige algo del tamaño que puedas hoy.</p></CompanionNote>
      <button type="button" className="pcs-size-card" onClick={() => onConnectionStep("received")}><span className="pcs-eyebrow">Pequeño · 1 min aprox.</span><strong>Ver mensajes de cuidado</strong><span>Vuelve a los mensajes que has recibido. No tienes que responder.</span><span className="pcs-card-arrow" aria-hidden="true">{Ic.chevRight}</span></button>
      <section className="pcs-size-card"><span className="pcs-eyebrow">Mediano · 5 min aprox.</span><h2>Escribir o llamar a alguien cercano</h2><p>¿A quién?</p><div className="pcs-people-list">{people.map(person => <button key={person.id} onClick={() => onConnectionStep("contact", person.id)}>{person.name}</button>)}<button onClick={() => onConnectionStep("contact")}>{people.length ? "Elegir otra persona" : "Elegir una persona"}</button></div><button className="pcs-text-link" onClick={() => onConnectionStep("message")}>Escribir mensaje para tejer cercanía</button></section>
      <button type="button" className="pcs-size-card" onClick={() => onConnectionStep("meeting")}><span className="pcs-eyebrow">Más grande · esta semana</span><strong>Proponer un encuentro</strong><span>Algo sencillo: un café, caminar o ver una serie.</span><span className="pcs-card-arrow" aria-hidden="true">{Ic.chevRight}</span></button>
      <p className="pcs-small">Los tiempos son orientativos. Puedes ir a tu propio ritmo.</p>
      <div className="pcs-result-actions"><button className="pcs-skills" onClick={() => onConnectionStep("skills")}>{Ic.book} Aprender habilidades</button><button className="pcs-secondary" onClick={() => navigate(2)}>Ahora no</button></div>
      <details className="pcs-result-review"><summary>Tu registro de hoy</summary><p>{answeredEmaCount(draft)} de {questionIndices.length} hilos respondidos.</p><p>{omittedRelationship ? "Hoy no se incluyó el bloque sobre una persona cercana vinculada." : `Persona de referencia: ${referenceName}.`}</p><p>Las respuestas de este prototipo se conservan durante esta sesión y se borran al recargar. Estas opciones no se seleccionan a partir de tus respuestas.</p><Btn variant="secondary" fullWidth onClick={() => navigate(5)}>Ver mi plan de seguridad</Btn></details>
    </main>
    <div className="pcs-support-dock"><FloatingSupportBtn onPress={() => navigate(6)} bottom={8} /></div>
  </div>

  return <div className="ema-screen ema-thread-screen">
    <StatusBar />
    <div className="ema-topbar"><button type="button" className="pcs-round-back" aria-label="Salir y continuar después" onClick={() => setShowExit(true)}>{Ic.x}</button></div>
    <main className="ema-scroller ema-thread-scroller" ref={scroller}>
      <header className="ema-thread-banner"><div><p>¿Cómo estoy hoy?</p><h1>Tu tejido de hoy</h1><span>{choosing ? "Antes de tu primer registro" : `Hilo ${position + 1} de ${questionIndices.length}`}</span></div>{!choosing && <svg viewBox="0 0 120 50" role="progressbar" aria-label="Avance del registro" aria-valuemin={1} aria-valuemax={questionIndices.length} aria-valuenow={position + 1}>{questionIndices.map((itemIndex,index) => { const x = index % 5 * 23; const y = Math.floor(index / 5) * 22 + 10; return <path key={EMA_ITEMS[itemIndex].id} d={`M${x} ${y} q5 -8 10 0 t10 0`} fill="none" stroke={index <= position ? "#3174A1" : "#CFE3EE"} strokeWidth="3" strokeLinecap="round" /> })}</svg>}</header>
      {choosing ? <section className="ema-reference-setup">
        <h2 ref={questionHeading} tabIndex={-1}>Por favor, escoge una persona con la cual te sientas cercano/a y con la que estés vinculada en la aplicación.</h2>
        {people.length ? <><fieldset className="ema-reference-list"><legend className="sr-only">Personas cercanas vinculadas</legend>{people.map(person => <label key={person.id} className={candidateId === person.id ? "is-selected" : ""}><input type="radio" name="ema-reference" checked={candidateId === person.id} onChange={() => { setCandidateId(person.id); setNotice("") }} /><span className="ema-reference-avatar" aria-hidden="true">{Ic.user}</span><span>{person.name}</span></label>)}</fieldset><button className="pcs-primary ema-blue-action" disabled={!candidate} onClick={() => { if (candidate && !onSelectReference(candidate.id)) setNotice("El vínculo cambió. Revisa tu red antes de continuar.") }}>Continuar con la persona elegida</button></> : <div className="ema-reference-empty"><p>Aún no tienes personas cercanas vinculadas. Puedes continuar hoy con seis preguntas, sin el bloque sobre una persona cercana.</p><button className="pcs-primary ema-blue-action" onClick={continueWithoutReference}>Continuar con el registro de hoy</button><button className="pcs-text-link" onClick={onOpenNetwork}>Ir a Conoce tu red</button></div>}
        <p className="ema-reference-help">{EMA_REFERENCE_HELP}</p>
      </section> : !activeReference && !omittedRelationship ? <section className="ema-reference-setup">
        <h2 ref={questionHeading} tabIndex={-1}>Revisa la persona de tu registro</h2><p>Tu persona de referencia ya no tiene un vínculo activo contigo. No cambiaremos tu elección automáticamente.</p><p className="ema-reference-help">En Tu mapa de red puedes revisar el vínculo o confirmar otra persona para el registro EMA.</p>{people.length === 0 ? <><p>También puedes continuar hoy con seis preguntas, sin el bloque sobre una persona cercana.</p><button className="pcs-primary ema-blue-action" onClick={continueWithoutReference}>Continuar con el registro de hoy</button><button className="pcs-text-link" onClick={onOpenNetwork}>Ir a Tu mapa de red</button></> : <button className="pcs-primary ema-blue-action" onClick={onOpenNetwork}>Ir a Tu mapa de red</button>}
      </section> : <>
        {omittedRelationship && <p className="ema-control-help">Hoy responderás sobre ti y tu conexión con otras personas.</p>}
        {question.block === "relationship" && <p className="ema-reference-context">{Ic.user}<span>Sobre tu relación con <strong>{referenceName}</strong></span></p>}
        <div className="ema-thread-question"><p>{EMA_TIME_WINDOW}, {question.kind === "binary" ? "responde Sí o No." : question.block === "relationship" ? `mueve la barra para indicar qué tan cierta es cada frase sobre tu relación con ${referenceName}.` : "mueve la barra para indicar qué tan cierta es cada frase para ti."}</p><h2 id="ema-current-question" ref={questionHeading} tabIndex={-1}>{question.text}</h2></div>
        {question.kind === "binary" ? <fieldset className="ema-binary-card" aria-labelledby="ema-current-question"><legend className="sr-only">Responde Sí o No</legend>{[{value: true, label: "Sí"}, {value: false, label: "No"}].map(option => <label key={option.label} className={selected === option.value ? "is-selected" : ""}><input type="radio" name={question.id} value={String(option.value)} checked={selected === option.value} onChange={() => setDraft(current => setEmaAnswer(current, current.questionIndex, option.value))} /><span>{option.label}</span></label>)}</fieldset> : <EmaRange key={question.id} value={selected} onChange={value => setDraft(current => setEmaAnswer(current, current.questionIndex, value))} />}
        <div className="ema-thread-actions"><button className="pcs-primary" disabled={!isEmaAnswer(draft.questionIndex, selected)} onClick={next}>{position < questionIndices.length - 1 ? "Tejer y seguir" : "Tejer y terminar"}</button>{position > 0 && <button className="pcs-text-link" onClick={() => setDraft(current => ({ ...current, questionIndex: questionIndices[position - 1] }))}>Hilo anterior</button>}</div>
      </>}
      {notice && <p className="ema-control-help" role="status">{notice}</p>}
      <button className="pcs-text-link ema-defer" onClick={() => setShowExit(true)}>Prefiero responder después</button>
    </main>
    <div className="pcs-support-dock"><FloatingSupportBtn onPress={() => navigate(6)} bottom={8} /></div>
    <Modal open={showExit} onClose={() => setShowExit(false)} title="¿Salir del registro?"><p className="ema-note">Puedes volver para continuar donde quedaste durante esta sesión. La persona elegida se conservará para tus próximos registros; las respuestas de prueba se borran al recargar.</p><div className="ema-actions"><Btn variant="secondary" fullWidth onClick={() => navigate(2)}>Salir y continuar después</Btn><Btn fullWidth onClick={() => setShowExit(false)}>Seguir con mi registro</Btn></div></Modal>
  </div>
}
