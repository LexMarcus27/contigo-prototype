import { useEffect, useRef, useState } from "react"
import { Btn, FloatingSupportBtn, Ic, StatusBar } from "../ui"
import { SAFETY_PLAN_STORY, SAFETY_PLAN_STORY_TITLE, safetyPlanLinkLabel } from "../safety-plan-story"

interface Props {
  navigate: (screen: number) => void
  pageIndex: number
  onPageChange: (index: number) => void
  hasPlanInformation: boolean
  demoMode: boolean
  onSimulatePlanInformation: (hasInformation: boolean) => void
}

function StoryVideo({ file, title }: { file: string; title: string }) {
  const [failed, setFailed] = useState(false)
  const src = `${import.meta.env.BASE_URL}media/plan-desenredo/${file}`
  return <div className="safety-story-media">
    <video controls playsInline preload="metadata" aria-label={title} onError={() => setFailed(true)}>
      <source src={src} type="video/mp4" />
      Tu navegador no permite reproducir este video.
    </video>
    {failed && <p role="alert">No pudimos cargar el video. Puedes abrirlo por separado o continuar con el contenido.</p>}
    <a href={src} target="_blank" rel="noreferrer">Abrir video por separado</a>
    <p>Puedes pausar el video y avanzar a tu propio ritmo.</p>
  </div>
}

export default function SafetyPlanStoryScreen({ navigate, pageIndex, onPageChange, hasPlanInformation, demoMode, onSimulatePlanInformation }: Props) {
  const content = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const page = SAFETY_PLAN_STORY[pageIndex]
  const last = pageIndex === SAFETY_PLAN_STORY.length - 1

  useEffect(() => {
    content.current?.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
  }, [pageIndex])

  return <div className="safety-story-screen">
    <StatusBar />
    <header className="safety-story-header">
      <button type="button" className="safety-story-exit" onClick={() => navigate(20)} aria-label="Salir del recurso y volver a Necesito ayuda">{Ic.arrowLeft}<span>Salir del recurso</span></button>
      <p className="safety-story-kicker">Recursos narrativos · Plan para desenredar</p>
      <h1>{SAFETY_PLAN_STORY_TITLE}</h1>
      <div className="safety-story-progress" role="progressbar" aria-label="Avance del recurso" aria-valuemin={1} aria-valuemax={7} aria-valuenow={pageIndex + 1} aria-valuetext={`Pantalla ${pageIndex + 1} de 7`}>
        {SAFETY_PLAN_STORY.map((item, index) => <span key={item.id} className={index <= pageIndex ? "is-read" : ""} />)}
      </div>
      <p className="safety-story-count" aria-live="polite">Pantalla {pageIndex + 1} de {SAFETY_PLAN_STORY.length}</p>
    </header>
    <main ref={content} className="safety-story-scroller">
      <h2 ref={heading} tabIndex={-1}>{page.title}</h2>
      {page.video && <StoryVideo key={page.video} file={page.video} title={page.title} />}
      {page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {page.listHeading && <h3>{page.listHeading}</h3>}
      {page.items && <ul>{page.items.map((item) => <li key={item}>{item}</li>)}</ul>}
      {page.closing && <p>{page.closing}</p>}
      {last && demoMode && <details className="safety-story-demo">
        <summary>Probar el estado del plan</summary>
        <p>Datos ficticios para probar un plan vacío o con información. Cada simulación reemplaza el plan de prueba; los cambios solo duran en esta sesión.</p>
        <p role="status">{hasPlanInformation ? "Plan con información, aunque esté incompleto" : "Plan sin diligenciar"}</p>
        <Btn small variant="secondary" fullWidth onClick={() => onSimulatePlanInformation(false)}>Simular plan sin diligenciar</Btn>
        <Btn small variant="secondary" fullWidth onClick={() => onSimulatePlanInformation(true)}>Simular plan con información</Btn>
      </details>}
    </main>
    <FloatingSupportBtn onPress={() => navigate(6)} bottom={124} />
    <footer className="safety-story-navigation">
      <Btn variant="secondary" disabled={pageIndex === 0} onClick={() => onPageChange(pageIndex - 1)}>Anterior</Btn>
      <Btn onClick={() => last ? navigate(5) : onPageChange(pageIndex + 1)}>{last ? safetyPlanLinkLabel(hasPlanInformation) : "Siguiente"}</Btn>
    </footer>
  </div>
}
