import { useState } from "react"
import {
  ActionCard,
  BottomSheet,
  Btn,
  C,
  FloatingSupportBtn,
  Ic,
  StatusChip,
  supportContentPadding,
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
type TileKind = "network" | "connection" | "help" | "checkin"

const SUPPORT_BOTTOM = 92
const avatarColors = [
  { background: "#F2DDD1", figure: "#D49A78" },
  { background: "#E8E2F7", figure: "#9C8AD3" },
  { background: "#E0EEE1", figure: "#8DAD83" },
  { background: "#DFECF5", figure: "#80ACCB" },
]

function HomePlant() {
  return (
    <svg className="home-plant" viewBox="0 0 158 148" fill="none" aria-hidden="true">
      <ellipse cx="48" cy="136" rx="41" ry="12" fill="#EEE8DF" />
      <ellipse cx="112" cy="137" rx="35" ry="14" fill="#F1CDB5" />
      <circle cx="91" cy="44" r="28" fill="#F0B896" />
      <path d="M110 139C107 103 107 72 92 47" stroke="#6D936D" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M109 101C98 80 78 70 54 72" stroke="#6D936D" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M109 82C113 52 126 36 136 20" stroke="#6D936D" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M55 72C42 57 31 55 14 57C24 69 39 73 55 72Z" fill="#779A70" />
      <path d="M135 22C136 12 141 5 150 1C149 20 144 36 127 49C126 39 129 29 135 22Z" fill="#72966D" />
      <path d="M94 49C86 38 82 35 75 31C78 47 86 60 101 67" fill="#A9BC95" />
    </svg>
  )
}

function HomeAvatar({ index }: { index: number }) {
  const colors = avatarColors[index % avatarColors.length]
  return (
    <svg viewBox="0 0 74 74" width="52" height="52" aria-hidden="true">
      <circle cx="37" cy="37" r="35" fill={colors.background} stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="37" cy="39" r="9" fill={colors.figure} />
      <path d="M17 67C19 55 27 51 37 51S55 55 57 67" fill={colors.figure} />
    </svg>
  )
}

function TileIcon({ kind }: { kind: TileKind }) {
  const shared = {
    width: 30,
    height: 30,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  }
  if (kind === "network")
    return (
      <svg {...shared}>
        <circle cx="16" cy="6" r="3" />
        <circle cx="6" cy="25" r="3" />
        <circle cx="26" cy="25" r="3" />
        <path d="M14.7 8.7L7.3 22M17.3 8.7L24.7 22M9 25h14" />
      </svg>
    )
  if (kind === "connection")
    return (
      <svg {...shared}>
        <path d="M16 16c-2.8-4.5-5.7-6.5-8.5-6.5a5.5 5.5 0 0 0 0 11c2.8 0 5.7-2 8.5-6.5 2.8 4.5 5.7 6.5 8.5 6.5a5.5 5.5 0 0 0 0-11c-2.8 0-5.7 2-8.5 6.5Z" />
      </svg>
    )
  if (kind === "help")
    return (
      <svg {...shared}>
        <circle cx="16" cy="16" r="12" />
        <circle cx="16" cy="16" r="5" />
        <path d="M8 8l4.5 4.5M24 8l-4.5 4.5M8 24l4.5-4.5M24 24l-4.5-4.5" />
      </svg>
    )
  return (
    <svg {...shared}>
      <circle cx="16" cy="16" r="5" />
      <path d="M16 2v5M16 25v5M2 16h5M25 16h5M6 6l3.5 3.5M22.5 22.5L26 26M26 6l-3.5 3.5M9.5 22.5L6 26" />
    </svg>
  )
}

function HomeTile({
  kind,
  title,
  description,
  onClick,
}: {
  kind: TileKind
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`home-tile home-tile--${kind}`}
      onClick={onClick}
      aria-label={`${title}. ${description}`}
    >
      <span className="home-tile-icon"><TileIcon kind={kind} /></span>
      <span className="home-tile-title">{title}</span>
      <span className="home-tile-description">{description}</span>
    </button>
  )
}

