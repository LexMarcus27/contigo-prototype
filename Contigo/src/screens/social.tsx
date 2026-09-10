import { useState } from "react"
import {
  C,
  Ic,
  Btn,
  Input,
  TextArea,
  Card,
  StatusChip,
  BottomSheet,
  PrivacyNote,
  ProgressBar,
  StatusBar,
  FloatingSupportBtn,
} from "../ui"

type Navigate = (screen: number) => void

const relationshipQuestions = [
  { text: "¿Sientes que esta persona te ha apoyado?", positive: true },
  { text: "¿Te sientes unido/a a esta persona?", positive: true },
  { text: "¿Te has sentido entendido/a por esta persona?", positive: true },
  {
    text: "¿La relación con esta persona se caracteriza por compañía y afecto?",
    positive: true,
  },
  {
    text: "¿La relación se caracteriza por exigencia, frustración, desconsideración o competencia?",
    positive: false,
  },
  {
    text: "¿Qué tanto esta relación es una fuente significativa de estrés para ti?",
    positive: false,
  },
  {
    text: "¿Con qué frecuencia tienes contacto con esta persona?",
    positive: true,
  },
  {
    text: "¿En qué grado esta relación interfiere con el apoyo que recibes de otras personas?",
    positive: false,
  },
  {
    text: "¿Con qué frecuencia esta relación te genera sentimientos encontrados?",
    positive: false,
  },
]

const relationshipScale = [
  "Nada",
  "Un poco",
  "A veces",
  "Moderadamente",
  "Mucho",
  "Extremadamente",
]

type RelationshipStage = "person" | "questions" | "result" | "invite" | "sent"

// ── Screen 13: Choose and assess a relationship ──────────────────────────────

