import { type ReactNode, useState } from "react"
import { Btn, BottomSheet, CaregiverBottomNav, FloatingSupportBtn, Ic } from "../ui"
import { type CaregiverContext, type CaregiverDemoMode, type CaregiverMessageKind } from "../caregiver"

type View = "home" | "learning" | "connections" | "profile" | "blocked"
interface Props {
  navigate: (screen: number) => void
  context: CaregiverContext | null
  caregiverName: string
  view?: View
  demoMode: boolean
  onSimulate: (mode: CaregiverDemoMode) => void
  onMessage: (kind: CaregiverMessageKind) => void
  demoProfiles: { id: string; name: string }[]
  selectedProfile: string
  onSelectProfile: (id: string) => void
}

function Plant() {
  return <svg className="caregiver-plant" viewBox="0 0 140 135" fill="none" aria-hidden="true">
    <ellipse cx="57" cy="124" rx="42" ry="10" fill="#EEE8DF" />
    <ellipse cx="102" cy="125" rx="30" ry="11" fill="#F1CDB5" />
    <circle cx="78" cy="41" r="26" fill="#F0B896" />
    <path d="M97 126C96 94 98 66 77 38M96 94C80 74 59 73 32 73M95 78C102 54 115 33 125 17" stroke="#7C9473" strokeWidth="2.5" />
    <path d="M34 73C21 60 12 59 3 61C9 72 21 75 34 73ZM125 17C127 8 133 3 139 1C138 20 132 34 119 46C116 35 119 26 125 17ZM77 38C65 29 65 31 66 38C70 51 79 62 90 67" fill="#7C9473" />
  </svg>
}

function Tile({ title, subtitle, icon, help, disabled, onClick }: {
  title: string; subtitle: string; icon: ReactNode; help?: boolean; disabled?: boolean; onClick: () => void
}) {
  return <button type="button" className={`caregiver-tile${help ? " caregiver-tile--help" : ""}`} disabled={disabled} onClick={onClick} aria-label={`${title}. ${subtitle}`}>
    <span className="caregiver-tile-icon" aria-hidden="true">{icon}</span>
    <span className="caregiver-tile-title">{title}</span>
    <span className="caregiver-tile-subtitle">{subtitle}</span>
    {disabled && <span className="caregiver-tile-unavailable">Necesitas un vínculo activo</span>}
  </button>
}

