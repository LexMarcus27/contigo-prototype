import { useEffect, useRef, useState, type ReactNode } from "react"
import { Btn, FloatingSupportBtn, Ic, StatusBar } from "../ui"
import { CARING_CONTENT, appendCaringIdea, toggleCaringQuestion, type CaringMessageDraft } from "../caring-messages"

interface Props {
  navigate: (screen: number) => void
  pcsName: string
  caregiverName: string
  draft: CaringMessageDraft
  onDraftChange: (next: CaringMessageDraft) => void
  onSimulateSend: (text: string) => boolean
  demoMode: boolean
  guideReviewed: boolean
  onGuideReviewed: () => void
}

type View = "welcome" | "guide" | "origin" | "compose" | "review" | "sent"
const GUIDE_TITLES = ["Un flotador en medio del mar", "Cómo acompañan estos mensajes", "Ideas para tu mensaje", "Antes de escribir", "Lo que quieres transmitir", "Preguntas para encontrar tu mensaje"]
const media = (file: string) => `${import.meta.env.BASE_URL}media/caring-messages/${file}`

function AvatarBubble({ children, expression = "welcome" }: { children: ReactNode; expression?: "welcome" | "thoughtful" | "affection" }) {
  return <div className="caring-avatar-bubble">
    <span className={`caring-avatar caring-avatar--${expression}`} aria-hidden="true" style={{ backgroundImage: `url(${media("avatar.png")})` }} />
    <p>{children}</p>
  </div>
}

function IntroductionVideo() {
  const [failed, setFailed] = useState(false)
  return <div className="caring-media">
    <video controls playsInline preload="metadata" aria-label="Mensajes de cuidado: un flotador en medio del mar" onError={() => setFailed(true)}>
      <source src={media("metafora.mp4")} type="video/mp4" />
      Tu navegador no permite reproducir este video.
    </video>
    {failed && <p role="alert">No pudimos cargar el video. Puedes abrirlo por separado o continuar leyendo.</p>}
    <a href={media("metafora.mp4")} target="_blank" rel="noreferrer">Abrir video por separado</a>
    <p>Puedes pausarlo o continuar cuando quieras.</p>
    <details><summary>Leer el guion del video</summary>{CARING_CONTENT.videoScript.map((text) => <p key={text}>{text}</p>)}</details>
  </div>
}

