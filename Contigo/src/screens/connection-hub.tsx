import { useEffect, useRef, useState } from "react"
import { validCaregivers, type JourneyState } from "../journey"
import {
  CONNECTION_STEPS,
  connectionStepContent,
  nextConnectionStep,
  type ConnectionAction,
  type ConnectionStep,
} from "../connection"
import { BottomSheet, Btn, FloatingSupportBtn, Ic, StatusBar } from "../ui"
import CompanionNote from "../components/companion-note"
import ConnectionPersonScreen from "./connection-person"

interface ConnectionHubProps {
  navigate: (screen: number) => void
  journey: JourneyState
  openNetwork: () => void
  receivedCaringCount: number
  initialStep: ConnectionStep | null
  onOpenConnection: (personId: string, action: ConnectionAction) => void
}

const icons = {
  message: Ic.message,
  received: Ic.heart,
  contact: Ic.users,
  meeting: Ic.calendar,
  skills: Ic.book,
}

export default function ConnectionHubScreen({
  navigate,
  journey,
  openNetwork,
  receivedCaringCount,
  initialStep,
  onOpenConnection,
}: ConnectionHubProps) {
  const [showResource, setShowResource] = useState(initialStep === "skills")
  const [view, setView] = useState<"home" | "people">(
    initialStep && initialStep !== "skills" && initialStep !== "received"
      ? "people"
      : "home",
  )
  const [intent, setIntent] = useState<ConnectionAction>(
    initialStep === "contact" || initialStep === "meeting"
      ? initialStep
      : "message",
  )
  const [step, setStep] = useState<ConnectionStep>("message")
  const scroller = useRef<HTMLElement>(null)
  const people = validCaregivers(journey)
  const person =
    people.find((item) => item.id === journey.selectedPersonId) ?? people[0]
  const featured = connectionStepContent(step, person?.name)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [view])
  const openStep = (next: ConnectionStep) => {
    if (next === "received") {
      navigate(27)
      return
    }
    if (next === "skills") {
      setShowResource(true)
      return
    }
    setIntent(next)
    setView("people")
  }

  return (
    <div className="pcs-internal-screen">
      <StatusBar />
      <header className="pcs-internal-top">
        <button
          className="pcs-round-back"
          aria-label={
            view === "home" ? "Volver al inicio" : "Volver a Tejiendo vínculos"
          }
          onClick={() => (view === "home" ? navigate(2) : setView("home"))}
        >
          {Ic.arrowLeft}
        </button>
        <span className="pcs-module-label">{Ic.link} Tejiendo vínculos</span>
      </header>
      <main className="pcs-internal-scroller" ref={scroller}>
        {view === "home" ? (
          <>
            <CompanionNote>
              <p>Tejer vínculos se hace paso a paso y de muchas formas.</p>
              <h1>¿Qué paso quieres dar hoy?</h1>
            </CompanionNote>
            <section
              className="pcs-featured-step"
              aria-label="Un paso para hoy"
            >
              <p className="pcs-eyebrow">Un paso para hoy</p>
              <div
                aria-live="polite"
                aria-atomic="true"
                className="pcs-featured-description"
              >
                <span className="pcs-action-icon" aria-hidden="true">
                  {icons[step]}
                </span>
                <div>
                  <h2>{featured.title}</h2>
                  <p>{featured.description}</p>
                </div>
              </div>
              <div className="pcs-featured-actions">
                <button className="pcs-primary" onClick={() => openStep(step)}>
                  {featured.button}
                </button>
                <button
                  className="pcs-secondary"
                  onClick={() =>
                    setStep((current) => nextConnectionStep(current))
                  }
                >
                  Otro paso
                </button>
              </div>
            </section>
            <h2 className="pcs-section-title">Otros pasos</h2>
            <div className="pcs-step-grid">
              {CONNECTION_STEPS.map((item) => (
                <button type="button" key={item} onClick={() => openStep(item)}>
                  <span aria-hidden="true">{icons[item]}</span>
                  <strong>
                    {connectionStepContent(item).tile}
                    {item === "received" && receivedCaringCount > 0
                      ? ` (${receivedCaringCount})`
                      : ""}
                  </strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <ConnectionPersonScreen
            journey={journey}
            intent={intent}
            onOpen={onOpenConnection}
            onOpenNetwork={openNetwork}
            onSkills={() => setShowResource(true)}
          />
        )}
      </main>
      <div className="pcs-support-dock">
        <FloatingSupportBtn onPress={() => navigate(6)} bottom={8} />
      </div>
      <BottomSheet
        open={showResource}
        onClose={() => setShowResource(false)}
        title="Habilidades interpersonales"
      >
        <p>
          Este contenido será proporcionado y validado por el equipo
          investigador.
        </p>
        <Btn
          variant="secondary"
          fullWidth
          onClick={() => setShowResource(false)}
        >
          Volver
        </Btn>
      </BottomSheet>
    </div>
  )
}
