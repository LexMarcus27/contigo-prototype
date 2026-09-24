import { useState } from "react"
import {
  BottomSheet,
  Btn,
  C,
  Card,
  FloatingSupportBtn,
  Ic,
  PrivacyNote,
  ProgressBar,
  StatusBar,
  StatusChip,
} from "../ui"
import {
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
  ring: "Íntimo" | "Personal" | "Ocasional"
  classification: "Mayormente positiva" | "Ambivalente" | "Mayormente negativa" | "Baja intensidad"
  shape: "circle" | "diamond" | "triangle" | "square"
  color: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function answer(person: NetworkPerson, questionNumber: number) {
  return person.answers[questionNumber - 2] ?? 1
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
      ring,
      classification: "Mayormente positiva",
      shape: "circle",
      color: "#3E7657",
    }
  }
  if (positivity >= 0.5 && negativity >= 0.5) {
    return {
      closeness,
      positivity,
      negativity,
      importance,
      finalCloseness,
      ring,
      classification: "Ambivalente",
      shape: "diamond",
      color: "#B57A2D",
    }
  }
  if (positivity < 0.5 && negativity >= 0.5) {
    return {
      closeness,
      positivity,
      negativity,
      importance,
      finalCloseness,
      ring,
      classification: "Mayormente negativa",
      shape: "triangle",
      color: "#A94747",
    }
  }
  return {
    closeness,
    positivity,
    negativity,
    importance,
    finalCloseness,
    ring,
    classification: "Baja intensidad",
    shape: "square",
    color: "#4C6F8A",
  }
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
    ["circle", "#3E7657", "Mayormente positiva"],
    ["diamond", "#B57A2D", "Ambivalente"],
    ["triangle", "#A94747", "Mayormente negativa"],
    ["square", "#4C6F8A", "Baja intensidad"],
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
            <span style={{ fontSize: 11, lineHeight: "15px", color: C.body }}>
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
    "Trabajo o estudio": 45,
    "Comunidad, servicio o credo": 135,
    Otro: 180,
  }

  return (
    <svg
      role="img"
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
      <path d="M160 24V296M24 160H296" stroke="#DCE8E5" strokeDasharray="4 5" />
      {[42, 77, 112].map((radius, index) => (
        <circle
          key={radius}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={index === 2 ? "#B9D4CF" : "#D5E4E1"}
          strokeWidth="1.5"
        />
      ))}
      <text x="52" y="35" fontSize="11" fontWeight="700" fill={C.muted}>
        Familia
      </text>
      <text
        x="268"
        y="35"
        fontSize="11"
        textAnchor="end"
        fontWeight="700"
        fill={C.muted}
      >
        Amistades
      </text>
      <text
        x="283"
        y="293"
        fontSize="11"
        textAnchor="end"
        fontWeight="700"
        fill={C.muted}
      >
        Trabajo / estudio
      </text>
      <text x="37" y="293" fontSize="10" fontWeight="700" fill={C.muted}>
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
        const y = clamp(center + Math.sin(angle) * radius, 39, 281)
        const size = 8 + metrics.importance * 5
        const labelY = y < 54 ? y + 24 : y > 268 ? y - 18 : y - size - 7
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
              if (event.key === "Enter" || event.key === " ")
                onSelect(person.id)
            }}
            style={{ cursor: "pointer" }}
          >
            <SvgNode x={x} y={y} size={size} metrics={metrics} />
            <text
              x={labelX}
              y={clamp(labelY, 28, 294)}
              textAnchor={anchor}
              fontSize="11.5"
              fontWeight="700"
              fill={C.heading}
              stroke="#fff"
              strokeWidth="3"
              paintOrder="stroke"
            >
              {person.name}
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
  const plot = { x: 50, y: 43, width: 238, height: 222 }
  const placed: Array<{ x: number; y: number }> = []

  return (
    <svg
      role="img"
      aria-label="Cuadrícula de positividad y negatividad"
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
      <rect
        x={plot.x}
        y={plot.y}
        width={plot.width / 2}
        height={plot.height / 2}
        fill="#F5F8F7"
      />
      <rect
        x={plot.x + plot.width / 2}
        y={plot.y}
        width={plot.width / 2}
        height={plot.height / 2}
        fill="#FBF6EC"
      />
      <rect
        x={plot.x}
        y={plot.y + plot.height / 2}
        width={plot.width / 2}
        height={plot.height / 2}
        fill="#EEF3F7"
      />
      <rect
        x={plot.x + plot.width / 2}
        y={plot.y + plot.height / 2}
        width={plot.width / 2}
        height={plot.height / 2}
        fill="#EDF6F1"
      />
      <rect
        x={plot.x}
        y={plot.y}
        width={plot.width}
        height={plot.height}
        fill="none"
        stroke="#9CB4AF"
      />
      <path
        d={`M${plot.x + plot.width / 2} ${plot.y}V${plot.y + plot.height}M${plot.x} ${plot.y + plot.height / 2}H${plot.x + plot.width}`}
        stroke="#B8CAC6"
        strokeDasharray="4 4"
      />
      <text x="57" y="59" fontSize="9.5" fontWeight="700" fill={C.muted}>
        Mayormente negativa
      </text>
      <text
        x="279"
        y="59"
        textAnchor="end"
        fontSize="9.5"
        fontWeight="700"
        fill={C.muted}
      >
        Ambivalente
      </text>
      <text x="57" y="253" fontSize="9.5" fontWeight="700" fill={C.muted}>
        Baja intensidad
      </text>
      <text
        x="279"
        y="253"
        textAnchor="end"
        fontSize="9.5"
        fontWeight="700"
        fill={C.muted}
      >
        Mayormente positiva
      </text>
      <text
        x="169"
        y="306"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={C.heading}
      >
        Positividad
      </text>
      <text x="50" y="286" fontSize="10.5" fill={C.muted}>
        Baja
      </text>
      <text x="288" y="286" textAnchor="end" fontSize="10.5" fill={C.muted}>
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
      <text x="38" y="50" textAnchor="end" fontSize="10.5" fill={C.muted}>
        Alta
      </text>
      <text x="38" y="265" textAnchor="end" fontSize="10.5" fill={C.muted}>
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
              if (event.key === "Enter" || event.key === " ")
                onSelect(person.id)
            }}
            style={{ cursor: "pointer" }}
          >
            <SvgNode x={x} y={y} size={size} metrics={metrics} />
            <text
              x={labelX}
              y={labelY}
              textAnchor={anchor}
              fontSize="11.5"
              fontWeight="700"
              fill={C.heading}
              stroke="#fff"
              strokeWidth="3"
              paintOrder="stroke"
            >
              {person.name}
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

  const currentPerson =
    journey.people.find((person) => person.id === currentPersonId) ?? null
  const detailPerson =
    journey.people.find((person) => person.id === detailPersonId) ?? null
  const candidate =
    journey.people.find((person) => person.id === candidateId) ?? null
  const completePeople = journey.people.filter(
    (person) => person.status === "complete",
  )
  const incompletePeople = journey.people.filter(
    (person) => person.status !== "complete",
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

      <main style={{ flex: 1, overflowY: "auto", padding: "0 20px 118px" }}>
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
              Mira con quiénes cuentas hoy
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
              Antes de trabajar en tejer vínculos, vale la pena reconocer
              quiénes forman parte de tu vida y cómo está tu red.
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
                setJourney((current) => ({ ...current, mapStarted: true }))
                setView("names")
              }}
            >
              Comenzar mi mapa
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
                      person.status === "complete" ? "#E8F4EE" : C.soft,
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
                        ? "0 2px 7px rgba(23,52,58,.09)"
                        : "none",
                    font: "inherit",
                    fontSize: 10.5,
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
                    fontSize: 12,
                    lineHeight: "18px",
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
                    fontSize: 12,
                    lineHeight: "18px",
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
                            fontSize: 12,
                            lineHeight: "17px",
                            color: C.muted,
                          }}
                        >
                          {person.relationshipType} · Cercanía{" "}
                          {metrics.ring.toLocaleLowerCase("es")} ·{" "}
                          {metrics.classification}
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
                Elegir un vínculo para fortalecer
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
              ¿Con cuál relación te gustaría trabajar?
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: "21px",
                color: C.muted,
                margin: "0 0 16px",
              }}
            >
              El mapa es una ayuda para reflexionar. La decisión siempre es tuya
              y puedes cambiarla después.
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
                  <StatusChip label="Persona elegida" variant="ok" />
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
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: "21px",
                    color: C.muted,
                    margin: "15px 0",
                  }}
                >
                  Puedes empezar con una actividad privada, preparar un mensaje
                  o invitar a esta persona a acompañarte en Contigo.
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <Btn fullWidth onClick={() => confirmSelection("activity")}>
                    Empezar a tejer este vínculo
                  </Btn>
                  <Btn
                    variant="secondary"
                    fullWidth
                    onClick={() => confirmSelection("invite")}
                  >
                    Invitar a acompañarme
                  </Btn>
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
                </div>
              </>
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
              La invitación solo se enviará después de tu confirmación. El mapa
              y tus respuestas no se compartirán.
            </p>
            <PrivacyNote text="Podrás revisar el mensaje antes de enviarlo y cancelar si cambias de opinión." />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 20,
              }}
            >
              <Btn fullWidth onClick={() => setView("sent")}>
                Confirmar invitación
              </Btn>
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
                background: "#E8F4EE",
                color: C.success,
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
              }}
            >
              {Ic.checkCircle}
            </div>
            <h2 style={{ fontSize: 23, color: C.heading, margin: "0 0 9px" }}>
              Tu elección quedó guardada
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: "22px",
                color: C.muted,
                margin: "0 0 20px",
              }}
            >
              Elegiste trabajar el vínculo con {candidate.name}. La invitación
              quedó representada como enviada dentro de este prototipo.
            </p>
            <Btn fullWidth onClick={() => navigate(8)}>
              Continuar a “Teje el vínculo”
            </Btn>
            <Btn
              variant="secondary"
              fullWidth
              onClick={() => navigate(2)}
              style={{ marginTop: 9 }}
            >
              Volver al inicio
            </Btn>
          </div>
        )}
      </main>

      <FloatingSupportBtn onPress={() => navigate(6)} bottom={18} />

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
                  <Btn
                    fullWidth
                    onClick={() => chooseCandidate(detailPerson.id)}
                  >
                    Considerar este vínculo
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
