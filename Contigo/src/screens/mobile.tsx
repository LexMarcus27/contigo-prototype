import { useState } from 'react'
import {
  C, Ic, Btn, Input, TextArea, Card, StatusChip, BottomSheet, Modal, Toast,
  PrivacyNote, ProgressBar, StatusBar, PCSBottomNav, CaregiverBottomNav,
  ContigoLogo, SectionHeading, Divider, useToast, FloatingSupportBtn,
} from '../ui'

// ── Screen 1: Activate Account ───────────────────────────────────────────────

export function MobileScreen01({ navigate }: { navigate: (n: number) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinue = () => {
    if (code.length < 4) { setError('No pudimos validar el código. Revísalo o solicita ayuda.'); return }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (code.startsWith('C')) navigate(9)
      else navigate(2)
    }, 900)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <ContigoLogo size="lg" />
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.heading, marginBottom: 10, lineHeight: '34px' }}>Activa tu cuenta</h1>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: '24px', margin: 0 }}>
            Ingresa el código que recibiste para empezar de forma segura.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: C.heading, display: 'block', marginBottom: 6 }}>
              Código de activación
            </label>
            <input
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
              placeholder="Ej: A3K9X2"
              style={{
                width: '100%', padding: '16px 18px', borderRadius: 12,
                border: `1.5px solid ${error ? C.critical : C.border}`,
                backgroundColor: C.surface, fontSize: 22, color: C.heading,
                fontFamily: 'inherit', letterSpacing: 4, fontWeight: 700,
                outline: 'none', textAlign: 'center',
              }}
              onFocus={e => { e.target.style.borderColor = C.focus; e.target.style.boxShadow = `0 0 0 3px ${C.focus}33` }}
              onBlur={e => { e.target.style.borderColor = error ? C.critical : C.border; e.target.style.boxShadow = 'none' }}
            />
            {error && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 8 }}>
                <span style={{ display: 'flex', color: C.critical, flexShrink: 0, marginTop: 1 }}>{Ic.alert}</span>
                <p style={{ fontSize: 13, color: C.critical, margin: 0, lineHeight: '18px' }}>{error}</p>
              </div>
            )}
          </div>

          <Btn onClick={handleContinue} variant="primary" fullWidth disabled={loading}>
            {loading ? 'Verificando...' : 'Continuar'}
          </Btn>

          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, fontSize: 15, fontWeight: 600, fontFamily: 'inherit', textAlign: 'center', padding: 8 }}>
            Necesito ayuda con mi código
          </button>

          <PrivacyNote text="Tu información es privada y solo se usa para brindarte el acompañamiento autorizado." />

          <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: '18px' }}>
            Códigos de demo: cualquier código → PCS. Código que empiece con «C» → cuidador/a.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Screen 2: PCS Home ────────────────────────────────────────────────────────

export function MobileScreen02({ navigate }: { navigate: (n: number) => void }) {
  const [showInvite, setShowInvite] = useState(false)
  const [showContent, setShowContent] = useState<string | null>(null)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', paddingBottom: 200 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: C.heading, marginBottom: 2 }}>Hola, Sofía</h1>
            <p style={{ fontSize: 15, color: C.muted, margin: 0 }}>¿Qué necesitas en este momento?</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ color: C.brand }}>{Ic.user}</span>
          </div>
        </div>

        {/* Hero card */}
        <div style={{ backgroundColor: C.brand, borderRadius: 20, padding: 24, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 30, width: 70, height: 70, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8, position: 'relative' }}>Estoy aquí contigo</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: '22px', marginBottom: 0, position: 'relative' }}>
            Podemos ir paso a paso. Elige la opción que te resulte más posible ahora.
          </p>
        </div>

        {/* Three action cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 4px' }}>Registro de hoy</h3>
                <StatusChip label="Pendiente" variant="warn" />
              </div>
              <span style={{ color: C.warm }}>{Ic.clipboard}</span>
            </div>
            <Btn onClick={() => navigate(3)} variant="primary" fullWidth small>Completar ahora</Btn>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 4px' }}>Mi plan de seguridad</h3>
                <StatusChip label="Disponible sin conexión" variant="ok" icon={Ic.wifi} />
              </div>
              <span style={{ color: C.brand }}>{Ic.shield}</span>
            </div>
            <Btn onClick={() => navigate(5)} variant="secondary" fullWidth small>Ver mi plan</Btn>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 4px' }}>Conectar con alguien</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Mensajes y formas sencillas de acercarte</p>
              </div>
              <span style={{ color: C.blue }}>{Ic.heart}</span>
            </div>
            <Btn onClick={() => navigate(8)} variant="secondary" fullWidth small>Ver opciones</Btn>
          </Card>
        </div>

        {/* Cerca de ti widget */}
        <div style={{ backgroundColor: C.soft, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 10 }}>Cerca de ti</p>
          <div style={{ backgroundColor: C.surface, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16 }}>🌿</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.heading, margin: '0 0 3px' }}>Mamá</p>
                <p style={{ fontSize: 13, color: C.body, margin: 0, lineHeight: '18px' }}>«Pensé en ti hoy. Aquí estoy cuando quieras.»</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowInvite(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
          <span style={{ display: 'flex' }}>{Ic.plus}</span>
          Invitar a una persona cercana
        </button>

        {/* Learning module */}
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Aprender habilidades</h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: '20px' }}>
            Encuentra recursos breves para afrontar momentos difíciles y fortalecer tus relaciones.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Afrontar una crisis', 'Habilidades interpersonales'].map(title => (
              <div key={title} style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ height: 100, backgroundColor: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 32 }}>{title === 'Afrontar una crisis' ? '🌬' : '🤝'}</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.heading, margin: '0 0 6px' }}>{title}</h3>
                  <p style={{ fontSize: 13, color: C.muted, margin: '0 0 12px', lineHeight: '18px', fontStyle: 'italic' }}>
                    [[Contenido narrativo e imagen por validar con el equipo investigador]]
                  </p>
                  <Btn variant="secondary" fullWidth small onClick={() => setShowContent(title)}>Explorar contenido</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={90} />
      <PCSBottomNav active="inicio" navigate={navigate} />

      <BottomSheet open={showInvite} onClose={() => setShowInvite(false)} title="Invitar a alguien cercano">
        <p style={{ fontSize: 14, color: C.muted, lineHeight: '20px', marginBottom: 16 }}>
          Puedes invitar a alguien de confianza para que te acompañe desde la aplicación.
          Nada se envía hasta que confirmes.
        </p>
        <Input label="Nombre o apodo" value="" onChange={() => {}} placeholder="Ej: Mamá, Jorge" />
        <div style={{ marginTop: 12 }}>
          <Input label="Forma de contacto" value="" onChange={() => {}} placeholder="Número o correo" />
        </div>
        <PrivacyNote text="La persona solo verá lo que tú decidas compartir con ella." />
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth>Enviar invitación</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => setShowInvite(false)}>Ahora no</Btn>
        </div>
      </BottomSheet>

      <BottomSheet open={!!showContent} onClose={() => setShowContent(null)} title={showContent ?? ''}>
        <div style={{ height: 120, backgroundColor: C.soft, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>{showContent === 'Afrontar una crisis' ? '🌬' : '🤝'}</span>
        </div>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: '22px', marginBottom: 20, textAlign: 'center' }}>
          Este contenido será proporcionado y validado por el equipo investigador.
        </p>
        <Btn variant="secondary" fullWidth onClick={() => setShowContent(null)}>Volver</Btn>
      </BottomSheet>
    </div>
  )
}

