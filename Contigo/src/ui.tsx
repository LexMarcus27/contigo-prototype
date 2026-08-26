import { type ReactNode, useState, useEffect } from 'react'

export const C = {
  canvas: '#F5F8F7',
  surface: '#FFFFFF',
  soft: '#EAF2F0',
  brand: '#246B64',
  brandHover: '#1C554F',
  brandSoft: '#D7EAE6',
  heading: '#17343A',
  body: '#26383D',
  muted: '#64757A',
  border: '#D7E1DF',
  blue: '#4C6F8A',
  warm: '#D9A85F',
  success: '#3E7657',
  critical: '#A94747',
  criticalSoft: '#F8E9E7',
  focus: '#2F7D73',
} as const

const sp = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const Ic = {
  home:       <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  shield:     <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  heart:      <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  user:       <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  message:    <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  phone:      <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  lock:       <svg width={18} height={18} viewBox="0 0 24 24" {...sp}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  check:      <svg width={20} height={20} viewBox="0 0 24 24" {...sp}><polyline points="20 6 9 17 4 12"/></svg>,
  checkCircle:<svg width={20} height={20} viewBox="0 0 24 24" {...sp}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  x:          <svg width={20} height={20} viewBox="0 0 24 24" {...sp}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  arrowLeft:  <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  chevDown:   <svg width={18} height={18} viewBox="0 0 24 24" {...sp}><polyline points="6 9 12 15 18 9"/></svg>,
  chevRight:  <svg width={18} height={18} viewBox="0 0 24 24" {...sp}><polyline points="9 18 15 12 9 6"/></svg>,
  plus:       <svg width={20} height={20} viewBox="0 0 24 24" {...sp}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  alert:      <svg width={20} height={20} viewBox="0 0 24 24" {...sp}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  edit:       <svg width={18} height={18} viewBox="0 0 24 24" {...sp}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  clipboard:  <svg width={20} height={20} viewBox="0 0 24 24" {...sp}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  book:       <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  info:       <svg width={18} height={18} viewBox="0 0 24 24" {...sp}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  settings:   <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  users:      <svg width={22} height={22} viewBox="0 0 24 24" {...sp}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  link:       <svg width={20} height={20} viewBox="0 0 24 24" {...sp}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  activity:   <svg width={20} height={20} viewBox="0 0 24 24" {...sp}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  calendar:   <svg width={20} height={20} viewBox="0 0 24 24" {...sp}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  wifi:       <svg width={18} height={18} viewBox="0 0 24 24" {...sp}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  copy:       <svg width={18} height={18} viewBox="0 0 24 24" {...sp}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
}

// ── Buttons ──────────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'secondary' | 'tertiary' | 'critical' | 'ghost'

interface BtnProps {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  fullWidth?: boolean
  small?: boolean
  icon?: ReactNode
  disabled?: boolean
  style?: React.CSSProperties
}

export function Btn({ children, onClick, variant = 'primary', fullWidth, small, icon, disabled, style }: BtnProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, fontFamily: 'inherit', fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
    border: 'none', transition: 'background 0.15s, opacity 0.15s',
    opacity: disabled ? 0.45 : 1,
    fontSize: small ? 14 : 16, lineHeight: small ? '20px' : '20px',
    padding: small ? '10px 16px' : '16px 24px',
    height: small ? 40 : 54,
    width: fullWidth ? '100%' : undefined,
    ...style,
  }
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary:   { ...base, backgroundColor: C.brand, color: '#fff' },
    secondary: { ...base, backgroundColor: C.soft, color: C.brand, border: `1.5px solid ${C.brandSoft}` },
    tertiary:  { ...base, backgroundColor: 'transparent', color: C.brand },
    critical:  { ...base, backgroundColor: C.critical, color: '#fff' },
    ghost:     { ...base, backgroundColor: 'transparent', color: C.muted },
  }
  return (
    <button style={styles[variant]} onClick={disabled ? undefined : onClick}>
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  )
}

// ── Inputs ───────────────────────────────────────────────────────────────────

interface InputProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  type?: string
  helper?: string
}

