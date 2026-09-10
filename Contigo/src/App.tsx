import { useState } from 'react'
import { C } from './ui'
import {
  MobileScreen01, MobileScreen02, MobileScreen03, MobileScreen04,
  MobileScreen05, MobileScreen06, MobileScreen07, MobileScreen08,
  MobileScreen09, MobileScreen09A, MobileScreen10, MobileScreen11, MobileScreen12,
} from './screens/mobile'
import { MobileScreen13, MobileScreen14 } from './screens/social'
import { DesktopScreen13, DesktopScreen14, DesktopScreen15 } from './screens/desktop'

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
  { id: 17, label: 'M13 Elegir relación' },
  { id: 18, label: 'M14 Preguntas PCS' },
  { id: 19, label: 'M14 Preguntas cuidador' },
  { id: 13, label: 'D13 Dashboard' },
  { id: 14, label: 'D14 Participante' },
  { id: 15, label: 'D15 Cuentas' },
]

export default function App() {
  const [screen, setScreen] = useState(1)
  const isMobile = ![13, 14, 15].includes(screen)

  const navigate = (n: number) => setScreen(n)

  const renderScreen = () => {
    switch (screen) {
      case 1:  return <MobileScreen01 navigate={navigate} />
      case 2:  return <MobileScreen02 navigate={navigate} />
      case 3:  return <MobileScreen03 navigate={navigate} />
      case 4:  return <MobileScreen04 navigate={navigate} />
      case 5:  return <MobileScreen05 navigate={navigate} />
      case 6:  return <MobileScreen06 navigate={navigate} />
      case 7:  return <MobileScreen07 navigate={navigate} />
      case 8:  return <MobileScreen08 navigate={navigate} />
      case 9:  return <MobileScreen09 navigate={navigate} />
      case 10: return <MobileScreen10 navigate={navigate} />
      case 11: return <MobileScreen11 navigate={navigate} />
      case 12: return <MobileScreen12 navigate={navigate} />
      case 16: return <MobileScreen09A navigate={navigate} />
      case 17: return <MobileScreen13 navigate={navigate} />
      case 18: return <MobileScreen14 navigate={navigate} role="pcs" />
      case 19: return <MobileScreen14 navigate={navigate} role="caregiver" />
      case 13: return <DesktopScreen13 navigate={navigate} />
      case 14: return <DesktopScreen14 navigate={navigate} />
      case 15: return <DesktopScreen15 navigate={navigate} />
      default: return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isMobile ? '#DDE6E4' : C.canvas }}>
      {/* Navigation bar */}
      <nav style={{
        backgroundColor: C.heading, padding: '0 16px', height: 44,
        display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto',
        flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12, flexShrink: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>Contigo</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 6, flexShrink: 0 }} />

        {/* Screen buttons */}
        {SCREENS.map(s => {
          const isDesktop = [13, 14, 15].includes(s.id)
          const active = screen === s.id
          return (
            <button
              key={s.id}
              onClick={() => setScreen(s.id)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
                border: active ? 'none' : `1px solid rgba(255,255,255,0.2)`,
                backgroundColor: active
                  ? (isDesktop ? C.warm : C.brand)
                  : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                transition: 'all 0.12s',
              }}>
              {s.label}
            </button>
          )
        })}
      </nav>

      {/* Screen content */}
      {isMobile ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px 32px', overflowY: 'auto' }}>
          {/* Phone label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {/* Phone frame */}
            <div style={{
              width: 390,
              height: 844,
              borderRadius: 44,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(23,52,58,0.3), 0 0 0 1.5px rgba(23,52,58,0.15), inset 0 0 0 1px rgba(255,255,255,0.2)',
              position: 'relative',
              backgroundColor: C.canvas,
              flexShrink: 0,
            }}>
              {renderScreen()}
            </div>
            {/* Screen label */}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, margin: 0 }}>
              {SCREENS.find(s => s.id === screen)?.label} · 390 × 844 px
            </p>
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