// ── Screen 3: Daily EMA Check-in ──────────────────────────────────────────────

export function MobileScreen03({ navigate }: { navigate: (n: number) => void }) {
  const [question, setQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showExit, setShowExit] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  const questions = [
    '[[PREGUNTA EMA 1 — TEXTO CLÍNICO POR VALIDAR]]',
    '[[PREGUNTA EMA 2 — TEXTO CLÍNICO POR VALIDAR]]',
    '[[PREGUNTA EMA 3 — TEXTO CLÍNICO POR VALIDAR]]',
  ]
  const options = ['[[ETIQUETA 1]]', '[[ETIQUETA 2]]', '[[ETIQUETA 3]]', '[[ETIQUETA 4]]', '[[ETIQUETA 5]]']

  const handleNext = () => {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setSelected(null)
    if (question < 2) { setQuestion(question + 1) }
    else { navigate(4) }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />

      <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setShowExit(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'flex' }}>{Ic.x}</span>
          Salir y continuar después
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 140px' }}>
        <div style={{ marginBottom: 24 }}>
          <ProgressBar value={question + 1} total={3} />
          <p style={{ fontSize: 13, color: C.muted, marginTop: 8, fontWeight: 500 }}>Pregunta {question + 1} de 3</p>
        </div>

        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.heading, lineHeight: '30px', marginBottom: 6 }}>¿Cómo estás hoy?</h1>
          <p style={{ fontSize: 15, color: C.muted }}>Son 3 preguntas. Tus respuestas son privadas.</p>
        </div>

        <div style={{ backgroundColor: C.soft, borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 16, color: C.body, lineHeight: '26px', fontStyle: 'italic', margin: 0 }}>
            {questions[question]}
          </p>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 10, marginBottom: 0 }}>
            [[ESCALA Y ETIQUETAS DE RESPUESTA POR VALIDAR]]
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                padding: '16px 20px', borderRadius: 14, border: `2px solid ${selected === i ? C.brand : C.border}`,
                backgroundColor: selected === i ? C.brandSoft : C.surface,
                color: selected === i ? C.brand : C.body,
                fontSize: 15, fontWeight: selected === i ? 600 : 400,
                fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
              }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === i ? C.brand : C.border}`,
                backgroundColor: selected === i ? C.brand : 'transparent', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected === i && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              {opt}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth onClick={handleNext} disabled={selected === null}>
            {question < 2 ? 'Siguiente' : 'Enviar respuestas'}
          </Btn>
          <Btn variant="tertiary" fullWidth onClick={() => setShowExit(true)}>Prefiero responder después</Btn>
        </div>
      </div>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={20} />

      <Modal open={showExit} onClose={() => setShowExit(false)} title="¿Salir del registro?">
        <p style={{ fontSize: 15, color: C.body, lineHeight: '22px', marginBottom: 20 }}>
          Tus respuestas parciales se guardarán para que puedas continuar cuando quieras.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="secondary" fullWidth onClick={() => navigate(2)}>Guardar y salir</Btn>
          <Btn variant="primary" fullWidth onClick={() => setShowExit(false)}>Seguir respondiendo</Btn>
        </div>
      </Modal>
    </div>
  )
}

// ── Screen 4: Check-in Response ───────────────────────────────────────────────

export function MobileScreen04({ navigate }: { navigate: (n: number) => void }) {
  const [showContact, setShowContact] = useState(false)
  const [showHelpLine, setShowHelpLine] = useState(false)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 140px' }}>
        <div style={{ textAlign: 'center', padding: '24px 0 32px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ color: C.brand }}>{Ic.checkCircle}</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.heading, marginBottom: 10, lineHeight: '30px' }}>
            Gracias por contarnos cómo estás
          </h1>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: '24px', margin: 0 }}>
            No tienes que resolver todo ahora. Podemos elegir un siguiente paso.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card onClick={() => navigate(6)} style={{ cursor: 'pointer', borderLeft: `4px solid ${C.brand}` }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ color: C.brand, display: 'flex' }}>{Ic.shield}</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 2px' }}>Abrir mi plan de seguridad</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Ve a tu propio ritmo</p>
              </div>
              <span style={{ marginLeft: 'auto', color: C.muted }}>{Ic.chevRight}</span>
            </div>
          </Card>

          <Card onClick={() => setShowContact(true)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ color: C.blue, display: 'flex' }}>{Ic.message}</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 2px' }}>Contactar a Mamá</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Mensajes o llamada</p>
              </div>
              <span style={{ marginLeft: 'auto', color: C.muted }}>{Ic.chevRight}</span>
            </div>
          </Card>

          <Card onClick={() => setShowHelpLine(true)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ color: C.warm, display: 'flex' }}>{Ic.phone}</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 2px' }}>Llamar a una línea de ayuda</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Línea de ayuda configurada</p>
              </div>
              <span style={{ marginLeft: 'auto', color: C.muted }}>{Ic.chevRight}</span>
            </div>
          </Card>

          <button
            onClick={() => navigate(2)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 15, fontFamily: 'inherit', padding: '14px 0', textAlign: 'center' }}>
            Volver al inicio
          </button>
        </div>
      </div>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={20} />

      <BottomSheet open={showContact} onClose={() => setShowContact(false)} title="¿Cómo quieres contactar a Mamá?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth icon={Ic.message}>Enviar un mensaje</Btn>
          <Btn variant="secondary" fullWidth icon={Ic.phone}>Llamar</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => setShowContact(false)}>Ahora no</Btn>
        </div>
      </BottomSheet>

      <BottomSheet open={showHelpLine} onClose={() => setShowHelpLine(false)} title="Línea de ayuda">
        <p style={{ fontSize: 15, color: C.body, lineHeight: '22px', marginBottom: 16 }}>
          Estás a punto de comunicarte con la línea de ayuda configurada por el equipo responsable.
          El número será confirmado por el equipo clínico.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth icon={Ic.phone}>Llamar a la línea de ayuda</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => setShowHelpLine(false)}>Ahora no</Btn>
        </div>
      </BottomSheet>
    </div>
  )
}

// ── Screen 5: Safety Plan ────────────────────────────────────────────────────

export function MobileScreen05({ navigate }: { navigate: (n: number) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(0)
  const [editValue, setEditValue] = useState('')

  // Contact picker states
  const [contactPermission, setContactPermission] = useState<'idle' | 'denied' | 'granted'>('idle')
  const [contacts, setContacts] = useState([
    { name: 'Mamá', label: 'Familiar', phone: '+57 300 000 0001' },
    { name: 'Jorge', label: 'Amigo de confianza', phone: '+57 300 000 0002' },
  ])
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null)
  const [showContactPicker, setShowContactPicker] = useState(false)

  // Social activities
  const [activities, setActivities] = useState(['Caminar juntos en el parque', 'Tomar un café'])
  const [newActivity, setNewActivity] = useState('')
  const [showActivityInput, setShowActivityInput] = useState(false)

  // Safer environment
  const [envText, setEnvText] = useState('')
  const [envSaved, setEnvSaved] = useState(false)

  const steps = [
    { title: 'Señales y situaciones que reconozco', status: 'ok' as const, label: 'Completo', text: 'Me siento abrumada cuando estoy sola por mucho tiempo o cuando no he dormido bien.' },
    { title: 'Lo que puedo hacer por mi cuenta', status: 'ok' as const, label: 'Completo', text: 'Respiración pausada · Caminar en el parque · Escuchar música tranquila' },
    { title: 'Personas y lugares que pueden acompañarme', status: 'warn' as const, label: 'Falta información', text: '' },
    { title: 'Ayuda profesional y líneas de atención', status: 'warn' as const, label: 'Falta información', text: '' },
  ]

  const removeContact = (i: number) => {
    setContacts(c => c.filter((_, idx) => idx !== i))
    setShowRemoveConfirm(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 12px', gap: 12 }}>
        <button onClick={() => navigate(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, display: 'flex', padding: 4 }}>{Ic.arrowLeft}</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.heading, margin: 0 }}>Mi plan de seguridad</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 180 }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: '20px', marginBottom: 8 }}>
            Prepáralo cuando tengas calma. Podrás consultarlo incluso sin conexión.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <StatusChip label="Disponible sin conexión" variant="ok" icon={Ic.wifi} />
            <span style={{ fontSize: 12, color: C.muted }}>Act. 14 ago 2026</span>
          </div>
        </div>

        {/* Existing plan steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  width: '100%', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit',
                }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: step.status === 'ok' ? C.brandSoft : step.status === 'warn' ? '#FEF9EC' : C.soft,
                  color: step.status === 'ok' ? C.brand : step.status === 'warn' ? '#92700A' : C.muted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: 12, fontWeight: 700,
                }}>
                  {step.status === 'ok' ? <span style={{ display: 'flex' }}>{Ic.check}</span> : i + 1}
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 600, color: C.heading }}>{step.title}</span>
                <StatusChip label={step.label} variant={step.status === 'ok' ? 'ok' : step.status === 'warn' ? 'warn' : 'empty'} />
                <span style={{ color: C.muted, display: 'flex', transition: 'transform 0.2s', transform: expanded === i ? 'rotate(180deg)' : 'none' }}>{Ic.chevDown}</span>
              </button>
              {expanded === i && (
                <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${C.border}` }}>
                  {step.text
                    ? <p style={{ fontSize: 14, color: C.body, lineHeight: '22px', marginTop: 12, marginBottom: 12 }}>{step.text}</p>
                    : <p style={{ fontSize: 14, color: C.muted, fontStyle: 'italic', marginTop: 12, marginBottom: 12 }}>Este paso aún no tiene información guardada.</p>
                  }
                  <button
                    onClick={() => { setEditIndex(i); setEditValue(step.text); setEditOpen(true) }}
                    style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: C.brand, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {Ic.edit} Editar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Divider />

        {/* Trusted support contacts */}
        <div style={{ marginTop: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Personas a quienes puedo pedir ayuda</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: '18px' }}>Estas personas aparecerán en tu plan cuando lo necesites.</p>

          {contacts.map((c, i) => (
            <div key={i} style={{ backgroundColor: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '12px 14px', marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: C.brand }}>{Ic.user}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.heading, margin: 0 }}>{c.name}</p>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{c.label} · {c.phone}</p>
              </div>
              <button
                onClick={() => setShowRemoveConfirm(i)}
                style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: C.critical, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                Quitar
              </button>
            </div>
          ))}

          {contactPermission === 'idle' && (
            <button
              onClick={() => setShowContactPicker(true)}
              style={{ width: '100%', padding: '14px 0', border: `1.5px dashed ${C.brand}`, borderRadius: 14, backgroundColor: C.brandSoft, cursor: 'pointer', color: C.brand, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'flex' }}>{Ic.plus}</span>
              Agregar desde mis contactos
            </button>
          )}
          {contactPermission === 'denied' && (
            <div style={{ backgroundColor: '#FEF9EC', borderRadius: 14, padding: 16, border: '1px solid #F5D060' }}>
              <p style={{ fontSize: 14, color: C.body, marginBottom: 12 }}>No se pudo acceder a tus contactos. Puedes intentarlo de nuevo o ingresar la información manualmente.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="secondary" small onClick={() => setShowContactPicker(true)}>Intentar de nuevo</Btn>
                <Btn variant="tertiary" small onClick={() => setContactPermission('idle')}>Ingresar manualmente</Btn>
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Social activities */}
        <div style={{ marginTop: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Actividades sociales que pueden ayudarme</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: '18px' }}>
            Agrega actividades sencillas que podrías hacer con otra persona cuando necesites apoyo.
          </p>

          {activities.map((a, i) => (
            <div key={i} style={{ backgroundColor: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, fontSize: 14, color: C.body }}>{a}</span>
              <button
                onClick={() => setActivities(act => act.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.critical, display: 'flex', padding: 4 }}>
                {Ic.x}
              </button>
            </div>
          ))}

          {showActivityInput ? (
            <div style={{ backgroundColor: C.surface, borderRadius: 12, border: `1px solid ${C.brand}`, padding: '12px 14px', marginBottom: 8 }}>
              <input
                value={newActivity}
                onChange={e => setNewActivity(e.target.value)}
                placeholder="Ej: Salir a caminar juntos"
                autoFocus
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: C.body, fontFamily: 'inherit', backgroundColor: 'transparent' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn variant="primary" small onClick={() => { if (newActivity.trim()) { setActivities(a => [...a, newActivity.trim()]); setNewActivity(''); setShowActivityInput(false) } }}>Guardar</Btn>
                <Btn variant="tertiary" small onClick={() => { setNewActivity(''); setShowActivityInput(false) }}>Cancelar</Btn>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowActivityInput(true)}
              style={{ width: '100%', padding: '12px 0', border: `1.5px dashed ${C.border}`, borderRadius: 12, backgroundColor: 'transparent', cursor: 'pointer', color: C.brand, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'flex' }}>{Ic.plus}</span>
              Agregar actividad
            </button>
          )}
        </div>

        <Divider />

        {/* Safer environment */}
        <div style={{ marginTop: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Cómo puedo hacer mi entorno más seguro</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: '18px' }}>
            Escribe acciones concretas que te ayuden a reducir riesgos en tu entorno.
          </p>
          <TextArea
            label=""
            value={envText}
            onChange={t => { setEnvText(t); setEnvSaved(false) }}
            placeholder="[[Acciones por validar con el equipo clínico]]"
            helper="Solo tú puedes ver y editar esta información."
          />
          {!envSaved && (
            <div style={{ marginTop: 10 }}>
              <Btn variant="secondary" small onClick={() => setEnvSaved(true)} disabled={!envText.trim()}>Guardar</Btn>
            </div>
          )}
          {envSaved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ color: C.brand, display: 'flex' }}>{Ic.check}</span>
              <span style={{ fontSize: 13, color: C.brand, fontWeight: 600 }}>Guardado</span>
            </div>
          )}
        </div>
      </div>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={90} />

      {/* Sticky button */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 40px', backgroundColor: C.surface, borderTop: `1px solid ${C.border}` }}>
        <Btn variant="primary" fullWidth onClick={() => navigate(6)}>Usar mi plan ahora</Btn>
      </div>

      {/* Edit bottom sheet */}
      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title={steps[editIndex]?.title}>
        <TextArea
          label="Tu información"
          value={editValue}
          onChange={setEditValue}
          placeholder="Escribe aquí lo que quieras recordar..."
          helper="Solo tú puedes ver y editar esta información."
        />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth onClick={() => setEditOpen(false)}>Guardar cambios</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => setEditOpen(false)}>Cancelar</Btn>
        </div>
      </BottomSheet>

      {/* Contact picker sheet */}
      <BottomSheet open={showContactPicker} onClose={() => setShowContactPicker(false)} title="Acceder a tus contactos">
        <p style={{ fontSize: 14, color: C.body, lineHeight: '20px', marginBottom: 16 }}>
          Para agregar personas de confianza a tu plan, necesitamos acceder a tus contactos del dispositivo.
          Solo verás la lista de contactos para elegir a quién agregar. No se comparte nada de forma automática.
        </p>
        <PrivacyNote text="Solo se usa para mostrarte los contactos. No se accede a mensajes ni datos adicionales." />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth onClick={() => {
            setContactPermission('granted')
            setContacts(c => [...c, { name: 'Dra. Valentina Ríos', label: 'Terapeuta', phone: '+57 300 000 0003' }])
            setShowContactPicker(false)
          }}>Permitir acceso</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => { setContactPermission('denied'); setShowContactPicker(false) }}>No permitir</Btn>
        </div>
      </BottomSheet>

      {/* Remove contact confirmation */}
      <Modal open={showRemoveConfirm !== null} onClose={() => setShowRemoveConfirm(null)} title="¿Quitar esta persona?">
        <p style={{ fontSize: 14, color: C.body, lineHeight: '20px', marginBottom: 20 }}>
          {showRemoveConfirm !== null ? contacts[showRemoveConfirm]?.name : ''} ya no aparecerá en tu plan de apoyo. Puedes volver a agregarla cuando quieras.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth onClick={() => setShowRemoveConfirm(null)}>Cancelar</Btn>
          <Btn variant="ghost" fullWidth style={{ color: C.critical }} onClick={() => removeContact(showRemoveConfirm!)}>Quitar</Btn>
        </div>
      </Modal>
    </div>
  )
}

