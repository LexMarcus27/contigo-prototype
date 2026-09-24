import { useState } from "react"
import {
  BottomSheet,
  Btn,
  C,
  Card,
  FloatingSupportBtn,
  Ic,
  PCSBottomNav,
  StatusBar,
  StatusChip,
} from "../ui"
import {
  createDemoJourney,
  EMPTY_JOURNEY,
  type JourneyState,
  type NetworkEntry,
} from "../journey"

type HomeVariant = "auto" | "first" | "progress" | "ready" | "selected" | "activity" | "check-in" | "offline" | "error"

interface HomeProps {
  navigate: (screen: number) => void
  journey: JourneyState
  setJourney: (
    next: JourneyState | ((current: JourneyState) => JourneyState),
  ) => void
  openNetwork: (entry: NetworkEntry) => void
  demoMode: boolean
}

const demoProgress: JourneyState = {
  ...EMPTY_JOURNEY,
  mapStarted: true,
  people: [
    {
      id: "demo-progress-m",
      name: "M.",
      relationshipType: "Familia",
      answers: Array(18).fill(5),
      status: "complete",
    },
    {
      id: "demo-progress-alex",
      name: "Alex",
      answers: Array(18).fill(null),
      status: "pending",
    },
  ],
}

function deriveVariant(journey: JourneyState): Exclude<HomeVariant, "auto"> {
  if (journey.activityInProgress) return "activity"
  if (journey.selectedPersonId) return "selected"
  if (journey.mapGenerated) return "ready"
  if (journey.mapStarted || journey.people.length > 0) return "progress"
  return "first"
}

