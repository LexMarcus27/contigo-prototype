import { useState } from "react"
import { validCaregivers, type JourneyState, type NetworkPerson } from "../journey"
import { ActionCard, BottomSheet, Btn, C, FloatingSupportBtn, Ic, StatusBar, supportContentPadding } from "../ui"

interface ConnectionHubProps {
  navigate: (screen: number) => void
  journey: JourneyState
  setJourney: (next: JourneyState | ((current: JourneyState) => JourneyState)) => void
  openNetwork: () => void
}

export default function ConnectionHubScreen({ navigate, journey, setJourney, openNetwork }: ConnectionHubProps) {
  const [showResource, setShowResource] = useState(false)
  const people = validCaregivers(journey)

  const openConnection = (person: NetworkPerson) => {
    setJourney((current) => ({ ...current, selectedPersonId: person.id }))
    navigate(8)
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: C.canvas, position: "relative" }}>
      <StatusBar />
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px 24px", paddingBottom: supportContentPadding(18) }}>
        <button type="button" aria-label="Volver al inicio" onClick={() => navigate(2)} style={{ width: 44, height: 44, margin: "0 0 18px -8px", border: 0, background: "transparent", color: C.brand, display: "grid", placeItems: "center", cursor: "pointer" }}>
          {Ic.arrowLeft}
        </button>
        <h1 style={{ color: C.heading, fontSize: 26, lineHeight: "32px", margin: "0 0 8px", fontWeight: 700 }}>
          ¿Te serviría sentirte acompañada?
        </h1>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: "22px", margin: "0 0 28px" }}>
          Puedes elegir una forma pequeña de acercarte. También puedes hacerlo después.
        </p>

        <section aria-labelledby="close-people-title">
          <h2 id="close-people-title" style={{ color: C.heading, fontSize: 18, lineHeight: "24px", margin: "0 0 12px", fontWeight: 700 }}>Personas cercanas</h2>
          {people.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {people.map((person) => (
                <ActionCard
                  key={person.id}
                  ariaLabel={`Abrir conexión con ${person.name}`}
                  onClick={() => openConnection(person)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}
                >
                  <span aria-hidden="true" style={{ display: "grid", placeItems: "center", flexShrink: 0, width: 42, height: 42, borderRadius: "50%", backgroundColor: C.brandSoft, color: C.brand }}>{Ic.user}</span>
                  <span style={{ flex: 1, minWidth: 0, color: C.heading, fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</span>
                  <span aria-hidden="true" style={{ display: "flex", color: C.brand }}>{Ic.chevRight}</span>
                </ActionCard>
              ))}
            </div>
          ) : (
            <div style={{ padding: 18, borderRadius: 16, backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: "21px", margin: "0 0 14px" }}>
                Todavía no hay personas cercanas vinculadas. Puedes conocer tu red e invitar a alguien cuando quieras.
              </p>
              <Btn variant="secondary" fullWidth onClick={openNetwork}>Conocer mi red</Btn>
            </div>
          )}
        </section>

        <section aria-labelledby="relationship-learning-title" style={{ marginTop: 30 }}>
          <h2 id="relationship-learning-title" style={{ color: C.heading, fontSize: 18, lineHeight: "24px", margin: "0 0 12px", fontWeight: 700 }}>Aprender habilidades</h2>
          <ActionCard ariaLabel="Abrir recurso de habilidades interpersonales" onClick={() => setShowResource(true)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}>
            <span aria-hidden="true" style={{ display: "flex", color: C.lilacDark }}>{Ic.book}</span>
            <span style={{ flex: 1, color: C.heading, fontSize: 15, fontWeight: 700 }}>Habilidades interpersonales</span>
            <span aria-hidden="true" style={{ display: "flex", color: C.lilacDark }}>{Ic.chevRight}</span>
          </ActionCard>
        </section>
      </main>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={18} />
      <BottomSheet open={showResource} onClose={() => setShowResource(false)} title="Habilidades interpersonales">
        <p style={{ fontSize: 14, lineHeight: "21px", color: C.muted, margin: "0 0 18px" }}>
          Este contenido será proporcionado y validado por el equipo investigador.
        </p>
        <Btn variant="secondary" fullWidth onClick={() => setShowResource(false)}>Volver</Btn>
      </BottomSheet>
    </div>
  )
}