// ── Screen 6: Crisis Mode ─────────────────────────────────────────────────────

export function MobileScreen06({ navigate }: { navigate: (n: number) => void }) {
  const [step, setStep] = useState(1)
  const [showExit, setShowExit] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const totalSteps = 6

  const contacts = [
    { name: 'Mamá', label: 'Familiar' },
    { name: 'Jorge', label: 'Amigo de confianza' },
    { name: 'Dra. Valentina Ríos', label: 'Terapeuta' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      {/* Minimal top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px', backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <button
          onClick={() => setShowExit(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 14 }}>
          <span style={{ display: 'flex' }}>{Ic.x}</span>
          Salir
        </button>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>Paso {step} de {totalSteps}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', paddingBottom: 120 }}>
        <div style={{ marginBottom: 20 }}>
          <ProgressBar value={step} total={totalSteps} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.heading, lineHeight: '32px', marginBottom: 8 }}>
          Estás aquí.<br />Vamos paso a paso.
        </h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: '22px', marginBottom: 28 }}>
          No tienes que hacerlo todo. Empecemos por una opción.
        </p>

        {/* 1. Self-help skills */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Qué puedo hacer por mi cuenta</h2>
          <div style={{ backgroundColor: C.surface, borderRadius: 20, border: `2px solid ${C.brand}`, padding: 24, boxShadow: `0 0 0 6px ${C.brandSoft}` }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.brand, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Paso {step} de {totalSteps}</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.heading, marginBottom: 6 }}>Prueba una habilidad que elegiste</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, backgroundColor: C.soft, borderRadius: 10, padding: '8px 12px', width: 'fit-content' }}>
              <span style={{ fontSize: 16 }}>🌬</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.brand }}>Respiración pausada</span>
            </div>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: '20px', marginBottom: 20 }}>
              Ve a tu ritmo. Puedes detenerte cuando lo necesites.
            </p>
            <Btn variant="primary" fullWidth onClick={() => navigate(7)}>Abrir esta habilidad</Btn>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                onClick={() => setStep(s => Math.min(s + 1, totalSteps))}
                style={{ flex: 1, background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 0', cursor: 'pointer', color: C.brand, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                Elegir otra opción
              </button>
              <button
                onClick={() => setStep(s => Math.min(s + 1, totalSteps))}
                style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', color: C.muted, fontSize: 13, fontFamily: 'inherit' }}>
                No puedo ahora
              </button>
            </div>
          </div>
        </div>

        {/* 2. Social activities */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Actividades sociales que pueden ayudarme</h2>
          {['Caminar juntos en el parque', 'Tomar un café'].length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Caminar juntos en el parque', 'Tomar un café'].map((a, i) => (
                <div key={i} style={{ backgroundColor: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>🌿</span>
                  <span style={{ fontSize: 14, color: C.body }}>{a}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: C.soft, borderRadius: 14, padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: C.muted, margin: '0 0 10px' }}>Aún no has agregado actividades sociales.</p>
              <Btn variant="secondary" small onClick={() => navigate(5)}>Agregar en mi plan</Btn>
            </div>
          )}
        </div>

        {/* 3. Safer environment */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Cómo puedo hacer mi entorno más seguro</h2>
          <div style={{ backgroundColor: C.soft, borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: C.muted, fontStyle: 'italic', margin: 0 }}>
              [[Información guardada en tu plan de seguridad — pendiente de completar]]
            </p>
          </div>
        </div>

        {/* 4. Trusted contacts */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Personas a quienes puedo pedir ayuda</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ backgroundColor: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: C.brand }}>{Ic.user}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.heading, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{c.label}</p>
                </div>
                <button
                  onClick={() => setShowContact(true)}
                  style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: C.brand, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                  Contactar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persistent emergency actions */}
      <div style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, padding: '12px 20px 34px' }}>
        <p style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 10, textAlign: 'center' }}>También puedes</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowContact(true)}
            style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: C.surface, cursor: 'pointer', color: C.blue, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            {Ic.message}<br />Mamá
          </button>
          <button
            style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1px solid ${C.border}`, backgroundColor: C.surface, cursor: 'pointer', color: C.warm, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            {Ic.phone}<br />Línea ayuda
          </button>
          <button
            onClick={() => setShowEmergency(true)}
            style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${C.critical}`, backgroundColor: C.criticalSoft, cursor: 'pointer', color: C.critical, fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
            {Ic.phone}<br />Emergencias
          </button>
        </div>
      </div>

      <Modal open={showExit} onClose={() => setShowExit(false)} title="¿Salir del plan?">
        <p style={{ fontSize: 15, color: C.body, lineHeight: '22px', marginBottom: 20 }}>
          Tu plan estará disponible cuando lo necesites, incluso sin conexión.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="secondary" fullWidth onClick={() => navigate(2)}>Salir</Btn>
          <Btn variant="primary" fullWidth onClick={() => setShowExit(false)}>Seguir con el plan</Btn>
        </div>
      </Modal>

      <Modal open={showEmergency} onClose={() => setShowEmergency(false)} title="Llamar a emergencias">
        <div style={{ backgroundColor: C.criticalSoft, borderRadius: 12, padding: '12px 14px', marginBottom: 16, border: `1px solid ${C.critical}30` }}>
          <p style={{ fontSize: 14, color: C.critical, lineHeight: '20px', margin: 0, fontWeight: 500 }}>
            Esta llamada conecta con el servicio de emergencias. El número lo configura el equipo clínico.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="critical" fullWidth icon={Ic.phone}>Llamar a emergencias</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => setShowEmergency(false)}>Cancelar</Btn>
        </div>
      </Modal>

      <BottomSheet open={showContact} onClose={() => setShowContact(false)} title="Contactar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth icon={Ic.message}>Enviar un mensaje</Btn>
          <Btn variant="secondary" fullWidth icon={Ic.phone}>Llamar</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => setShowContact(false)}>Ahora no</Btn>
        </div>
      </BottomSheet>
    </div>
  )
}

