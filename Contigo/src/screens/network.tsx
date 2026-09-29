import { useState } from "react"
import {
  BottomSheet,
  Btn,
  C,
  Card,
  FloatingSupportBtn,
  supportContentPadding,
  Ic,
  PrivacyNote,
  ProgressBar,
  StatusBar,
  StatusChip,
} from "../ui"
import {
  canStrengthenRelationship,
  createDemoJourney,
  type JourneyState,
  type NetworkEntry,
  type NetworkPerson,
  type RelationshipType,
} from "../journey"

type NetworkView = "intro" | "names" | "review" | "person-intro" | "category" | "questions" | "summary" | "generating" | "results" | "choose" | "invite" | "sent"

type ResultTab = "closeness" | "quality" | "list"

interface NetworkProps {
  navigate: (screen: number) => void
  journey: JourneyState
  setJourney: (
    next: JourneyState | ((current: JourneyState) => JourneyState),
  ) => void
  entry: NetworkEntry
  demoMode: boolean
}

const NAME_QUESTIONS = [
  "Si salieras de la ciudad, ¿a quién o a quiénes les pedirías que cuidaran tu casa mientras estás fuera?",
  "¿Con quién o con quiénes te reunirías para hablar de pasatiempos o intereses que tienen en común?",
  "Cuando algo personal te preocupa, ¿con quién o con quiénes hablas de eso?",
  "¿La opinión de quién o quiénes consideras seriamente al tomar decisiones importantes?",
  "Si necesitaras reunir una suma grande de dinero, ¿a quién o a quiénes les pedirías ayuda?",
  "Cuando quieres sentirte escuchado o acompañado, ¿a quién o a quiénes se lo contarías?",
  "Si te sintieras enfermo o tuvieras una emergencia médica, ¿a quién buscarías para que te ayudara?",
  "¿Quién o quiénes te permiten sentir que perteneces a una comunidad, equipo o grupo?",
  "¿Hay alguien importante para ti que todavía no aparezca en esta lista?",
  "¿A cuáles de las personas de esta lista sientes especialmente cercanas?",
]

const RELATIONSHIP_QUESTIONS = [
  "¿Qué tan significativa es esta relación para tu vida?",
  "¿Con qué frecuencia hablan o se ven?",
  "¿Con qué frecuencia esta persona te escucha cuando le expresas algo?",
  "¿Con qué frecuencia esta persona se interesa por lo que estás sintiendo?",
  "¿Con qué frecuencia puedes contar con esta persona para distraerte de tus preocupaciones cuando estás bajo estrés?",
  "¿Qué tan frecuentemente tienes discusiones o peleas con esta persona?",
  "¿Qué tan satisfecho o satisfecha te sientes en esta relación?",
  "¿Con qué frecuencia sentiste que esta persona fue hostil o te trató mal?",
  "¿Con qué frecuencia sentiste que esta persona fue cálida o cariñosa contigo?",
  "¿La mayor parte del tiempo la relación se caracteriza por compañía y amor?",
  "¿La mayor parte del tiempo la relación se caracteriza por exigencia, frustración, desconsideración o competencia?",
  "¿Sientes que esta persona te ha apoyado?",
  "¿Con qué frecuencia te sientes entendido o entendida por esta persona?",
  "¿La mayor parte del tiempo la relación se caracteriza por compañía y cuidado?",
  "¿La mayor parte del tiempo la relación se caracteriza por frustración?",
  "¿Qué proporción del tiempo esta relación es una fuente significativa de estrés para ti?",
  "¿Con qué frecuencia esta relación interfiere con el apoyo que recibes de otras personas?",
  "¿Con qué frecuencia esta relación te genera sentimientos encontrados?",
]

const SCALE = [
  "Nada",
  "Un poco",
  "A veces",
  "Moderadamente",
  "Mucho",
  "Extremadamente",
]

const RELATIONSHIP_TYPES: RelationshipType[] = [
  "Familia",
  "Amistades",
  "Pareja",
  "Trabajo o estudio",
  "Comunidad, servicio o credo",
  "Otro",
]

