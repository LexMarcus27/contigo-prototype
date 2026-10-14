export interface SafetyPlanStoryPage {
  id: number
  title: string
  video?: string
  paragraphs: string[]
  listHeading?: string
  items?: string[]
  closing?: string
}

export const SAFETY_PLAN_STORY_TITLE = "Las crisis también pasan"

// First (PCS) story only. Preserve the supplied narrative; these are not new clinical rules.
export const SAFETY_PLAN_STORY: SafetyPlanStoryPage[] = [
  {
    id: 1, title: "Conoce el plan para desenredar", video: "plan-desenredo-1.mp4", paragraphs: [],
  },
  {
    id: 2, title: "Cuando aparece una crisis", paragraphs: [
      "La ideación suicida y las crisis emocionales son como una curva que sube y baja. Lo que buscamos es que, cuando la crisis llegue a su punto más alto, la persona no actúe sobre el impulso de hacerse daño. Así se abre espacio para que desarrolle otras estrategias, afronte el malestar de otra manera y la situación pueda cambiar.",
      "Durante una crisis, las habilidades para resolver problemas y afrontar las dificultades se reducen. No es que no las tengas: es que, con el malestar al máximo, cuesta más acceder a ellas.",
    ],
  },
  {
    id: 3, title: "Otras formas de afrontar el malestar", paragraphs: [
      "Recuerda que la conducta suicida puede dar un alivio breve, pero no resuelve lo que duele. Además, deja menos espacio para otras estrategias más efectivas y, a veces, empeora el problema que originó el malestar.",
      "Esto no significa que dejemos de sentir malestar. Significa que podemos aprender a afrontarlo de otra manera, para que la curva baje y podamos lidiar con la situación sin hacernos daño.",
    ],
  },
  {
    id: 4, title: "Prepararnos para los momentos difíciles", video: "plan-desenredo-2.mp4", paragraphs: [],
  },
  {
    id: 5, title: "Un plan para los momentos de malestar", paragraphs: [
      "Hemos visto que se pueden aprender formas más efectivas de actuar en una crisis. También vimos que las habilidades suelen estar ahí, pero que cuesta recurrir a ellas cuando el malestar es muy intenso. Por eso es igual de importante aprender a reconocer cómo empiezan las crisis. No siempre es fácil darse cuenta de qué las desencadena.",
      "Una forma de prepararnos es construir un plan para los momentos de malestar: un plan de seguridad, o plan para desenredar. En él aprendemos a:",
    ], items: [
      "Identificar cuándo aparece la crisis.",
      "Reconocer qué estrategias podemos usar.",
      "Saber en quién apoyarnos y cómo mantenernos en contacto con esas personas.",
      "Alejarnos de lo que aumenta el riesgo.",
      "Tener a la mano contactos profesionales y de emergencia.",
      "Recordar nuestras razones para mantenernos a salvo.",
    ],
  },
  {
    id: 6, title: "El plan para desenredar", paragraphs: [
      "Tener este plan nos hace sentir más capaces de afrontar los momentos en que aparece un nudo en el tejido.",
    ], listHeading: "¿Por qué sirve el plan para desenredar?", items: [
      "El malestar sube y baja. Si logramos tolerarlo, podemos actuar de forma más efectiva.",
      "Durante una crisis, las habilidades para resolver problemas y afrontar las dificultades se reducen.",
      "Puede ser difícil identificar cuándo empieza una crisis.",
      "Tener un plan nos ayuda a actuar de forma más efectiva ante el malestar, y usarlo aumenta la confianza en nosotros mismos para enfrentarlo.",
    ], closing: "Aquí podemos construir el plan para desenredar. Siempre lo tendremos a la mano.",
  },
  {
    id: 7, title: "Tu plan puede seguir creciendo", paragraphs: [
      "Aquí puedes construir tu plan. Encontrarás algunas estrategias que pueden ayudar y también un espacio para que identifiques y escribas lo que te sirve a ti.",
      "No es un plan final. Como cualquier tejido, se va ajustando con el tiempo: puedes volver a él, cambiarlo y seguir tejiéndolo.",
    ],
  },
]

export function safetyPlanLinkLabel(hasInformation: boolean) {
  return hasInformation ? "Ir a mi plan para desenredar" : "Construir mi plan para desenredar"
}