export default function CaregiverHomeScreen({ navigate, context, caregiverName, view = "home", demoMode, onSimulate, onMessage, demoProfiles, selectedProfile, onSelectProfile }: Props) {
  const [resource, setResource] = useState<string | null>(null)
  const pcsName = context?.pcsName
  const linked = Boolean(context)
  const active = view === "learning" ? "aprender" : view === "connections" ? "vinculos" : view === "profile" ? "perfil" : "inicio"

  const demoControls = demoMode && <details className="caregiver-demo">
    <summary>Herramientas de demostración del cuidador</summary>
    <p>Datos ficticios. Las simulaciones usan el vínculo de Marta con Sofía; no representan aceptación, acceso o desvinculación reales.</p>
    <label htmlFor="caregiver-demo-profile">Perfil ficticio</label>
    <select id="caregiver-demo-profile" value={selectedProfile} onChange={(event) => onSelectProfile(event.target.value)}>
      {demoProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
    </select>
    <Btn small fullWidth onClick={() => onSimulate("active")}>Cargar vínculo de demostración</Btn>
    <Btn small fullWidth variant="secondary" onClick={() => onSimulate("accepted-only")}>Simular aceptación sin asociación</Btn>
    <Btn small fullWidth variant="secondary" onClick={() => onSimulate("revoked")}>Simular revocación del vínculo</Btn>
  </details>

  return <div className="caregiver-screen">
    <main className="caregiver-scroller">
      {view === "home" ? <>
        <header className="caregiver-hero"><h1>Inicio</h1><p>¡Hola, {caregiverName}! Qué bueno verte.</p><Plant /></header>
        <button type="button" className="caregiver-link-card" disabled={!linked} onClick={() => navigate(12)} aria-label={pcsName ? `Mi vínculo con ${pcsName}. Registrar cómo está la relación` : "Todavía no tienes un vínculo activo"}>
          <span className="caregiver-avatar" aria-hidden="true">{Ic.user}</span>
          <span><span className="caregiver-link-caption">{linked ? "Mi vínculo con" : "Tu vínculo"}</span><strong>{pcsName ?? "Aún no hay una persona vinculada"}</strong></span>
          {linked && <span aria-hidden="true">{Ic.chevRight}</span>}
        </button>
        {!linked && <p className="caregiver-empty" role="status">Puedes explorar los recursos para aprender. El plan, los mensajes y el registro de la relación estarán disponibles cuando tengas un vínculo activo.</p>}
        <section className="caregiver-grid" aria-label="Herramientas principales del cuidador">
          <Tile title="Aprendiendo a tejer vínculos" subtitle={pcsName ? `Lo que puedo saber para cuidar mi relación con ${pcsName}` : "Lo que puedo saber para cuidar a quienes quiero"} icon={Ic.book} onClick={() => navigate(22)} />
          <Tile title={pcsName ? `Cómo puedo acompañar a ${pcsName}` : "Cómo puedo acompañar"} subtitle="Qué puedo hacer en una crisis" icon={Ic.lifeRing} help disabled={!linked} onClick={() => navigate(11)} />
          <Tile title="Tejiendo vínculos" subtitle="Cuidando mis relaciones" icon={Ic.link} disabled={!linked} onClick={() => navigate(23)} />
          <Tile title={pcsName ? `¿Cómo está el tejido con ${pcsName} ahora?` : "¿Cómo está el tejido ahora?"} subtitle="Registra cómo está la relación" icon={Ic.activity} disabled={!linked} onClick={() => navigate(12)} />
        </section>
        {demoControls}
      </> : <>
        <button type="button" className="caregiver-back" aria-label="Volver al inicio del cuidador" onClick={() => navigate(9)}>{Ic.arrowLeft} Inicio</button>
        <h1 className="caregiver-page-title">{view === "learning" ? "Aprendiendo a tejer vínculos" : view === "connections" ? "Tejiendo vínculos" : view === "profile" ? "Perfil" : "Necesitas un vínculo activo"}</h1>
        {view === "learning" && <>
          <p>{pcsName ? `Lo que puedo saber para cuidar mi relación con ${pcsName}` : "Lo que puedo saber para cuidar a quienes quiero"}</p>
          <div className="caregiver-actions">
            {['Validación', 'Habilidades interpersonales'].map((title) => <Btn key={title} variant="secondary" fullWidth icon={Ic.book} onClick={() => setResource(title)}>{title}</Btn>)}
          </div>
          <p className="caregiver-note">Los recursos serán proporcionados y validados por el equipo investigador.</p>
        </>}
        {view === "connections" && linked && <>
          <p>Formas pequeñas de cuidar tu relación con {pcsName}.</p>
          <div className="caregiver-actions">
            <Btn variant="secondary" fullWidth icon={Ic.message} onClick={() => onMessage("intimate")}>Escribir un mensaje íntimo</Btn>
            <Btn variant="secondary" fullWidth icon={Ic.heart} onClick={() => onMessage("caring-contact")}>Escribir un mensaje de cuidado</Btn>
            <Btn variant="secondary" fullWidth icon={Ic.users} onClick={() => navigate(19)}>Preguntas para conectar</Btn>
            <Btn variant="secondary" fullWidth icon={Ic.calendar} onClick={() => navigate(16)}>Registrar encuentro</Btn>
          </div>
        </>}
        {(view === "blocked" || (view === "connections" && !linked)) && <>
          <p>No hay una asociación activa autorizada para esta cuenta. Una invitación aceptada por sí sola no habilita el plan, los mensajes ni los registros.</p>
          <Btn fullWidth variant="secondary" onClick={() => navigate(22)}>Explorar recursos para aprender</Btn>
        </>}
        {view === "profile" && <>
          <p><strong>{caregiverName}</strong></p><p>{pcsName ? `Vínculo activo con ${pcsName}` : "Sin vínculo activo"}</p>
          <p className="caregiver-note">Este prototipo utiliza una cuenta ficticia para revisar el recorrido del cuidador.</p>
          {demoControls}
        </>}
      </>}
    </main>
    <FloatingSupportBtn label="Proveer apoyo" disabled={!linked} onPress={() => navigate(11)} bottom={92} />
    <CaregiverBottomNav active={active} navigate={navigate} />
    <BottomSheet open={Boolean(resource)} title={resource ?? ""} onClose={() => setResource(null)}>
      <p>Este contenido será proporcionado y validado por el equipo investigador.</p>
      <Btn variant="secondary" fullWidth onClick={() => setResource(null)}>Volver a aprender</Btn>
    </BottomSheet>
  </div>
}
