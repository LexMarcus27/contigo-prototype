export type RelationshipType = "Familia" | "Amistades" | "Pareja" | "Trabajo o estudio" | "Comunidad, servicio o credo" | "Otro"

export type PersonStatus = "pending" | "in-progress" | "complete"
export type InvitationStatus =
  | "not-invited"
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "expired"

export type OnboardingStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "deferred"

export interface CareAssociation {
  id: string
  pcsId: string
  caregiverId: string
  personId: string
  active: boolean
}

export interface NetworkPerson {
  id: string
  name: string
  relationshipType?: RelationshipType
  answers: (number | null)[]
  status: PersonStatus
  invitationStatus: InvitationStatus
  caregiverId?: string
}

export interface JourneyState {
  mapStarted: boolean
  mapGenerated: boolean
  people: NetworkPerson[]
  selectedPersonId: string | null
  associations: CareAssociation[]
  onboardingStatus: OnboardingStatus
  onboardingWelcomeShown: boolean
  activityInProgress: boolean
  dailyCheckInPending: boolean
}

export type NetworkEntry = "auto" | "intro" | "progress" | "results"

export const EMPTY_JOURNEY: JourneyState = {
  mapStarted: false,
  mapGenerated: false,
  people: [],
  selectedPersonId: null,
  associations: [],
  onboardingStatus: "not-started",
  onboardingWelcomeShown: false,
  activityInProgress: false,
  dailyCheckInPending: true,
}

const demoAnswers = (...values: number[]) => values.map((value) => value)

export const DEMO_PEOPLE: NetworkPerson[] = [
  {
    id: "demo-m",
    name: "M.",
    relationshipType: "Familia",
    answers: demoAnswers(6, 5, 5, 5, 5, 2, 5, 1, 6, 6, 2, 6, 5, 6, 2, 2, 1, 2),
    status: "complete",
    invitationStatus: "accepted",
    caregiverId: "caregiver-m",
  },
  {
    id: "demo-alex",
    name: "Alex",
    relationshipType: "Amistades",
    answers: demoAnswers(5, 4, 5, 4, 5, 3, 5, 2, 5, 5, 3, 5, 5, 5, 3, 2, 2, 3),
    status: "complete",
    invitationStatus: "pending",
  },
  {
    id: "demo-carmen",
    name: "Carmen",
    relationshipType: "Trabajo o estudio",
    answers: demoAnswers(4, 3, 3, 3, 4, 4, 3, 4, 4, 3, 4, 3, 3, 4, 4, 4, 3, 4),
    status: "complete",
    invitationStatus: "accepted",
    caregiverId: "caregiver-carmen",
  },
  {
    id: "demo-lu",
    name: "Lu",
    relationshipType: "Comunidad, servicio o credo",
    answers: demoAnswers(4, 2, 4, 4, 3, 2, 4, 2, 4, 4, 2, 4, 4, 4, 2, 2, 2, 2),
    status: "complete",
    invitationStatus: "not-invited",
  },
  {
    id: "demo-sam",
    name: "Sam",
    relationshipType: "Amistades",
    answers: demoAnswers(5, 4, 4, 3, 4, 5, 3, 5, 4, 4, 5, 4, 3, 4, 5, 5, 4, 5),
    status: "complete",
    invitationStatus: "declined",
  },
]

export function createDemoJourney(): JourneyState {
  return {
    mapStarted: true,
    mapGenerated: true,
    people: DEMO_PEOPLE.map((person) => ({
      ...person,
      answers: [...person.answers],
    })),
    selectedPersonId: null,
    associations: [
      {
        id: "association-demo-m",
        pcsId: "pcs-sofia",
        caregiverId: "caregiver-m",
        personId: "demo-m",
        active: true,
      },
      {
        id: "association-demo-carmen",
        pcsId: "pcs-sofia",
        caregiverId: "caregiver-carmen",
        personId: "demo-carmen",
        active: false,
      },
    ],
    onboardingStatus: "completed",
    onboardingWelcomeShown: true,
    activityInProgress: false,
    dailyCheckInPending: true,
  }
}

export const CURRENT_PCS_ID = "pcs-sofia"

export function canStrengthenRelationship(
  state: JourneyState,
  personId: string | null,
  pcsId = CURRENT_PCS_ID,
) {
  if (!personId) return false
  const person = state.people.find((item) => item.id === personId)
  if (
    !person ||
    person.invitationStatus !== "accepted" ||
    !person.caregiverId
  )
    return false
  return state.associations.some(
    (association) =>
      association.personId === person.id &&
      association.pcsId === pcsId &&
      association.caregiverId === person.caregiverId &&
      association.active,
  )
}

export function validCaregivers(state: JourneyState) {
  return state.people.filter((person) =>
    canStrengthenRelationship(state, person.id),
  )
}