// ── Screen 7: Coping Skill ────────────────────────────────────────────────────

export function MobileScreen07({ navigate }: { navigate: (n: number) => void }) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [duration, setDuration] = useState<string | null>('2 minutos')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '52px 20px 16px', gap: 10 }}>
        <button onClick={() => navigate(6)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 14 }}>
          <span style={{ display: 'flex' }}>{Ic.arrowLeft}</span>
          Volver a mi plan
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 140px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.heading, marginBottom: 6 }}>Respiración pausada</h1>
        <p style={{ fontSize: 15, color: C.muted, marginBottom: 32, lineHeight: '22px' }}>
          Puedes detenerte o elegir otra opción cuando quieras.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, height: 200 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', width: 180, height: 180, borderRadius: '50%',
              backgroundColor: C.brandSoft,
              animation: isAnimating ? 'breathe-outer 4s ease-in-out infinite' : 'none',
            }} />
            <div style={{
              width: 130, height: 130, borderRadius: '50%',
              backgroundColor: C.brand,
              animation: isAnimating ? 'breathe 4s ease-in-out infinite' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Inhala</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>suavemente</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            style={{
              background: 'none', border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px',
              cursor: 'pointer', fontSize: 12, color: C.muted, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {isAnimating ? '⏸ Reducir movimiento' : '▶ Activar animación'}
          </button>
        </div>

        <div style={{ backgroundColor: C.soft, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: C.muted, fontWeight: 600, marginBottom: 8 }}>Instrucciones</p>
          <p style={{ fontSize: 15, color: C.body, lineHeight: '24px', fontStyle: 'italic', margin: 0 }}>
            [[INSTRUCCIONES CLÍNICAS BREVES POR VALIDAR]]
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 10 }}>Duración (opcional)</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['1 minuto', '2 minutos', 'Sin tiempo'].map(d => (
              <button
                key={d}
                onClick={() => setDuration(duration === d ? null : d)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10,
                  border: `1.5px solid ${duration === d ? C.brand : C.border}`,
                  backgroundColor: duration === d ? C.brandSoft : C.surface,
                  color: duration === d ? C.brand : C.muted,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth onClick={() => navigate(6)}>Terminé por ahora</Btn>
          <Btn variant="secondary" fullWidth onClick={() => navigate(6)}>Probar otra habilidad</Btn>
          <Btn variant="tertiary" fullWidth>Contactar a alguien</Btn>
        </div>
      </div>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={20} />
    </div>
  )
}

// ── Screen 8: Connection & JITAI ─────────────────────────────────────────────

export function MobileScreen08({ navigate }: { navigate: (n: number) => void }) {
  const [showMessage, setShowMessage] = useState(false)
  const [showComposer, setShowComposer] = useState(false)
  const [composedText, setComposedText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(false)
  const [aiDraft, setAiDraft] = useState('')

  // Activities
  const [myActivities, setMyActivities] = useState<string[]>(['Proponer una llamada corta'])
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [newActivityText, setNewActivityText] = useState('')

  const generateDraft = () => {
    setAiLoading(true)
    setAiError(false)
    setAiDraft('')
    setTimeout(() => {
      setAiLoading(false)
      setAiDraft('Hola Mamá, pensé en ti hoy y quería escribirte. No tienes que responder ahora. Solo quería que supieras que estoy aquí.')
      setComposedText('Hola Mamá, pensé en ti hoy y quería escribirte. No tienes que responder ahora. Solo quería que supieras que estoy aquí.')
    }, 1800)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 12px', gap: 10 }}>
        <button onClick={() => navigate(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, display: 'flex' }}>{Ic.arrowLeft}</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 140px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.heading, lineHeight: '32px', marginBottom: 8 }}>
            ¿Te serviría sentirte acompañada?
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: '22px', margin: 0 }}>
            Puedes elegir una forma pequeña de acercarte. También puedes hacerlo después.
          </p>
        </div>

        {/* Caring contact message */}
        <Card onClick={() => setShowMessage(true)} style={{ cursor: 'pointer', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>🌿</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 3px' }}>Ver un mensaje de Mamá</h3>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Un mensaje que guardó para ti</p>
            </div>
            <span style={{ color: C.muted }}>{Ic.chevRight}</span>
          </div>
        </Card>

        {/* AI message assistant */}
        <div style={{ backgroundColor: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 18, marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 6px' }}>Asistente para crear mensajes</h3>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: '18px', marginBottom: 10 }}>
            Una herramienta con inteligencia artificial te ayuda a crear un borrador para comunicarte con alguien de confianza.
          </p>
          <div style={{ backgroundColor: C.brandSoft, borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.brand, display: 'flex' }}>{Ic.info}</span>
            <span style={{ fontSize: 12, color: C.brand, fontWeight: 600 }}>IA basada en artículos revisados por el equipo investigador</span>
          </div>
          <div style={{ backgroundColor: '#FEF9EC', borderRadius: 10, padding: '10px 12px', marginBottom: 16, border: '1px solid #F5D060' }}>
            <p style={{ fontSize: 12, color: '#6B5A1E', margin: 0, lineHeight: '17px' }}>
              <strong>La IA propone un borrador. Tú decides qué editar y enviar. El mensaje nunca se envía automáticamente.</strong>
            </p>
          </div>

          <Btn variant="secondary" fullWidth onClick={() => { setShowComposer(true); generateDraft() }}>Ayúdame a escribirle</Btn>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 10, margin: '10px 0 0', lineHeight: '16px', textAlign: 'center' }}>
            Esta herramienta no reemplaza la orientación profesional ni ofrece consejos clínicos.
          </p>
        </div>

        {/* Activities for an in-person meeting */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Ideas para un encuentro personal</h3>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Actividades que podrías proponer.</p>

          <p style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Sugeridas por el equipo</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {['Tomar un café juntos', 'Dar una caminata corta'].map((act, i) => (
              <div key={i} style={{ backgroundColor: C.soft, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, color: C.body, flex: 1 }}>{act}</span>
                <span style={{ fontSize: 10, color: C.muted, fontStyle: 'italic' }}>Contenido por validar</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Mis actividades</p>
          {myActivities.map((act, i) => (
            <div key={i} style={{ backgroundColor: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, color: C.body, flex: 1 }}>{act}</span>
              <button
                onClick={() => setMyActivities(a => a.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.critical, display: 'flex', padding: 4 }}>
                {Ic.x}
              </button>
            </div>
          ))}
          {showNewActivity ? (
            <div style={{ backgroundColor: C.surface, borderRadius: 12, border: `1px solid ${C.brand}`, padding: '12px 14px', marginBottom: 8 }}>
              <input
                value={newActivityText}
                onChange={e => setNewActivityText(e.target.value)}
                placeholder="Ej: Ver una película en casa"
                autoFocus
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: C.body, fontFamily: 'inherit', backgroundColor: 'transparent' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn variant="primary" small onClick={() => { if (newActivityText.trim()) { setMyActivities(a => [...a, newActivityText.trim()]); setNewActivityText(''); setShowNewActivity(false) } }}>Guardar</Btn>
                <Btn variant="tertiary" small onClick={() => { setNewActivityText(''); setShowNewActivity(false) }}>Cancelar</Btn>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewActivity(true)}
              style={{ width: '100%', padding: '12px 0', border: `1.5px dashed ${C.border}`, borderRadius: 12, backgroundColor: 'transparent', cursor: 'pointer', color: C.brand, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'flex' }}>{Ic.plus}</span>
              Agregar actividad
            </button>
          )}
        </div>

        <button
          onClick={() => navigate(2)}
          style={{ marginTop: 20, background: 'none', border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', cursor: 'pointer', color: C.muted, fontSize: 16, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
          <span style={{ display: 'flex' }}>{Ic.x}</span>
          Ahora no
        </button>
      </div>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={20} />

      {/* Caring contact modal */}
      <Modal open={showMessage} onClose={() => setShowMessage(false)}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18 }}>🌿</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.heading, margin: 0 }}>Mamá</p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>14 ago 2026</p>
            </div>
          </div>
          <div style={{ backgroundColor: C.soft, borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 16, color: C.body, lineHeight: '24px', margin: 0 }}>
              «Pensé en ti hoy y quería recordarte que estoy aquí. No tienes que responder ahora. Te quiero.»
            </p>
          </div>
        </div>
        <Btn variant="secondary" fullWidth onClick={() => setShowMessage(false)}>Cerrar</Btn>
      </Modal>

      {/* AI Composer bottom sheet */}
      <BottomSheet open={showComposer} onClose={() => setShowComposer(false)} title="Asistente para crear mensajes">
        {aiLoading && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.brandSoft}`, borderTopColor: C.brand, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: C.muted }}>Generando un borrador...</p>
          </div>
        )}
        {aiError && (
          <div style={{ backgroundColor: C.criticalSoft, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: C.critical, margin: '0 0 10px' }}>Ocurrió un error al generar el borrador. Por favor intenta de nuevo.</p>
            <Btn variant="secondary" small onClick={generateDraft}>Intentar de nuevo</Btn>
          </div>
        )}
        {!aiLoading && aiDraft && (
          <>
            <div style={{ backgroundColor: '#FEF9EC', borderRadius: 10, padding: '10px 12px', marginBottom: 12, border: '1px solid #F5D060' }}>
              <p style={{ fontSize: 12, color: '#6B5A1E', margin: 0 }}>La IA propone un borrador. Tú decides qué editar y enviar.</p>
            </div>
            <TextArea label="Tu mensaje (edítalo como prefieras)" value={composedText} onChange={setComposedText} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => { setAiDraft(''); setComposedText(''); generateDraft() }}
                style={{ flex: 1, padding: '12px 0', border: `1px solid ${C.border}`, borderRadius: 10, background: 'none', cursor: 'pointer', color: C.brand, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                Regenerar
              </button>
              <button style={{ flex: 1, padding: '12px 0', border: `1px solid ${C.border}`, borderRadius: 10, background: 'none', cursor: 'pointer', color: C.brand, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {Ic.copy} Copiar
              </button>
            </div>
            <div style={{ marginTop: 10 }}>
              <button style={{ width: '100%', padding: '12px 0', borderRadius: 10, backgroundColor: '#25D366', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                Abrir en WhatsApp
              </button>
            </div>
            <PrivacyNote text="El mensaje nunca se envía automáticamente. Tú controlas cada paso." />
          </>
        )}
      </BottomSheet>
    </div>
  )
}

// ── Screen 9: Caregiver Home ──────────────────────────────────────────────────

export function MobileScreen09({ navigate }: { navigate: (n: number) => void }) {
  const [showUnlink, setShowUnlink] = useState(false)
  const [showContent, setShowContent] = useState(false)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', paddingBottom: 140 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 14, color: C.muted, margin: '0 0 2px' }}>Hola, Lorena</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.heading, margin: '0 0 4px' }}>Acompañar a Sofi</h1>
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Aquí tienes formas sencillas de estar cerca.</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: C.brand }}>{Ic.user}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card onClick={() => navigate(10)} style={{ cursor: 'pointer', borderLeft: `4px solid ${C.brand}` }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: C.brand }}>{Ic.message}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 2px' }}>Preparar un mensaje cercano</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Para que Sofi lo lea cuando lo necesite</p>
              </div>
              <span style={{ color: C.muted }}>{Ic.chevRight}</span>
            </div>
          </Card>

          <Card onClick={() => navigate(11)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: C.brand }}>{Ic.shield}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 2px' }}>Ver plan de apoyo</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Solo lectura · Para acompañarle en crisis</p>
              </div>
              <span style={{ color: C.muted }}>{Ic.chevRight}</span>
            </div>
          </Card>

          <Card onClick={() => navigate(12)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#EBF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: C.blue }}>{Ic.clipboard}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 2px' }}>Registrar contacto de hoy</h3>
                <StatusChip label="Pendiente" variant="warn" />
              </div>
              <span style={{ color: C.muted }}>{Ic.chevRight}</span>
            </div>
          </Card>

          {/* Register encounter card */}
          <Card style={{ borderLeft: `4px solid ${C.warm}` }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FBF2E3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: C.warm }}>{Ic.calendar}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 4px' }}>Registrar encuentro</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Registra cómo fue un encuentro personal con tu persona cercana.</p>
              </div>
            </div>
            <Btn variant="primary" fullWidth small onClick={() => navigate(16)}>Registrar ahora</Btn>
          </Card>

          {/* Learning module */}
          <Card>
            <div style={{ height: 80, backgroundColor: C.soft, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>📚</span>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FBF2E3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: C.warm }}>{Ic.book}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.heading, margin: '0 0 4px' }}>Aprender a acercarme</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: '0 0 6px', fontStyle: 'italic' }}>Contenido narrativo por validar</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Conexión social', 'Validación', 'Perspectiva', 'Valores'].map(t => (
                    <span key={t} style={{ fontSize: 11, backgroundColor: C.soft, color: C.muted, borderRadius: 6, padding: '3px 8px', fontWeight: 500 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <Btn variant="secondary" fullWidth small onClick={() => setShowContent(true)}>Explorar contenido</Btn>
          </Card>
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowUnlink(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.critical, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            {Ic.link} Desvincular mi cuenta
          </button>
        </div>
      </div>

      <CaregiverBottomNav active="inicio" navigate={navigate} />

      <Modal open={showUnlink} onClose={() => setShowUnlink(false)} title="¿Desvincular tu cuenta?">
        <p style={{ fontSize: 14, color: C.body, lineHeight: '20px', marginBottom: 8 }}>
          Si te desvincula, perderás acceso al plan de apoyo de Sofi y no podrás enviarle mensajes desde la aplicación.
        </p>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Esta acción no puede deshacerse.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="primary" fullWidth onClick={() => setShowUnlink(false)}>Cancelar</Btn>
          <Btn variant="ghost" fullWidth style={{ color: C.critical }}>Desvincularme</Btn>
        </div>
      </Modal>

      <BottomSheet open={showContent} onClose={() => setShowContent(false)} title="Aprender a acercarme">
        <div style={{ height: 120, backgroundColor: C.soft, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>📚</span>
        </div>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: '22px', marginBottom: 20, textAlign: 'center' }}>
          Este contenido será proporcionado y validado por el equipo investigador.
        </p>
        <Btn variant="secondary" fullWidth onClick={() => setShowContent(false)}>Volver</Btn>
      </BottomSheet>
    </div>
  )
}

// ── Screen 9A: Register Personal Encounter ────────────────────────────────────

export function MobileScreen09A({ navigate }: { navigate: (n: number) => void }) {
  const [rating, setRating] = useState<number | null>(null)
  const [additionalRatings, setAdditionalRatings] = useState<(number | null)[]>([null, null, null])
  const [saved, setSaved] = useState(false)
  const { visible, message, show } = useToast()

  const additionalStatements = [
    'Me sentí cómodo/a contándole a esta persona cosas que no les cuento a otras personas',
    'Me sentí cómodo/a al discutir problemas significativos con esta persona',
    'Mostré mis verdaderos sentimientos y me comporté de forma natural con esta persona',
  ]

  const allAnswered = rating !== null && additionalRatings.every(r => r !== null)

  const handleSave = () => {
    show('Registro guardado. Gracias por dedicar este momento.')
    setSaved(true)
    setTimeout(() => navigate(9), 2600)
  }

  if (saved) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: C.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ color: C.brand }}>{Ic.checkCircle}</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.heading, textAlign: 'center', marginBottom: 10 }}>Registro guardado</h2>
        <p style={{ fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: '22px' }}>Volviendo al inicio...</p>
        <Toast message={message} visible={visible} />
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 12px', gap: 10 }}>
        <button onClick={() => navigate(9)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, display: 'flex' }}>{Ic.arrowLeft}</button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.heading, margin: 0 }}>Registrar encuentro</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
        {/* Main rating question */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.heading, marginBottom: 4, lineHeight: '22px' }}>
            ¿Puedes puntuar la interacción que tuviste con tu persona cercana?
          </p>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 14, fontStyle: 'italic' }}>
            Escala y etiquetas por validar con el equipo investigador
          </p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>[[Mín.]]</span>
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{
                flex: 1, height: 44, borderRadius: 10,
                border: `2px solid ${rating !== null && n <= rating ? C.brand : C.border}`,
                backgroundColor: rating !== null && n <= rating ? C.brand : C.surface,
                color: rating !== null && n <= rating ? '#fff' : C.muted,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              }}>
                {n}
              </button>
            ))}
            <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>[[Máx.]]</span>
          </div>
        </div>

        {/* Additional assessment */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.heading, marginBottom: 4 }}>Valoración adicional</h2>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 20, fontStyle: 'italic' }}>
            Opciones de respuesta por validar con el equipo investigador
          </p>

          {additionalStatements.map((stmt, qi) => (
            <div key={qi} style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 14, color: C.body, marginBottom: 10, lineHeight: '20px' }}>{stmt}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => {
                    const updated = [...additionalRatings]
                    updated[qi] = n
                    setAdditionalRatings(updated)
                  }} style={{
                    flex: 1, height: 40, borderRadius: 8,
                    border: `2px solid ${additionalRatings[qi] !== null && n <= (additionalRatings[qi] ?? 0) ? C.brand : C.border}`,
                    backgroundColor: additionalRatings[qi] !== null && n <= (additionalRatings[qi] ?? 0) ? C.brandSoft : C.surface,
                    color: additionalRatings[qi] !== null && n <= (additionalRatings[qi] ?? 0) ? C.brand : C.muted,
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <PrivacyNote text="Este registro es privado y se usa únicamente según los permisos del estudio." />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <Btn variant="primary" fullWidth onClick={handleSave} disabled={!allAnswered}>Guardar registro</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => navigate(9)}>Cancelar</Btn>
        </div>
      </div>

      <Toast message={message} visible={visible} />
    </div>
  )
}

// ── Screen 10: Create Caring Contact ─────────────────────────────────────────

export function MobileScreen10({ navigate }: { navigate: (n: number) => void }) {
  const [text, setText] = useState('')
  const { visible, message, show } = useToast()

  const chips = ['Recordarle que estás', 'Compartir un recuerdo', 'Ofrecer compañía']
  const example = 'Por ejemplo: Pensé en ti y quería recordarte que estoy aquí. No tienes que responder ahora.'

  const handleSave = () => {
    show('Mensaje guardado para Sofi')
    setTimeout(() => navigate(9), 2000)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 12px', gap: 10 }}>
        <button onClick={() => navigate(9)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, display: 'flex' }}>{Ic.arrowLeft}</button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.heading, margin: 0 }}>Un mensaje para Sofi</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: '22px', marginBottom: 20 }}>
          Escribe algo cercano, breve y sin exigir una respuesta.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => setText(chip.toLowerCase() + '...')}
              style={{
                backgroundColor: C.soft, border: `1px solid ${C.border}`, borderRadius: 999,
                padding: '6px 14px', fontSize: 13, color: C.brand, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {chip}
            </button>
          ))}
        </div>

        <TextArea
          label="Tu mensaje"
          value={text}
          onChange={setText}
          placeholder={example}
          helper="Los mensajes breves suelen ser más fáciles de recibir."
        />

        {text && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 10 }}>Así lo verá Sofi</p>
            <div style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🌿</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.heading, margin: '0 0 4px' }}>Lorena</p>
                  <p style={{ fontSize: 14, color: C.body, margin: 0, lineHeight: '20px' }}>{text}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning callout */}
        <div style={{ backgroundColor: '#FEF5F0', borderRadius: 14, padding: 16, border: '1px solid #F4C0A8', marginTop: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#7A3520', marginBottom: 10 }}>Antes de guardar, recuerda</h3>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Trata de evitar dar consejos que la persona no ha pedido.',
              'Evita juzgar o cuestionar lo que siente.',
              'No exijas una respuesta inmediata.',
              'Evita minimizar lo que está viviendo.',
            ].map((item, i) => (
              <li key={i} style={{ fontSize: 13, color: '#7A3520', lineHeight: '18px' }}>{item}</li>
            ))}
          </ul>
          <p style={{ fontSize: 11, color: '#A05535', marginTop: 10, marginBottom: 0, fontStyle: 'italic' }}>
            Orientaciones pendientes de validación final por el equipo investigador
          </p>
        </div>

        <PrivacyNote text="Este mensaje se guarda solo para Sofi. No es público ni visible para otros." />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <Btn variant="primary" fullWidth onClick={handleSave} disabled={!text.trim()}>Guardar mensaje</Btn>
          <Btn variant="secondary" fullWidth>Guardar como borrador</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => navigate(9)}>Cancelar</Btn>
        </div>
      </div>

      <Toast message={message} visible={visible} />
    </div>
  )
}

// ── Screen 11: Caregiver Safety Plan View ────────────────────────────────────

export function MobileScreen11({ navigate }: { navigate: (n: number) => void }) {
  const [checklist, setChecklist] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [checked, setChecked] = useState<number[]>([])

  const steps = [
    { text: 'Respiración pausada (su habilidad favorita)' },
    { text: 'Llamar a Jorge, su amigo de confianza' },
    { text: 'Salir a caminar al parque cercano' },
  ]

  const toggleCheck = (i: number) => setChecked(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 12px', gap: 10 }}>
        <button onClick={() => navigate(9)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, display: 'flex' }}>{Ic.arrowLeft}</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: C.heading, margin: 0 }}>Plan de apoyo de Sofi</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <StatusChip label="Solo lectura" variant="blue" />
            <span style={{ fontSize: 11, color: C.muted }}>Act. 14 ago 2026</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Section 1 */}
          <div>
            <SectionHeading title="Qué puede ayudarle ahora" subtitle="Habilidades que ella eligió" />
            {checklist
              ? steps.map((s, i) => (
                <button key={i} onClick={() => toggleCheck(i)} style={{
                  width: '100%', padding: '14px 16px', marginBottom: 8, borderRadius: 12,
                  border: `1.5px solid ${checked.includes(i) ? C.brand : C.border}`,
                  backgroundColor: checked.includes(i) ? C.brandSoft : C.surface,
                  display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checked.includes(i) ? C.brand : C.border}`, backgroundColor: checked.includes(i) ? C.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {checked.includes(i) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: 14, color: C.body }}>{s.text}</span>
                </button>
              ))
              : steps.map((s, i) => (
                <div key={i} style={{ backgroundColor: C.surface, borderRadius: 12, padding: '12px 16px', marginBottom: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.body }}>
                  {i + 1}. {s.text}
                </div>
              ))
            }
          </div>

          <Divider />

          {/* Section 2 */}
          <div>
            <SectionHeading title="Cómo ayudar a mantener un entorno seguro" />
            <div style={{ backgroundColor: C.soft, borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ fontSize: 13, color: C.muted, fontStyle: 'italic', margin: 0 }}>
                [Lista proporcionada por el equipo clínico responsable]
              </p>
            </div>
          </div>

          {/* Emergency callout */}
          <div style={{ backgroundColor: C.criticalSoft, borderRadius: 16, padding: 18, border: `1px solid ${C.critical}30` }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.critical, marginBottom: 6 }}>Si hay peligro inmediato</h3>
            <p style={{ fontSize: 14, color: C.body, lineHeight: '20px', marginBottom: 14 }}>
              Sigue el protocolo indicado por el equipo responsable.
            </p>
            <Btn variant="critical" fullWidth icon={Ic.phone} onClick={() => setShowEmergency(true)} small>
              Llamar a emergencias
            </Btn>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 40px', backgroundColor: C.surface, borderTop: `1px solid ${C.border}` }}>
        <Btn variant="primary" fullWidth onClick={() => setChecklist(!checklist)}>
          {checklist ? 'Ver plan completo' : 'Acompañar paso a paso'}
        </Btn>
      </div>

      <Modal open={showEmergency} onClose={() => setShowEmergency(false)} title="Llamar a emergencias">
        <p style={{ fontSize: 14, color: C.body, lineHeight: '20px', marginBottom: 20 }}>
          Esta llamada conecta con el servicio de emergencias configurado por el equipo clínico.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="critical" fullWidth icon={Ic.phone}>Confirmar llamada</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => setShowEmergency(false)}>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  )
}

