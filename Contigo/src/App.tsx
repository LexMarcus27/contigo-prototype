import { useEffect, useState } from 'react'
import { C } from './ui'
import {
  MobileScreen01, MobileScreen03, MobileScreen04,
  MobileScreen05, MobileScreen06, MobileScreen07, MobileScreen08,
  MobileScreen09, MobileScreen09A, MobileScreen10, MobileScreen11, MobileScreen12,
} from './screens/mobile'
import { MobileScreen14 } from './screens/social'
import { DesktopScreen13, DesktopScreen14, DesktopScreen15 } from './screens/desktop'
import MobileHomeScreen from './screens/home'
import HelpHubScreen from './screens/help-hub'
import ConnectionHubScreen from './screens/connection-hub'
import SocialNetworkScreen from './screens/network'
import { createRandomNotification, type DemoNotification } from './notifications'
import {
  canStrengthenRelationship,
  EMPTY_JOURNEY,
  validCaregivers,
  type JourneyState,
  type NetworkEntry,
} from './journey'

const SCREENS = [
  { id: 1, label: 'M1 Activar cuenta' },
  { id: 2, label: 'M2 Inicio PCS' },
  { id: 3, label: 'M3 Registro EMA' },
  { id: 4, label: 'M4 Respuesta EMA' },
  { id: 5, label: 'M5 Plan seguridad' },
  { id: 6, label: 'M6 Modo crisis' },
  { id: 7, label: 'M7 Respiración' },
  { id: 8, label: 'M8 Conexión' },
  { id: 9, label: 'M9 Inicio cuidador' },
  { id: 10, label: 'M10 Crear mensaje' },
  { id: 11, label: 'M11 Plan cuidador' },
  { id: 12, label: 'M12 Registro cuidador' },
  { id: 16, label: 'M9A Encuentro' },
  { id: 17, label: 'M17 Conoce tu red' },
  { id: 20, label: 'M20 Necesito ayuda' },
  { id: 21, label: 'M21 Tejiendo vínculos' },
  { id: 18, label: 'M14 Preguntas PCS' },
  { id: 19, label: 'M14 Preguntas cuidador' },
  { id: 13, label: 'D13 Dashboard' },
  { id: 14, label: 'D14 Participante' },
  { id: 15, label: 'D15 Cuentas' },
]

