export type RelationshipType = "Familia" | "Amistades" | "Trabajo o estudio" | "Comunidad, servicio o credo" | "Otro"

export type PersonStatus = "pending" | "in-progress" | "complete"

export interface NetworkPerson {
  id: string
  name: string
  relationshipType?: RelationshipType
  answers: (number | null)[]
  status: PersonStatus
}

export interface JourneyState {
  mapStarted: boolean
  mapGenerated: boolean
  people: NetworkPerson[]
  selectedPersonId: string | null
  activityInProgress: boolean
  dailyCheckInPending: boolean
}

export type NetworkEntry = "auto" | "intro" | "progress" | "results"

export const EMPTY_JOURNEY: JourneyState = {
  mapStarted: false,
  mapGenerated: false,
  people: [],
  selectedPersonId: null,
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
  },
  {
    id: "demo-alex",
    name: "Alex",
    relationshipType: "Amistades",
    answers: demoAnswers(5, 4, 5, 4, 5, 3, 5, 2, 5, 5, 3, 5, 5, 5, 3, 2, 2, 3),
    status: "complete",
  },
  {
    id: "demo-carmen",
    name: "Carmen",
    relationshipType: "Trabajo o estudio",
    answers: demoAnswers(4, 3, 3, 3, 4, 4, 3, 4, 4, 3, 4, 3, 3, 4, 4, 4, 3, 4),
    status: "complete",
  },
  {
    id: "demo-lu",
    name: "Lu",
    relationshipType: "Comunidad, servicio o credo",
    answers: demoAnswers(4, 2, 4, 4, 3, 2, 4, 2, 4, 4, 2, 4, 4, 4, 2, 2, 2, 2),
    status: "complete",
  },
  {
    id: "demo-sam",
    name: "Sam",
    relationshipType: "Amistades",
    answers: demoAnswers(5, 4, 4, 3, 4, 5, 3, 5, 4, 4, 5, 4, 3, 4, 5, 5, 4, 5),
    status: "complete",
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
    activityInProgress: false,
    dailyCheckInPending: true,
  }
}