// ── Screen 12: Caregiver Daily Check-in ──────────────────────────────────────

export function MobileScreen12({ navigate }: { navigate: (n: number) => void }) {
  const [hadContact, setHadContact] = useState<'si' | 'no' | 'prefiero' | null>(null)
  const [quality, setQuality] = useState<number | null>(null)
  const [initiator, setInitiator] = useState<'yo' | 'sofi' | 'ambos' | null>(null)
  const [saved, setSaved] = useState(false)
  const { visible, message, show } = useToast()

  const handleSave = () => {
    show('Registro guardado. Gracias por dedicar este momento.')
    setSaved(true)
    setTimeout(() => navigate(9), 2600)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.canvas, position: 'relative' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 12px', gap: 10 }}>
        <button onClick={() => navigate(9)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.brand, display: 'flex' }}>{Ic.arrowLeft}</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.heading, margin: 0 }}>Contacto de hoy</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Este registro toma cerca de un minuto.</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
        {/* Q1 */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.heading, marginBottom: 12 }}>¿Tuviste contacto con Sofi hoy?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['si', 'no', 'prefiero'] as const).map((opt, i) => (
              <button key={opt} onClick={() => setHadContact(opt)} style={{
                flex: 1, padding: '12px 0', borderRadius: 12,
                border: `2px solid ${hadContact === opt ? C.brand : C.border}`,
                backgroundColor: hadContact === opt ? C.brandSoft : C.surface,
                color: hadContact === opt ? C.brand : C.body, fontSize: 13, fontWeight: hadContact === opt ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {['Sí', 'No', 'Prefiero no responder'][i]}
              </button>
            ))}
          </div>
        </div>

        {/* Q2 - conditional */}
        {hadContact === 'si' && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.heading, marginBottom: 12 }}>¿Cómo calificarías la calidad de la interacción?</p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.muted }}>Difícil</span>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setQuality(n)} style={{
                  flex: 1, height: 44, borderRadius: 10,
                  border: `2px solid ${quality !== null && n <= quality ? C.brand : C.border}`,
                  backgroundColor: quality !== null && n <= quality ? C.brand : C.surface,
                  color: quality !== null && n <= quality ? '#fff' : C.muted,
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
                }}>
                  {n}
                </button>
              ))}
              <span style={{ fontSize: 12, color: C.muted }}>Muy bien</span>
            </div>
          </div>
        )}

        {/* Q3 */}
        {hadContact === 'si' && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.heading, marginBottom: 12 }}>¿Quién inició el contacto?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['yo', 'sofi', 'ambos'] as const).map((opt, i) => (
                <button key={opt} onClick={() => setInitiator(opt)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  border: `2px solid ${initiator === opt ? C.brand : C.border}`,
                  backgroundColor: initiator === opt ? C.brandSoft : C.surface,
                  color: initiator === opt ? C.brand : C.body, fontSize: 13, fontWeight: initiator === opt ? 700 : 400,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {['Yo', 'Sofi', 'Ambos'][i]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <Btn variant="primary" fullWidth onClick={handleSave} disabled={!hadContact}>Guardar registro</Btn>
          <Btn variant="tertiary" fullWidth onClick={() => navigate(9)}>Completar después</Btn>
        </div>
      </div>

      <Toast message={message} visible={visible} />
    </div>
  )
}
