import { canStrengthenRelationship, CURRENT_PCS_ID, DEMO_PEOPLE, type JourneyState } from "./journey"

// A fictitious session for the prototype, not authentication or clinical access control.
export const DEMO_CAREGIVER = { id: "caregiver-home-marta", name: "Marta" }
const DEMO_PERSON_ID = "demo-home-marta"

export interface CaregiverContext {
  caregiverId: string
  caregiverName: string
  personId: string
  pcsId: string
  pcsName: string
  associationId: string
}

export type CaregiverMessageKind = "intimate" | "caring-contact"
export type CaregiverDemoMode = "active" | "accepted-only" | "revoked"

export function caregiverContext(state: JourneyState, caregiverId: string): CaregiverContext | null {
  const person = state.people.find((item) =>
    item.caregiverId === caregiverId && canStrengthenRelationship(state, item.id),
  )
  if (!person) return null
  const association = state.associations.find((item) =>
    item.active && item.personId === person.id && item.caregiverId === caregiverId && item.pcsId === CURRENT_PCS_ID,
  )
  if (!association) return null
  return { caregiverId, caregiverName: person.name, personId: person.id, pcsId: association.pcsId, pcsName: "Sofía", associationId: association.id }
}

// Merge only this explicitly requested demo link; preserve the PCS map and other people.
export function simulateCaregiverLink(state: JourneyState, mode: CaregiverDemoMode): JourneyState {
  const existing = state.people.find((person) => person.id === DEMO_PERSON_ID)
  const person = {
    ...(existing ?? { ...DEMO_PEOPLE[0], answers: [...DEMO_PEOPLE[0].answers] }),
    id: DEMO_PERSON_ID,
    name: DEMO_CAREGIVER.name,
    caregiverId: DEMO_CAREGIVER.id,
    invitationStatus: mode === "revoked" ? "cancelled" as const : "accepted" as const,
  }
  const associations = state.associations.filter((item) => item.id !== "association-home-marta")
  return {
    ...state,
    people: existing ? state.people.map((item) => item.id === person.id ? person : item) : [...state.people, person],
    associations: [...associations, {
      id: "association-home-marta", pcsId: CURRENT_PCS_ID,
      caregiverId: DEMO_CAREGIVER.id, personId: person.id, active: mode === "active",
    }],
  }
}
