import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts'
import { C, Ic, Btn, Card, StatusChip, BottomSheet, Modal, Divider, SectionHeading, DesktopSidebar, useToast, Toast } from '../ui'

// ── Synthetic data ────────────────────────────────────────────────────────────

const emaData = [
  { day: '1 ago', completions: 7, total: 8 },
  { day: '2 ago', completions: 8, total: 8 },
  { day: '3 ago', completions: 6, total: 8 },
  { day: '4 ago', completions: 8, total: 8 },
  { day: '5 ago', completions: 5, total: 8 },
  { day: '6 ago', completions: 7, total: 8 },
  { day: '7 ago', completions: 8, total: 8 },
  { day: '8 ago', completions: 6, total: 8 },
  { day: '9 ago', completions: 7, total: 8 },
  { day: '10 ago', completions: 8, total: 8 },
  { day: '11 ago', completions: 4, total: 8 },
  { day: '12 ago', completions: 6, total: 8 },
  { day: '13 ago', completions: 7, total: 8 },
  { day: '14 ago', completions: 8, total: 8 },
]

const participantEmaData = [
  { semana: 'S1', valor: 3.2 }, { semana: 'S2', valor: 3.8 }, { semana: 'S3', valor: 2.9 },
  { semana: 'S4', valor: 4.1 }, { semana: 'S5', valor: 3.5 }, { semana: 'S6', valor: 4.4 },
  { semana: 'S7', valor: 3.8 }, { semana: 'S8', valor: 4.6 },
]

const participants = [
  { id: 'PCS-021', ema: '14 ago', adherencia: '94%', plan: 'Completo', cuidador: 'Vinculado', estado: 'ok' as const },
  { id: 'PCS-022', ema: '14 ago', adherencia: '88%', plan: 'Parcial', cuidador: 'Vinculado', estado: 'ok' as const },
  { id: 'PCS-023', ema: '12 ago', adherencia: '62%', plan: 'Sin empezar', cuidador: 'Sin vincular', estado: 'warn' as const },
  { id: 'PCS-024', ema: '14 ago', adherencia: '97%', plan: 'Completo', cuidador: 'Vinculado', estado: 'ok' as const },
  { id: 'PCS-025', ema: '10 ago', adherencia: '43%', plan: 'Parcial', cuidador: 'Vinculado', estado: 'critical' as const },
  { id: 'PCS-026', ema: '14 ago', adherencia: '81%', plan: 'Completo', cuidador: 'Sin vincular', estado: 'ok' as const },
]

const links = [
  { pcs: 'PCS-021', cuidador: '@maria.garcia', relacion: 'Madre', fecha: '3 ago 2026', estado: 'Activo' },
  { pcs: 'PCS-022', cuidador: '@jorge.perez', relacion: 'Amigo', fecha: '5 ago 2026', estado: 'Activo' },
  { pcs: 'PCS-024', cuidador: '@lorena.m', relacion: 'Madre', fecha: '1 ago 2026', estado: 'Activo' },
  { pcs: 'PCS-025', cuidador: '@lucia.ramirez', relacion: 'Hermana', fecha: '8 ago 2026', estado: 'Activo' },
]

const auditLog = [
  { actor: 'dra.rios', accion: 'Creó participante PCS-026', fecha: '14 ago 2026 09:12', id: 'PCS-026' },
  { actor: 'dra.rios', accion: 'Consultó plan de seguridad', fecha: '14 ago 2026 08:55', id: 'PCS-024' },
  { actor: 'admin.sistema', accion: 'Envió código de activación', fecha: '13 ago 2026 17:30', id: 'PCS-025' },
  { actor: 'dra.rios', accion: 'Vinculó cuidador @lorena.m', fecha: '1 ago 2026 10:14', id: 'PCS-024' },
]

// ── Shared desktop wrapper ────────────────────────────────────────────────────

function DesktopLayout({ navigate, activeNav, children }: { navigate: (n: number) => void; activeNav: string; children: React.ReactNode }) {
  const navMap: Record<string, number> = { resumen: 13, participantes: 14, cuentas: 15, configuracion: 13 }
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 44px)', overflow: 'hidden' }}>
      <DesktopSidebar active={activeNav} onNavigate={id => navigate(navMap[id] ?? 13)} />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: C.canvas }}>
        {children}
      </main>
    </div>
  )
}