function HomeBottomNav({
  onNetwork,
  onDay,
  onProfile,
}: {
  onNetwork: () => void
  onDay: () => void
  onProfile: () => void
}) {
  const tabs = [
    { label: "Inicio", icon: Ic.home, action: () => {}, current: true },
    { label: "Vínculos", icon: <TileIcon kind="connection" />, action: onNetwork },
    { label: "Mi día", icon: Ic.calendar, action: onDay },
    { label: "Perfil", icon: Ic.user, action: onProfile },
  ]
  return (
    <nav className="home-bottom-nav" aria-label="Navegación principal">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className={tab.current ? "home-bottom-tab is-active" : "home-bottom-tab"}
          aria-current={tab.current ? "page" : undefined}
          onClick={tab.action}
        >
          <span className="home-bottom-icon" aria-hidden="true">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function MobileHomeScreen({
  navigate,
  journey,
  setJourney,
  openNetwork,
}: HomeProps) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const [learningTitle, setLearningTitle] = useState("")
  const caregivers = validCaregivers(journey)
  const showWelcome = journey.onboardingStatus === "not-started"
  const people = journey.people.slice(0, 4)

  const openMap = () =>
    openNetwork(
      journey.mapGenerated
        ? "results"
        : journey.mapStarted
          ? "progress"
          : "intro",
    )

  const startMap = () => {
    setJourney((current) => ({
      ...current,
      onboardingStatus: "in-progress",
      onboardingWelcomeShown: true,
    }))
    openNetwork("intro")
  }

  const deferMap = () => {
    setJourney((current) => ({
      ...current,
      onboardingStatus: "deferred",
      onboardingWelcomeShown: true,
    }))
  }

  const openCareTools = () => {
    if (caregivers.length === 1) {
      setJourney((current) => ({ ...current, selectedPersonId: caregivers[0].id }))
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

  const learning = ["Afrontar una crisis", "Habilidades interpersonales"]

  return (
    <div className="home-screen">
      <main className="home-scroller" style={{ paddingBottom: supportContentPadding(SUPPORT_BOTTOM) }}>
        <header className="home-hero">
          <HomePlant />
          <h1>Inicio</h1>
          <p>¡Hola, Sofía! Qué bueno verte.</p>
        </header>

        <section className="home-links" aria-labelledby="home-links-title">
          <div className="home-section-heading">
            <h2 id="home-links-title">Mis vínculos</h2>
            <button type="button" onClick={openMap}>Ver todos</button>
          </div>
          <div className="home-avatars">
            {Array.from({ length: 4 }, (_, index) => {
              const person = people[index]
              return (
                <button
                  type="button"
                  className="home-avatar-button"
                  key={person?.id ?? `empty-${index}`}
                  onClick={openMap}
                  aria-label={person ? `Ver a ${person.name} en mi mapa` : "Agregar persona a mi mapa"}
                >
                  <HomeAvatar index={index} />
                  <span>{person?.name ?? "Añadir"}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="home-tile-grid" aria-label="Herramientas principales">
          <HomeTile kind="network" title="¿En dónde tejer?" description="Relaciones para conectar" onClick={openMap} />
          <HomeTile kind="connection" title="Tejiendo vínculos" description="Cuida tus relaciones" onClick={openCareTools} />
          <HomeTile kind="help" title="Necesito ayuda" description="Crisis y plan de seguridad" onClick={() => navigate(5)} />
          <HomeTile kind="checkin" title="¿Cómo estoy hoy?" description="Registra cómo te sientes" onClick={() => navigate(3)} />
        </section>

        <section className="home-more" aria-labelledby="home-more-title">
          <h2 id="home-more-title">Más para ti</h2>
          {journey.onboardingStatus === "deferred" && !journey.mapGenerated && (
            <button type="button" className="home-extra-row" onClick={() => openNetwork("intro")}>
              <span>Tu mapa te espera</span><span aria-hidden="true">{Ic.chevRight}</span>
            </button>
          )}
          <button type="button" className="home-extra-row" onClick={() => setSheet("history")}>
            <span>Mensajes y actividad</span><span aria-hidden="true">{Ic.chevRight}</span>
          </button>
          <h3>Aprender habilidades</h3>
          {learning.map((title) => (
            <button
              type="button"
              className="home-extra-row"
              key={title}
              onClick={() => { setLearningTitle(title); setSheet("learning") }}
            >
              <span>{title}</span><span aria-hidden="true">{Ic.chevRight}</span>
            </button>
          ))}
        </section>
      </main>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={SUPPORT_BOTTOM} variant="home" />
      <HomeBottomNav onNetwork={openCareTools} onDay={() => navigate(3)} onProfile={() => setSheet("profile")} />

      <BottomSheet open={showWelcome} onClose={deferMap} title="Antes de empezar, reconoce tu red">
        <p style={{ fontSize: 14, lineHeight: "21px", color: C.body, margin: "0 0 18px" }}>
          Construye tu mapa de red y, al terminar, invita a las personas cercanas con quienes quieras compartir la aplicación o fortalecer tu relación.
        </p>
        <Btn fullWidth onClick={startMap}>Construir mi mapa</Btn>
        <Btn variant="secondary" fullWidth onClick={deferMap} style={{ marginTop: 9 }}>Hacerlo después</Btn>
        <Btn variant="tertiary" fullWidth onClick={() => navigate(6)} style={{ marginTop: 7 }}>Necesito apoyo ahora</Btn>
      </BottomSheet>

      <BottomSheet open={sheet === "caregivers"} onClose={() => setSheet(null)} title="Tejiendo vínculos">
        {caregivers.length === 0 ? (
          <div>
            <StatusChip label="Sin personas vinculadas" variant="warn" />
            <p style={{ fontSize: 15, lineHeight: "22px", color: C.body, margin: "15px 0 7px", fontWeight: 700 }}>Todavía no hay un vínculo habilitado</p>
            <p style={{ fontSize: 13, lineHeight: "20px", color: C.muted, margin: "0 0 18px" }}>
              Cuando alguien acepte tu invitación y quede vinculado contigo, podrás usar mensajes, encuentros y preguntas para conectar.
            </p>
            <Btn fullWidth onClick={() => { setSheet(null); openMap() }}>Conocer mi red</Btn>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, lineHeight: "20px", color: C.muted, margin: "0 0 13px" }}>Elige una persona cercana vinculada para esta actividad.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {caregivers.map((person) => (
                <ActionCard
                  key={person.id}
                  ariaLabel={`Elegir a ${person.name}, persona cercana vinculada`}
                  onClick={() => selectCaregiver(person)}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span style={{ color: C.brand }}>{Ic.user}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.heading }}>{person.name}</span>
                  <StatusChip label="Vínculo activo" variant="ok" />
                </ActionCard>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={sheet === "history"} onClose={() => setSheet(null)} title="Mensajes y actividad">
        <p style={{ fontSize: 14, lineHeight: "21px", color: C.muted, margin: "0 0 18px" }}>
          Este prototipo no muestra interacciones clínicas ni mensajes inventados.
        </p>
        <Btn variant="secondary" fullWidth onClick={() => setSheet(null)}>Volver al inicio</Btn>
      </BottomSheet>

      <BottomSheet open={sheet === "learning"} onClose={() => setSheet(null)} title={learningTitle}>
        <p style={{ fontSize: 14, lineHeight: "21px", color: C.muted, margin: "0 0 18px" }}>
          Este contenido será proporcionado y validado por el equipo investigador.
        </p>
        <Btn variant="secondary" fullWidth onClick={() => setSheet(null)}>Volver</Btn>
      </BottomSheet>

      <BottomSheet open={sheet === "profile" || sheet === "notifications"} onClose={() => setSheet(null)} title={sheet === "profile" ? "Tu perfil" : "Notificaciones"}>
        <p style={{ fontSize: 14, lineHeight: "21px", color: C.muted, margin: "0 0 18px" }}>
          {sheet === "profile" ? "Desde aquí podrás revisar tu cuenta, privacidad y preferencias de acompañamiento." : "No tienes notificaciones nuevas."}
        </p>
        {sheet === "profile" && <Btn variant="secondary" fullWidth onClick={() => setSheet("notifications")} style={{ marginBottom: 9 }}>Ver notificaciones</Btn>}
        <Btn variant="secondary" fullWidth onClick={() => setSheet(null)}>Cerrar</Btn>
      </BottomSheet>
    </div>
  )
}