type Metrics = {
  closeness: number
  positivity: number
  negativity: number
  importance: number
  finalCloseness: number
  calculatedAmbivalence: number
  reportedAmbivalence: number
  ring: "Íntimo" | "Personal" | "Ocasional"
  classification: "Mayormente positiva" | "Ambivalente" | "Mayormente negativa" | "Baja intensidad"
  shape: "circle" | "diamond" | "triangle" | "square"
  color: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function answer(person: NetworkPerson, questionNumber: number) {
  return person.answers[questionNumber - 2] ?? Number.NaN
}

function pomp(person: NetworkPerson, questionNumbers: number[]) {
  const total = questionNumbers.reduce(
    (sum, number) => sum + answer(person, number),
    0,
  )
  return clamp(
    (total - questionNumbers.length) / (5 * questionNumbers.length),
    0,
    1,
  )
}

function metricsFor(person: NetworkPerson): Metrics {
  const closeness = pomp(person, [4, 5, 6, 13, 14])
  const positivity = pomp(person, [10, 11, 15])
  const negativity = pomp(person, [7, 9, 12, 16, 17, 18])
  const importance = clamp((answer(person, 2) - 1) / 5, 0, 1)
  const calculatedAmbivalence =
    (positivity + negativity) / 2 - Math.abs(positivity - negativity)
  const reportedAmbivalence = clamp((answer(person, 19) - 1) / 5, 0, 1)
  const finalCloseness = Math.max(0, closeness - 0.4 * negativity)
  const ring =
    finalCloseness >= 0.7
      ? "Íntimo"
      : finalCloseness >= 0.35
        ? "Personal"
        : "Ocasional"

  if (positivity >= 0.5 && negativity < 0.5) {
    return {
      closeness,
      positivity,
      negativity,
      importance,
      finalCloseness,
      calculatedAmbivalence,
      reportedAmbivalence,
      ring,
      classification: "Mayormente positiva",
      shape: "circle",
      color: C.sage,
    }
  }
  if (positivity >= 0.5 && negativity >= 0.5) {
    return {
      closeness,
      positivity,
      negativity,
      importance,
      finalCloseness,
      calculatedAmbivalence,
      reportedAmbivalence,
      ring,
      classification: "Ambivalente",
      shape: "diamond",
      color: C.lilac,
    }
  }
  if (positivity < 0.5 && negativity >= 0.5) {
    return {
      closeness,
      positivity,
      negativity,
      importance,
      finalCloseness,
      calculatedAmbivalence,
      reportedAmbivalence,
      ring,
      classification: "Mayormente negativa",
      shape: "triangle",
      color: C.rose,
    }
  }
  return {
    closeness,
    positivity,
    negativity,
    importance,
    finalCloseness,
    calculatedAmbivalence,
    reportedAmbivalence,
    ring,
    classification: "Baja intensidad",
    shape: "square",
    color: C.bluePowder,
  }
}

function invitationLabel(person: NetworkPerson, journey: JourneyState) {
  if (canStrengthenRelationship(journey, person.id))
    return "Persona cercana vinculada"
  if (person.invitationStatus === "accepted") return "Vinculación en proceso"
  const labels = {
    "not-invited": "Sin invitación",
    pending: "Pendiente de aceptación",
    declined: "Invitación rechazada",
    cancelled: "Invitación cancelada",
    expired: "Invitación expirada",
  } as const
  return labels[
    person.invitationStatus as keyof typeof labels
  ] ?? "Sin invitación"
}

function invitationVariant(
  person: NetworkPerson,
  journey: JourneyState,
): "ok" | "warn" | "default" | "blue" {
  if (canStrengthenRelationship(journey, person.id)) return "ok"
  if (person.invitationStatus === "pending") return "warn"
  if (person.invitationStatus === "accepted") return "blue"
  return "default"
}

function SvgNode({
  x,
  y,
  size,
  metrics,
}: {
  x: number
  y: number
  size: number
  metrics: Metrics
}) {
  const common = { fill: metrics.color, stroke: "#fff", strokeWidth: 2.5 }
  if (metrics.shape === "diamond") {
    return (
      <rect
        x={x - size}
        y={y - size}
        width={size * 2}
        height={size * 2}
        rx={2}
        transform={`rotate(45 ${x} ${y})`}
        {...common}
      />
    )
  }
  if (metrics.shape === "triangle") {
    return (
      <path
        d={`M ${x} ${y - size - 2} L ${x + size + 2} ${y + size} L ${x - size - 2} ${y + size} Z`}
        {...common}
      />
    )
  }
  if (metrics.shape === "square") {
    return (
      <rect
        x={x - size}
        y={y - size}
        width={size * 2}
        height={size * 2}
        rx={3}
        {...common}
      />
    )
  }
  return <circle cx={x} cy={y} r={size} {...common} />
}

function Legend() {
  const items: Array<[Metrics["shape"], string, string]> = [
    ["circle", C.sage, "Mayormente positiva"],
    ["diamond", C.lilac, "Ambivalente"],
    ["triangle", C.rose, "Mayormente negativa"],
    ["square", C.bluePowder, "Baja intensidad"],
  ]
  return (
    <div
      aria-label="Leyenda de calidad relacional"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginTop: 12,
      }}
    >
      {items.map(([shape, color, label]) => {
        const fakeMetrics = { shape, color } as Metrics
        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              minWidth: 0,
            }}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 19 19"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <SvgNode x={9.5} y={9.5} size={5} metrics={fakeMetrics} />
            </svg>
            <span style={{ fontSize: 12, lineHeight: "17px", color: C.body }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ClosenessMap({
  people,
  onSelect,
}: {
  people: NetworkPerson[]
  onSelect: (id: string) => void
}) {
  const center = 160
  const sectorAngles: Record<RelationshipType, number> = {
    Familia: -135,
    Amistades: -45,
    Pareja: -90,
    "Trabajo o estudio": 45,
    "Comunidad, servicio o credo": 135,
    Otro: 180,
  }

  return (
    <svg
      className="network-chart"
      role="group"
      aria-label="Mapa de cercanía de tu red"
      viewBox="0 0 320 330"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <rect
        x="7"
        y="7"
        width="306"
        height="306"
        rx="20"
        fill="#fff"
        stroke={C.border}
      />
      <path d="M160 24V296M24 160H296" stroke={C.border} strokeDasharray="4 5" />
      {[42, 77, 112].map((radius, index) => (
        <circle
          key={radius}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={index === 2 ? C.sage : C.border}
          strokeWidth="1.5"
        />
      ))}
      <text x="52" y="35" fontSize="12" fontWeight="700" fill={C.muted}>
        Familia
      </text>
      <text
        x="268"
        y="35"
        fontSize="12"
        textAnchor="end"
        fontWeight="700"
        fill={C.muted}
      >
        Amistades
      </text>
      <text x="160" y="35" fontSize="12" textAnchor="middle" fontWeight="700" fill={C.muted}>
        Pareja
      </text>
      <text
        x="283"
        y="293"
        fontSize="12"
        textAnchor="end"
        fontWeight="700"
        fill={C.muted}
      >
        Trabajo / estudio
      </text>
      <text x="37" y="293" fontSize="12" fontWeight="700" fill={C.muted}>
        Comunidad
      </text>
      <circle cx={center} cy={center} r="22" fill={C.heading} />
      <text
        x={center}
        y={center + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="750"
        fill="#fff"
      >
        Yo
      </text>
      {people.map((person, index) => {
        const metrics = metricsFor(person)
        const base = sectorAngles[person.relationshipType ?? "Otro"]
        const angle = ((base + ((index % 3) - 1) * 11) * Math.PI) / 180
        const radius = 34 + (1 - metrics.finalCloseness) * 78
        const x = clamp(center + Math.cos(angle) * radius, 34, 286)
        const y = clamp(
          center + Math.sin(angle) * radius,
          person.relationshipType === "Pareja" ? 72 : 39,
          281,
        )
        const size = 8 + metrics.importance * 5
        const labelY =
          person.relationshipType === "Pareja" && y < 85
            ? y + size + 16
            : y < 54
              ? y + 24
              : y > 268
                ? y - 18
                : y - size - 7
        const labelX = clamp(x, 40, 280)
        const anchor = x < 65 ? "start" : x > 255 ? "end" : "middle"
        return (
          <g
            key={person.id}
            role="button"
            aria-label={`${person.name}, ${metrics.ring}, ${metrics.classification}`}
            tabIndex={0}
            onClick={() => onSelect(person.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onSelect(person.id)
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <SvgNode x={x} y={y} size={size} metrics={metrics} />
            <text
              x={labelX}
              y={clamp(labelY, 28, 294)}
              textAnchor={anchor}
              fontSize="12"
              fontWeight="700"
              fill={C.heading}
              stroke="#fff"
              strokeWidth="3"
              paintOrder="stroke"
            >
              {person.name.length > 10
                ? `${person.name.slice(0, 9)}…`
                : person.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function QualityGrid({
  people,
  onSelect,
}: {
  people: NetworkPerson[]
  onSelect: (id: string) => void
}) {
  const plot = { x: 50, y: 72, width: 238, height: 184 }
  const placed: Array<{ x: number; y: number }> = []

  return (
    <svg
      className="network-chart"
      role="group"
      aria-label="Cuadrícula de positividad y negatividad"
      viewBox="0 0 320 360"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <rect
        x="7"
        y="7"
        width="306"
        height="346"
        rx="20"
        fill="#fff"
        stroke={C.border}
      />
      <rect
        x={plot.x}
        y={plot.y}
        width={plot.width / 2}
        height={plot.height / 2}
        fill="#F6E8E5"
      />
      <rect
        x={plot.x + plot.width / 2}
        y={plot.y}
        width={plot.width / 2}
        height={plot.height / 2}
        fill="#F0EAF3"
      />
      <rect
        x={plot.x}
        y={plot.y + plot.height / 2}
        width={plot.width / 2}
        height={plot.height / 2}
        fill={C.blueSoft}
      />
      <rect
        x={plot.x + plot.width / 2}
        y={plot.y + plot.height / 2}
        width={plot.width / 2}
        height={plot.height / 2}
        fill={C.successSoft}
      />
      <rect
        x={plot.x}
        y={plot.y}
        width={plot.width}
        height={plot.height}
        fill="none"
        stroke={C.sage}
      />
      <path
        d={`M${plot.x + plot.width / 2} ${plot.y}V${plot.y + plot.height}M${plot.x} ${plot.y + plot.height / 2}H${plot.x + plot.width}`}
        stroke={C.border}
        strokeDasharray="4 4"
      />
      <text x="109.5" y="28" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.muted}>
        Mayormente
        <tspan x="109.5" dy="17">negativa</tspan>
      </text>
      <text
        x="228.5"
        y="36"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill={C.muted}
      >
        Ambivalente
      </text>
      <text x="109.5" y="294" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.muted}>
        Baja intensidad
      </text>
      <text
        x="228.5"
        y="287"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill={C.muted}
      >
        Mayormente
        <tspan x="228.5" dy="17">positiva</tspan>
      </text>
      <text
        x="169"
        y="343"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={C.heading}
      >
        Positividad
      </text>
      <text x="50" y="273" fontSize="12" fill={C.muted}>
        Baja
      </text>
      <text x="288" y="273" textAnchor="end" fontSize="12" fill={C.muted}>
        Alta
      </text>
      <text
        x="16"
        y="154"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={C.heading}
        transform="rotate(-90 16 154)"
      >
        Negatividad
      </text>
      <text x="42" y="78" textAnchor="end" fontSize="12" fill={C.muted}>
        Alta
      </text>
      <text x="42" y="256" textAnchor="end" fontSize="12" fill={C.muted}>
        Baja
      </text>
      {people.map((person, index) => {
        const metrics = metricsFor(person)
        let x = clamp(
          plot.x + metrics.positivity * plot.width,
          plot.x + 12,
          plot.x + plot.width - 12,
        )
        let y = clamp(
          plot.y + (1 - metrics.negativity) * plot.height,
          plot.y + 12,
          plot.y + plot.height - 12,
        )
        for (const previous of placed) {
          if (Math.abs(previous.x - x) < 22 && Math.abs(previous.y - y) < 22) {
            x = clamp(
              x + (index % 2 === 0 ? 18 : -18),
              plot.x + 12,
              plot.x + plot.width - 12,
            )
            y = clamp(y + 17, plot.y + 12, plot.y + plot.height - 12)
          }
        }
        placed.push({ x, y })
        const size = 8 + metrics.importance * 5
        const useBelow = y < plot.y + 30
        const labelY = clamp(
          useBelow ? y + size + 16 : y - size - 7,
          plot.y + 14,
          plot.y + plot.height - 8,
        )
        const anchor =
          x < plot.x + 38
            ? "start"
            : x > plot.x + plot.width - 38
              ? "end"
              : "middle"
        const labelX = clamp(x, plot.x + 4, plot.x + plot.width - 4)
        return (
          <g
            key={person.id}
            role="button"
            tabIndex={0}
            aria-label={`${person.name}, ${metrics.classification}`}
            onClick={() => onSelect(person.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onSelect(person.id)
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <SvgNode x={x} y={y} size={size} metrics={metrics} />
            <path
              d={`M${x} ${y}L${labelX} ${labelY}`}
              stroke={C.muted}
              strokeWidth="1"
              opacity="0.45"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor={anchor}
              fontSize="12"
              fontWeight="700"
              fill={C.heading}
              stroke="#fff"
              strokeWidth="3"
              paintOrder="stroke"
            >
              {person.name.length > 10
                ? `${person.name.slice(0, 9)}…`
                : person.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function initialViewFor(
  entry: NetworkEntry,
  journey: JourneyState,
): NetworkView {
  if (
    entry === "results" &&
    journey.people.some((person) => person.status === "complete")
  )
    return "results"
  if (entry === "progress" && journey.people.length > 0) return "summary"
  if (entry === "intro") return "intro"
  if (journey.mapGenerated) return "results"
  if (journey.people.length > 0) return "summary"
  return "intro"
}

export default function SocialNetworkScreen({
  navigate,
  journey,
  setJourney,
  entry,
  demoMode,
}: NetworkProps) {
  const [view, setView] = useState<NetworkView>(() =>
    initialViewFor(entry, journey),
  )
  const [nameQuestionIndex, setNameQuestionIndex] = useState(0)
  const [personDraft, setPersonDraft] = useState("")
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(null)
  const [assessmentIndex, setAssessmentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [resultTab, setResultTab] = useState<ResultTab>("closeness")
  const [detailPersonId, setDetailPersonId] = useState<string | null>(null)
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [duplicate, setDuplicate] = useState<{
    name: string
    existingId: string
  } | null>(null)
  const [reviewMessage, setReviewMessage] = useState("")
  const [demoPanelOpen, setDemoPanelOpen] = useState(false)

  const currentPerson =
    journey.people.find((person) => person.id === currentPersonId) ?? null
  const detailPerson =
    journey.people.find((person) => person.id === detailPersonId) ?? null
  const candidate =
    journey.people.find((person) => person.id === candidateId) ?? null
  const completePeople = journey.people.filter(
    (person) =>
      person.status === "complete" &&
      person.answers.length >= 18 &&
      person.answers.every(
        (value) => value !== null && value >= 1 && value <= 6,
      ),
  )
  const incompletePeople = journey.people.filter(
    (person) => !completePeople.some((complete) => complete.id === person.id),
  )

  const updatePerson = (id: string, update: Partial<NetworkPerson>) => {
    setJourney((current) => ({
      ...current,
      mapStarted: true,
      people: current.people.map((person) =>
        person.id === id ? { ...person, ...update } : person,
      ),
    }))
  }

  const appendPerson = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setJourney((current) => ({
      ...current,
      mapStarted: true,
      people: [
        ...current.people,
        {
          id: `person-${Date.now()}-${current.people.length}`,
          name: trimmed,
          answers: Array(18).fill(null),
          status: "pending",
          invitationStatus: "not-invited",
        },
      ],
    }))
    setPersonDraft("")
  }

  const addPerson = () => {
    const normalized = personDraft.trim().toLocaleLowerCase("es")
    if (!normalized) return
    const possibleDuplicate = journey.people.find((person) => {
      const existing = person.name.trim().toLocaleLowerCase("es")
      return (
        existing === normalized ||
        (normalized.length >= 3 && existing.startsWith(normalized.slice(0, 3)))
      )
    })
    if (possibleDuplicate) {
      setDuplicate({
        name: personDraft.trim(),
        existingId: possibleDuplicate.id,
      })
      return
    }
    appendPerson(personDraft)
  }

  const advanceNameQuestion = () => {
    setPersonDraft("")
    if (nameQuestionIndex < NAME_QUESTIONS.length - 1)
      setNameQuestionIndex((index) => index + 1)
    else setView("review")
  }

  const submitNameQuestion = () => {
    const normalized = personDraft.trim().toLocaleLowerCase("es")
    if (normalized) {
      const possibleDuplicate = journey.people.find((person) => {
        const existing = person.name.trim().toLocaleLowerCase("es")
        return (
          existing === normalized ||
          (normalized.length >= 3 &&
            existing.startsWith(normalized.slice(0, 3)))
        )
      })
      if (possibleDuplicate) {
        setDuplicate({
          name: personDraft.trim(),
          existingId: possibleDuplicate.id,
        })
        return
      }
      appendPerson(personDraft)
    }
    advanceNameQuestion()
  }

  const startAssessment = (personId: string) => {
    const person = journey.people.find((item) => item.id === personId)
    setCurrentPersonId(personId)
    setAssessmentIndex(0)
    setSelectedAnswer(person?.answers[0] ?? null)
    setView(person?.relationshipType ? "questions" : "person-intro")
  }

  const selectCategory = (type: RelationshipType) => {
    if (!currentPersonId) return
    updatePerson(currentPersonId, {
      relationshipType: type,
      status: "in-progress",
    })
    setAssessmentIndex(0)
    setSelectedAnswer(currentPerson?.answers[0] ?? null)
    setView("questions")
  }

  const saveAssessmentAnswer = () => {
    if (!currentPersonId || selectedAnswer === null || !currentPerson) return
    const nextAnswers = [...currentPerson.answers]
    nextAnswers[assessmentIndex] = selectedAnswer
    const isLast = assessmentIndex === RELATIONSHIP_QUESTIONS.length - 1
    updatePerson(currentPersonId, {
      answers: nextAnswers,
      status: isLast ? "complete" : "in-progress",
    })
    if (isLast) {
      setSelectedAnswer(null)
      setView("summary")
      return
    }
    const nextIndex = assessmentIndex + 1
    setAssessmentIndex(nextIndex)
    setSelectedAnswer(nextAnswers[nextIndex])
  }

  const generateResults = () => {
    if (completePeople.length === 0) return
    setView("generating")
    window.setTimeout(() => {
      setJourney((current) => ({
        ...current,
        mapStarted: true,
        mapGenerated: true,
      }))
      setView("results")
    }, 550)
  }

  const chooseCandidate = (id: string) => {
    setCandidateId(id)
    setDetailPersonId(null)
    setView("choose")
  }

  const confirmSelection = (destination: "activity" | "invite") => {
    if (!candidateId) return
    if (
      destination === "activity" &&
      !canStrengthenRelationship(journey, candidateId)
    )
      return
    setJourney((current) => ({
      ...current,
      selectedPersonId: candidateId,
      activityInProgress: destination === "activity",
    }))
    if (destination === "activity") navigate(8)
    else setView("invite")
  }

  const back = () => {
    if (view === "names" && nameQuestionIndex > 0) {
      setNameQuestionIndex((index) => index - 1)
      return
    }
    if (view === "questions" && assessmentIndex > 0) {
      const previous = assessmentIndex - 1
      setAssessmentIndex(previous)
      setSelectedAnswer(currentPerson?.answers[previous] ?? null)
      return
    }
    if (["category", "person-intro"].includes(view)) {
      setView("review")
      return
    }
    if (["choose", "invite"].includes(view)) {
      setView(view === "invite" ? "choose" : "results")
      return
    }
    if (view === "results") {
      navigate(2)
      return
    }
    if (view === "summary") {
      setView("review")
      return
    }
    if (view === "review") {
      setView("names")
      setNameQuestionIndex(NAME_QUESTIONS.length - 1)
      return
    }
    if (view === "names") {
      setView("intro")
      return
    }
    navigate(2)
  }

  const screenTitle =
    view === "results"
      ? "Tu mapa de red"
      : view === "choose" || view === "invite" || view === "sent"
        ? "Elegir un vínculo"
        : "Conoce tu red"

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: C.canvas,
        position: "relative",
      }}
    >
      <StatusBar />
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "0 18px 11px",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={back}
          aria-label="Volver"
          style={{
            width: 44,
            height: 44,
            display: "grid",
            placeItems: "center",
            background: "transparent",
            border: "none",
            color: C.brand,
            cursor: "pointer",
          }}
        >
          {Ic.arrowLeft}
        </button>
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: 20,
              lineHeight: "25px",
              color: C.heading,
              margin: 0,
            }}
          >
            {screenTitle}
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>
            A tu propio ritmo
          </p>
        </div>
      </header>

      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px 24px", paddingBottom: supportContentPadding(18) }}>
        {view === "intro" && (
          <div>
            <div
              aria-hidden="true"
              style={{
                width: 82,
                height: 82,
                borderRadius: 26,
                margin: "12px auto 20px",
                background: C.brandSoft,
                color: C.brand,
                display: "grid",
                placeItems: "center",
              }}
            >
              {Ic.users}
            </div>
            <h2
              style={{
                fontSize: 24,
                lineHeight: "31px",
                color: C.heading,
                margin: "0 0 12px",
                textAlign: "center",
              }}
            >
              Antes de empezar, construye tu mapa de red
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: "23px",
                color: C.muted,
                margin: "0 0 18px",
                textAlign: "center",
              }}
            >
              Reconoce las personas que forman parte de tu vida. Al terminar,
              podrás invitar a personas cercanas con quienes quieras compartir
              la aplicación o fortalecer tu relación.
            </p>
            <PrivacyNote text="Puedes usar nombres, iniciales o apodos. Esta herramienta no evalúa a las personas ni te obliga a explicar cada relación." />
            <details
              style={{
                margin: "16px 0 22px",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "12px 14px",
                background: C.surface,
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  color: C.brand,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                ¿Por qué te preguntamos esto?
              </summary>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: "20px",
                  color: C.muted,
                  margin: "10px 0 0",
                }}
              >
                Observar tu red puede ayudarte a decidir qué relación te
                gustaría cuidar o fortalecer. La decisión siempre será tuya.
              </p>
            </details>
            <Btn
              fullWidth
              onClick={() => {
                setJourney((current) => ({
                  ...current,
                  mapStarted: true,
                  onboardingStatus:
                    current.onboardingStatus === "completed"
                      ? "completed"
                      : "in-progress",
                  onboardingWelcomeShown: true,
                }))
                setView("names")
              }}
            >
              Construir mi mapa
            </Btn>
            {journey.people.length > 0 && (
              <Btn
                variant="secondary"
                fullWidth
                onClick={() => setView("summary")}
                style={{ marginTop: 10 }}
              >
                Continuar un mapa guardado
              </Btn>
            )}
            {journey.people.length === 0 && (
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => {
                  setJourney((current) => ({
                    ...current,
                    onboardingStatus: "deferred",
                    onboardingWelcomeShown: true,
                  }))
                  navigate(2)
                }}
                style={{ marginTop: 8 }}
              >
                Hacerlo después
              </Btn>
            )}
            {demoMode && (
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => {
                  setJourney(createDemoJourney())
                  setView("results")
                }}
                style={{ marginTop: 8 }}
              >
                Cargar datos de demostración
              </Btn>
            )}
          </div>
        )}

        {view === "names" && (
          <div>
            <ProgressBar
              value={nameQuestionIndex + 1}
              total={NAME_QUESTIONS.length}
              label={`Pregunta ${nameQuestionIndex + 1} de ${NAME_QUESTIONS.length}`}
            />
            <Card
              style={{
                marginTop: 18,
                marginBottom: 16,
                borderLeft: `4px solid ${C.brand}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: "27px",
                  fontWeight: 650,
                  color: C.heading,
                }}
              >
                {NAME_QUESTIONS[nameQuestionIndex]}
              </p>
            </Card>
            {journey.people.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  marginBottom: 13,
                }}
              >
                {journey.people.map((person) => (
                  <span
                    key={person.id}
                    style={{
                      borderRadius: 999,
                      padding: "7px 10px",
                      background: C.brandSoft,
                      color: C.brand,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {person.name}
                  </span>
                ))}
              </div>
            )}
            <label
              htmlFor="network-person-name"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                color: C.heading,
                marginBottom: 6,
              }}
            >
              Nombre, iniciales o apodo
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="network-person-name"
                value={personDraft}
                onChange={(event) => setPersonDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addPerson()
                }}
                placeholder="Ej. Alex o M."
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 48,
                  borderRadius: 12,
                  border: `1.5px solid ${C.border}`,
                  padding: "0 13px",
                  background: C.surface,
                  color: C.body,
                  font: "inherit",
                }}
              />
              <button
                type="button"
                onClick={addPerson}
                aria-label="Añadir esta persona"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  border: "none",
                  background: C.brand,
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                {Ic.plus}
              </button>
            </div>
            <button
              type="button"
              onClick={addPerson}
              disabled={!personDraft.trim()}
              style={{
                minHeight: 44,
                border: "none",
                background: "transparent",
                color: C.brand,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: personDraft.trim() ? "pointer" : "default",
                opacity: personDraft.trim() ? 1 : 0.45,
                padding: "8px 0",
              }}
            >
              Añadir otra persona
            </button>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 16,
              }}
            >
              <Btn fullWidth onClick={submitNameQuestion}>
                {nameQuestionIndex === NAME_QUESTIONS.length - 1
                  ? "Revisar mi lista"
                  : "Continuar"}
              </Btn>
              <Btn variant="secondary" fullWidth onClick={advanceNameQuestion}>
                No se me ocurre nadie
              </Btn>
              <Btn variant="tertiary" fullWidth onClick={advanceNameQuestion}>
                Omitir esta pregunta
              </Btn>
              <button
                type="button"
                onClick={() => navigate(2)}
                style={{
                  minHeight: 44,
                  border: "none",
                  background: "transparent",
                  color: C.muted,
                  font: "inherit",
                  cursor: "pointer",
                }}
              >
                Guardar y continuar después
              </button>
            </div>
          </div>
        )}

        {view === "review" && (
          <div>
            <h2 style={{ fontSize: 23, color: C.heading, margin: "4px 0 7px" }}>
              Las personas que forman tu red
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: "21px",
                color: C.muted,
                margin: "0 0 16px",
              }}
            >
              Revisa los nombres antes de caracterizar cada relación. Puedes
              cambiarlos por iniciales o apodos.
            </p>
            {journey.people.length === 0 ? (
              <Card style={{ textAlign: "center", padding: 24 }}>
                <p
                  style={{
                    color: C.muted,
                    lineHeight: "21px",
                    margin: "0 0 14px",
                  }}
                >
                  Tu lista todavía está vacía. Puedes volver y añadir a alguien
                  cuando quieras.
                </p>
                <Btn
                  variant="secondary"
                  onClick={() => {
                    setView("names")
                    setNameQuestionIndex(0)
                  }}
                >
                  Volver a las preguntas
                </Btn>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {journey.people.map((person) => (
                  <Card key={person.id} style={{ padding: 13 }}>
                    {editingId === person.id ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          aria-label={`Editar nombre de ${person.name}`}
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          style={{
                            flex: 1,
                            minWidth: 0,
                            height: 44,
                            border: `1px solid ${C.border}`,
                            borderRadius: 10,
                            padding: "0 10px",
                            font: "inherit",
                          }}
                        />
                        <button
                          type="button"
                          aria-label="Guardar nombre"
                          onClick={() => {
                            if (editingName.trim())
                              updatePerson(person.id, {
                                name: editingName.trim(),
                              })
                            setEditingId(null)
                          }}
                          style={{
                            width: 44,
                            border: "none",
                            borderRadius: 10,
                            background: C.brand,
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          {Ic.check}
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: C.brandSoft,
                            color: C.brand,
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 750,
                          }}
                        >
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <strong
                          style={{ flex: 1, color: C.heading, fontSize: 15 }}
                        >
                          {person.name}
                        </strong>
                        <button
                          type="button"
                          aria-label={`Editar ${person.name}`}
                          onClick={() => {
                            setEditingId(person.id)
                            setEditingName(person.name)
                          }}
                          style={{
                            width: 44,
                            height: 44,
                            border: "none",
                            background: "transparent",
                            color: C.brand,
                            cursor: "pointer",
                          }}
                        >
                          {Ic.edit}
                        </button>
                        <button
                          type="button"
                          aria-label={`Eliminar ${person.name}`}
                          onClick={() => setRemoveId(person.id)}
                          style={{
                            width: 44,
                            height: 44,
                            border: "none",
                            background: "transparent",
                            color: C.critical,
                            cursor: "pointer",
                          }}
                        >
                          {Ic.x}
                        </button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            {reviewMessage && (
              <p
                role="status"
                style={{ fontSize: 12, color: C.muted, margin: "10px 0 0" }}
              >
                {reviewMessage}
              </p>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 16,
              }}
            >
              <Btn
                variant="secondary"
                fullWidth
                onClick={() => {
                  setView("names")
                  setNameQuestionIndex(NAME_QUESTIONS.length - 1)
                }}
              >
                Añadir a alguien más
              </Btn>
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => {
                  const seen = new Set<string>()
                  const unique = journey.people.filter((person) => {
                    const key = person.name.trim().toLocaleLowerCase("es")
                    if (seen.has(key)) return false
                    seen.add(key)
                    return true
                  })
                  setReviewMessage(
                    unique.length === journey.people.length
                      ? "No encontramos duplicados exactos. Puedes editar los nombres manualmente."
                      : "Combinamos las entradas duplicadas.",
                  )
                  if (unique.length !== journey.people.length)
                    setJourney((current) => ({ ...current, people: unique }))
                }}
              >
                Combinar posibles duplicados
              </Btn>
              <Btn
                fullWidth
                disabled={journey.people.length === 0}
                onClick={() => setView("summary")}
              >
                Continuar con la caracterización
              </Btn>
            </div>
          </div>
        )}

        {view === "summary" && (
          <div>
            <h2 style={{ fontSize: 23, color: C.heading, margin: "4px 0 7px" }}>
              Avance de tu mapa
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: "21px",
                color: C.muted,
                margin: "0 0 15px",
              }}
            >
              Elige una persona para continuar. No necesitas terminar todo en
              una sola sesión.
            </p>
            {journey.people.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => startAssessment(person.id)}
                style={{
                  width: "100%",
                  minHeight: 70,
                  marginBottom: 9,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  background: C.surface,
                  padding: "12px 13px",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    background:
                      person.status === "complete" ? C.successSoft : C.soft,
                    color: person.status === "complete" ? C.success : C.brand,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {person.status === "complete" ? Ic.check : Ic.user}
                </div>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong
                    style={{ display: "block", color: C.heading, fontSize: 15 }}
                  >
                    {person.name}
                  </strong>
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {person.relationshipType ?? "Tipo de relación pendiente"}
                  </span>
                </span>
                <StatusChip
                  label={
                    person.status === "complete"
                      ? "Completa"
                      : person.status === "in-progress"
                        ? "En progreso"
                        : "Pendiente"
                  }
                  variant={
                    person.status === "complete"
                      ? "ok"
                      : person.status === "in-progress"
                        ? "warn"
                        : "default"
                  }
                />
              </button>
            ))}
            {incompletePeople.length > 0 && completePeople.length > 0 && (
              <PrivacyNote text="Puedes ver un resultado preliminar o terminar las relaciones pendientes para tener una vista más completa." />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 16,
              }}
            >
              {incompletePeople.length > 0 && (
                <Btn
                  fullWidth
                  onClick={() => startAssessment(incompletePeople[0].id)}
                >
                  Caracterizar otra persona
                </Btn>
              )}
              <Btn
                variant={incompletePeople.length > 0 ? "secondary" : "primary"}
                fullWidth
                disabled={completePeople.length === 0}
                onClick={generateResults}
              >
                Generar mi mapa
              </Btn>
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => setView("review")}
              >
                Añadir o editar personas
              </Btn>
              <button
                type="button"
                onClick={() => navigate(2)}
                style={{
                  minHeight: 44,
                  border: "none",
                  background: "transparent",
                  color: C.muted,
                  font: "inherit",
                  cursor: "pointer",
                }}
              >
                Guardar y continuar después
              </button>
            </div>
          </div>
        )}

        {view === "person-intro" && currentPerson && (
          <div style={{ textAlign: "center", paddingTop: 18 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: C.brandSoft,
                color: C.brand,
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
                fontSize: 28,
                fontWeight: 750,
              }}
            >
              {currentPerson.name.charAt(0).toUpperCase()}
            </div>
            <h2
              style={{
                fontSize: 23,
                lineHeight: "30px",
                color: C.heading,
                margin: "0 0 10px",
              }}
            >
              Ahora veremos tu relación con {currentPerson.name}
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: "23px",
                color: C.muted,
                margin: "0 0 20px",
              }}
            >
              No hay respuestas correctas o incorrectas. Responde según cómo
              percibes actualmente esta relación.
            </p>
            <Btn fullWidth onClick={() => setView("category")}>
              Continuar
            </Btn>
            <Btn
              variant="tertiary"
              fullWidth
              onClick={() => navigate(2)}
              style={{ marginTop: 8 }}
            >
              Guardar y salir
            </Btn>
          </div>
        )}

        {view === "category" && currentPerson && (
          <div>
            <ProgressBar value={1} total={19} label="Pregunta 1 de 19" />
            <h2
              style={{
                fontSize: 21,
                lineHeight: "28px",
                color: C.heading,
                margin: "20px 0 6px",
              }}
            >
              ¿Quién es {currentPerson.name} para ti?
            </h2>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px" }}>
              Elige el ámbito que mejor represente la relación actualmente.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => selectCategory(type)}
                  style={{
                    minHeight: 52,
                    borderRadius: 12,
                    border: `1.5px solid ${
                      currentPerson.relationshipType === type
                        ? C.brand
                        : C.border
                    }`,
                    background:
                      currentPerson.relationshipType === type
                        ? C.brandSoft
                        : C.surface,
                    color:
                      currentPerson.relationshipType === type
                        ? C.brand
                        : C.body,
                    padding: "0 14px",
                    textAlign: "left",
                    font: "inherit",
                    fontWeight: 650,
                    cursor: "pointer",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "questions" && currentPerson && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <StatusChip label={currentPerson.name} variant="blue" />
              <button
                type="button"
                onClick={() => {
                  setEditingId(currentPerson.id)
                  setEditingName(currentPerson.name)
                  setView("review")
                }}
                style={{
                  minHeight: 44,
                  border: "none",
                  background: "transparent",
                  color: C.brand,
                  font: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cambiar nombre
              </button>
            </div>
            <ProgressBar
              value={assessmentIndex + 2}
              total={19}
              label={`Pregunta ${assessmentIndex + 2} de 19`}
            />
            <Card
              style={{
                margin: "18px 0 14px",
                borderLeft: `4px solid ${C.brand}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: "27px",
                  color: C.heading,
                  fontWeight: 650,
                }}
              >
                {RELATIONSHIP_QUESTIONS[assessmentIndex]}
              </p>
            </Card>
            <div
              role="radiogroup"
              aria-label="Escala de respuesta"
              style={{ display: "flex", flexDirection: "column", gap: 7 }}
            >
              {SCALE.map((label, index) => {
                const value = index + 1
                const active = selectedAnswer === value
                return (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedAnswer(value)}
                    style={{
                      minHeight: 50,
                      borderRadius: 12,
                      border: `2px solid ${active ? C.brand : C.border}`,
                      background: active ? C.brandSoft : C.surface,
                      color: active ? C.brand : C.body,
                      padding: "0 13px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      font: "inherit",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: active ? C.brand : C.soft,
                        color: active ? "white" : C.muted,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        fontWeight: 750,
                        flexShrink: 0,
                      }}
                    >
                      {value}
                    </span>
                    <span style={{ fontWeight: 650 }}>{label}</span>
                  </button>
                )
              })}
            </div>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Btn
                fullWidth
                disabled={selectedAnswer === null}
                onClick={saveAssessmentAnswer}
              >
                {assessmentIndex === RELATIONSHIP_QUESTIONS.length - 1
                  ? "Terminar caracterización"
                  : "Continuar"}
              </Btn>
              <button
                type="button"
                onClick={() => navigate(2)}
                style={{
                  minHeight: 44,
                  border: "none",
                  background: "transparent",
                  color: C.muted,
                  font: "inherit",
                  cursor: "pointer",
                }}
              >
                Guardar y continuar después
              </button>
            </div>
          </div>
        )}

        {view === "generating" && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div
              className="gentle-spinner"
              aria-hidden="true"
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                border: `5px solid ${C.brandSoft}`,
                borderTopColor: C.brand,
                margin: "0 auto 20px",
              }}
            />
            <h2 style={{ fontSize: 22, color: C.heading, margin: "0 0 8px" }}>
              Tejiendo tu mapa…
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: "21px",
                color: C.muted,
                margin: 0,
              }}
            >
              Estamos organizando la información que compartiste.
            </p>
          </div>
        )}

        {view === "results" && (
          <div>
            <p
              style={{
                fontSize: 14,
                lineHeight: "21px",
                color: C.muted,
                margin: "0 0 13px",
              }}
            >
              Explora las vistas para observar tu red desde distintas
              perspectivas. Ninguna califica el valor de una persona.
            </p>
            <div
              role="tablist"
              aria-label="Vistas del mapa"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 5,
                background: C.soft,
                padding: 4,
                borderRadius: 12,
                marginBottom: 13,
              }}
            >
              {([
                ["closeness", "Mapa de cercanía"],
                ["quality", "Calidad relacional"],
                ["list", "Lista"],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={resultTab === tab}
                  onClick={() => setResultTab(tab)}
                  style={{
                    minHeight: 48,
                    border: "none",
                    borderRadius: 9,
                    padding: "6px 5px",
                    background: resultTab === tab ? C.surface : "transparent",
                    color: resultTab === tab ? C.brand : C.muted,
                    boxShadow:
                      resultTab === tab
                        ? "0 2px 7px rgba(58,50,56,.09)"
                        : "none",
                    font: "inherit",
                    fontSize: 12,
                    lineHeight: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {resultTab === "closeness" && (
              <>
                <ClosenessMap
                  people={completePeople}
                  onSelect={setDetailPersonId}
                />
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: "20px",
                    color: C.muted,
                    margin: "10px 0 0",
                  }}
                >
                  La distancia muestra qué tan cercana percibes actualmente la
                  relación. No califica el valor de la persona.
                </p>
                <Legend />
              </>
            )}

            {resultTab === "quality" && (
              <>
                <QualityGrid
                  people={completePeople}
                  onSelect={setDetailPersonId}
                />
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: "20px",
                    color: C.muted,
                    margin: "10px 0 0",
                  }}
                >
                  Una relación puede tener aspectos positivos y difíciles al
                  mismo tiempo. Esta vista ayuda a observar ambas dimensiones,
                  no a juzgar a la persona.
                </p>
                <Legend />
              </>
            )}

            {resultTab === "list" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {completePeople.map((person) => {
                  const metrics = metricsFor(person)
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setDetailPersonId(person.id)}
                      style={{
                        width: "100%",
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        background: C.surface,
                        padding: 14,
                        display: "flex",
                        gap: 11,
                        alignItems: "center",
                        textAlign: "left",
                        font: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 34 34"
                        aria-hidden="true"
                        style={{ flexShrink: 0 }}
                      >
                        <SvgNode x={17} y={17} size={10} metrics={metrics} />
                      </svg>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            fontSize: 15,
                            color: C.heading,
                            marginBottom: 3,
                          }}
                        >
                          {person.name}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: 14,
                            lineHeight: "20px",
                            color: C.muted,
                          }}
                        >
                          {person.relationshipType} · Cercanía{" "}
                          {metrics.ring.toLocaleLowerCase("es")} ·{" "}
                          {metrics.classification}
                        </span>
                        <span style={{ display: "block", marginTop: 7 }}>
                          <StatusChip
                            label={invitationLabel(person, journey)}
                            variant={invitationVariant(person, journey)}
                          />
                        </span>
                      </span>
                      <span style={{ color: C.brand }}>{Ic.chevRight}</span>
                    </button>
                  )
                })}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <Btn
                fullWidth
                onClick={() => {
                  setCandidateId(null)
                  setView("choose")
                }}
              >
                Gestionar invitaciones y vínculos
              </Btn>
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => setView("summary")}
                style={{ marginTop: 7 }}
              >
                Ver o editar respuestas
              </Btn>
            </div>
          </div>
        )}

        {view === "choose" && (
          <div>
            <h2
              style={{
                fontSize: 23,
                lineHeight: "30px",
                color: C.heading,
                margin: "3px 0 8px",
              }}
            >
              Invitaciones y vínculos
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: "21px",
                color: C.muted,
                margin: "0 0 16px",
              }}
            >
              Invita a cada persona por separado o consulta su estado. Estar en
              el mapa no envía invitaciones ni vincula a nadie automáticamente.
            </p>
            {!candidate &&
              completePeople.map((person) => {
                const metrics = metricsFor(person)
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setCandidateId(person.id)}
                    style={{
                      width: "100%",
                      minHeight: 66,
                      marginBottom: 9,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 14,
                      background: C.surface,
                      padding: "11px 13px",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      textAlign: "left",
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <SvgNode x={16} y={16} size={9} metrics={metrics} />
                    </svg>
                    <span style={{ flex: 1 }}>
                      <strong style={{ display: "block", color: C.heading }}>
                        {person.name}
                      </strong>
                      <span style={{ fontSize: 12, color: C.muted }}>
                        {person.relationshipType}
                      </span>
                      <span style={{ display: "block", marginTop: 5 }}>
                        <StatusChip
                          label={invitationLabel(person, journey)}
                          variant={invitationVariant(person, journey)}
                        />
                      </span>
                    </span>
                    <span style={{ color: C.brand }}>{Ic.chevRight}</span>
                  </button>
                )
              })}
            {candidate && (
              <>
                <Card
                  style={{
                    borderLeft: `4px solid ${C.brand}`,
                    marginBottom: 15,
                  }}
                >
                  <StatusChip
                    label={invitationLabel(candidate, journey)}
                    variant={invitationVariant(candidate, journey)}
                  />
                  <h3
                    style={{
                      fontSize: 21,
                      color: C.heading,
                      margin: "12px 0 4px",
                    }}
                  >
                    {candidate.name}
                  </h3>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                    {candidate.relationshipType}
                  </p>
                </Card>
                <label
                  htmlFor="selection-reason"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.heading,
                    marginBottom: 6,
                  }}
                >
                  ¿Qué te gustaría cuidar de este vínculo?{" "}
                  <span style={{ color: C.muted, fontWeight: 500 }}>
                    (opcional)
                  </span>
                </label>
                <textarea
                  id="selection-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  placeholder="Puedes escribir una razón breve…"
                  style={{
                    width: "100%",
                    resize: "vertical",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 12,
                    font: "inherit",
                    color: C.body,
                    background: C.surface,
                  }}
                />
                <p style={{ fontSize: 14, lineHeight: "21px", color: C.muted, margin: "15px 0" }}>
                  {canStrengthenRelationship(journey, candidate.id)
                    ? "Esta persona aceptó y tiene una asociación activa contigo."
                    : candidate.invitationStatus === "pending"
                      ? "La invitación está pendiente. Las herramientas compartidas seguirán inhabilitadas hasta que acepte y quede vinculada contigo."
                      : candidate.invitationStatus === "accepted"
                        ? "La invitación fue aceptada, pero la vinculación activa todavía está en proceso."
                        : "Puedes invitar a esta persona cercana para cuidar este vínculo. No se compartirán tus respuestas ni la puntuación del mapa."}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {canStrengthenRelationship(journey, candidate.id) &&
                    journey.onboardingStatus === "completed" && (
                      <Btn fullWidth onClick={() => confirmSelection("activity")}>
                        Fortalecer este vínculo
                      </Btn>
                    )}
                  {candidate.invitationStatus === "not-invited" && (
                    <Btn fullWidth onClick={() => confirmSelection("invite")}>
                      Invitar a esta persona cercana
                    </Btn>
                  )}
                  {["declined", "cancelled", "expired"].includes(
                    candidate.invitationStatus,
                  ) && (
                    <Btn
                      variant="secondary"
                      fullWidth
                      onClick={() => confirmSelection("invite")}
                    >
                      Revisar una nueva invitación
                    </Btn>
                  )}
                  <Btn
                    variant="tertiary"
                    fullWidth
                    onClick={() => {
                      setCandidateId(null)
                      setView("results")
                    }}
                  >
                    Elegir después
                  </Btn>
                  {demoMode && (
                    <Btn
                      variant="secondary"
                      fullWidth
                      onClick={() => setDemoPanelOpen(true)}
                    >
                      Abrir panel de prueba
                    </Btn>
                  )}
                </div>
              </>
            )}
            {!candidate && (
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => {
                  setJourney((current) => ({
                    ...current,
                    onboardingStatus: "completed",
                  }))
                  navigate(2)
                }}
                style={{ marginTop: 9 }}
              >
                {journey.onboardingStatus === "completed"
                  ? "Volver al inicio"
                  : "Continuar sin invitar por ahora"}
              </Btn>
            )}
          </div>
        )}

        {view === "invite" && candidate && (
          <div style={{ textAlign: "center", paddingTop: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                background: C.brandSoft,
                color: C.brand,
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
              }}
            >
              {Ic.message}
            </div>
            <h2
              style={{
                fontSize: 23,
                lineHeight: "30px",
                color: C.heading,
                margin: "0 0 9px",
              }}
            >
              ¿Quieres invitar a {candidate.name}?
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: "22px",
                color: C.muted,
                margin: "0 0 17px",
              }}
            >
              Revisa el mensaje antes de confirmar. El mapa y tus respuestas no
              se compartirán.
            </p>
            <Card style={{ textAlign: "left", marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: C.muted, margin: "0 0 4px" }}>
                Destinatario
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.heading, margin: "0 0 2px" }}>
                {candidate.name}
              </p>
              <p style={{ fontSize: 12, color: C.brand, margin: "0 0 14px" }}>
                Vinculación técnica: cuidador informal
              </p>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: "0 0 6px" }}>
                BORRADOR DE PROTOTIPO · PENDIENTE DE VALIDACIÓN
              </p>
              <p style={{ fontSize: 14, lineHeight: "21px", color: C.body, margin: 0 }}>
                Hola, me gustaría invitarte a Contigo como persona cercana para
                compartir herramientas que nos ayuden a cuidar nuestra relación.
                Si aceptas, la aplicación vinculará tu cuenta a la mía con el
                rol técnico de cuidador informal. Puedes decidir libremente si
                quieres participar.
              </p>
            </Card>
            <PrivacyNote text="Este borrador no incluye respuestas, puntuaciones, diagnósticos ni el motivo privado de tu elección." />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 20,
              }}
            >
              {demoMode ? (
                <Btn
                  fullWidth
                  onClick={() => {
                    updatePerson(candidate.id, { invitationStatus: "pending" })
                    setView("sent")
                  }}
                >
                  Simular envío de invitación
                </Btn>
              ) : (
                <>
                  <Btn fullWidth disabled>
                    Envío real pendiente de integración
                  </Btn>
                  <p style={{ fontSize: 12, lineHeight: "18px", color: C.muted, margin: 0 }}>
                    Puedes revisar el borrador, pero este prototipo no entregará
                    ningún mensaje ni cambiará el estado de la invitación.
                  </p>
                </>
              )}
              <Btn
                variant="secondary"
                fullWidth
                onClick={() => setView("choose")}
              >
                Volver sin enviar
              </Btn>
            </div>
          </div>
        )}

        {view === "sent" && candidate && (
          <div style={{ textAlign: "center", paddingTop: 36 }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: "50%",
                background: C.successSoft,
                color: C.success,
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
              }}
            >
              {Ic.checkCircle}
            </div>
            <h2 style={{ fontSize: 23, color: C.heading, margin: "0 0 9px" }}>
              Invitación simulada · pendiente de aceptación
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: "22px",
                color: C.muted,
                margin: "0 0 20px",
              }}
            >
              No se entregó ningún mensaje real. La invitación para{" "}
              {candidate.name} quedó representada como pendiente únicamente para
              probar el flujo. Esto no significa que haya aceptado ni que ya
              esté vinculada contigo.
            </p>
            <Btn
              fullWidth
              onClick={() => {
                setCandidateId(null)
                setView("choose")
              }}
            >
              Invitar a otra persona
            </Btn>
            <Btn
              variant="secondary"
              fullWidth
              onClick={() => {
                setJourney((current) => ({
                  ...current,
                  onboardingStatus: "completed",
                }))
                navigate(2)
              }}
              style={{ marginTop: 9 }}
            >
              Ir al inicio
            </Btn>
          </div>
        )}
      </main>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={18} />

      <BottomSheet
        open={demoMode && demoPanelOpen}
        onClose={() => setDemoPanelOpen(false)}
        title="Panel de prueba"
      >
        {candidate && (
          <div>
            <StatusChip label="Demostración · datos ficticios" variant="blue" />
            <p style={{ fontSize: 13, lineHeight: "20px", color: C.muted, margin: "12px 0 16px" }}>
              Estos controles representan acciones externas del cuidador. No son
              acciones disponibles para una PCS ni realizan una aceptación real.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn
                variant="secondary"
                fullWidth
                onClick={() => {
                  const caregiverId =
                    candidate.caregiverId ?? `caregiver-${candidate.id}`
                  updatePerson(candidate.id, {
                    invitationStatus: "accepted",
                    caregiverId,
                  })
                  setDemoPanelOpen(false)
                }}
              >
                Simular aceptación sin asociación
              </Btn>
              <Btn
                fullWidth
                onClick={() => {
                  const caregiverId =
                    candidate.caregiverId ?? `caregiver-${candidate.id}`
                  updatePerson(candidate.id, {
                    invitationStatus: "accepted",
                    caregiverId,
                  })
                  setJourney((current) => ({
                    ...current,
                    associations: [
                      ...current.associations.filter(
                        (item) => item.personId !== candidate.id,
                      ),
                      {
                        id: `association-${candidate.id}`,
                        pcsId: "pcs-sofia",
                        caregiverId,
                        personId: candidate.id,
                        active: true,
                      },
                    ],
                  }))
                  setDemoPanelOpen(false)
                }}
              >
                Simular aceptación y asociación activa
              </Btn>
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => {
                  updatePerson(candidate.id, {
                    invitationStatus: "declined",
                  })
                  setJourney((current) => ({
                    ...current,
                    selectedPersonId:
                      current.selectedPersonId === candidate.id
                        ? null
                        : current.selectedPersonId,
                    associations: current.associations.map((item) =>
                      item.personId === candidate.id
                        ? { ...item, active: false }
                        : item,
                    ),
                  }))
                  setDemoPanelOpen(false)
                }}
              >
                Simular rechazo o revocación
              </Btn>
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={detailPerson !== null}
        onClose={() => setDetailPersonId(null)}
        title={detailPerson?.name ?? "Detalle de la relación"}
      >
        {detailPerson &&
          (() => {
            const metrics = metricsFor(detailPerson)
            return (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 13,
                  }}
                >
                  <StatusChip
                    label={detailPerson.relationshipType ?? "Otro"}
                    variant="blue"
                  />
                  <StatusChip
                    label={`Cercanía ${metrics.ring.toLocaleLowerCase("es")}`}
                    variant="ok"
                  />
                  <StatusChip
                    label={invitationLabel(detailPerson, journey)}
                    variant={invitationVariant(detailPerson, journey)}
                  />
                </div>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: "21px",
                    color: C.body,
                    margin: "0 0 6px",
                  }}
                >
                  <strong>Lectura actual:</strong> {metrics.classification}
                </p>
                <p style={{ fontSize: 12, lineHeight: "18px", color: C.muted, margin: "0 0 10px" }}>
                  Positividad {metrics.positivity.toFixed(2)} · Negatividad{" "}
                  {metrics.negativity.toFixed(2)} · Cercanía final{" "}
                  {metrics.finalCloseness.toFixed(2)} · Ambivalencia calculada{" "}
                  {metrics.calculatedAmbivalence.toFixed(2)}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: "18px",
                    color: C.muted,
                    margin: "0 0 17px",
                  }}
                >
                  Esta descripción ayuda a reflexionar y no es un diagnóstico ni
                  una recomendación automática.
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <Btn fullWidth onClick={() => chooseCandidate(detailPerson.id)}>
                    {canStrengthenRelationship(journey, detailPerson.id) &&
                    journey.onboardingStatus === "completed"
                      ? "Fortalecer este vínculo"
                      : detailPerson.invitationStatus === "not-invited"
                        ? "Invitar a esta persona cercana"
                        : "Consultar estado de vinculación"}
                  </Btn>
                  <Btn
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      setDetailPersonId(null)
                      startAssessment(detailPerson.id)
                    }}
                  >
                    Editar respuestas
                  </Btn>
                  <Btn
                    variant="tertiary"
                    fullWidth
                    onClick={() => setDetailPersonId(null)}
                  >
                    Cerrar detalle
                  </Btn>
                </div>
              </div>
            )
          })()}
      </BottomSheet>

      <BottomSheet
        open={removeId !== null}
        onClose={() => setRemoveId(null)}
        title="Eliminar persona"
      >
        <p
          style={{
            fontSize: 14,
            lineHeight: "21px",
            color: C.muted,
            margin: "0 0 17px",
          }}
        >
          Se eliminarán también las respuestas guardadas para esta relación.
          Esta acción solo afecta tu mapa.
        </p>
        <Btn
          variant="critical"
          fullWidth
          onClick={() => {
            setJourney((current) => ({
              ...current,
              people: current.people.filter((person) => person.id !== removeId),
            }))
            setRemoveId(null)
          }}
        >
          Eliminar
        </Btn>
        <Btn
          variant="secondary"
          fullWidth
          onClick={() => setRemoveId(null)}
          style={{ marginTop: 8 }}
        >
          Cancelar
        </Btn>
      </BottomSheet>

      <BottomSheet
        open={duplicate !== null}
        onClose={() => setDuplicate(null)}
        title="Posible duplicado"
      >
        {duplicate && (
          <p
            style={{
              fontSize: 14,
              lineHeight: "21px",
              color: C.muted,
              margin: "0 0 17px",
            }}
          >
            ¿“{duplicate.name}” es la misma persona que “
            {
              journey.people.find(
                (person) => person.id === duplicate.existingId,
              )?.name
            }
            ”?
          </p>
        )}
        <Btn
          fullWidth
          onClick={() => {
            setPersonDraft("")
            setDuplicate(null)
          }}
        >
          Sí, es la misma
        </Btn>
        <Btn
          variant="secondary"
          fullWidth
          onClick={() => {
            if (duplicate) appendPerson(duplicate.name)
            setDuplicate(null)
          }}
          style={{ marginTop: 8 }}
        >
          No, es otra persona
        </Btn>
      </BottomSheet>
    </div>
  )
}
