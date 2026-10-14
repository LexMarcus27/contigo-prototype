export interface SafetyPlanContact {
  name: string
  label: string
  phone: string
}

// Session-only draft shared by M5 and the narrative's demo controls.
export interface SafetyPlanDraft {
  stepTexts: string[]
  contacts: SafetyPlanContact[]
  activities: string[]
  environment: string
}

export const SAFETY_PLAN_STEP_TITLES = [
  "Señales y situaciones que reconozco",
  "Lo que puedo hacer por mi cuenta",
  "Personas y lugares que pueden acompañarme",
  "Ayuda profesional y líneas de atención",
] as const

export function createSafetyPlanDraft(withExampleInformation = false): SafetyPlanDraft {
  if (!withExampleInformation) {
    return { stepTexts: SAFETY_PLAN_STEP_TITLES.map(() => ""), contacts: [], activities: [], environment: "" }
  }
  // Existing fictitious examples, available only through the demo simulation.
  return {
    stepTexts: [
      "Me siento abrumada cuando estoy sola por mucho tiempo o cuando no he dormido bien.",
      "Respiración pausada · Caminar en el parque · Escuchar música tranquila",
      "",
      "",
    ],
    contacts: [
      { name: "Mamá", label: "Familiar", phone: "+57 300 000 0001" },
      { name: "Jorge", label: "Amigo de confianza", phone: "+57 300 000 0002" },
    ],
    activities: ["Caminar juntos en el parque", "Tomar un café"],
    environment: "",
  }
}

export function safetyPlanHasInformation(plan: SafetyPlanDraft): boolean {
  return plan.stepTexts.some((text) => Boolean(text.trim())) ||
    plan.contacts.length > 0 || plan.activities.length > 0 || Boolean(plan.environment.trim())
}