export function Input({ label, value, onChange, placeholder, error, type = 'text', helper }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: C.heading }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${error ? C.critical : C.border}`,
          backgroundColor: C.surface, fontSize: 16, color: C.body, fontFamily: 'inherit',
          outline: 'none', transition: 'border 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = C.focus; e.target.style.boxShadow = `0 0 0 3px ${C.focus}33` }}
        onBlur={e => { e.target.style.borderColor = error ? C.critical : C.border; e.target.style.boxShadow = 'none' }}
      />
      {error && <p style={{ fontSize: 13, color: C.critical, display: 'flex', gap: 5, alignItems: 'center' }}><span style={{ display: 'flex' }}>{Ic.alert}</span>{error}</p>}
      {helper && !error && <p style={{ fontSize: 13, color: C.muted }}>{helper}</p>}
    </div>
  )
}

export function TextArea({ label, value, onChange, placeholder, helper }: Omit<InputProps, 'type' | 'error'> & { helper?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: C.heading }}>{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{
          padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`,
          backgroundColor: C.surface, fontSize: 16, color: C.body, fontFamily: 'inherit',
          outline: 'none', resize: 'vertical', lineHeight: '24px',
        }}
        onFocus={e => { e.target.style.borderColor = C.focus; e.target.style.boxShadow = `0 0 0 3px ${C.focus}33` }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
      />
      {helper && <p style={{ fontSize: 13, color: C.muted }}>{helper}</p>}
    </div>
  )
}

// ── Status chip ───────────────────────────────────────────────────────────────

type ChipVariant = 'ok' | 'warn' | 'empty' | 'critical' | 'blue' | 'warm' | 'default'

export function StatusChip({ label, variant = 'default', icon }: { label: string; variant?: ChipVariant; icon?: ReactNode }) {
  const colors: Record<ChipVariant, { bg: string; fg: string }> = {
    ok:       { bg: '#E8F4EE', fg: C.success },
    warn:     { bg: '#FEF9EC', fg: '#92700A' },
    empty:    { bg: C.soft, fg: C.muted },
    critical: { bg: C.criticalSoft, fg: C.critical },
    blue:     { bg: '#EBF2F7', fg: C.blue },
    warm:     { bg: '#FBF2E3', fg: '#8A6322' },
    default:  { bg: C.soft, fg: C.body },
  }
  const { bg, fg } = colors[variant]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: bg, color: fg, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {label}
    </span>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style, onClick }: { children: ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: C.surface, borderRadius: 16, padding: 20,
        border: `1px solid ${C.border}`,
        boxShadow: '0 4px 16px rgba(23,52,58,0.07)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}>
      {children}
    </div>
  )
}

// ── Bottom Sheet ─────────────────────────────────────────────────────────────

export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(23,52,58,0.45)', animation: 'fade-in 0.2s ease' }}
        onClick={onClose}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.surface, borderRadius: '20px 20px 0 0',
        padding: '12px 20px 40px', animation: 'slide-up 0.28s ease',
        maxHeight: '80%', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, margin: '0 auto 20px' }} />
        {title && <h3 style={{ fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 16 }}>{title}</h3>}
        {children}
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(23,52,58,0.5)', animation: 'fade-in 0.2s ease' }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative', backgroundColor: C.surface, borderRadius: 20, padding: 24,
        width: '100%', maxWidth: 350, animation: 'fade-in 0.2s ease',
        boxShadow: '0 20px 60px rgba(23,52,58,0.2)',
      }}>
        {title && <h3 style={{ fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 12 }}>{title}</h3>}
        {children}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'absolute', bottom: 110, left: 20, right: 20, zIndex: 80,
      backgroundColor: C.heading, color: '#fff', borderRadius: 12, padding: '14px 18px',
      fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
      animation: 'toast-in 0.25s ease',
      boxShadow: '0 8px 24px rgba(23,52,58,0.25)',
    }}>
      <span style={{ display: 'flex', color: '#6EE7C4' }}>{Ic.checkCircle}</span>
      {message}
    </div>
  )
}

// ── Privacy Note ──────────────────────────────────────────────────────────────

export function PrivacyNote({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', backgroundColor: C.soft, borderRadius: 12, padding: '12px 14px' }}>
      <span style={{ display: 'flex', color: C.brand, flexShrink: 0, marginTop: 1 }}>{Ic.lock}</span>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: '18px', margin: 0 }}>{text}</p>
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

