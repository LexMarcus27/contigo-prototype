import { canStrengthenRelationship, type JourneyState } from "./journey"

export const CONNECTION_STEPS = [
  "message",
  "received",
  "contact",
  "meeting",
  "skills",
] as const
export type ConnectionStep = typeof CONNECTION_STEPS[number]
export type ConnectionAction = "message" | "contact" | "meeting"

export function nextConnectionStep(step: ConnectionStep): ConnectionStep {
  return CONNECTION_STEPS[
    (CONNECTION_STEPS.indexOf(step) + 1) % CONNECTION_STEPS.length
  ]
}

export function connectionStepContent(step: ConnectionStep, name?: string) {
  const person = name || "alguien cercano"
  switch (step) {
    case "message":
      return {
        title: `Escríbele a ${person}`,
        description:
          "Un mensaje corto basta. Si quieres, te ayudo a escribirlo.",
        button: "Escribir mensaje",
        tile: "Escribir mensaje para tejer cercanía",
      }
    case "received":
      return {
        title: "Vuelve a tus mensajes de cuidado",
        description:
          "Puedes leer las palabras que otras personas han guardado para ti.",
        button: "Ver mensajes recibidos",
        tile: "Ver mensajes de cuidado",
      }
    case "contact":
      return {
        title: `Acércate a ${person}`,
        description:
          "Un saludo o una conversación corta pueden ser un primer paso.",
        button: "Contactar a alguien",
        tile: "Contactar a alguien",
      }
    case "meeting":
      return {
        title: "Planea un encuentro",
        description:
          "Algo sencillo: un café, caminar o ver una serie en compañía.",
        button: "Planear un encuentro",
        tile: "Planear un encuentro",
      }
    case "skills":
      return {
        title: "Aprende una forma de conectar",
        description:
          "Explora habilidades que pueden ayudarte a cuidar tus relaciones.",
        button: "Explorar habilidades",
        tile: "Habilidades interpersonales",
      }
  }
}

// Recheck the exact active association at launch, including after a revocation.
export function connectionLaunch(
  state: JourneyState,
  personId: string,
  action: ConnectionAction,
) {
  if (
    !canStrengthenRelationship(state, personId) ||
    !["message", "contact", "meeting"].includes(action)
  )
    return null
  return { personId, action }
}
