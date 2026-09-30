import { useEffect, useRef, useState } from "react"
import {
  answeredEmaCount, canCompleteEma, createEmaDraft, emaScaleLabel,
  EMA_INSTRUCTION, EMA_ITEMS, EMA_SCALE, setEmaAnswer, type EmaDraft,
} from "../ema"
import { ActionCard, Btn, FloatingSupportBtn, Ic, Modal, ProgressBar, StatusBar } from "../ui"

interface EmaProps {
  navigate: (screen: number) => void
  draft: EmaDraft
  setDraft: (next: EmaDraft | ((current: EmaDraft) => EmaDraft)) => void
  view?: "form" | "result"
}

export default function EmaScreen({ navigate, draft, setDraft, view = "form" }: EmaProps) {
  const [showExit, setShowExit] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const questionHeading = useRef<HTMLHeadingElement>(null)
  const answered = answeredEmaCount(draft)
  const question = EMA_ITEMS[draft.questionIndex]
  const selected = draft.answers[draft.questionIndex]
  const complete = canCompleteEma(draft)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    if (!draft.showBank && view === "form") questionHeading.current?.focus({ preventScroll: true })
  }, [draft.questionIndex, draft.showBank, view])

  const showQuestion = (index: number) => {
    if (index < 0 || index >= EMA_ITEMS.length) return
    setDraft((current) => ({ ...current, questionIndex: index, showBank: false }))
  }
  const openBank = () => setDraft((current) => ({ ...current, showBank: true }))
  const finish = () => {
    if (!complete) return
    setDraft((current) => ({ ...current, completed: true }))
    navigate(4)
  }

  if (view === "result") {
    return (
      <div className="ema-screen">
        <StatusBar />
        <main className="ema-scroller">
          <header className="ema-result-header">
            <span className="ema-result-icon" aria-hidden="true">{draft.completed ? Ic.checkCircle : Ic.clipboard}</span>
            <h1>{draft.completed ? "Registro de prueba completado" : "Tu registro de prueba"}</h1>
            <p>{answered} de {EMA_ITEMS.length} preguntas respondidas.</p>
          </header>
          <p className="ema-note">Las respuestas de prueba permanecen solo durante esta sesión. No se han enviado a nadie y se borran al recargar.</p>
          <p className="ema-note">Este prototipo no calcula una puntuación de riesgo ni activa intervenciones automáticamente. La selección de preguntas y las reglas clínicas siguen pendientes de validación.</p>
          <div className="ema-actions">
            <Btn fullWidth onClick={() => { openBank(); navigate(3) }}>Revisar todas las preguntas</Btn>
            <Btn variant="secondary" fullWidth onClick={() => navigate(5)}>Ver mi plan de seguridad</Btn>
            <Btn variant="secondary" fullWidth onClick={() => navigate(21)}>Ir a Tejiendo vínculos</Btn>
            <Btn variant="tertiary" fullWidth onClick={() => { setDraft(createEmaDraft()); navigate(3) }}>Volver a probar el registro</Btn>
            <Btn variant="tertiary" fullWidth onClick={() => navigate(2)}>Volver al inicio</Btn>
          </div>
        </main>
        <div className="ema-support-space" aria-hidden="true" />
        <FloatingSupportBtn onPress={() => navigate(6)} bottom={20} />
      </div>
    )
  }

  return (
    <div className="ema-screen">
      <StatusBar />
      <div className="ema-topbar">
        <button type="button" className="ema-exit" onClick={() => setShowExit(true)}>
          <span aria-hidden="true">{Ic.arrowLeft}</span><span>Salir y continuar después</span>
        </button>
      </div>
      <main ref={scroller} className="ema-scroller">
        <header className="ema-header">
          <span className="ema-review-label">Versión para evaluación</span>
          <h1>¿Cómo estoy hoy?</h1>
          <p>{EMA_INSTRUCTION}</p>
          <p className="ema-note">Escala de 1 a 7: 1 = Nada o muy poco · 7 = Extremadamente.</p>
        </header>

        {draft.showBank ? (
          <>
            <h2 className="ema-section-title">Todas las preguntas</h2>
            <p className="ema-note">Este banco incluye los {EMA_ITEMS.length} ítems para su evaluación. Por ahora no se aplica el límite de tres preguntas diarias. Puedes abrir cualquiera sin responder las anteriores.</p>
            <p className="ema-note">Usa respuestas de prueba. Se conservan durante esta sesión, no se envían a nadie y se borran al recargar.</p>
            <p className="ema-progress-text" role="status">{answered} de {EMA_ITEMS.length} respondidas</p>
            <div className="ema-actions" style={{ marginBottom: 18 }}>
              <Btn fullWidth onClick={() => showQuestion(draft.questionIndex)}>{answered ? "Continuar registro" : "Probar el registro"}</Btn>
            </div>
            <ol className="ema-bank" aria-label="Banco completo de preguntas EMA">
              {EMA_ITEMS.map((item, index) => (
                <li key={item.id}>
                  <ActionCard ariaLabel={`Ver pregunta ${index + 1}. ${item.text}`} onClick={() => showQuestion(index)} style={{ padding: 16 }}>
                    <span className="ema-item-number">Pregunta {index + 1} de {EMA_ITEMS.length}</span>
                    <span className="ema-item-text">{item.text}</span>
                    <span className="ema-item-status">{draft.answers[index] === null ? "Sin responder" : `Respuesta: ${emaScaleLabel(draft.answers[index]!)}`}</span>
                  </ActionCard>
                </li>
              ))}
            </ol>
            <div className="ema-actions" style={{ marginTop: 18 }}>
              <Btn fullWidth disabled={!complete} onClick={finish}>Finalizar prueba del registro</Btn>
              {!complete && <p className="ema-note">Puedes revisar todo el banco sin responder. Para probar el cierre del registro, responde los {EMA_ITEMS.length} ítems.</p>}
              <Btn variant="tertiary" fullWidth onClick={() => setShowExit(true)}>Prefiero responder después</Btn>
            </div>
          </>
        ) : (
          <>
            <button type="button" className="ema-bank-link" onClick={openBank}><span aria-hidden="true">{Ic.clipboard}</span>Ver todas las preguntas</button>
            <ProgressBar value={draft.questionIndex + 1} total={EMA_ITEMS.length} />
            <p className="ema-progress-text">Pregunta {draft.questionIndex + 1} de {EMA_ITEMS.length}</p>
            <h2 ref={questionHeading} id="ema-current-question" className="ema-question" tabIndex={-1}>{question.text}</h2>
            <fieldset className="ema-scale" aria-labelledby="ema-current-question">
              <legend className="ema-scale-legend">Elige una respuesta de 1 a 7</legend>
              {EMA_SCALE.map((value) => (
                <label key={value} className={selected === value ? "ema-option is-selected" : "ema-option"}>
                  <input type="radio" name={question.id} value={value} checked={selected === value} onChange={() => setDraft((current) => setEmaAnswer(current, current.questionIndex, value))} />
                  <span>{emaScaleLabel(value)}</span>
                </label>
              ))}
            </fieldset>
            <div className="ema-actions">
              {draft.questionIndex < EMA_ITEMS.length - 1 ? (
                <Btn fullWidth onClick={() => showQuestion(draft.questionIndex + 1)}>{selected === null ? "Ver siguiente pregunta" : "Siguiente pregunta"}</Btn>
              ) : (
                <Btn fullWidth onClick={openBank}>Revisar el banco completo</Btn>
              )}
              {draft.questionIndex > 0 && <Btn variant="secondary" fullWidth onClick={() => showQuestion(draft.questionIndex - 1)}>Pregunta anterior</Btn>}
              {complete && <Btn variant="secondary" fullWidth onClick={finish}>Finalizar prueba del registro</Btn>}
              <Btn variant="tertiary" fullWidth onClick={() => setShowExit(true)}>Prefiero responder después</Btn>
            </div>
          </>
        )}
      </main>
      <div className="ema-support-space" aria-hidden="true" />
      <FloatingSupportBtn onPress={() => navigate(6)} bottom={20} />
      <Modal open={showExit} onClose={() => setShowExit(false)} title="¿Salir del registro?">
        <p className="ema-note">Lo respondido se conservará durante esta sesión para que puedas retomar desde “¿Cómo estoy hoy?”. Recargar la página borra este registro de prueba.</p>
        <div className="ema-actions">
          <Btn variant="secondary" fullWidth onClick={() => navigate(2)}>Salir y continuar después</Btn>
          <Btn fullWidth onClick={() => setShowExit(false)}>Seguir revisando</Btn>
        </div>
      </Modal>
    </div>
  )
}