export function MobileScreen13({ navigate }: { navigate: Navigate }) {
  const [stage, setStage] = useState<RelationshipStage>("person")
  const [personName, setPersonName] = useState("Mamá")
  const [contact, setContact] = useState("")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(relationshipQuestions.length).fill(null),
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [showResource, setShowResource] = useState(false)

  const back = () => {
    if (stage === "questions" && questionIndex > 0) {
      const previous = questionIndex - 1
      setQuestionIndex(previous)
      setSelected(answers[previous])
      return
    }
    if (stage === "result") {
      setQuestionIndex(relationshipQuestions.length - 1)
      setSelected(answers[relationshipQuestions.length - 1])
      setStage("questions")
      return
    }
    if (stage === "invite") {
      setStage("result")
      return
    }
    if (stage === "sent") {
      navigate(2)
      return
    }
    if (stage === "questions") {
      setStage("person")
      return
    }
    navigate(2)
  }

  const saveAnswer = () => {
    if (selected === null) return
    const nextAnswers = [...answers]
    nextAnswers[questionIndex] = selected
    setAnswers(nextAnswers)

    if (questionIndex < relationshipQuestions.length - 1) {
      const nextIndex = questionIndex + 1
      setQuestionIndex(nextIndex)
      setSelected(nextAnswers[nextIndex])
    } else {
      setStage("result")
    }
  }

  const restart = () => {
    setStage("person")
    setPersonName("")
    setContact("")
    setQuestionIndex(0)
    setAnswers(Array(relationshipQuestions.length).fill(null))
    setSelected(null)
  }

  const provisionalScore =
    answers.reduce<number>((total, answer, index) => {
      if (answer === null) return total
      return (
        total + (relationshipQuestions[index].positive ? answer : 7 - answer)
      )
    }, 0) / relationshipQuestions.length
  const supportiveResult = provisionalScore >= 4

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 20px 12px",
          gap: 10,
        }}
      >
        <button
          onClick={back}
          aria-label="Volver"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.brand,
            display: "flex",
            padding: 4,
          }}
        >
          {Ic.arrowLeft}
        </button>
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.heading,
              margin: 0,
            }}
          >
            Elegir una relación
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>
            Antes de enviar una invitación
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 130px" }}>
        {stage === "person" && (
          <>
            <Card
              style={{ borderLeft: `4px solid ${C.brand}`, marginBottom: 18 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: C.brandSoft,
                  color: C.brand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                {Ic.users}
              </div>
              <h2
                style={{
                  fontSize: 21,
                  lineHeight: "27px",
                  fontWeight: 700,
                  color: C.heading,
                  margin: "0 0 8px",
                }}
              >
                Piensa en alguien cercano
              </h2>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: "21px",
                  color: C.muted,
                  margin: 0,
                }}
              >
                Estas preguntas pueden ayudarte a pensar si quieres invitar a
                esa persona a acompañarte en Contigo. La decisión siempre será
                tuya.
              </p>
            </Card>

            <Input
              label="Nombre o apodo de la persona"
              value={personName}
              onChange={setPersonName}
              placeholder="Ej: Mamá, Jorge"
              helper="Solo tú puedes decidir a quién evaluar e invitar."
            />

            <div style={{ marginTop: 18 }}>
              <PrivacyNote text="Tus respuestas se guardarán de forma privada y no se compartirán con la persona evaluada." />
            </div>

            <div
              style={{
                backgroundColor: C.soft,
                borderRadius: 12,
                padding: "12px 14px",
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.heading,
                    margin: "0 0 2px",
                  }}
                >
                  Personas vinculadas
                </p>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                  1 de 5 espacios utilizados
                </p>
              </div>
              <StatusChip label="4 disponibles" variant="ok" />
            </div>

            <div
              style={{
                marginTop: 22,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Btn
                variant="primary"
                fullWidth
                disabled={!personName.trim()}
                onClick={() => setStage("questions")}
              >
                Comenzar preguntas
              </Btn>
              <Btn variant="tertiary" fullWidth onClick={() => navigate(2)}>
                Ahora no
              </Btn>
            </div>
          </>
        )}

        {stage === "questions" && (
          <>
            <ProgressBar
              value={questionIndex + 1}
              total={relationshipQuestions.length}
            />
            <p style={{ fontSize: 13, color: C.muted, margin: "8px 0 20px" }}>
              Pregunta {questionIndex + 1} de {relationshipQuestions.length} ·
              Pensando en {personName}
            </p>

            <Card style={{ marginBottom: 18 }}>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 650,
                  color: C.heading,
                  lineHeight: "27px",
                  margin: 0,
                }}
              >
                {relationshipQuestions[questionIndex].text}
              </p>
            </Card>

            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 10px" }}>
              Selecciona la opción que más se acerque:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {relationshipScale.map((label, index) => {
                const value = index + 1
                const active = selected === value
                return (
                  <button
                    key={label}
                    onClick={() => setSelected(value)}
                    style={{
                      minHeight: 48,
                      borderRadius: 12,
                      border: `2px solid ${active ? C.brand : C.border}`,
                      backgroundColor: active ? C.brandSoft : C.surface,
                      color: active ? C.brand : C.body,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 14,
                      fontWeight: active ? 650 : 450,
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        backgroundColor: active ? C.brand : C.soft,
                        color: active ? "#fff" : C.muted,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {value}
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: 20 }}>
              <Btn
                variant="primary"
                fullWidth
                disabled={selected === null}
                onClick={saveAnswer}
              >
                {questionIndex < relationshipQuestions.length - 1
                  ? "Siguiente"
                  : "Ver orientación"}
              </Btn>
            </div>
          </>
        )}

        {stage === "result" && (
          <>
            <div style={{ textAlign: "center", padding: "12px 8px 22px" }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  backgroundColor: supportiveResult ? C.brandSoft : "#FBF2E3",
                  color: supportiveResult ? C.brand : "#8A6322",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {supportiveResult ? Ic.checkCircle : Ic.info}
              </div>
              <h2
                style={{
                  fontSize: 22,
                  lineHeight: "28px",
                  fontWeight: 700,
                  color: C.heading,
                  margin: "0 0 8px",
                }}
              >
                {supportiveResult
                  ? `${personName} puede ser una opción de apoyo`
                  : "Esta relación parece importante y también compleja"}
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: C.muted,
                  lineHeight: "22px",
                  margin: 0,
                }}
              >
                {supportiveResult
                  ? "Si te sientes cómodo/a, puedes continuar y enviarle una invitación para acompañarte desde Contigo."
                  : "Algunas respuestas sugieren momentos de tensión o estrés. Puedes invitar a esta persona, considerar a alguien más o revisar un recurso antes de decidir."}
              </p>
            </div>

            <Card
              style={{
                marginBottom: 14,
                backgroundColor: supportiveResult ? "#F1F8F5" : "#FFF9EF",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: C.body,
                  lineHeight: "19px",
                  margin: 0,
                }}
              >
                <strong>La elección es tuya.</strong> Esta orientación nunca
                bloquea una invitación ni decide por ti.
              </p>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn
                variant="primary"
                fullWidth
                onClick={() => setStage("invite")}
              >
                Continuar con la invitación
              </Btn>
              {!supportiveResult && (
                <Btn
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowResource(true)}
                >
                  Ver recurso sobre relaciones
                </Btn>
              )}
              <Btn variant="tertiary" fullWidth onClick={restart}>
                Pensar en otra persona
              </Btn>
            </div>

            <p
              style={{
                fontSize: 11,
                color: C.muted,
                lineHeight: "16px",
                textAlign: "center",
                marginTop: 18,
                fontStyle: "italic",
              }}
            >
              Orientación demostrativa. Los umbrales y la puntuación final están
              pendientes de validación por el equipo investigador.
            </p>
          </>
        )}

        {stage === "invite" && (
          <>
            <Card style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: C.brandSoft,
                    color: C.brand,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {Ic.user}
                </div>
                <div>
                  <p
                    style={{ fontSize: 12, color: C.muted, margin: "0 0 2px" }}
                  >
                    Invitar a
                  </p>
                  <h2 style={{ fontSize: 18, color: C.heading, margin: 0 }}>
                    {personName}
                  </h2>
                </div>
              </div>
            </Card>

            <Input
              label="Número o correo"
              value={contact}
              onChange={setContact}
              placeholder="Ej: 300 123 4567"
              helper="La invitación no se enviará hasta que confirmes."
            />
            <div style={{ marginTop: 18 }}>
              <PrivacyNote text="La persona solo podrá consultar la información que autorices compartir con ella." />
            </div>
            <div
              style={{
                marginTop: 22,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Btn
                variant="primary"
                fullWidth
                disabled={!contact.trim()}
                onClick={() => setStage("sent")}
              >
                Enviar invitación
              </Btn>
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => setStage("result")}
              >
                Volver a la orientación
              </Btn>
            </div>
          </>
        )}

        {stage === "sent" && (
          <div style={{ textAlign: "center", paddingTop: 52 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                backgroundColor: C.brandSoft,
                color: C.brand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              {Ic.checkCircle}
            </div>
            <h2 style={{ fontSize: 24, color: C.heading, margin: "0 0 10px" }}>
              Invitación preparada
            </h2>
            <p
              style={{
                fontSize: 15,
                color: C.muted,
                lineHeight: "22px",
                margin: "0 0 24px",
              }}
            >
              Enviamos a {personName} la información para reclamar su cuenta de
              cuidador/a y vincularse contigo.
            </p>
            <Btn variant="primary" fullWidth onClick={() => navigate(2)}>
              Volver al inicio
            </Btn>
          </div>
        )}
      </div>

      {stage !== "sent" && (
        <FloatingSupportBtn onPress={() => navigate(6)} bottom={18} />
      )}

      <BottomSheet
        open={showResource}
        onClose={() => setShowResource(false)}
        title="Relaciones y conexión social"
      >
        <div
          style={{
            height: 112,
            backgroundColor: C.soft,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 38 }}>🤝</span>
        </div>
        <p
          style={{
            fontSize: 14,
            color: C.muted,
            textAlign: "center",
            lineHeight: "21px",
            marginBottom: 18,
          }}
        >
          [[Contenido narrativo pendiente de entrega y validación por el equipo
          investigador]]
        </p>
        <Btn
          variant="secondary"
          fullWidth
          onClick={() => setShowResource(false)}
        >
          Volver a mi decisión
        </Btn>
      </BottomSheet>
    </div>
  )
}

const connectionQuestions = [
  "¿Cómo sería un día perfecto para ti?",
  "Si pudieras invitar a cualquier persona del mundo a cenar, ¿a quién elegirías?",
  "¿Por qué te sientes más agradecido/a en este momento?",
  "Si pudieras despertar mañana con una nueva cualidad o habilidad, ¿cuál sería?",
  "¿Qué es lo que más valoras en una amistad?",
  "¿Hay algo que hayas soñado hacer durante mucho tiempo?",
]

type ResponseFormat = "text" | "audio" | "photo"
type ConnectionStage = "answering" | "waiting" | "revealed"

// ── Screen 14: Shared vulnerability-question flow ─────────────────────────────

export function MobileScreen14({
  navigate,
  role,
}: {
  navigate: Navigate
  role: "pcs" | "caregiver"
}) {
  const homeScreen = role === "pcs" ? 2 : 9
  const otherName = role === "pcs" ? "Mamá" : "Sofi"
  const [questionIndex, setQuestionIndex] = useState(role === "pcs" ? 0 : 2)
  const [stage, setStage] = useState<ConnectionStage>("answering")
  const [format, setFormat] = useState<ResponseFormat>("text")
  const [text, setText] = useState("")
  const [attachment, setAttachment] = useState("")
  const [completed, setCompleted] = useState(0)

  const question = connectionQuestions[questionIndex]
  const hasResponse =
    format === "text" ? Boolean(text.trim()) : Boolean(attachment)
  const ownResponse = format === "text" ? text : attachment

  const resetComposer = (nextIndex: number) => {
    setQuestionIndex(nextIndex)
    setStage("answering")
    setFormat("text")
    setText("")
    setAttachment("")
  }

  const showAnother = () => {
    resetComposer((questionIndex + 2) % connectionQuestions.length)
  }

  const nextQuestion = () => {
    setCompleted((current) => Math.min(current + 1, connectionQuestions.length))
    resetComposer((questionIndex + 3) % connectionQuestions.length)
  }

  const responsePreview = () => {
    if (format === "audio") return "🎙️ Audio de 0:18"
    if (format === "photo") return "🖼️ Fotografía seleccionada"
    return ownResponse
  }

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 20px 12px",
          gap: 10,
        }}
      >
        <button
          onClick={() => navigate(homeScreen)}
          aria-label="Volver al inicio"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.brand,
            display: "flex",
            padding: 4,
          }}
        >
          {Ic.arrowLeft}
        </button>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.heading,
              margin: 0,
            }}
          >
            Preguntas para conectar
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>
            Una conversación entre tú y {otherName}
          </p>
        </div>
        <StatusChip
          label={`${completed}/${connectionQuestions.length}`}
          variant="warm"
        />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `0 20px ${role === "pcs" ? 130 : 28}px`,
        }}
      >
        {stage === "answering" && (
          <>
            <Card
              style={{ borderLeft: `4px solid ${C.warm}`, marginBottom: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <StatusChip label="Pregunta sugerida" variant="warm" />
                <button
                  onClick={showAnother}
                  style={{
                    border: "none",
                    background: "none",
                    color: C.brand,
                    fontSize: 12,
                    fontWeight: 650,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  Ver otra
                </button>
              </div>
              <p
                style={{
                  fontSize: 20,
                  lineHeight: "29px",
                  fontWeight: 650,
                  color: C.heading,
                  margin: 0,
                }}
              >
                {question}
              </p>
            </Card>

            <p
              style={{
                fontSize: 13,
                fontWeight: 650,
                color: C.heading,
                margin: "0 0 9px",
              }}
            >
              ¿Cómo quieres responder?
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {([
                ["text", "✍️", "Texto"],
                ["audio", "🎙️", "Audio"],
                ["photo", "🖼️", "Foto"],
              ] as const).map(([value, icon, label]) => {
                const active = format === value
                return (
                  <button
                    key={value}
                    onClick={() => {
                      setFormat(value)
                      setAttachment("")
                    }}
                    aria-pressed={active}
                    style={{
                      height: 68,
                      borderRadius: 12,
                      border: `2px solid ${active ? C.brand : C.border}`,
                      backgroundColor: active ? C.brandSoft : C.surface,
                      color: active ? C.brand : C.muted,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 12,
                      fontWeight: 650,
                    }}
                  >
                    <span style={{ fontSize: 19 }}>{icon}</span>
                    {label}
                  </button>
                )
              })}
            </div>

            {format === "text" && (
              <TextArea
                label="Tu respuesta"
                value={text}
                onChange={setText}
                placeholder="Escribe lo que quieras compartir..."
                helper="Puedes responder con la extensión que te resulte cómoda."
              />
            )}

            {format === "audio" && (
              <Card style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
                <p
                  style={{
                    fontSize: 14,
                    color: C.muted,
                    lineHeight: "20px",
                    margin: "0 0 14px",
                  }}
                >
                  Graba una respuesta de voz. En el prototipo se simulará una
                  grabación breve.
                </p>
                <Btn
                  variant="secondary"
                  fullWidth
                  small
                  onClick={() => setAttachment("Audio de 0:18 listo")}
                >
                  {attachment ? "Volver a grabar" : "Grabar audio"}
                </Btn>
                {attachment && (
                  <p
                    style={{
                      fontSize: 12,
                      color: C.success,
                      fontWeight: 650,
                      margin: "10px 0 0",
                    }}
                  >
                    ● {attachment}
                  </p>
                )}
              </Card>
            )}

            {format === "photo" && (
              <Card style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                <p
                  style={{
                    fontSize: 14,
                    color: C.muted,
                    lineHeight: "20px",
                    margin: "0 0 14px",
                  }}
                >
                  Elige una fotografía que represente tu respuesta. Nada se
                  comparte hasta que confirmes.
                </p>
                <Btn
                  variant="secondary"
                  fullWidth
                  small
                  onClick={() => setAttachment("Fotografía seleccionada")}
                >
                  {attachment ? "Cambiar fotografía" : "Elegir fotografía"}
                </Btn>
                {attachment && (
                  <p
                    style={{
                      fontSize: 12,
                      color: C.success,
                      fontWeight: 650,
                      margin: "10px 0 0",
                    }}
                  >
                    ✓ {attachment}
                  </p>
                )}
              </Card>
            )}

            <div style={{ marginTop: 16 }}>
              <PrivacyNote
                text={`Tu respuesta permanecerá oculta hasta que ${otherName} también responda esta pregunta.`}
              />
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Btn
                variant="primary"
                fullWidth
                disabled={!hasResponse}
                onClick={() => setStage("waiting")}
              >
                Compartir respuesta
              </Btn>
              <Btn variant="tertiary" fullWidth onClick={showAnother}>
                Omitir y ver otra pregunta
              </Btn>
            </div>

            <div style={{ marginTop: 24 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 650,
                  color: C.muted,
                  margin: "0 0 8px",
                }}
              >
                En esta serie
              </p>
              {[
                question,
                connectionQuestions[
                  (questionIndex + 1) % connectionQuestions.length
                ],
                connectionQuestions[
                  (questionIndex + 2) % connectionQuestions.length
                ],
              ].map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "12px 0",
                    borderTop: `1px solid ${C.border}`,
                    opacity: index === 0 ? 1 : 0.46,
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: index === 0 ? C.brand : C.soft,
                      color: index === 0 ? "#fff" : C.muted,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index === 0 ? "1" : "🔒"}
                  </span>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: "19px",
                      color: C.body,
                      margin: 0,
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {stage === "waiting" && (
          <div style={{ textAlign: "center", paddingTop: 34 }}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 22,
                backgroundColor: "#FBF2E3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                fontSize: 30,
              }}
            >
              ⏳
            </div>
            <StatusChip label="Esperando respuesta" variant="warn" />
            <h2
              style={{
                fontSize: 23,
                lineHeight: "29px",
                color: C.heading,
                margin: "16px 0 9px",
              }}
            >
              Tu respuesta está guardada
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: "22px",
                color: C.muted,
                margin: "0 0 18px",
              }}
            >
              Cuando {otherName} responda, podrán ver las dos respuestas al
              mismo tiempo. Mientras tanto, ninguna respuesta será visible.
            </p>

            <Card style={{ textAlign: "left", marginBottom: 18 }}>
              <p style={{ fontSize: 12, color: C.muted, margin: "0 0 6px" }}>
                Pregunta pendiente
              </p>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: "22px",
                  fontWeight: 650,
                  color: C.heading,
                  margin: 0,
                }}
              >
                {question}
              </p>
            </Card>

            <PrivacyNote text="Puedes salir con tranquilidad. Te avisaremos cuando la otra persona responda." />

            <div
              style={{
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Btn
                variant="primary"
                fullWidth
                onClick={() => setStage("revealed")}
              >
                Simular respuesta de {otherName}
              </Btn>
              <Btn
                variant="secondary"
                fullWidth
                onClick={() => navigate(homeScreen)}
              >
                Volver al inicio
              </Btn>
            </div>
            <p
              style={{
                fontSize: 11,
                color: C.muted,
                marginTop: 12,
                fontStyle: "italic",
              }}
            >
              El primer botón solo representa el evento dentro del prototipo.
            </p>
          </div>
        )}

        {stage === "revealed" && (
          <>
            <div style={{ textAlign: "center", padding: "14px 0 20px" }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  backgroundColor: C.brandSoft,
                  color: C.brand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 15px",
                }}
              >
                {Ic.heart}
              </div>
              <StatusChip label="Ambos respondieron" variant="ok" />
              <h2
                style={{ fontSize: 22, color: C.heading, margin: "14px 0 8px" }}
              >
                Ahora pueden leer sus respuestas
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: C.muted,
                  lineHeight: "21px",
                  margin: 0,
                }}
              >
                {question}
              </p>
            </div>

            <Card
              style={{ marginBottom: 10, borderLeft: `4px solid ${C.brand}` }}
            >
              <p style={{ fontSize: 12, color: C.muted, margin: "0 0 7px" }}>
                Tu respuesta
              </p>
              <p
                style={{
                  fontSize: 15,
                  color: C.body,
                  lineHeight: "22px",
                  margin: 0,
                }}
              >
                {responsePreview()}
              </p>
            </Card>

            <Card
              style={{ marginBottom: 16, borderLeft: `4px solid ${C.warm}` }}
            >
              <p style={{ fontSize: 12, color: C.muted, margin: "0 0 7px" }}>
                Respuesta de {otherName}
              </p>
              <p
                style={{
                  fontSize: 15,
                  color: C.body,
                  lineHeight: "22px",
                  margin: 0,
                }}
              >
                Me gusta imaginar un día tranquilo, con tiempo para conversar y
                hacer algo sencillo juntos.
              </p>
            </Card>

            <PrivacyNote text="Estas respuestas se guardan de forma privada dentro de la conversación entre ustedes." />

            <div
              style={{
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Btn variant="primary" fullWidth onClick={nextQuestion}>
                Continuar con otra pregunta
              </Btn>
              <Btn
                variant="tertiary"
                fullWidth
                onClick={() => navigate(homeScreen)}
              >
                Terminar por ahora
              </Btn>
            </div>
          </>
        )}
      </div>

      {role === "pcs" && (
        <FloatingSupportBtn onPress={() => navigate(6)} bottom={18} />
      )}
    </div>
  )
}
