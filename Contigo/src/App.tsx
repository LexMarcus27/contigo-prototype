import { useEffect, useRef, useState } from 'react'
import { C } from './ui'
import {
  MobileScreen01,
  MobileScreen05, MobileScreen06, MobileScreen07, MobileScreen08,
  MobileScreen09A, MobileScreen10, MobileScreen11, MobileScreen12,
} from './screens/mobile'
import { MobileScreen14 } from './screens/social'
import { DesktopScreen13, DesktopScreen14, DesktopScreen15 } from './screens/desktop'
import MobileHomeScreen from './screens/home'
import HelpHubScreen from './screens/help-hub'
import ConnectionHubScreen from './screens/connection-hub'
import SocialNetworkScreen from './screens/network'
import EmaScreen from './screens/ema'
import SafetyPlanStoryScreen from './screens/safety-plan-story'
import CaregiverHomeScreen from './screens/caregiver-home'
import CaringMessageScreen from './screens/caring-message'
import CaringMessageInboxScreen from './screens/caring-message-inbox'
import { caringDraftKey, createCaringDraft, createSimulatedCaringMessage, visibleCaringMessages, type CaringMessageDraft, type SimulatedCaringMessage } from './caring-messages'
import { caregiverContext, DEMO_CAREGIVER, simulateCaregiverLink, type CaregiverMessageKind } from './caregiver'
import { changeEmaReference, createEmaDraft, emaReferenceForPerson, parseEmaReference, prepareEmaDay, type EmaReference } from './ema'
import { connectionLaunch, type ConnectionAction, type ConnectionStep } from './connection'
import { createSafetyPlanDraft, safetyPlanHasInformation } from './safety-plan'
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
  { id: 9, label: 'M9 Inicio cuidador' },
  { id: 3, label: 'M3 Registro EMA' },
  { id: 4, label: 'M4 Respuesta EMA' },
  { id: 5, label: 'M5 Plan seguridad' },
  { id: 6, label: 'M6 Modo crisis' },
  { id: 7, label: 'M7 Respiración' },
  { id: 8, label: 'M8 Conexión' },
  { id: 10, label: 'M10 Crear mensaje' },
  { id: 11, label: 'M11 Plan cuidador' },
  { id: 12, label: 'M12 Registro cuidador' },
  { id: 16, label: 'M9A Encuentro' },
  { id: 17, label: 'M17 Conoce tu red' },
  { id: 20, label: 'M20 Necesito ayuda' },
  { id: 21, label: 'M21 Tejiendo vínculos' },
  { id: 22, label: 'M22 Aprender cuidador' },
  { id: 23, label: 'M23 Vínculos cuidador' },
  { id: 24, label: 'M24 Perfil cuidador' },
  { id: 25, label: 'M25 Las crisis también pasan' },
  { id: 26, label: 'M26 Mensaje de cuidado' },
  { id: 27, label: 'M27 Mensajes de cuidado PCS' },
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
  const emaReferenceKey = `${storageKey}-ema-reference`
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
  // Only the reference IDs are remembered between visits; never the answers.
  const [emaReference, setEmaReference] = useState<EmaReference | null>(() => {
    try { return parseEmaReference(window.localStorage.getItem(emaReferenceKey)) }
    catch { return null }
  })
  // Clinical answers stay in session memory, outside the persisted PCS map.
  const [emaDraft, setEmaDraft] = useState(() => createEmaDraft(emaReference))
  const [connectionIntent, setConnectionIntent] = useState<ConnectionStep | null>(null)
  const [connectionEntry, setConnectionEntry] = useState<{ personId: string; action: ConnectionAction; id: number } | null>(null)
  const connectionSequence = useRef(0)
  // Narrative position and the actual plan draft are session-only.
  // Do not store any safety-plan content in the PCS map's localStorage.
  const [safetyStoryPage, setSafetyStoryPage] = useState(0)
  const [safetyPlan, setSafetyPlan] = useState(() => createSafetyPlanDraft())
  const hasSafetyPlanInformation = safetyPlanHasInformation(safetyPlan)
  const [caregiverId, setCaregiverId] = useState<string>(DEMO_CAREGIVER.id)
  const [caregiverMessageKind, setCaregiverMessageKind] = useState<CaregiverMessageKind>('intimate')
  // Only fictitious drafts in session memory; do not persist these in the PCS map.
  const [caregiverDrafts, setCaregiverDrafts] = useState<Record<string, string>>({})
  // Caring-message text, private reflection notes and simulated inbox stay in memory.
  const [caringDrafts, setCaringDrafts] = useState<Record<string, CaringMessageDraft>>({})
  const [caringGuidesReviewed, setCaringGuidesReviewed] = useState<Record<string, boolean>>({})
  const [caringMessages, setCaringMessages] = useState<SimulatedCaringMessage[]>([])
  const caringSequence = useRef(0)
  const caregiver = caregiverContext(journey, caregiverId)
  const caregiverName = journey.people.find((person) => person.caregiverId === caregiverId)?.name ?? DEMO_CAREGIVER.name
  const caregiverKey = `${caregiverId}:${caregiver?.associationId ?? 'unlinked'}`
  const caringKey = caregiver ? caringDraftKey(caregiver) : ''
  const caringDraft = caringDrafts[caringKey] ?? createCaringDraft()
  const receivedCaringMessages = visibleCaringMessages(journey, caringMessages)
  const draftKey = `${caregiverId}:${caregiver?.pcsId ?? ''}:${caregiverMessageKind}`
  const isMobile = ![13, 14, 15].includes(screen)

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(journey),
    )
  }, [journey, storageKey])

  useEffect(() => {
    if (emaReference) window.localStorage.setItem(emaReferenceKey, JSON.stringify(emaReference))
  }, [emaReference, emaReferenceKey])

  const selectEmaReference = (personId: string) => {
    const reference = emaReferenceForPerson(journey, personId)
    if (!reference) return false
    setEmaReference(reference)
    setEmaDraft(current => changeEmaReference(prepareEmaDay(current, reference), reference))
    return true
  }

  const navigate = (n: number) => {
    if (n === 3) setEmaDraft(current => prepareEmaDay(current, emaReference))
    setConnectionIntent(null)
    setConnectionEntry(null)
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
    window.localStorage.removeItem("contigo-demo-pcs-sofia-testing-ema-reference")
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
    setConnectionIntent(null)
    setConnectionEntry(null)
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

  const openConnectionStep = (step: ConnectionStep, personId?: string) => {
    if (step === 'received') { navigate(27); return }
    if (step !== 'skills' && personId) {
      const entry = connectionLaunch(journey, personId, step)
      if (entry) {
        navigate(8)
        setJourney(current => ({ ...current, selectedPersonId: entry.personId }))
        setConnectionEntry({ ...entry, id: ++connectionSequence.current })
        return
      }
    }
    navigate(21)
    setConnectionIntent(step)
  }

  const renderScreen = () => {
    const emaProps = {
      navigate, draft: emaDraft, setDraft: setEmaDraft, journey,
      referencePreference: emaReference, onSelectReference: selectEmaReference,
      onOpenNetwork: () => openNetwork(journey.mapGenerated ? 'results' : journey.mapStarted ? 'progress' : 'intro'),
      onConnectionStep: openConnectionStep,
    }
    const caregiverHome = (view: 'home' | 'learning' | 'connections' | 'profile' | 'blocked' = 'home') => (
      <CaregiverHomeScreen
        key={`${caregiverKey}:${view}`}
        navigate={navigate} context={caregiver} caregiverName={caregiverName} view={view} demoMode={demoMode}
        selectedProfile={caregiverId}
        demoProfiles={[DEMO_CAREGIVER, ...journey.people.filter((person) => person.caregiverId && person.caregiverId !== DEMO_CAREGIVER.id).map((person) => ({ id: person.caregiverId!, name: person.name }))]}
        onSelectProfile={setCaregiverId}
        onSimulate={(mode) => {
          if (!demoMode) return
          setCaregiverId(DEMO_CAREGIVER.id)
          setJourney((current) => simulateCaregiverLink(current, mode))
        }}
        onMessage={(kind) => {
          if (kind === 'caring-contact') { navigate(26); return }
          setCaregiverMessageKind(kind)
          navigate(10)
        }}
      />
    )
    // Recheck the exact caregiver/PCS association even for direct demo navigation.
    if ([10, 11, 12, 16, 19, 23, 26].includes(screen) && !caregiver) return caregiverHome('blocked')
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
      case 3:  return <EmaScreen {...emaProps} />
      case 4:  return <EmaScreen {...emaProps} view="result" />
      case 5:  return <MobileScreen05 navigate={navigate} plan={safetyPlan} onPlanChange={setSafetyPlan} />
      case 6:  return <MobileScreen06 navigate={navigate} />
      case 7:  return <MobileScreen07 navigate={navigate} />
      case 8: {
        const action = connectionEntry?.action ?? notificationEntry?.action
        const selected = journey.people.find(
          (person) => person.id === journey.selectedPersonId,
        )
        return (
          <MobileScreen08
            key={`${connectionEntry?.id ?? notificationEntry?.id ?? 'connection'}:${journey.selectedPersonId}`}
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
      case 9:  return caregiverHome()
      case 10: return <MobileScreen10 key={`${caregiverKey}:${caregiverMessageKind}`} navigate={navigate} pcsName={caregiver!.pcsName} caregiverName={caregiverName} messageKind={caregiverMessageKind} initialText={caregiverDrafts[draftKey] ?? ''} onSaveDraft={(text) => {
        if (caregiverContext(journey, caregiverId)) setCaregiverDrafts((current) => ({ ...current, [draftKey]: text }))
      }} />
      case 11: return <MobileScreen11 key={caregiverKey} navigate={navigate} pcsName={caregiver!.pcsName} />
      case 12: return <MobileScreen12 key={caregiverKey} navigate={navigate} pcsName={caregiver!.pcsName} />
      case 16: return <MobileScreen09A key={caregiverKey} navigate={navigate} pcsName={caregiver!.pcsName} />
      case 22: return caregiverHome('learning')
      case 23: return caregiverHome('connections')
      case 24: return caregiverHome('profile')
      case 26: return <CaringMessageScreen
        key={caringKey}
        navigate={navigate} pcsName={caregiver!.pcsName} caregiverName={caregiverName} draft={caringDraft} demoMode={demoMode}
        guideReviewed={caringGuidesReviewed[caringKey] ?? false}
        onGuideReviewed={() => setCaringGuidesReviewed(current => current[caringKey] ? current : ({ ...current, [caringKey]: true }))}
        onDraftChange={(next) => {
          const active = caregiverContext(journey, caregiverId)
          if (active && caringDraftKey(active) === caringKey) setCaringDrafts(current => ({ ...current, [caringKey]: next }))
        }}
        onSimulateSend={(text) => {
          const active = caregiverContext(journey, caregiverId)
          if (!active || caringDraftKey(active) !== caringKey) return false
          const message = createSimulatedCaringMessage(journey, caregiverId, text, `caring-${++caringSequence.current}`)
          if (!message) return false
          setCaringMessages(current => [message, ...current])
          setCaringDrafts(current => ({ ...current, [caringKey]: createCaringDraft() }))
          return true
        }}
      />
      case 27: return <CaringMessageInboxScreen navigate={navigate} messages={receivedCaringMessages} />
      case 25: return <SafetyPlanStoryScreen navigate={navigate} pageIndex={safetyStoryPage} onPageChange={setSafetyStoryPage} hasPlanInformation={hasSafetyPlanInformation} demoMode={demoMode} onSimulatePlanInformation={(hasInformation) => {
        if (demoMode) setSafetyPlan(createSafetyPlanDraft(hasInformation))
      }} />
      case 17: return <SocialNetworkScreen navigate={navigate} journey={journey} setJourney={setJourney} entry={networkEntry} demoMode={demoMode} emaReference={emaReference} emaReferenceAppliesNextDay={emaDraft.completed || emaDraft.relationshipOmission === 'no-active-link'} onSelectEmaReference={selectEmaReference} />
      case 20: return <HelpHubScreen navigate={navigate} />
      case 21:
        return (
          <ConnectionHubScreen
            key={connectionIntent ?? 'home'}
            navigate={navigate}
            initialStep={connectionIntent}
            onOpenConnection={(personId, action) => openConnectionStep(action, personId)}
            receivedCaringCount={receivedCaringMessages.length}
            journey={journey}
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
      case 19: return <MobileScreen14 key={caregiverKey} navigate={navigate} role="caregiver" otherName={caregiver!.pcsName} />
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
