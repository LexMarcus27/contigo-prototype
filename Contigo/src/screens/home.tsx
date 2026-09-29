import { useState } from "react"
import {
  BottomSheet,
  ActionCard,
  Btn,
  C,
  Card,
  FloatingSupportBtn,
  supportContentPadding,
  Ic,
  PCSBottomNav,
  StatusBar,
  StatusChip,
} from "../ui"
import {
  validCaregivers,
  type JourneyState,
  type NetworkEntry,
  type NetworkPerson,
} from "../journey"

interface HomeProps {
  navigate: (screen: number) => void
  journey: JourneyState
  setJourney: (
    next: JourneyState | ((current: JourneyState) => JourneyState),
  ) => void
  openNetwork: (entry: NetworkEntry) => void
  demoMode: boolean
}

type Sheet = "profile" | "notifications" | "history" | "caregivers" | "learning" | null

const moduleTints = [C.brandSoft, C.soft, C.soft, C.soft, C.criticalSoft]
const SUPPORT_BOTTOM = 104

export default function MobileHomeScreen({
  navigate,
  journey,
  setJourney,
  openNetwork,
}: HomeProps) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const [learningTitle, setLearningTitle] = useState("")
  const caregivers = validCaregivers(journey)
  const pendingInvitations = journey.people.filter(
    (person) => person.invitationStatus === "pending",
  ).length
  const completed = journey.people.filter(
    (person) => person.status === "complete",
  ).length
  const showWelcome = journey.onboardingStatus === "not-started"

  const openCareTools = () => {
    if (caregivers.length === 1) {
      setJourney((current) => ({
        ...current,
        selectedPersonId: caregivers[0].id,
      }))
      navigate(8)
      return
    }
    setSheet("caregivers")
  }

  const selectCaregiver = (person: NetworkPerson) => {
    setJourney((current) => ({ ...current, selectedPersonId: person.id }))
    setSheet(null)
    navigate(8)
  }

  const tools = [
    {
      title: "Conocer mi red",
      description: "Construye o revisa tu mapa e invita a personas cercanas",
      icon: Ic.users,
      status:
        pendingInvitations > 0
          ? `${pendingInvitations} ${pendingInvitations === 1 ? "invitación pendiente" : "invitaciones pendientes"}`
          : journey.mapGenerated
            ? `${completed} relaciones en tu mapa`
            : journey.mapStarted
              ? "Mapa en progreso"
              : "Aún no has comenzado",
      action: () =>
        openNetwork(
          journey.mapGenerated
            ? "results"
            : journey.mapStarted
              ? "progress"
              : "intro",
        ),
    },
    {
      title: "Cuidar un vínculo",
      description: "Mensajes, encuentros y preguntas para conectar",
      icon: Ic.heart,
      status:
        caregivers.length > 0
          ? `${caregivers.length} ${caregivers.length === 1 ? "cuidador informal asociado" : "cuidadores informales asociados"}`
          : "Necesita una invitación aceptada y una vinculación activa",
      action: openCareTools,
    },
    {
      title: "Registrar cómo estoy",
      description: "Registro breve y EMA",
      icon: Ic.clipboard,
      status: journey.dailyCheckInPending ? "Registro disponible" : "Registro al día",
      action: () => navigate(3),
    },
    {
      title: "Consultar mensajes y actividad",
      description: "Revisa tu acompañamiento y tus interacciones recientes",
      icon: Ic.message,
      status: "Sin actividad reciente",
      action: () => setSheet("history"),
    },
    {
      title: "Plan de seguridad y apoyo inmediato",
      description: "Consulta tu plan y encuentra apoyo cuando lo necesites",
      icon: Ic.shield,
      status: "Disponible sin cuidadores asociados",
      action: () => navigate(5),
    },
  ]

  const learning = ["Afrontar una crisis", "Habilidades interpersonales"]

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
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 20px 24px", paddingBottom: supportContentPadding(SUPPORT_BOTTOM) }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 22,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 27,
                fontWeight: 750,
                color: C.heading,
                margin: "0 0 5px",
                lineHeight: "32px",
              }}
            >
              Hola, Sofía
            </p>
            <p style={{ fontSize: 14, lineHeight: "20px", color: C.muted, margin: 0 }}>
              ¿Qué te gustaría hacer hoy?
            </p>
          </div>
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            <Btn variant="tertiary" icon={Ic.message} onClick={() => setSheet("notifications")} aria-label="Ver notificaciones">
              <span aria-hidden="true"> </span>
            </Btn>
            <Btn variant="secondary" icon={Ic.user} onClick={() => setSheet("profile")} aria-label="Abrir perfil">
              <span aria-hidden="true"> </span>
            </Btn>
          </div>
        </header>

        {showWelcome && (
          <Card
            style={{
              padding: 20,
              marginBottom: 24,
              background: `linear-gradient(145deg, ${C.brand}, ${C.brandHover})`,
              border: "none",
              color: C.surface,
              boxShadow: "0 12px 28px rgba(168,85,80,.18)",
            }}
          >
            <div style={{ color: C.surface, marginBottom: 12 }}>{Ic.users}</div>
            <p style={{ fontSize: 20, lineHeight: "26px", fontWeight: 750, margin: "0 0 8px" }}>
              Antes de empezar, reconoce las personas que forman parte de tu vida
            </p>
            <p style={{ fontSize: 13, lineHeight: "20px", color: C.surface, margin: "0 0 16px" }}>
              Construye tu mapa de red y, al terminar, invita a las personas cercanas con quienes quieras compartir la aplicación o fortalecer tu relación.
            </p>
            <Btn
              fullWidth
              onClick={() => {
                setJourney((current) => ({
                  ...current,
                  onboardingStatus: "in-progress",
                  onboardingWelcomeShown: true,
                }))
                openNetwork("intro")
              }}
              style={{ backgroundColor: C.surface, color: C.brand }}
            >
              Construir mi mapa
            </Btn>
            <Btn
              variant="tertiary"
              fullWidth
              onClick={() =>
                setJourney((current) => ({
                  ...current,
                  onboardingStatus: "deferred",
                  onboardingWelcomeShown: true,
                }))
              }
              style={{
                color: C.surface,
                border: `1px solid ${C.surface}`,
                backgroundColor: "transparent",
                marginTop: 10,
                minHeight: 44,
              }}
            >
              Hacerlo después
            </Btn>
          </Card>
        )}

        {!showWelcome && journey.onboardingStatus === "deferred" && !journey.mapGenerated && (
          <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.brand}` }}>
            <p style={{ fontSize: 12, fontWeight: 750, color: C.brand, margin: "0 0 5px" }}>TU MAPA TE ESPERA</p>
            <p style={{ fontSize: 14, lineHeight: "20px", color: C.body, margin: "0 0 12px" }}>
              Puedes reconocer tu red cuando te resulte posible. El plan y el apoyo inmediato siguen disponibles.
            </p>
            <Btn variant="secondary" fullWidth onClick={() => openNetwork("intro")}>Continuar mi mapa</Btn>
          </Card>
        )}

        <section>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 19, fontWeight: 750, color: C.heading, margin: "0 0 4px" }}>Tus herramientas</p>
            <p style={{ fontSize: 13, lineHeight: "19px", color: C.muted, margin: 0 }}>Elige la que te sea más útil en este momento.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {tools.map((tool, index) => (
              index === 4 ? (
              <Card key={tool.title} style={{ padding: 16, boxShadow: "0 5px 16px rgba(58,50,56,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      backgroundColor: moduleTints[index],
                      color: index === 4 ? C.critical : index === 2 ? C.warm : index === 1 ? C.blue : C.brand,
                    }}
                  >
                    {tool.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 16, lineHeight: "21px", fontWeight: 750, color: C.heading, margin: "0 0 4px" }}>{tool.title}</p>
                    <p style={{ fontSize: 13, lineHeight: "18px", color: C.muted, margin: "0 0 7px" }}>{tool.description}</p>
                    <p style={{ fontSize: 11.5, lineHeight: "16px", fontWeight: 650, color: index === 4 ? C.critical : C.brand, margin: 0 }}>{tool.status}</p>
                  </div>
                  <span aria-hidden="true" style={{ color: C.critical, flexShrink: 0 }}>{Ic.shield}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                  <Btn variant="secondary" small onClick={() => navigate(5)}>Ver mi plan</Btn>
                  <Btn variant="critical" small onClick={() => navigate(6)}>Apoyo ahora</Btn>
                </div>
              </Card>
              ) : (
                <ActionCard
                  key={tool.title}
                  onClick={tool.action}
                  ariaLabel={`${tool.title}. ${tool.description}. ${tool.status}`}
                  style={{ padding: 16, boxShadow: "0 5px 16px rgba(58,50,56,.06)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", flexShrink: 0, backgroundColor: moduleTints[index], color: index === 2 ? C.warm : index === 1 ? C.blue : C.brand }}>
                      {tool.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 16, lineHeight: "21px", fontWeight: 750, color: C.heading, margin: "0 0 4px" }}>{tool.title}</p>
                      <p style={{ fontSize: 13, lineHeight: "18px", color: C.muted, margin: "0 0 7px" }}>{tool.description}</p>
                      <p style={{ fontSize: 11.5, lineHeight: "16px", fontWeight: 650, color: C.brand, margin: 0 }}>{tool.status}</p>
                    </div>
                    <span aria-hidden="true" style={{ color: C.brand, flexShrink: 0 }}>{Ic.chevRight}</span>
                  </div>
                </ActionCard>
              )
            ))}
          </div>
        </section>

        <section style={{ marginTop: 30 }}>
          <p style={{ fontSize: 19, fontWeight: 750, color: C.heading, margin: "0 0 4px" }}>Aprender habilidades</p>
          <p style={{ fontSize: 13, lineHeight: "19px", color: C.muted, margin: "0 0 14px" }}>
            Recursos breves para afrontar momentos difíciles y fortalecer tus relaciones.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {learning.map((title, index) => (
              <Card key={title} style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 76, backgroundColor: index === 0 ? C.brandSoft : C.soft, display: "grid", placeItems: "center", color: index === 0 ? C.brand : C.blue }}>
                  {index === 0 ? Ic.shield : Ic.users}
                </div>
                <div style={{ padding: 15 }}>
                  <p style={{ fontSize: 15, fontWeight: 750, color: C.heading, margin: "0 0 6px" }}>{title}</p>
                  <p style={{ fontSize: 12, lineHeight: "18px", color: C.muted, margin: "0 0 12px" }}>Contenido pendiente de validación por el equipo investigador.</p>
                  <Btn variant="secondary" fullWidth small onClick={() => { setLearningTitle(title); setSheet("learning") }}>Explorar contenido</Btn>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={SUPPORT_BOTTOM} />
      <PCSBottomNav active="inicio" navigate={navigate} />

      <BottomSheet open={sheet === "caregivers"} onClose={() => setSheet(null)} title="Cuidar un vínculo">
        {caregivers.length === 0 ? (
          <div>
            <StatusChip label="Sin cuidadores asociados" variant="warn" />
            <p style={{ fontSize: 15, lineHeight: "22px", color: C.body, margin: "15px 0 7px", fontWeight: 700 }}>Todavía no hay un vínculo habilitado</p>
            <p style={{ fontSize: 13, lineHeight: "20px", color: C.muted, margin: "0 0 18px" }}>
              Cuando alguien acepte tu invitación y quede vinculado contigo, podrás usar aquí mensajes, encuentros y preguntas para conectar.
            </p>
            <Btn fullWidth onClick={() => { setSheet(null); openNetwork(journey.mapGenerated ? "results" : "auto") }}>Invitar a alguien</Btn>
            <Btn variant="tertiary" fullWidth onClick={() => setSheet(null)} style={{ marginTop: 7 }}>Volver al inicio</Btn>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, lineHeight: "20px", color: C.muted, margin: "0 0 13px" }}>Elige un cuidador informal asociado para esta actividad.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {caregivers.map((person) => (
                <ActionCard key={person.id} ariaLabel={`Elegir a ${person.name}, cuidador informal asociado`} onClick={() => selectCaregiver(person)} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: C.brand }}>{Ic.user}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.heading }}>{person.name}</span>
                  <StatusChip label="Asociado" variant="ok" />
                </ActionCard>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={sheet === "history"} onClose={() => setSheet(null)} title="Mensajes y actividad">
        <div style={{ textAlign: "center", padding: "14px 0" }}>
          <div style={{ color: C.brand, marginBottom: 12 }}>{Ic.message}</div>
          <p style={{ fontSize: 16, fontWeight: 750, color: C.heading, margin: "0 0 7px" }}>Aún no hay actividad para mostrar</p>
          <p style={{ fontSize: 13, lineHeight: "20px", color: C.muted, margin: "0 0 18px" }}>Este prototipo no muestra interacciones clínicas ni mensajes inventados.</p>
          <Btn variant="secondary" fullWidth onClick={() => setSheet(null)}>Volver al inicio</Btn>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "learning"} onClose={() => setSheet(null)} title={learningTitle}>
        <div style={{ textAlign: "center" }}>
          <div style={{ height: 100, borderRadius: 14, backgroundColor: C.soft, color: C.brand, display: "grid", placeItems: "center", marginBottom: 16 }}>{learningTitle === learning[0] ? Ic.shield : Ic.users}</div>
          <p style={{ fontSize: 14, lineHeight: "21px", color: C.muted, margin: "0 0 18px" }}>Este contenido será proporcionado y validado por el equipo investigador.</p>
          <Btn variant="secondary" fullWidth onClick={() => setSheet(null)}>Volver</Btn>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "profile" || sheet === "notifications"} onClose={() => setSheet(null)} title={sheet === "profile" ? "Tu perfil" : "Notificaciones"}>
        <p style={{ fontSize: 14, lineHeight: "21px", color: C.muted, margin: "0 0 18px" }}>
          {sheet === "profile" ? "Desde aquí podrás revisar tu cuenta, privacidad y preferencias de acompañamiento." : "No tienes notificaciones nuevas."}
        </p>
        <Btn variant="secondary" fullWidth onClick={() => setSheet(null)}>Cerrar</Btn>
      </BottomSheet>
    </div>
  )
}