export function ProgressBar({ value, total, label }: { value: number; total: number; label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <p style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{label}</p>}
      <div style={{ height: 6, borderRadius: 3, backgroundColor: C.soft, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(value / total) * 100}%`, backgroundColor: C.brand, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ── Status Bar (mobile) ───────────────────────────────────────────────────────

export function StatusBar() {
  return (
    <div style={{ height: 47, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: C.heading }}>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: C.heading }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="6" width="3" height="6" rx="0.5"/><rect x="4.5" y="4" width="3" height="8" rx="0.5"/><rect x="9" y="2" width="3" height="10" rx="0.5"/><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.3"/></svg>
        <svg width="16" height="12" viewBox="0 0 24 12" fill="currentColor"><rect x="0" y="1" width="22" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="2.5" width="16" height="7" rx="1" fill="currentColor"/></svg>
      </div>
    </div>
  )
}

// ── PCS Bottom Navigation ──────────────────────────────────────────────────────

const PCS_TAB_SCREENS: Record<string, number> = {
  inicio: 2,
  plan: 5,
  acompanamiento: 8,
  perfil: 2,
}

// ── Floating Support Button (PCS M2–M5, M7–M8; never M1, M6, caregiver, admin) ─

export function FloatingSupportBtn({ onPress, bottom = 64 }: { onPress: () => void; bottom?: number }) {
  return (
    <button
      onClick={onPress}
      style={{
        position: 'absolute', left: 20, right: 20, bottom, zIndex: 40,
        backgroundColor: C.brand, color: '#fff',
        border: 'none', borderRadius: 14, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 6px 24px rgba(36,107,100,0.35)',
      }}>
      <span style={{ display: 'flex' }}>{Ic.shield}</span>
      Necesito apoyo ahora
    </button>
  )
}

export function PCSBottomNav({ active, navigate }: { active: string; navigate: (n: number) => void }) {
  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: Ic.home },
    { id: 'plan', label: 'Mi plan', icon: Ic.shield },
    { id: 'acompanamiento', label: 'Apoyo', icon: Ic.heart },
    { id: 'perfil', label: 'Perfil', icon: Ic.user },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', paddingBottom: 28 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => navigate(PCS_TAB_SCREENS[t.id] ?? 2)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer',
              color: active === t.id ? C.brand : C.muted, fontFamily: 'inherit',
            }}>
            {t.icon}
            <span style={{ fontSize: 11, fontWeight: active === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Caregiver Bottom Navigation ───────────────────────────────────────────────

const CAREGIVER_TAB_SCREENS: Record<string, number> = {
  inicio: 9,
  mensajes: 10,
  plan: 11,
  registro: 12,
  perfil: 9,
}

export function CaregiverBottomNav({ active, navigate }: { active: string; navigate: (n: number) => void }) {
  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: Ic.home },
    { id: 'mensajes', label: 'Mensajes', icon: Ic.message },
    { id: 'plan', label: 'Plan apoyo', icon: Ic.shield },
    { id: 'registro', label: 'Registro', icon: Ic.clipboard },
    { id: 'perfil', label: 'Perfil', icon: Ic.user },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', paddingBottom: 28 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => navigate(CAREGIVER_TAB_SCREENS[t.id] ?? 9)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer',
              color: active === t.id ? C.brand : C.muted, fontFamily: 'inherit',
            }}>
            {t.icon}
            <span style={{ fontSize: 10, fontWeight: active === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Desktop Sidebar ───────────────────────────────────────────────────────────

export function DesktopSidebar({ active, onNavigate }: { active: string; onNavigate: (tab: string) => void }) {
  const items = [
    { id: 'resumen', label: 'Resumen', icon: Ic.activity },
    { id: 'participantes', label: 'Participantes', icon: Ic.users },
    { id: 'cuentas', label: 'Cuentas y vínculos', icon: Ic.link },
    { id: 'configuracion', label: 'Configuración', icon: Ic.settings },
  ]
  return (
    <aside style={{ width: 232, backgroundColor: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: C.heading }}>Contigo</span>
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 500 }}>Panel investigador</p>
      </div>
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              backgroundColor: active === item.id ? C.brandSoft : 'transparent',
              color: active === item.id ? C.brand : C.muted,
              fontFamily: 'inherit', fontSize: 14, fontWeight: active === item.id ? 600 : 400,
              textAlign: 'left', marginBottom: 2, transition: 'background 0.12s',
            }}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth={2} strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.body, margin: 0 }}>Dra. Valentina Ríos</p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Investigadora principal</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ── Contigo Logo ─────────────────────────────────────────────────────────────

export function ContigoLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 36, md: 52, lg: 68 }[size]
  const fs = { sm: 20, md: 28, lg: 36 }[size]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ width: dims, height: dims, borderRadius: dims * 0.3, backgroundColor: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={dims * 0.55} height={dims * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <span style={{ fontSize: fs, fontWeight: 700, color: C.heading, letterSpacing: '-0.5px' }}>Contigo</span>
    </div>
  )
}

// ── Section heading ──────────────────────────────────────────────────────────

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{subtitle}</p>}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

export function Divider() {
  return <div style={{ height: 1, backgroundColor: C.border, margin: '16px 0' }} />
}

// ── useToast hook ─────────────────────────────────────────────────────────────

export function useToast(duration = 2800) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const show = (msg: string) => {
    setMessage(msg)
    setVisible(true)
    setTimeout(() => setVisible(false), duration)
  }
  return { visible, message, show }
}