// ── Top Bar for desktop pages ─────────────────────────────────────────────────

function DesktopTopBar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.heading, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: C.muted, margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {action && <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>{action}</div>}
    </div>
  )
}

// ── Summary stat card ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(23,52,58,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, margin: 0, lineHeight: '18px' }}>{label}</p>
        <span style={{ color: C.brand, display: 'flex' }}>{icon}</span>
      </div>
      <p style={{ fontSize: 32, fontWeight: 700, color: C.heading, margin: '0 0 4px', letterSpacing: '-1px' }}>{value}</p>
      {sub && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{sub}</p>}
    </div>
  )
}

// ── Screen 13: Admin Dashboard ────────────────────────────────────────────────

export function DesktopScreen13({ navigate }: { navigate: (n: number) => void }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [dateRange, setDateRange] = useState('Últimos 14 días')

  return (
    <DesktopLayout navigate={navigate} activeNav="resumen">
      <DesktopTopBar
        title="Resumen del estudio"
        subtitle="Vista general · Estudio CONTIGO-2026"
        action={
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px' }}>
              <span style={{ display: 'flex', color: C.muted }}>{Ic.calendar}</span>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                style={{ border: 'none', background: 'none', fontSize: 14, color: C.body, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
                <option>Últimos 7 días</option>
                <option>Últimos 14 días</option>
                <option>Últimos 30 días</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: C.soft, borderRadius: 10, padding: '8px 14px' }}>
              <span style={{ display: 'flex', color: C.success }}>{Ic.lock}</span>
              <span style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>Sesión segura · Dra. Ríos</span>
            </div>
            <Btn variant="primary" small onClick={() => setCreateOpen(true)} icon={Ic.plus}>Crear participante</Btn>
          </>
        }
      />

      <div style={{ padding: 32 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Participantes activos" value="8" sub="De 10 inscritos" icon={Ic.users} />
          <StatCard label="Registros EMA de hoy" value="7" sub="87.5% de adherencia" icon={Ic.clipboard} />
          <StatCard label="Planes de seguridad completos" value="6" sub="75% del total" icon={Ic.shield} />
          <StatCard label="Vínculos con cuidadores" value="6" sub="75% vinculados" icon={Ic.link} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>
          {/* Participant table */}
          <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: 0 }}>Estado de participantes</h2>
              <input placeholder="Buscar por ID..." style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.body, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: C.canvas }}>
                  {['ID participante', 'Último EMA', 'Adherencia', 'Plan seguridad', 'Cuidador', 'Estado', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${C.border}`, backgroundColor: i % 2 === 0 ? C.surface : C.canvas + '80' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: C.heading }}>{p.id}</td>
                    <td style={{ padding: '12px 16px', color: C.muted }}>{p.ema}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: parseFloat(p.adherencia) >= 80 ? C.success : parseFloat(p.adherencia) >= 60 ? '#92700A' : C.critical, fontWeight: 700 }}>{p.adherencia}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusChip label={p.plan} variant={p.plan === 'Completo' ? 'ok' : p.plan === 'Parcial' ? 'warn' : 'empty'} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusChip label={p.cuidador} variant={p.cuidador === 'Vinculado' ? 'ok' : 'empty'} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusChip
                        label={p.estado === 'ok' ? 'Al día' : p.estado === 'warn' ? 'Revisar' : 'Requiere apoyo'}
                        variant={p.estado}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => navigate(14)}
                        style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: C.brand, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMA chart */}
          <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Diligenciamiento EMA</h2>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Últimos 14 días · Completados de 8 participantes</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={emaData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="emaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.brand} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.brand} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 8]} tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}
                  formatter={(v) => [`${v} de 8 participantes`, 'Completados']}
                />
                <Area type="monotone" dataKey="completions" stroke={C.brand} strokeWidth={2} fill="url(#emaGrad)" dot={{ r: 3, fill: C.brand }} />
              </AreaChart>
            </ResponsiveContainer>
            <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 8 }}>
              Representa adherencia al registro, no resultados clínicos.
            </p>
          </div>
        </div>
      </div>

      {/* Create participant modal */}
      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23,52,58,0.45)' }}>
          <div style={{ backgroundColor: C.surface, borderRadius: 20, padding: 28, width: 480, boxShadow: '0 20px 60px rgba(23,52,58,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.heading, margin: 0 }}>Crear participante</h2>
              <button onClick={() => setCreateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex' }}>{Ic.x}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 5 }}>ID del estudio</label>
                <input defaultValue="PCS-027" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 15, fontFamily: 'inherit', color: C.body, outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 5 }}>Nombre (anonimizado)</label>
                  <input placeholder="Apodo para la app" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'inherit', color: C.body, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 5 }}>Rol</label>
                  <select style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'inherit', color: C.body, outline: 'none', backgroundColor: C.surface }}>
                    <option>PCS</option>
                    <option>Cuidador/a</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Btn variant="secondary" fullWidth onClick={() => setCreateOpen(false)}>Cancelar</Btn>
                <Btn variant="primary" fullWidth onClick={() => { navigate(15); setCreateOpen(false) }}>Crear cuenta y generar código</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  )
}

// ── Screen 14: Participant Detail ─────────────────────────────────────────────

const completedEmas = [
  { id: 'EMA-241', date: '14 ago 2026', time: '08:12', answers: [3, 4, 2] },
  { id: 'EMA-240', date: '13 ago 2026', time: '07:55', answers: [4, 4, 3] },
  { id: 'EMA-239', date: '12 ago 2026', time: '09:03', answers: [2, 3, 2] },
  { id: 'EMA-238', date: '11 ago 2026', time: '08:30', answers: [3, 3, 3] },
  { id: 'EMA-237', date: '10 ago 2026', time: '07:48', answers: [4, 5, 4] },
  { id: 'EMA-236', date: '9 ago 2026', time: '08:15', answers: [3, 3, 2] },
  { id: 'EMA-235', date: '8 ago 2026', time: '09:22', answers: [2, 2, 1] },
]

const emaQuestions = [
  '[[PREGUNTA EMA 1 — TEXTO CLÍNICO POR VALIDAR]]',
  '[[PREGUNTA EMA 2 — TEXTO CLÍNICO POR VALIDAR]]',
  '[[PREGUNTA EMA 3 — TEXTO CLÍNICO POR VALIDAR]]',
]

export function DesktopScreen14({ navigate }: { navigate: (n: number) => void }) {
  const [tab, setTab] = useState('resumen')
  const [showPlan, setShowPlan] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)
  const [crisisReason, setCrisisReason] = useState('')
  const [selectedEma, setSelectedEma] = useState<typeof completedEmas[0] | null>(null)

  const tabs = ['resumen', 'ema', 'plan', 'cuidador', 'historial']
  const tabLabels: Record<string, string> = { resumen: 'Resumen', ema: 'EMA', plan: 'Plan de seguridad', cuidador: 'Cuidador', historial: 'Historial de acceso' }

  return (
    <DesktopLayout navigate={navigate} activeNav="participantes">
      {/* Header */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => navigate(13)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, display: 'flex' }}>{Ic.arrowLeft}</button>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: C.heading, margin: 0 }}>Participante PCS-024</h1>
                <StatusChip label="Al día" variant="ok" icon={Ic.checkCircle} />
              </div>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Cuidador vinculado: @lorena.m · Actualizado: 14 ago 2026, 09:45</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ backgroundColor: C.criticalSoft, borderRadius: 10, padding: '8px 14px', display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ display: 'flex', color: C.critical }}>{Ic.lock}</span>
              <span style={{ fontSize: 12, color: C.critical, fontWeight: 600 }}>Información sensible — acceso registrado</span>
            </div>
            <Btn variant="secondary" small onClick={() => setShowPlan(true)} icon={Ic.shield}>Ver plan de seguridad</Btn>
            <Btn variant="critical" small onClick={() => setShowCrisis(true)} icon={Ic.alert}>Activar protocolo de crisis</Btn>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderTop: `1px solid ${C.border}`, paddingTop: 0, marginTop: 0 }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t ? C.brand : C.muted, fontWeight: tab === t ? 700 : 400,
                fontSize: 14, fontFamily: 'inherit', borderBottom: `2px solid ${tab === t ? C.brand : 'transparent'}`,
                marginBottom: -1, transition: 'color 0.15s',
              }}>
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 32 }}>
        {tab === 'resumen' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* EMA trend chart */}
              <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: 0 }}>Tendencia EMA — PCS-024</h2>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Valores de demostración — reglas por validar</p>
                  </div>
                  <StatusChip label="97% adherencia" variant="ok" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={participantEmaData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="semana" tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} formatter={(v) => [typeof v === 'number' ? v.toFixed(1) : v, 'Valor EMA']} />
                    <Line type="monotone" dataKey="valor" stroke={C.brand} strokeWidth={2.5} dot={{ r: 4, fill: C.brand, stroke: C.surface, strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
                <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 4 }}>Eje Y: escala EMA pendiente de validación clínica</p>
              </div>

              {/* Daily completion */}
              <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.heading, marginBottom: 16 }}>Historial de registros (últimos 14 días)</h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {emaData.map((d, i) => (
                    <div key={i} title={`${d.day}: completado`} style={{
                      width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: d.completions >= 7 ? C.brand : d.completions >= 5 ? C.brandSoft : C.criticalSoft,
                      fontSize: 10, fontWeight: 700, color: d.completions >= 7 ? '#fff' : d.completions >= 5 ? C.brand : C.critical,
                      cursor: 'default',
                    }}>
                      {d.completions >= 7 ? '✓' : d.completions}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: C.brand }} /><span style={{ fontSize: 11, color: C.muted }}>Completo</span></div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: C.brandSoft }} /><span style={{ fontSize: 11, color: C.muted }}>Parcial</span></div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: C.criticalSoft }} /><span style={{ fontSize: 11, color: C.muted }}>Incompleto</span></div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Safety plan status */}
              <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.heading, marginBottom: 14 }}>Plan de seguridad</h3>
                {[
                  { label: 'Señales que reconoce', status: 'ok' as const },
                  { label: 'Habilidades elegidas', status: 'ok' as const },
                  { label: 'Personas de apoyo', status: 'ok' as const },
                  { label: 'Ayuda profesional', status: 'warn' as const },
                  { label: 'Entorno seguro', status: 'empty' as const },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 13, color: C.body }}>{s.label}</span>
                    <StatusChip label={s.status === 'ok' ? 'Completo' : s.status === 'warn' ? 'Parcial' : 'Sin empezar'} variant={s.status} />
                  </div>
                ))}
              </div>

              {/* Caregiver log summary */}
              <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.heading, marginBottom: 14 }}>Interacción cuidador</h3>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Últimos 7 días · @lorena.m</p>
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                  <div key={d} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: C.muted, width: 28 }}>{d}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: C.soft }}>
                      <div style={{ height: '100%', width: [80, 100, 60, 100, 40, 0, 100][i] + '%', backgroundColor: C.brand, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.heading, marginBottom: 14 }}>Actividad reciente</h3>
                {[
                  { icon: Ic.checkCircle, text: 'Completó registro EMA', time: 'Hoy 08:12', color: C.success },
                  { icon: Ic.shield, text: 'Actualizó plan de seguridad', time: 'Ayer 16:30', color: C.brand },
                  { icon: Ic.activity, text: 'Usó habilidad de respiración', time: 'Ayer 14:05', color: C.blue },
                  { icon: Ic.message, text: 'Recibió mensaje de cuidador', time: '12 ago', color: C.warm },
                ].map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <span style={{ color: e.color, display: 'flex', flexShrink: 0, marginTop: 1 }}>{e.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, color: C.body, margin: 0 }}>{e.text}</p>
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{e.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'ema' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Trend chart */}
            <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Tendencia de adherencia EMA</h2>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Últimos 7 días · Valores de demostración</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={emaData.slice(-7)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.muted }} />
                  <YAxis domain={[0, 8]} tick={{ fontSize: 11, fill: C.muted }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
                  <Bar dataKey="completions" fill={C.brand} radius={[6, 6, 0, 0]} name="Completados" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Completed EMAs table */}
            <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: 0 }}>EMA completadas</h2>
                  <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>PCS-024 · {completedEmas.length} registros</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: C.criticalSoft, borderRadius: 8, padding: '6px 12px' }}>
                  <span style={{ display: 'flex', color: C.critical, fontSize: 12 }}>{Ic.lock}</span>
                  <span style={{ fontSize: 11, color: C.critical, fontWeight: 600 }}>El acceso a estas respuestas queda registrado.</span>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: C.canvas }}>
                    {['ID registro', 'Fecha', 'Hora', 'Estado', ''].map(h => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completedEmas.map((ema, i) => (
                    <tr key={ema.id} style={{ borderTop: `1px solid ${C.border}`, backgroundColor: i % 2 === 0 ? C.surface : C.canvas + '80', cursor: 'pointer' }} onClick={() => setSelectedEma(ema)}>
                      <td style={{ padding: '12px 20px', fontWeight: 700, color: C.heading }}>{ema.id}</td>
                      <td style={{ padding: '12px 20px', color: C.body }}>{ema.date}</td>
                      <td style={{ padding: '12px 20px', color: C.muted }}>{ema.time}</td>
                      <td style={{ padding: '12px 20px' }}><StatusChip label="Completada" variant="ok" /></td>
                      <td style={{ padding: '12px 20px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedEma(ema) }}
                          style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: C.brand, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          Ver respuestas
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMA response drawer */}
        {selectedEma && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(23,52,58,0.4)' }} onClick={() => setSelectedEma(null)} />
            <div style={{ position: 'relative', width: 440, backgroundColor: C.surface, boxShadow: '-8px 0 32px rgba(23,52,58,0.15)', overflowY: 'auto' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, margin: '0 0 4px' }}>Respuestas EMA</h2>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Participante PCS-024 · {selectedEma.id}</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{selectedEma.date} a las {selectedEma.time}</p>
                </div>
                <button onClick={() => setSelectedEma(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 4 }}>{Ic.x}</button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ backgroundColor: C.criticalSoft, borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'flex', color: C.critical, flexShrink: 0 }}>{Ic.lock}</span>
                  <span style={{ fontSize: 12, color: C.critical, fontWeight: 600 }}>El acceso a estas respuestas queda registrado.</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {emaQuestions.map((q, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, backgroundColor: C.canvas }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px' }}>Pregunta {i + 1}</p>
                      <p style={{ fontSize: 14, color: C.body, lineHeight: '20px', margin: '0 0 12px', fontStyle: 'italic' }}>{q}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: C.muted }}>Respuesta:</span>
                        <span style={{ fontSize: 22, fontWeight: 700, color: C.brand }}>{selectedEma.answers[i]}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>de 5</span>
                        <span style={{ fontSize: 11, color: C.muted, marginLeft: 4, fontStyle: 'italic' }}>[[Etiquetas por validar]]</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24 }}>
                  <Btn variant="secondary" fullWidth onClick={() => setSelectedEma(null)}>Cerrar</Btn>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'plan' && (
          <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 20 }}>Plan de seguridad — PCS-024</h2>
            {[
              { n: 1, title: 'Señales y situaciones que reconoce', content: 'Se siente abrumada cuando está sola por mucho tiempo o cuando no ha dormido bien.', status: 'ok' as const },
              { n: 2, title: 'Lo que puede hacer por su cuenta', content: 'Respiración pausada · Caminar en el parque · Escuchar música tranquila', status: 'ok' as const },
              { n: 3, title: 'Personas y lugares que pueden acompañarle', content: 'Mamá · Parque central del barrio', status: 'ok' as const },
              { n: 4, title: 'Ayuda profesional y líneas de atención', content: '[Pendiente de completar — equipo clínico responsable]', status: 'warn' as const },
              { n: 5, title: 'Cómo hacer el entorno más seguro', content: '[Sin empezar]', status: 'empty' as const },
            ].map(s => (
              <div key={s.n} style={{ marginBottom: 16, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: s.status === 'ok' ? C.brandSoft : C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.status === 'ok' ? C.brand : C.muted }}>{s.n}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.heading, margin: 0 }}>{s.title}</h3>
                      <StatusChip label={s.status === 'ok' ? 'Completo' : s.status === 'warn' ? 'Parcial' : 'Sin empezar'} variant={s.status} />
                    </div>
                    <p style={{ fontSize: 13, color: C.body, margin: 0, fontStyle: s.status !== 'ok' ? 'italic' : 'normal' }}>{s.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'cuidador' && (
          <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 20 }}>Vínculo con cuidador</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              {[{ label: 'Cuidador', val: '@lorena.m' }, { label: 'Relación', val: 'Madre' }, { label: 'Fecha vínculo', val: '1 ago 2026' }, { label: 'Estado', val: 'Activo' }].map(f => (
                <div key={f.label} style={{ backgroundColor: C.canvas, borderRadius: 10, padding: '12px 16px', flex: 1 }}>
                  <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, margin: '0 0 4px' }}>{f.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.heading, margin: 0 }}>{f.val}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: C.muted, fontStyle: 'italic' }}>Resumen de interacciones cuidador disponible en la pestaña Resumen.</p>
          </div>
        )}

        {tab === 'historial' && (
          <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 20 }}>Historial de acceso — PCS-024</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: C.canvas }}>
                  {['Actor', 'Acción', 'Fecha/hora', 'Participante'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLog.map((r, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: '11px 14px', color: C.brand, fontWeight: 600, fontSize: 12 }}>{r.actor}</td>
                    <td style={{ padding: '11px 14px', color: C.body }}>{r.accion}</td>
                    <td style={{ padding: '11px 14px', color: C.muted, fontSize: 12 }}>{r.fecha}</td>
                    <td style={{ padding: '11px 14px' }}><StatusChip label={r.id} variant="blue" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Safety plan drawer */}
      {showPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(23,52,58,0.4)' }} onClick={() => setShowPlan(false)} />
          <div style={{ position: 'relative', width: 420, backgroundColor: C.surface, boxShadow: '-8px 0 32px rgba(23,52,58,0.15)', overflowY: 'auto', animation: 'slide-right 0.28s ease' }}>
            <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, margin: 0 }}>Plan de seguridad — PCS-024</h2>
              <button onClick={() => setShowPlan(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex' }}>{Ic.x}</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Actualizado por PCS-024 el 14 ago 2026 · Solo lectura</p>
              {['Señales que reconoce', 'Habilidades elegidas', 'Personas de apoyo', 'Contacto profesional', 'Entorno seguro'].map((s, i) => (
                <div key={i} style={{ marginBottom: 14, padding: 16, borderRadius: 12, backgroundColor: C.canvas }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.heading, margin: '0 0 6px' }}>{i + 1}. {s}</p>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, fontStyle: 'italic' }}>[Contenido del plan de PCS-024]</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Crisis protocol modal */}
      {showCrisis && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23,52,58,0.5)' }}>
          <div style={{ backgroundColor: C.surface, borderRadius: 20, padding: 28, width: 480, boxShadow: '0 20px 60px rgba(23,52,58,0.2)' }}>
            <div style={{ backgroundColor: C.criticalSoft, borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `1px solid ${C.critical}30` }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.critical, margin: '0 0 4px' }}>⚠ Activar protocolo de crisis</p>
              <p style={{ fontSize: 13, color: C.body, margin: 0 }}>Participante: <strong>PCS-024</strong> · Esta acción quedará registrada en el historial de auditoría.</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 8 }}>Motivo de activación</label>
              <select value={crisisReason} onChange={e => setCrisisReason(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'inherit', color: C.body, outline: 'none', backgroundColor: C.surface }}>
                <option value="">Selecciona un motivo...</option>
                <option>Alerta clínica identificada</option>
                <option>Solicitud del equipo de campo</option>
                <option>Contacto de emergencia del cuidador</option>
              </select>
            </div>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>No se realiza ninguna llamada automática. El equipo responsable recibirá una notificación interna.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="primary" fullWidth onClick={() => setShowCrisis(false)}>Cancelar</Btn>
              <Btn variant="critical" fullWidth onClick={() => setShowCrisis(false)} disabled={!crisisReason}>Confirmar activación</Btn>
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  )
}

// ── Screen 15: Account and Link Management ────────────────────────────────────

export function DesktopScreen15({ navigate }: { navigate: (n: number) => void }) {
  const [genCode, setGenCode] = useState(false)
  const [showUnlink, setShowUnlink] = useState<typeof links[0] | null>(null)
  const { visible, message, show } = useToast()

  return (
    <DesktopLayout navigate={navigate} activeNav="cuentas">
      <DesktopTopBar title="Cuentas y vínculos" subtitle="Gestión de accesos y relaciones PCS–cuidador" />

      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Create participant panel */}
          <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 6 }}>Crear participante</h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Genera un código de activación seguro para el nuevo participante.</p>

            {!genCode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 6 }}>ID del estudio</label>
                  <input defaultValue="PCS-027" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 15, fontFamily: 'inherit', color: C.body, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 6 }}>Nombre de presentación (apodo)</label>
                  <input placeholder="Usado en la app, no expone datos reales" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'inherit', color: C.body, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 6 }}>Rol</label>
                  <select style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'inherit', color: C.body, outline: 'none', backgroundColor: C.surface }}>
                    <option>PCS</option>
                    <option>Cuidador/a</option>
                  </select>
                </div>
                <Btn variant="primary" fullWidth onClick={() => setGenCode(true)} icon={Ic.plus}>Crear cuenta y generar código</Btn>
              </div>
            ) : (
              <div>
                <div style={{ backgroundColor: C.brandSoft, borderRadius: 14, padding: 20, marginBottom: 20, border: `1.5px solid ${C.brand}` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.brand, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Código de activación generado</p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: C.heading, letterSpacing: 6 }}>K9M3P7</span>
                    <button
                      onClick={() => show('Código copiado al portapapeles')}
                      style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: C.brand, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {Ic.copy} Copiar
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 8, marginBottom: 0 }}>Cuenta: PCS-027 · Válido por 72 horas</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant="secondary" fullWidth onClick={() => setGenCode(false)}>Crear otro</Btn>
                  <Btn variant="primary" fullWidth icon={Ic.message}>Enviar invitación</Btn>
                </div>
              </div>
            )}
          </div>

          {/* Audit history */}
          <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 6 }}>Historial de auditoría</h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Acciones recientes del sistema.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {auditLog.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < auditLog.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: C.brand, display: 'flex' }}>{Ic.user}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: C.body, margin: '0 0 2px' }}><strong>{r.actor}</strong> · {r.accion}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{r.fecha} · {r.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PCS-Caregiver links table */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: 0 }}>Vínculos PCS–cuidador</h2>
            <input placeholder="Buscar por ID o usuario..." style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.body, fontFamily: 'inherit', outline: 'none', width: 240 }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: C.canvas }}>
                {['PCS ID', 'Usuario cuidador', 'Relación', 'Fecha vínculo', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.map((l, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: C.heading }}>{l.pcs}</td>
                  <td style={{ padding: '13px 20px', color: C.brand, fontWeight: 600 }}>{l.cuidador}</td>
                  <td style={{ padding: '13px 20px', color: C.body }}>{l.relacion}</td>
                  <td style={{ padding: '13px 20px', color: C.muted }}>{l.fecha}</td>
                  <td style={{ padding: '13px 20px' }}><StatusChip label={l.estado} variant="ok" /></td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate(14)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: C.brand, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Ver</button>
                      <button onClick={() => setShowUnlink(l)} style={{ background: 'none', border: `1px solid ${C.critical}40`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: C.critical, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Desvincular</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unlink modal */}
      {showUnlink && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23,52,58,0.45)' }}>
          <div style={{ backgroundColor: C.surface, borderRadius: 20, padding: 28, width: 460, boxShadow: '0 20px 60px rgba(23,52,58,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.heading, marginBottom: 12 }}>Desvincular registro</h2>
            <div style={{ backgroundColor: C.canvas, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Participante</p><p style={{ fontSize: 15, fontWeight: 700, color: C.heading, margin: 0 }}>{showUnlink.pcs}</p></div>
                <div><p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Cuidador</p><p style={{ fontSize: 15, fontWeight: 700, color: C.heading, margin: 0 }}>{showUnlink.cuidador}</p></div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.body, lineHeight: '20px', marginBottom: 16 }}>
              El cuidador perderá acceso al plan de apoyo y no podrá enviar mensajes a este participante. Esta acción se registrará en el historial de auditoría.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 6 }}>Nota administrativa (opcional)</label>
              <input placeholder="Ej: Solicitud de desvinculación por el participante" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'inherit', color: C.body, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="primary" fullWidth onClick={() => setShowUnlink(null)}>Cancelar</Btn>
              <Btn variant="ghost" fullWidth style={{ color: C.critical, border: `1px solid ${C.critical}40` }} onClick={() => { setShowUnlink(null); show('Vínculo eliminado') }}>Desvincularme</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Toast positioned for desktop */}
      {visible && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 200, backgroundColor: C.heading, color: '#fff', borderRadius: 12, padding: '14px 22px', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10, animation: 'toast-in 0.25s ease', boxShadow: '0 8px 24px rgba(23,52,58,0.25)', whiteSpace: 'nowrap' }}>
          <span style={{ display: 'flex', color: '#6EE7C4' }}>{Ic.checkCircle}</span>
          {message}
        </div>
      )}
    </DesktopLayout>
  )
}