export default function CaringMessageScreen({ navigate, pcsName, caregiverName, draft, onDraftChange, onSimulateSend, demoMode, guideReviewed, onGuideReviewed }: Props) {
  const [view, setView] = useState<View>("welcome")
  const [page, setPage] = useState(0)
  const [returnView, setReturnView] = useState<"welcome" | "compose">("welcome")
  const [originReturnView, setOriginReturnView] = useState<"welcome" | "compose" | "guide">("welcome")
  const visitedPages = useRef(new Set<number>())
  const [notice, setNotice] = useState("")
  const [sendError, setSendError] = useState("")
  const [sentText, setSentText] = useState("")
  const scroller = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const sendLock = useRef(false)

  useEffect(() => {
    if (view !== "guide") return
    visitedPages.current.add(page)
    if (!guideReviewed && visitedPages.current.size === GUIDE_TITLES.length) onGuideReviewed()
  }, [view, page, guideReviewed, onGuideReviewed])

  const openOrigin = (from: "welcome" | "compose" | "guide") => {
    if (!guideReviewed) return
    setOriginReturnView(from)
    setView("origin")
  }

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
    setNotice("")
    setSendError("")
  }, [view, page])

  const openGuide = (index: number, from: "welcome" | "compose" = "welcome") => {
    setReturnView(from)
    setPage(index)
    setView("guide")
  }
  const addIdea = (text: string) => {
    onDraftChange(appendCaringIdea(draft, text))
    setNotice("Idea añadida al final del borrador. Puedes editarla al redactar.")
  }
  const send = () => {
    if (sendLock.current || !draft.text.trim()) return
    sendLock.current = true
    const text = draft.text.trim()
    if (!onSimulateSend(text)) {
      sendLock.current = false
      setSendError("No se pudo simular el envío. Comprueba que tu vínculo siga activo.")
      return
    }
    setSentText(text)
    setView("sent")
  }
  const title = view === "guide" ? GUIDE_TITLES[page] : view === "origin" ? "Cómo empezó todo" :
    view === "compose" ? "Escribe tu mensaje" : view === "review" ? "Revisa tu mensaje" :
    view === "sent" ? "Envío simulado" : "Mensajes de cuidado"

  const guideContent = () => {
    switch (page) {
      case 0: return <>
        <IntroductionVideo />
        <section className="caring-section"><h3>¿Qué son?</h3>{CARING_CONTENT.definition.map((text) => <p key={text}>{text.replace(/^¿Qué son\?\s*/, "")}</p>)}</section>
        <section className="caring-section caring-section--sage"><h3>Qué no son</h3><p>{CARING_CONTENT.notAdvice}</p></section>
      </>
      case 1: return <>{CARING_CONTENT.characteristics.map((item) => <section className="caring-section" key={item.title}><h3>{item.title}</h3>{item.paragraphs.map((text) => <p key={text}>{text}</p>)}</section>)}</>
      case 2: return <>
        <p>Elige una idea si te ayuda. Se añadirá al final de tu borrador y podrás cambiarla para que sea tuya.</p>
        {CARING_CONTENT.examples.map((group) => <section className="caring-section" key={group.title}>
          <h3>{group.title}</h3>{group.messages.map((text) => <div className="caring-example" key={text}><p>{text}</p><Btn small variant="secondary" onClick={() => addIdea(text)}>Añadir idea al borrador</Btn></div>)}
        </section>)}
      </>
      case 3: return <>
        <img className="caring-illustration" src={media("preparacion.png")} alt="El avatar respira, suelta los hombros y piensa en la persona con la que está conectando." />
        <section className="caring-section"><h3>Un momento para conectar</h3><ol>{CARING_CONTENT.preparation.map((text) => <li key={text}>{text}</li>)}</ol></section>
        <p>Puedes continuar a tu propio ritmo.</p>
      </>
      case 4: return <>
        <AvatarBubble expression="affection">{CARING_CONTENT.avatarLine}</AvatarBubble>
        <section className="caring-section"><h3>Estos mensajes buscan</h3><ul>{CARING_CONTENT.intentions.map((text) => <li key={text}>{text}</li>)}</ul></section>
        <section className="caring-section caring-section--sage"><h3>Y muestran que</h3><ul>{CARING_CONTENT.whatTheyShow.map((text) => <li key={text}>{text}</li>)}</ul></section>
      </>
      case 5: return <>
        <p>Para encontrar tu mensaje, elige una o varias de estas preguntas. También puedes escribir directamente.</p>
        <p className="caring-muted">Tus notas son para ti; no se incluyen en el mensaje enviado.</p>
        {CARING_CONTENT.questions.map((question, index) => <div className="caring-question" key={question}>
          <label className="caring-question-choice"><input type="checkbox" checked={draft.selectedQuestions.includes(index)} onChange={() => onDraftChange(toggleCaringQuestion(draft, index))} /><span>{question}</span></label>
          {draft.selectedQuestions.includes(index) && <><label htmlFor={`caring-note-${index}`}>Tu idea para esta pregunta</label><textarea id={`caring-note-${index}`} value={draft.notes[index] ?? ""} onChange={(event) => onDraftChange({ ...draft, notes: { ...draft.notes, [index]: event.target.value } })} placeholder="Escribe una idea si te ayuda…" /></>}
        </div>)}
        <AvatarBubble expression="thoughtful">{CARING_CONTENT.honesty}</AvatarBubble>
        {guideReviewed && <section className="caring-section caring-section--sage"><h3>Ya conoces los mensajes de cuidado</h3><p>Si quieres, ahora puedes descubrir su historia antes de escribir.</p><Btn fullWidth variant="secondary" onClick={() => openOrigin("guide")}>Cómo empezó todo</Btn></section>}
      </>
    }
  }

  return <div className="caring-screen">
    <StatusBar />
    <header className="caring-header">
      <button type="button" className="caring-back" onClick={() => navigate(23)}>{Ic.arrowLeft}<span>Volver a Tejiendo vínculos</span></button>
      <p className="caring-kicker">Para {pcsName}</p>
      <h1 ref={heading} tabIndex={-1}>{title}</h1>
      {view === "guide" && <><div className="caring-progress" role="progressbar" aria-label="Avance de la guía" aria-valuemin={1} aria-valuemax={6} aria-valuenow={page + 1}>{GUIDE_TITLES.map((text, index) => <span key={text} className={index <= page ? "is-read" : ""} />)}</div><p className="caring-count">Parte {page + 1} de 6</p></>}
    </header>
    <main className="caring-scroller caring-resource-content" ref={scroller}>
      {view === "welcome" && <>
        <AvatarBubble>{CARING_CONTENT.avatarLine}</AvatarBubble>
        <p>Un mensaje sencillo puede ayudarte a cuidar tu relación con {pcsName}. Puedes conocer la guía o empezar a escribir.</p>
        <div className="caring-actions">
          <Btn fullWidth onClick={() => openGuide(0)}>Conocer los mensajes de cuidado</Btn>
          <Btn fullWidth variant="secondary" onClick={() => setView("compose")}>{draft.text.trim() ? "Continuar mi borrador" : "Crear un mensaje"}</Btn>
          {guideReviewed && <Btn fullWidth variant="tertiary" onClick={() => openOrigin("welcome")}>Cómo empezó todo</Btn>}
        </div>
      </>}
      {view === "guide" && guideContent()}
      {view === "origin" && <>{CARING_CONTENT.origins.map((item) => <section className="caring-section" key={item.title}><h2>{item.title}</h2><img className="caring-illustration" src={media(item.image)} alt={item.alt} />{item.paragraphs.map((text) => <p key={text}>{text}</p>)}</section>)}</>}
      {view === "compose" && <>
        <AvatarBubble expression="thoughtful">{CARING_CONTENT.honesty}</AvatarBubble>
        <p>{CARING_CONTENT.writingInvitation}</p>
        <label htmlFor="caring-message-text">Tu mensaje para {pcsName}</label>
        <textarea id="caring-message-text" className="caring-editor" value={draft.text} onChange={(event) => onDraftChange({ ...draft, text: event.target.value })} placeholder={`Hola ${pcsName}, estaba pensando en lo mucho que admiro…`} />
        <p className="caring-muted">Puedes comenzar con una fortaleza o un recuerdo y seguir con lo que pensar en eso te hizo sentir.</p>
        {draft.selectedQuestions.length > 0 && <details><summary>Consultar mis ideas</summary>{draft.selectedQuestions.map((index) => <div className="caring-question" key={index}><h3>{CARING_CONTENT.questions[index]}</h3><p>{draft.notes[index] || "Todavía no has escrito una nota para esta pregunta."}</p></div>)}</details>}
        <div className="caring-actions">
          <Btn fullWidth small variant="secondary" onClick={() => openGuide(5, "compose")}>Preguntas para inspirarme</Btn>
          <Btn fullWidth small variant="secondary" onClick={() => openGuide(2, "compose")}>Consultar ejemplos</Btn>
          {guideReviewed && <Btn fullWidth small variant="tertiary" onClick={() => openOrigin("compose")}>Cómo empezó todo</Btn>}
        </div>
        <section className="caring-section caring-section--sage"><h3>Antes de revisar</h3>
        <ul><li>Expresa algo que sientas y creas que es verdad.</li><li>Evita dar consejos o decirle cómo debería sentirse.</li><li>Acompaña sin preguntas, tareas ni exigir una respuesta.</li></ul></section>
        <p className="caring-muted">El borrador se conserva mientras usas la aplicación y se borra al recargar.</p>
      </>}
      {view === "review" && <>
        <p>Comprueba el destinatario y el texto antes de confirmar.</p>
        <article className="caring-message-card"><p className="caring-muted">De {caregiverName} para {pcsName}</p><p className="caring-message-text">{draft.text}</p></article>
        <p>Esta es una simulación. El mensaje aparecerá en la bandeja de prueba de PCS durante esta sesión; no se envía a una persona real.</p>
      </>}
      {view === "sent" && <>
        <AvatarBubble expression="affection">Tu mensaje quedó disponible en la bandeja de prueba de {pcsName}.</AvatarBubble>
        <article className="caring-message-card"><p className="caring-muted">De {caregiverName} para {pcsName} · Envío simulado</p><p className="caring-message-text">{sentText}</p></article>
        <p>No se envió a una persona real. Se borrará al recargar.</p>
        <div className="caring-actions"><Btn fullWidth onClick={() => { sendLock.current = false; setView("compose") }}>Escribir otro mensaje</Btn><Btn fullWidth variant="secondary" onClick={() => navigate(23)}>Volver a Tejiendo vínculos</Btn>{demoMode && <Btn fullWidth variant="tertiary" onClick={() => navigate(27)}>Ver recepción simulada en PCS</Btn>}</div>
      </>}
      {notice && <p className="caring-feedback" role="status">{notice}</p>}
      {sendError && <p role="alert">{sendError}</p>}
    </main>
    <div className="caring-support-dock"><FloatingSupportBtn label="Proveer apoyo" onPress={() => navigate(11)} bottom={8} /></div>
    <footer className="caring-navigation">
      {view === "welcome" || view === "sent" ? <Btn fullWidth variant="secondary" onClick={() => navigate(23)}>Salir del recurso</Btn> : view === "guide" ? <>
        <Btn variant="secondary" onClick={() => page === 0 ? setView(returnView) : setPage(page - 1)}>Anterior</Btn>
        <Btn onClick={() => page === 5 ? setView("compose") : setPage(page + 1)}>{page === 5 ? "Redactar mi mensaje" : "Siguiente"}</Btn>
        <button className="caring-footer-link" type="button" onClick={() => setView("compose")}>{returnView === "compose" ? "Volver a mi mensaje" : "Ir a escribir"}</button>
      </> : view === "origin" ? <Btn fullWidth onClick={() => setView(originReturnView)}>{originReturnView === "compose" ? "Volver a mi mensaje" : originReturnView === "guide" ? "Volver a la guía" : "Volver al recurso"}</Btn> : view === "compose" ? <>
        <Btn variant="secondary" onClick={() => setNotice("Borrador conservado durante esta sesión.")}>Guardar borrador</Btn>
        <Btn disabled={!draft.text.trim()} onClick={() => setView("review")}>Revisar mensaje</Btn>
      </> : <>
        <Btn variant="secondary" onClick={() => setView("compose")}>Editar</Btn>
        <Btn disabled={!draft.text.trim()} onClick={send}>Simular envío</Btn>
      </>}
    </footer>
  </div>
}
