import { useRef, useState } from "react"
import { canStrengthenRelationship, type JourneyState } from "../journey"
import { type ConnectionAction } from "../connection"
import { Ic } from "../ui"
import { metricsFor } from "./network"

interface Props {
  journey: JourneyState
  intent: ConnectionAction
  onOpen: (personId: string, action: ConnectionAction) => void
  onOpenNetwork: () => void
  onSkills: () => void
}

const actions = [
  {
    id: "message",
    title: "Mensaje para tejer cercanía",
    subtitle: "Ideas para escribirle hoy",
    icon: Ic.message,
  },
  {
    id: "contact",
    title: "Llamar o enviar audio",
    subtitle: "Prepara una forma de acercarte",
    icon: Ic.phone,
  },
  {
    id: "meeting",
    title: "Proponer un encuentro",
    subtitle: "Algo sencillo para verse",
    icon: Ic.calendar,
  },
] as const
const isAssessed = (person: JourneyState["people"][number]) =>
  person.status === "complete" &&
  person.answers.length >= 18 &&
  person.answers.every((value) => value !== null && Number.isFinite(value))

export default function ConnectionPersonScreen({
  journey,
  intent,
  onOpen,
  onOpenNetwork,
  onSkills,
}: Props) {
  const [selectedId, setSelectedId] = useState(journey.selectedPersonId)
  const panel = useRef<HTMLElement>(null)
  const selectPerson = (id: string) => {
    setSelectedId(id)
    window.requestAnimationFrame(() =>
      panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
    )
  }
  const selected = journey.people.find((person) => person.id === selectedId)
  const canOpen = selected
    ? canStrengthenRelationship(journey, selected.id)
    : false
  const shown = journey.people.slice(0, 8)
  const nodes = shown.map((person, index) => {
    const metrics = isAssessed(person) ? metricsFor(person) : null
    const radius =
      metrics?.ring === "Íntimo" ? 52 : metrics?.ring === "Personal" ? 90 : 125
    const angle =
      ((-110 + index * (360 / Math.max(shown.length, 3))) * Math.PI) / 180
    return {
      person,
      x: 160 + Math.cos(angle) * radius,
      y: 160 + Math.sin(angle) * radius,
    }
  })
  const selectedRing =
    selected && isAssessed(selected) ? metricsFor(selected).ring : null

  return (
    <>
      <h1 className="pcs-display">¿Te serviría sentirte acompañada?</h1>
      <p className="pcs-lead">
        Toca a alguien de tu tejido para ver formas de acercarte.
      </p>
      {journey.people.length === 0 ? (
        <section className="pcs-empty">
          <h2>Tu tejido puede empezar con una persona</h2>
          <p>
            Todavía no hay personas en tu red. Puedes conocerla e invitar a
            alguien cuando quieras.
          </p>
          <button className="pcs-primary" onClick={onOpenNetwork}>
            Conocer mi red
          </button>
        </section>
      ) : (
        <>
          <div
            className="pcs-person-map"
            role="group"
            aria-label="Personas de tu tejido"
          >
            <svg viewBox="0 0 320 320" aria-hidden="true">
              {[64, 100, 140].map((radius, index) => (
                <circle
                  key={radius}
                  cx="160"
                  cy="160"
                  r={radius}
                  fill={index === 0 ? "#FBEADD" : "none"}
                  stroke="#E5D8CA"
                  strokeDasharray={index === 0 ? undefined : "4 5"}
                />
              ))}
              {nodes.map(({ person, x, y }) => (
                <line
                  key={person.id}
                  x1="160"
                  y1="160"
                  x2={x}
                  y2={y}
                  stroke={selected?.id === person.id ? "#AA461D" : "#DFC5B0"}
                  strokeWidth={selected?.id === person.id ? 3 : 1.5}
                />
              ))}
            </svg>
            <span className="pcs-map-self">Tú</span>
            {nodes.map(({ person, x, y }) => (
              <button
                key={person.id}
                type="button"
                className={`pcs-map-person ${
                  selected?.id === person.id ? "is-selected" : ""
                }`}
                style={{ left: `${x / 3.2}%`, top: `${y / 3.2}%` }}
                aria-label={`Elegir a ${person.name}`}
                aria-pressed={selected?.id === person.id}
                onClick={() => selectPerson(person.id)}
              >
                <span className="pcs-person-icon" aria-hidden="true">
                  {Ic.user}
                </span>
                <span>{person.name}</span>
              </button>
            ))}
          </div>
          <div
            className="pcs-people-list"
            role="group"
            aria-label="Todas las personas de tu red"
          >
            {journey.people.map((person) => (
              <button
                type="button"
                key={person.id}
                className={selected?.id === person.id ? "is-selected" : ""}
                aria-pressed={selected?.id === person.id}
                onClick={() => selectPerson(person.id)}
              >
                {person.name}
              </button>
            ))}
          </div>
          {shown.length < journey.people.length && (
            <p className="pcs-small">
              El mapa muestra las primeras ocho personas; puedes elegir
              cualquiera desde la lista.
            </p>
          )}
          {selected ? (
            <section
              ref={panel}
              className="pcs-person-panel"
              aria-label={`Formas de acercarte a ${selected.name}`}
            >
              <div className="pcs-person-panel-heading">
                <div>
                  <h2>{selected.name}</h2>
                  <p>
                    {selectedRing
                      ? `Círculo ${selectedRing.toLowerCase()} de tu red`
                      : "Persona de tu red"}
                  </p>
                </div>
                <button className="pcs-skills" onClick={onSkills}>
                  {Ic.book}
                  <span>Habilidades</span>
                </button>
              </div>
              {!canOpen && (
                <p className="pcs-empty-note">
                  Para usar estas herramientas, esta persona debe aceptar la
                  invitación y tener un vínculo activo contigo.{" "}
                  <button onClick={onOpenNetwork}>
                    Revisar mi red e invitaciones
                  </button>
                </p>
              )}
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  disabled={!canOpen}
                  className={`pcs-person-action ${
                    intent === action.id ? "is-suggested" : ""
                  }`}
                  onClick={() => onOpen(selected.id, action.id)}
                >
                  <span className="pcs-action-icon" aria-hidden="true">
                    {action.icon}
                  </span>
                  <span>
                    <strong>{action.title}</strong>
                    <span>{action.subtitle}</span>
                  </span>
                  <span aria-hidden="true">{Ic.chevRight}</span>
                </button>
              ))}
            </section>
          ) : (
            <p className="pcs-empty">
              Elige una persona del mapa o de la lista para ver las opciones.
            </p>
          )}
        </>
      )}
    </>
  )
}