export default function MobileHomeScreen({
  navigate,
  journey,
  setJourney,
  openNetwork,
  demoMode,
}: HomeProps) {
  const [toolsOpen, setToolsOpen] = useState(false)
  const [headerPanel, setHeaderPanel] =
    useState<"notifications" | "profile" | null>(null)
  const [variant, setVariant] = useState<HomeVariant>("auto")

  const effectiveVariant = variant === "auto" ? deriveVariant(journey) : variant
  const completed = journey.people.filter(
    (person) => person.status === "complete",
  ).length
  const selectedPerson = journey.people.find(
    (person) => person.id === journey.selectedPersonId,
  )

  const selectDemoVariant = (nextVariant: HomeVariant) => {
    setVariant(nextVariant)
    if (nextVariant === "first") setJourney({ ...EMPTY_JOURNEY })
    if (nextVariant === "progress")
      setJourney({
        ...demoProgress,
        people: demoProgress.people.map((person) => ({
          ...person,
          answers: [...person.answers],
        })),
      })
    if (
      nextVariant === "ready" ||
      nextVariant === "check-in" ||
      nextVariant === "offline" ||
      nextVariant === "error"
    ) {
      setJourney(createDemoJourney())
    }
    if (nextVariant === "selected" || nextVariant === "activity") {
      const demo = createDemoJourney()
      setJourney({
        ...demo,
        selectedPersonId: demo.people[0].id,
        activityInProgress: nextVariant === "activity",
      })
    }
  }

  const nextStep = (() => {
    if (effectiveVariant === "error") {
      return {
        eyebrow: "No pudimos actualizar tu información",
        title: "Puedes intentarlo de nuevo o continuar con otra herramienta.",
        action: "Intentar de nuevo",
        onAction: () => setVariant("auto"),
      }
    }
    if (effectiveVariant === "offline") {
      return {
        eyebrow: "Estás sin conexión",
        title:
          "Tu plan de seguridad sigue disponible. Los cambios se sincronizarán después.",
        action: "Ver mi plan",
        onAction: () => navigate(5),
      }
    }
    if (effectiveVariant === "check-in") {
      return {
        eyebrow: "Tu siguiente paso",
        title:
          "¿Quieres registrar cómo estás hoy? Puedes hacerlo a tu propio ritmo.",
        action: "Registrar cómo estoy",
        onAction: () => navigate(3),
      }
    }
    if (effectiveVariant === "activity") {
      return {
        eyebrow: "Tu siguiente paso",
        title: `Retoma la actividad que guardaste${
          selectedPerson ? ` con ${selectedPerson.name}` : ""
        }.`,
        action: "Retomar actividad",
        onAction: () => navigate(8),
      }
    }
    if (effectiveVariant === "selected") {
      return {
        eyebrow: "Tu siguiente paso",
        title: `Continúa fortaleciendo tu vínculo${
          selectedPerson ? ` con ${selectedPerson.name}` : ""
        }.`,
        action: "Tejer este vínculo",
        onAction: () => navigate(8),
      }
    }
    if (effectiveVariant === "ready") {
      return {
        eyebrow: "Tu mapa está listo",
        title: "Revísalo y elige libremente dónde te gustaría tejer.",
        action: "Ver mi red y elegir",
        onAction: () => openNetwork("results"),
      }
    }
    if (effectiveVariant === "progress") {
      return {
        eyebrow: "Tu siguiente paso",
        title: "Continúa construyendo tu red cuando te resulte posible.",
        action: "Continuar mi mapa",
        onAction: () => openNetwork("progress"),
      }
    }
    return {
      eyebrow: "Tu siguiente paso",
      title: "Empieza reconociendo las personas que forman parte de tu vida.",
      action: "Construir mi mapa",
      onAction: () => openNetwork("intro"),
    }
  })()

  const stages = [
    {
      number: 1,
      title: "¿Dónde quieres tejer?",
      subtitle: "Conoce tu red",
      description:
        "Reconoce con quiénes cuentas hoy y observa cómo está tejida tu red.",
      status: journey.mapGenerated
        ? "Completado"
        : journey.mapStarted
          ? "En progreso"
          : "Recomendado",
      statusVariant: journey.mapGenerated
        ? "ok"
        : journey.mapStarted
          ? "warn"
          : "blue",
      detail:
        journey.people.length > 0
          ? `${completed} de ${journey.people.length} relaciones caracterizadas`
          : undefined,
      action: journey.mapGenerated
        ? "Ver mi red"
        : journey.mapStarted
          ? "Continuar mi mapa"
          : "Construir mi mapa",
      onAction: () =>
        openNetwork(
          journey.mapGenerated
            ? "results"
            : journey.mapStarted
              ? "progress"
              : "intro",
        ),
      active: ["first", "progress"].includes(effectiveVariant),
    },
    {
      number: 2,
      title: "Elige un vínculo",
      description:
        "Escoge una relación en la que te gustaría acercarte, comunicarte o recibir acompañamiento.",
      status: selectedPerson
        ? "Persona seleccionada"
        : journey.mapGenerated
          ? "Siguiente paso"
          : "Disponible",
      statusVariant: selectedPerson
        ? "ok"
        : journey.mapGenerated
          ? "blue"
          : "default",
      detail: selectedPerson
        ? `Elegiste tejer con ${selectedPerson.name}.`
        : undefined,
      action: selectedPerson ? "Cambiar elección" : "Elegir una persona",
      onAction: () => openNetwork("results"),
      active: effectiveVariant === "ready",
    },
    {
      number: 3,
      title: "Teje el vínculo",
      description: selectedPerson
        ? `Encuentra formas pequeñas y cuidadosas de acercarte a ${selectedPerson.name}.`
        : "Explora formas cuidadosas de acercarte a una persona importante para ti.",
      status: journey.activityInProgress
        ? "Actividad en curso"
        : selectedPerson
          ? "Listo para comenzar"
          : "Disponible para explorar",
      statusVariant: journey.activityInProgress
        ? "warn"
        : selectedPerson
          ? "ok"
          : "default",
      action: journey.activityInProgress
        ? "Retomar"
        : selectedPerson
          ? "Continuar fortaleciendo este vínculo"
          : "Explorar herramientas",
      onAction: () => navigate(8),
      active: ["selected", "activity"].includes(effectiveVariant),
    },
    {
      number: 4,
      title: "Observa tu proceso",
      description:
        "Registra cómo estás y observa tus interacciones con calma, a tu propio ritmo.",
      status: journey.dailyCheckInPending ? "Registro disponible" : "Al día",
      statusVariant: journey.dailyCheckInPending ? "warm" : "ok",
      action: journey.dailyCheckInPending
        ? "Registrar cómo estoy"
        : "Ver actividad reciente",
      onAction: () => navigate(3),
      active: effectiveVariant === "check-in",
    },
  ] as const

  const tools: Array<{
    title: string
    description: string
    action: () => void
  }> = [
    {
      title: "Conocer mi red",
      description: "Construir o revisar mi mapa",
      action: () => openNetwork(journey.mapGenerated ? "results" : "auto"),
    },
    {
      title: "Cuidar un vínculo",
      description: "Mensajes, encuentros y preguntas para conectar",
      action: () => navigate(8),
    },
    {
      title: "Registrar cómo estoy",
      description: "Registro breve y EMA",
      action: () => navigate(3),
    },
    {
      title: "Consultar mensajes y actividad",
      description: "Acompañamiento reciente",
      action: () => navigate(8),
    },
    {
      title: "Plan de seguridad y apoyo inmediato",
      description: "Disponible incluso sin conexión",
      action: () => navigate(5),
    },
  ]

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: C.canvas,
        position: "relative",
      }}
    >
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 180px" }}>
        {demoMode && (
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="home-demo-state"
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                marginBottom: 5,
              }}
            >
              Demo · Estado de pantalla
            </label>
            <select
              id="home-demo-state"
              value={variant}
              onChange={(event) =>
                selectDemoVariant(event.target.value as HomeVariant)
              }
              style={{
                width: "100%",
                height: 40,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "0 10px",
                color: C.body,
                backgroundColor: C.surface,
              }}
            >
              <option value="auto">Automático</option>
              <option value="first">Primer ingreso</option>
              <option value="progress">Mapa en progreso</option>
              <option value="ready">Mapa listo</option>
              <option value="selected">Persona elegida</option>
              <option value="activity">Actividad</option>
              <option value="check-in">Registro pendiente</option>
              <option value="offline">Sin conexión</option>
              <option value="error">Error</option>
            </select>
          </div>
        )}

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 27,
                color: C.heading,
                margin: "0 0 5px",
                lineHeight: "32px",
              }}
            >
              Hola, Sofía
            </h1>
            <p
              style={{
                fontSize: 14,
                lineHeight: "20px",
                color: C.muted,
                margin: 0,
              }}
            >
              Aquí puedes reconocer tu red, cuidar tus vínculos y encontrar
              apoyo cuando lo necesites.
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              aria-label="Ver notificaciones"
              onClick={() => setHeaderPanel("notifications")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: C.surface,
                color: C.brand,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              {Ic.message}
            </button>
            <button
              type="button"
              aria-label="Abrir perfil"
              onClick={() => setHeaderPanel("profile")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                border: "none",
                background: C.brandSoft,
                color: C.brand,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              {Ic.user}
            </button>
          </div>
        </header>

        <section
          style={{
            background: `linear-gradient(145deg, ${C.brand}, ${C.brandHover})`,
            borderRadius: 20,
            padding: 20,
            color: "white",
            marginBottom: 24,
            boxShadow: "0 12px 28px rgba(36,107,100,.18)",
          }}
        >
          <p
            style={{
              margin: "0 0 7px",
              fontSize: 12,
              fontWeight: 750,
              letterSpacing: ".04em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.72)",
            }}
          >
            {nextStep.eyebrow}
          </p>
          <h2 style={{ margin: "0 0 16px", fontSize: 19, lineHeight: "26px" }}>
            {nextStep.title}
          </h2>
          <Btn
            fullWidth
            onClick={nextStep.onAction}
            style={{ backgroundColor: "white", color: C.brand, height: 46 }}
          >
            {nextStep.action}
          </Btn>
        </section>

        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 19, color: C.heading, margin: "0 0 4px" }}>
            Tu recorrido
          </h2>
          <p
            style={{
              fontSize: 13,
              lineHeight: "19px",
              color: C.muted,
              margin: 0,
            }}
          >
            Es una ruta recomendada. Puedes explorarla a tu propio ritmo.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 22,
              top: 28,
              bottom: 34,
              width: 2,
              background: `linear-gradient(${C.brandSoft}, ${C.border})`,
            }}
          />
          {stages.map((stage) => (
            <div
              key={stage.number}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "46px 1fr",
                gap: 10,
                paddingBottom: 14,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: stage.active ? C.brand : C.surface,
                  color: stage.active ? "white" : C.brand,
                  border: `2px solid ${stage.active ? C.brand : C.brandSoft}`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 15,
                  fontWeight: 750,
                  zIndex: 1,
                }}
              >
                {stage.number}
              </div>
              <Card
                style={{
                  padding: 17,
                  border: stage.active
                    ? `2px solid ${C.brand}`
                    : `1px solid ${C.border}`,
                  boxShadow: stage.active
                    ? "0 9px 22px rgba(36,107,100,.12)"
                    : "0 3px 12px rgba(23,52,58,.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 16,
                        lineHeight: "21px",
                        color: C.heading,
                        margin: 0,
                      }}
                    >
                      {stage.title}
                    </h3>
                    {"subtitle" in stage && stage.subtitle && (
                      <p
                        style={{
                          margin: "2px 0 0",
                          color: C.brand,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {stage.subtitle}
                      </p>
                    )}
                  </div>
                  <StatusChip
                    label={stage.status}
                    variant={stage.statusVariant}
                  />
                </div>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: "19px",
                    color: C.muted,
                    margin: "0 0 8px",
                  }}
                >
                  {stage.description}
                </p>
                {"detail" in stage && stage.detail && (
                  <p
                    style={{
                      fontSize: 12,
                      color: C.body,
                      fontWeight: 650,
                      margin: "0 0 10px",
                    }}
                  >
                    {stage.detail}
                  </p>
                )}
                <button
                  type="button"
                  onClick={stage.onAction}
                  style={{
                    minHeight: 44,
                    border: "none",
                    background: "transparent",
                    color: C.brand,
                    padding: 0,
                    fontFamily: "inherit",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    textAlign: "left",
                  }}
                >
                  {stage.action} {Ic.chevRight}
                </button>
              </Card>
            </div>
          ))}
        </div>

        <Btn
          variant="secondary"
          fullWidth
          onClick={() => setToolsOpen(true)}
          style={{ marginTop: 4 }}
        >
          Ver todas las herramientas
        </Btn>
      </div>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={92} />
      <PCSBottomNav active="inicio" navigate={navigate} />

      <BottomSheet
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        title="Todas las herramientas"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tools.map(({ title, description, action }) => (
            <button
              type="button"
              key={title}
              onClick={action}
              style={{
                width: "100%",
                minHeight: 62,
                border: `1px solid ${C.border}`,
                borderRadius: 13,
                padding: "12px 14px",
                background: C.surface,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span>
                <strong
                  style={{
                    display: "block",
                    color: C.heading,
                    fontSize: 14,
                    marginBottom: 3,
                  }}
                >
                  {title}
                </strong>
                <span
                  style={{ color: C.muted, fontSize: 12, lineHeight: "17px" }}
                >
                  {description}
                </span>
              </span>
              <span style={{ color: C.brand, flexShrink: 0 }}>
                {Ic.chevRight}
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        open={headerPanel !== null}
        onClose={() => setHeaderPanel(null)}
        title={headerPanel === "profile" ? "Tu perfil" : "Notificaciones"}
      >
        <p
          style={{
            fontSize: 14,
            color: C.muted,
            lineHeight: "21px",
            margin: "0 0 18px",
          }}
        >
          {headerPanel === "profile"
            ? "Desde aquí podrás revisar tu cuenta, privacidad y preferencias de acompañamiento."
            : "No tienes notificaciones nuevas. Tus mensajes sensibles se mantienen privados en esta vista."}
        </p>
        <Btn variant="secondary" fullWidth onClick={() => setHeaderPanel(null)}>
          Cerrar
        </Btn>
      </BottomSheet>
    </div>
  )
}