export default function App() {
  const searchParams = new URLSearchParams(window.location.search)
  const demoMode = searchParams.get("demo") === "1"
  const storageKey = demoMode
    ? "contigo-demo-pcs-sofia-testing"
    : "contigo-demo-pcs-sofia"
  const requestedScreen = Number(searchParams.get('screen'))
  const [screen, setScreen] = useState(Number.isFinite(requestedScreen) && requestedScreen > 0 ? requestedScreen : 2)
  const [journey, setJourney] = useState<JourneyState>(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (!saved) return EMPTY_JOURNEY
      const parsed = JSON.parse(saved) as Partial<JourneyState>
      return {
        ...EMPTY_JOURNEY,
        ...parsed,
        people: (parsed.people ?? []).map((person) => ({
          ...person,
          invitationStatus: person.invitationStatus ?? "not-invited",
        })),
        associations: parsed.associations ?? [],
        onboardingStatus:
          parsed.onboardingStatus ??
          (parsed.mapGenerated ? "completed" : "not-started"),
        onboardingWelcomeShown:
          parsed.onboardingWelcomeShown ?? Boolean(parsed.mapGenerated),
      }
    } catch {
      return EMPTY_JOURNEY
    }
  })
  const [networkEntry, setNetworkEntry] = useState<NetworkEntry>('auto')
  const [notifications, setNotifications] = useState<DemoNotification[]>([])
  const [visibleNotification, setVisibleNotification] = useState<DemoNotification | null>(null)
  const [notificationEntry, setNotificationEntry] = useState<DemoNotification | null>(null)
  const isMobile = ![13, 14, 15].includes(screen)

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(journey),
    )
  }, [journey, storageKey])

  const navigate = (n: number) => {
    setNotificationEntry(null)
    setVisibleNotification(null)
    setScreen(n)
  }
  const openNetwork = (entry: NetworkEntry) => {
    setNetworkEntry(entry)
    setScreen(17)
  }
  const resetDemoState = () => {
    if (!demoMode) return
    window.localStorage.removeItem("contigo-demo-pcs-sofia-testing")
    window.location.reload()
  }

  const availableNotifications = notifications.filter(
    (notification) => !notification.personId || canStrengthenRelationship(journey, notification.personId),
  )
  const simulateNotification = () => {
    const notification = createRandomNotification(journey, notifications[0]?.id)
    setNotifications((current) => [notification, ...current].slice(0, 12))
    setVisibleNotification(notification)
  }
  const openNotification = (notification: DemoNotification) => {
    setVisibleNotification(null)
    // Recheck access when opening, including notifications created before revocation.
    if (!notification.personId || !canStrengthenRelationship(journey, notification.personId)) {
      navigate(21)
      return
    }
    setJourney((current) => ({ ...current, selectedPersonId: notification.personId! }))
    setNotificationEntry(notification)
    setScreen(notification.action === 'questions' ? 18 : 8)
  }

  const renderScreen = () => {
    switch (screen) {
      case 1:  return <MobileScreen01 navigate={navigate} />
      case 2:
        return (
          <MobileHomeScreen
            navigate={navigate}
            journey={journey}
            setJourney={setJourney}
            openNetwork={openNetwork}
            demoMode={demoMode}
            notifications={availableNotifications}
            visibleNotification={visibleNotification && (
              !visibleNotification.personId || canStrengthenRelationship(journey, visibleNotification.personId)
            ) ? visibleNotification : null}
            onSimulateNotification={simulateNotification}
            onOpenNotification={openNotification}
            onDismissNotification={() => setVisibleNotification(null)}
          />
        )
      case 3:  return <MobileScreen03 navigate={navigate} />
      case 4:  return <MobileScreen04 navigate={navigate} />
      case 5:  return <MobileScreen05 navigate={navigate} />
      case 6:  return <MobileScreen06 navigate={navigate} />
      case 7:  return <MobileScreen07 navigate={navigate} />
      case 8: {
        const action = notificationEntry?.action
        const selected = journey.people.find(
          (person) => person.id === journey.selectedPersonId,
        )
        return (
          <MobileScreen08
            key={notificationEntry?.id ?? 'connection'}
            navigate={navigate}
            initialAction={action === 'message' || action === 'contact' || action === 'meeting' ? action : undefined}
            caregiverName={selected?.name ?? null}
            hasAccess={canStrengthenRelationship(
              journey,
              journey.selectedPersonId,
            )}
            onOpenNetwork={() => openNetwork("results")}
            availableCaregivers={validCaregivers(journey)}
            onSelectCaregiver={(personId) =>
              setJourney((current) => ({
                ...current,
                selectedPersonId: personId,
              }))
            }
          />
        )
      }
      case 9:  return <MobileScreen09 navigate={navigate} />
      case 10: return <MobileScreen10 navigate={navigate} />
      case 11: return <MobileScreen11 navigate={navigate} />
      case 12: return <MobileScreen12 navigate={navigate} />
      case 16: return <MobileScreen09A navigate={navigate} />
      case 17: return <SocialNetworkScreen navigate={navigate} journey={journey} setJourney={setJourney} entry={networkEntry} demoMode={demoMode} />
      case 20: return <HelpHubScreen navigate={navigate} />
      case 21:
        return (
          <ConnectionHubScreen
            navigate={navigate}
            journey={journey}
            setJourney={setJourney}
            openNetwork={() =>
              openNetwork(
                journey.mapGenerated ? 'results' : journey.mapStarted ? 'progress' : 'intro',
              )
            }
          />
        )
      case 18:
        return canStrengthenRelationship(journey, journey.selectedPersonId) ? (
          <MobileScreen14
            key={notificationEntry?.id ?? 'questions'}
            navigate={navigate}
            role="pcs"
            initialQuestion={notificationEntry?.question}
            otherName={
              journey.people.find(
                (person) => person.id === journey.selectedPersonId,
              )?.name
            }
          />
        ) : (
          <MobileScreen08
            navigate={navigate}
            caregiverName={null}
            hasAccess={false}
            onOpenNetwork={() => openNetwork("results")}
            availableCaregivers={validCaregivers(journey)}
            onSelectCaregiver={(personId) =>
              setJourney((current) => ({
                ...current,
                selectedPersonId: personId,
              }))
            }
          />
        )
      case 19: return <MobileScreen14 navigate={navigate} role="caregiver" />
      case 13: return <DesktopScreen13 navigate={navigate} />
      case 14: return <DesktopScreen14 navigate={navigate} />
      case 15: return <DesktopScreen15 navigate={navigate} />
      default: return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isMobile ? C.soft : C.canvas }}>
      {/* Navigation bar */}
      {demoMode && <nav style={{
        backgroundColor: C.heading, padding: '0 16px', height: 44,
        display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto',
        flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12, flexShrink: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.surface, whiteSpace: "nowrap" }}>
            Demostración · datos ficticios
          </span>
        </div>

        <button
          type="button"
          onClick={resetDemoState}
          aria-label="Restaurar estado inicial de la demostración"
          title="Borra solo los datos ficticios guardados en este navegador"
          style={{
            flexShrink: 0, padding: '5px 10px', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.45)', background: 'transparent',
            color: C.surface, fontSize: 11, fontWeight: 700,
            fontFamily: 'inherit', whiteSpace: 'nowrap', cursor: 'pointer',
          }}
        >
          Reiniciar demo
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 6, flexShrink: 0 }} />

        {/* Screen buttons */}
        {SCREENS.map(s => {
          const isDesktop = [13, 14, 15].includes(s.id)
          const active = screen === s.id
          return (
            <button
              key={s.id}
              onClick={() => navigate(s.id)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
                border: active ? 'none' : `1px solid rgba(255,255,255,0.2)`,
                backgroundColor: active
                  ? (isDesktop ? C.warm : C.brand)
                  : 'transparent',
                color: active ? (isDesktop ? C.heading : '#fff') : 'rgba(255,255,255,0.8)',
                transition: 'all 0.12s',
              }}>
              {s.label}
            </button>
          )
        })}
      </nav>}

      {/* Screen content */}
      {isMobile ? (
        <div className="prototype-stage" style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: demoMode ? '24px 16px 32px' : '0', overflowY: 'auto' }}>
          {/* Phone label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {/* Phone frame */}
            <div className="phone-shell" style={{
              width: 390,
              height: 844,
              borderRadius: 44,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(58,50,56,0.3), 0 0 0 1.5px rgba(58,50,56,0.15), inset 0 0 0 1px rgba(255,255,255,0.2)',
              position: 'relative',
              backgroundColor: C.canvas,
              flexShrink: 0,
            }}>
              {renderScreen()}
            </div>
            {/* Screen label */}
            {demoMode && <p style={{ fontSize: 12, color: C.muted, fontWeight: 500, margin: 0 }}>
              {SCREENS.find(s => s.id === screen)?.label} · 390 × 844 px
            </p>}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {renderScreen()}
        </div>
      )}
    </div>
  )
}
