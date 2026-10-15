import { useEffect, useRef, useState } from "react"

import {
  answeredEmaCount,
  canCompleteEma,
  createEmaDraft,
  emaScaleLabel,
  EMA_INSTRUCTION,
  EMA_ITEMS,
  EMA_SCALE,
  setEmaAnswer,
  type EmaDraft,
} from "../ema"

import {
  ActionCard,
  Btn,
  FloatingSupportBtn,
  Ic,
  Modal,
  StatusBar,
} from "../ui"

import { type ConnectionStep } from "../connection"

import CompanionNote from "../components/companion-note"

interface EmaProps {
  navigate: (screen: number) => void

  draft: EmaDraft

  setDraft: (next: EmaDraft | ((current: EmaDraft) => EmaDraft)) => void

  view?: "form" | "result"

  people?: Array<{
    id: string
    name: string
  }>

  onConnectionStep?: (step: ConnectionStep, personId?: string) => void
}

export default function EmaScreen({
  navigate,
  draft,
  setDraft,
  view = "form",
  people = [],
  onConnectionStep,
}: EmaProps) {
  const [showExit, setShowExit] = useState(false)

  const scroller = useRef<HTMLElement>(null)

  const questionHeading = useRef<HTMLHeadingElement>(null)

  const answered = answeredEmaCount(draft)

  const question = EMA_ITEMS[draft.questionIndex]

  const selected = draft.answers[draft.questionIndex]

  const complete = canCompleteEma(draft)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })

    if (!draft.showBank && view === "form")
      questionHeading.current?.focus({ preventScroll: true })
  }, [draft.questionIndex, draft.showBank, view])

  const showQuestion = (index: number) => {
    if (index < 0 || index >= EMA_ITEMS.length) return

    setDraft((current) => ({
      ...current,
      questionIndex: index,
      showBank: false,
    }))
  }

  const openBank = () => setDraft((current) => ({ ...current, showBank: true }))

  const finish = () => {
    if (!complete) return

    setDraft((current) => ({ ...current, completed: true }))

    navigate(4)
  }

  const openStep = (step: ConnectionStep, personId?: string) => {
    if (onConnectionStep) onConnectionStep(step, personId)
    else navigate(step === "received" ? 27 : 21)
  }

  if (view === "result")
    return (
      <div className="pcs-internal-screen">
        <StatusBar />
      <main className="pcs-internal-scroller pcs-result-content">
        <h1 className="sr-only">Opciones para acercarte a tu tejido</h1>
          <CompanionNote affection>
            <p>
              {draft.completed
                ? "Gracias por contarme, Sofía."
                : "Puedes acercarte a tu tejido, Sofía."}{" "}
              ¿Te serviría sentirte acompañada? Elige algo del tamaño que puedas
              hoy.
            </p>
          </CompanionNote>
          <button
            type="button"
            className="pcs-size-card"
            onClick={() => openStep("received")}
          >
            <span className="pcs-eyebrow">Pequeño · 1 min aprox.</span>
            <strong>Ver mensajes de cuidado</strong>
            <span>
              Vuelve a los mensajes que has recibido. No tienes que responder.
            </span>
            <span className="pcs-card-arrow" aria-hidden="true">
              {Ic.chevRight}
            </span>
          </button>
          <section className="pcs-size-card">
            <span className="pcs-eyebrow">Mediano · 5 min aprox.</span>
            <h2>Escribir o llamar a alguien cercano</h2>
            <p>¿A quién?</p>
            <div className="pcs-people-list">
              {people.map((person) => (
                <button
                  key={person.id}
                  onClick={() => openStep("contact", person.id)}
                >
                  {person.name}
                </button>
              ))}
              <button onClick={() => openStep("contact")}>
                {people.length ? "Elegir otra persona" : "Elegir una persona"}
              </button>
            </div>
            <button
              className="pcs-text-link"
              onClick={() => openStep("message")}
            >
              Escribir mensaje para tejer cercanía
            </button>
          </section>
          <button
            type="button"
            className="pcs-size-card"
            onClick={() => openStep("meeting")}
          >
            <span className="pcs-eyebrow">Más grande · esta semana</span>
            <strong>Proponer un encuentro</strong>
            <span>Algo sencillo: un café, caminar o ver una serie.</span>
            <span className="pcs-card-arrow" aria-hidden="true">
              {Ic.chevRight}
            </span>
          </button>
          <p className="pcs-small">
            Los tiempos son orientativos. Puedes ir a tu propio ritmo.
          </p>
          <div className="pcs-result-actions">
            <button className="pcs-skills" onClick={() => openStep("skills")}>
              {Ic.book} Aprender habilidades
            </button>
            <button className="pcs-secondary" onClick={() => navigate(2)}>
              Ahora no
            </button>
          </div>
          <details className="pcs-result-review">
            <summary>Revisar mi registro de prueba</summary>
            <p>
              {answered} de {EMA_ITEMS.length} preguntas respondidas. Las
              respuestas permanecen en esta sesión y se borran al recargar.
              Estas opciones no se seleccionan a partir de tus respuestas.
            </p>
            <div className="ema-actions">
              <Btn
                variant="secondary"
                fullWidth
                onClick={() => {
                  openBank()
                  navigate(3)
                }}
              >
                Revisar todas las preguntas
              </Btn>
              <Btn variant="secondary" fullWidth onClick={() => navigate(5)}>
                Ver mi plan de seguridad
              </Btn>
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => {
                  setDraft(createEmaDraft())
                  navigate(3)
                }}
              >
                Volver a probar el registro
              </Btn>
            </div>
          </details>
        </main>
        <div className="pcs-support-dock">
          <FloatingSupportBtn onPress={() => navigate(6)} bottom={8} />
        </div>
      </div>
    )

  return (
    <div
      className={`ema-screen ${
        draft.showBank ? "ema-bank-screen" : "ema-thread-screen"
      }`}
    >
      <StatusBar />
      <div className="ema-topbar">
        <button
          type="button"
          className={draft.showBank ? "ema-exit" : "pcs-round-back"}
          aria-label="Salir y continuar después"
          onClick={() => setShowExit(true)}
        >
          <span aria-hidden="true">{draft.showBank ? Ic.arrowLeft : Ic.x}</span>
          {draft.showBank && <span>Salir y continuar después</span>}
        </button>
      </div>
      <main
        ref={scroller}
        className={`ema-scroller ${
          draft.showBank ? "" : "ema-thread-scroller"
        }`}
      >
        {draft.showBank ? (
          <>
            <header className="ema-header">
              <span className="ema-review-label">Versión para evaluación</span>
              <h1>¿Cómo estoy hoy?</h1>
              <p>{EMA_INSTRUCTION}</p>
              <p className="ema-note">
                Escala de 1 a 7: 1 = Nada o muy poco · 7 = Extremadamente.
              </p>
            </header>
            <h2 className="ema-section-title">Todas las preguntas</h2>
            <p className="ema-note">
              Este banco incluye los {EMA_ITEMS.length} ítems para su
              evaluación. Por ahora no se aplica el límite de tres preguntas
              diarias. Puedes abrir cualquiera sin responder las anteriores.
            </p>
            <p className="ema-note">
              Usa respuestas de prueba. Se conservan durante esta sesión, no se
              envían a nadie y se borran al recargar.
            </p>
            <p className="ema-progress-text" role="status">
              {answered} de {EMA_ITEMS.length} respondidas
            </p>
            <div className="ema-actions" style={{ marginBottom: 18 }}>
              <Btn fullWidth onClick={() => showQuestion(draft.questionIndex)}>
                {answered ? "Continuar registro" : "Probar el registro"}
              </Btn>
            </div>
            <ol
              className="ema-bank"
              aria-label="Banco completo de preguntas EMA"
            >
              {EMA_ITEMS.map((item, index) => (
                <li key={item.id}>
                  <ActionCard
                    ariaLabel={`Ver pregunta ${index + 1}. ${item.text}`}
                    onClick={() => showQuestion(index)}
                    style={{ padding: 16 }}
                  >
                    <span className="ema-item-number">
                      Pregunta {index + 1} de {EMA_ITEMS.length}
                    </span>
                    <span className="ema-item-text">{item.text}</span>
                    <span className="ema-item-status">
                      {draft.answers[index] === null
                        ? "Sin responder"
                        : `Respuesta: ${emaScaleLabel(draft.answers[index]!)}`}
                    </span>
                  </ActionCard>
                </li>
              ))}
            </ol>
            <div className="ema-actions" style={{ marginTop: 18 }}>
              <Btn fullWidth disabled={!complete} onClick={finish}>
                Finalizar prueba del registro
              </Btn>
              {!complete && (
                <p className="ema-note">
                  Puedes revisar todo el banco sin responder. Para probar el
                  cierre del registro, responde los {EMA_ITEMS.length} ítems.
                </p>
              )}
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => setShowExit(true)}
              >
                Prefiero responder después
              </Btn>
            </div>
          </>
        ) : (
          <>
            <header className="ema-thread-banner">
              <div>
                <p>¿Cómo estoy hoy?</p>
                <h1>Tu tejido de hoy</h1>
                <span>
                  Hilo {draft.questionIndex + 1} de {EMA_ITEMS.length}
                </span>
              </div>
              <svg
                viewBox="0 0 120 50"
                role="progressbar"
                aria-label="Avance del registro"
                aria-valuemin={1}
                aria-valuemax={EMA_ITEMS.length}
                aria-valuenow={draft.questionIndex + 1}
              >
                {EMA_ITEMS.map((item, index) => {
                  const x = (index % 7) * 17
                  const y = Math.floor(index / 7) * 22 + 10
                  return (
                    <path
                      key={item.id}
                      d={`M${x} ${y} q4 -8 8 0 t8 0`}
                      fill="none"
                      stroke={
                        index <= draft.questionIndex ? "#3174A1" : "#CFE3EE"
                      }
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )
                })}
              </svg>
            </header>
            <button className="ema-bank-link" type="button" onClick={openBank}>
              Ver todas las preguntas
            </button>
            <div className="ema-thread-question">
              <p>{EMA_INSTRUCTION}</p>
              <h2 id="ema-current-question" ref={questionHeading} tabIndex={-1}>
                {question.text}
              </h2>
            </div>
            <fieldset
              className="ema-thread-scale"
              aria-labelledby="ema-current-question"
            >
              <legend className="ema-scale-legend">
                Elige una respuesta de 1 a 7
              </legend>
              <div className="ema-thread-options">
                <span className="ema-thread-track" aria-hidden="true">
                  <span
                    style={{
                      width: `${
                        selected === null ? 0 : ((selected - 1) / 6) * 100
                      }%`,
                    }}
                  />
                </span>
                {EMA_SCALE.map((value) => (
                  <label
                    key={value}
                    className={selected === value ? "is-selected" : ""}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={value}
                      checked={selected === value}
                      aria-label={emaScaleLabel(value)}
                      onChange={() =>
                        setDraft((current) =>
                          setEmaAnswer(current, current.questionIndex, value),
                        )
                      }
                    />
                    <span className="ema-thread-dot" aria-hidden="true" />
                    <span aria-hidden="true">{value}</span>
                  </label>
                ))}
              </div>
              <div className="ema-thread-endpoints">
                <span>Nada o muy poco</span>
                <span>Extremadamente</span>
              </div>
            </fieldset>
            <div className="ema-thread-actions">
              <button
                className="pcs-primary"
                onClick={() =>
                  draft.questionIndex < EMA_ITEMS.length - 1
                    ? showQuestion(draft.questionIndex + 1)
                    : complete
                      ? finish()
                      : openBank()
                }
              >
                {draft.questionIndex < EMA_ITEMS.length - 1
                  ? "Tejer y seguir"
                  : complete
                    ? "Tejer y terminar"
                    : "Revisar mis hilos"}
              </button>
              {draft.questionIndex > 0 && (
                <button
                  className="pcs-text-link"
                  onClick={() => showQuestion(draft.questionIndex - 1)}
                >
                  Hilo anterior
                </button>
              )}
              <button
                className="pcs-text-link"
                onClick={() => setShowExit(true)}
              >
                Prefiero no responder ahora
              </button>
            </div>
          </>
        )}
      </main>
      <div
        className={draft.showBank ? "ema-support-space" : "pcs-support-dock"}
        aria-hidden="true"
      />
      <FloatingSupportBtn
        onPress={() => navigate(6)}
        bottom={draft.showBank ? 20 : 8}
      />
      <Modal
        open={showExit}
        onClose={() => setShowExit(false)}
        title="¿Salir del registro?"
      >
        <p className="ema-note">
          Lo respondido se conservará durante esta sesión para que puedas
          retomar desde “¿Cómo estoy hoy?”. Recargar la página borra este
          registro de prueba.
        </p>
        <div className="ema-actions">
          <Btn variant="secondary" fullWidth onClick={() => navigate(2)}>
            Salir y continuar después
          </Btn>
          <Btn fullWidth onClick={() => setShowExit(false)}>
            Seguir revisando
          </Btn>
        </div>
      </Modal>
    </div>
  )
}
