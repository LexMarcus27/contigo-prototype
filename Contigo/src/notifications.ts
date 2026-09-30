import { validCaregivers, type JourneyState } from "./journey"

export type NotificationType = "reminder" | "questions" | "intimate" | "social" | "meeting"
export type NotificationAction = "relationships" | "questions" | "message" | "contact" | "meeting"

export const NOTIFICATION_STYLES = {
  reminder: { label: "Recordatorio para conexión", background: "#E5EDE2", accent: "#536B50" },
  questions: { label: "Preguntas para conectar", background: "#F1E9DF", accent: "#75634E" },
  intimate: { label: "Mensaje íntimo", background: "#EEE6F2", accent: "#735D83" },
  social: { label: "Contacto social", background: "#E9EEF5", accent: "#506A87" },
  meeting: { label: "Encuentro personal", background: "#F2E3E0", accent: "#8D4541" },
  closeness: { label: "Tejiendo cercanía", background: "#F8ECD4", accent: "#805C1D" },
} as const

interface NotificationTemplate {
  id: string
  type: NotificationType
  subtype?: "closeness"
  text: string
  showType: boolean
  action: NotificationAction
  question?: string
}

// Selected from Historias de Usuario NOTIFICACIONES. No claims about measured
// usage, past conversations, or other users are made by this simulation.
export const NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  { id: "reminder-directions", type: "reminder", text: "Los vínculos se alimentan en las dos direcciones. Hoy puedes escribirle a alguien o dejar que alguien te acompañe.", showType: false, action: "relationships" },
  { id: "reminder-return", type: "reminder", text: "A todos se nos pasan días. Retomar puede ser tan simple como un mensaje corto.", showType: true, action: "relationships" },
  { id: "questions-animals", type: "questions", text: "Si los animales pudieran hablar, ¿cuál sería el más bocón? Pregúntale a XXX qué piensa.", showType: false, action: "questions", question: "Si los animales pudieran hablar, ¿cuál sería el más bocón?" },
  { id: "questions-movie", type: "questions", text: "¿Qué película te marcó? Cuéntale a XXX por qué y pregúntale cuál es la suya.", showType: true, action: "questions", question: "¿Qué película te marcó y por qué?" },
  { id: "questions-closeness", type: "questions", subtype: "closeness", text: "¿Qué es lo que más valoras en una amistad?", showType: true, action: "questions", question: "¿Qué es lo que más valoras en una amistad?" },
  { id: "intimate-write", type: "intimate", text: "¿Le escribimos a XXX algo cercano? Te ayudo a armarlo en un minuto.", showType: false, action: "message" },
  { id: "intimate-weave", type: "intimate", text: "Tejer cercanía con XXX puede empezar con un mensaje. ¿Lo armamos juntos?", showType: true, action: "message" },
  { id: "social-hello", type: "social", text: "¿Y si saludas a XXX? Un “hola, ¿cómo vas?” basta.", showType: false, action: "contact" },
  { id: "social-check", type: "social", text: "¿Y si le preguntas a XXX cómo está?", showType: true, action: "contact" },
  { id: "meeting-invite", type: "meeting", text: "¿Y si invitas a XXX a hacer algo esta semana? Te ayudo a escribir la invitación.", showType: true, action: "meeting" },
  { id: "meeting-see", type: "meeting", text: "¿Qué tal invitar a XXX a que se vean esta semana? Un rato basta.", showType: false, action: "meeting" },
]

export interface DemoNotification extends NotificationTemplate {
  personId?: string
  personName?: string
}

export function notificationStyle(notification: DemoNotification) {
  return NOTIFICATION_STYLES[notification.subtype ?? notification.type]
}

export function createRandomNotification(
  journey: JourneyState,
  previousTemplateId?: string,
  random: () => number = Math.random,
): DemoNotification {
  const people = validCaregivers(journey)
  const eligible = NOTIFICATION_TEMPLATES.filter(
    (template) => template.action === "relationships" || people.length > 0,
  )
  const alternatives = eligible.filter((template) => template.id !== previousTemplateId)
  const pool = alternatives.length ? alternatives : eligible
  // Choose the type first so the three question examples do not bias its odds.
  const types = [...new Set(pool.map((template) => template.type))]
  const type = types[Math.floor(random() * types.length)]
  const templates = pool.filter((template) => template.type === type)
  const template = templates[Math.floor(random() * templates.length)]
  const person = template.action === "relationships"
    ? undefined
    : people[Math.floor(random() * people.length)]
  return {
    ...template,
    text: template.text.split("XXX").join(person?.name ?? ""),
    personId: person?.id,
    personName: person?.name,
  }
}
