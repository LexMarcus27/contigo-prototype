import { useState, type ReactNode } from "react"
import { ActionCard, BottomSheet, Btn, C, Ic, StatusBar } from "../ui"

interface HelpHubProps {
  navigate: (screen: number) => void
}

function HelpOption({
  title,
  description,
  icon,
  onClick,
  urgent = false,
}: {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
  urgent?: boolean
}) {
  return (
    <ActionCard
      ariaLabel={`${title}. ${description}`}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, backgroundColor: urgent ? C.criticalSoft : C.surface }}
    >
      <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, display: "grid", placeItems: "center", backgroundColor: urgent ? "#F2CECB" : C.brandSoft, color: urgent ? C.critical : C.brand }}>
        {icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: C.heading, fontSize: 16, fontWeight: 700, lineHeight: "21px" }}>{title}</span>
        <span style={{ display: "block", color: C.muted, fontSize: 13, lineHeight: "19px", marginTop: 3 }}>{description}</span>
      </span>
      <span aria-hidden="true" style={{ color: C.brand, display: "flex" }}>{Ic.chevRight}</span>
    </ActionCard>
  )
}

export default function HelpHubScreen({ navigate }: HelpHubProps) {
  const [showResource, setShowResource] = useState(false)

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: C.canvas, position: "relative" }}>
      <StatusBar />
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px 32px" }}>
        <button type="button" aria-label="Volver al inicio" onClick={() => navigate(2)} style={{ width: 44, height: 44, margin: "0 0 18px -8px", border: 0, background: "transparent", color: C.brand, display: "grid", placeItems: "center", cursor: "pointer" }}>
          {Ic.arrowLeft}
        </button>
        <h1 style={{ color: C.heading, fontSize: 27, lineHeight: "33px", margin: "0 0 9px", fontWeight: 750 }}>¿Qué necesitas ahora?</h1>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: "22px", margin: "0 0 28px" }}>Elige la opción que te sirva en este momento.</p>

        <HelpOption title="Ver plan de seguridad" description="Consulta o prepara tu plan, incluso sin conexión." icon={Ic.shield} onClick={() => navigate(5)} />
        <HelpOption title="Necesito ayuda ahora" description="Abre el apoyo inmediato, paso a paso." icon={Ic.lifeRing} onClick={() => navigate(6)} urgent />
        <HelpOption title="Afrontar una crisis" description="Explora este recurso a tu propio ritmo." icon={Ic.book} onClick={() => setShowResource(true)} />
      </main>

      <BottomSheet open={showResource} onClose={() => setShowResource(false)} title="Afrontar una crisis">
        <p style={{ fontSize: 14, lineHeight: "21px", color: C.muted, margin: "0 0 18px" }}>
          Este contenido será proporcionado y validado por el equipo investigador.
        </p>
        <Btn variant="secondary" fullWidth onClick={() => setShowResource(false)}>Volver</Btn>
      </BottomSheet>
    </div>
  )
}
