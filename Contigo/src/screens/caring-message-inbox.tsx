import { StatusBar, FloatingSupportBtn, Ic } from "../ui"
import { type SimulatedCaringMessage } from "../caring-messages"

export default function CaringMessageInboxScreen({ navigate, messages }: {
  navigate: (screen: number) => void
  messages: SimulatedCaringMessage[]
}) {
  return <div className="caring-screen">
    <StatusBar />
    <header className="caring-header">
      <button className="caring-back" type="button" onClick={() => navigate(21)}>{Ic.arrowLeft}<span>Volver a Tejiendo vínculos</span></button>
      <h1>Mensajes de cuidado</h1>
    </header>
    <main className="caring-scroller caring-inbox">
      <p>Mensajes de tus vínculos activos que puedes volver a leer cuando quieras. No tienes que responder.</p>
      <p className="caring-muted">Bandeja de prueba: estos mensajes son simulados y se borran al recargar.</p>
      {messages.length === 0 && <p className="caring-empty" role="status">Aún no hay mensajes de cuidado de tus vínculos activos en esta sesión.</p>}
      {messages.map((message) => <article key={message.id} className="caring-message-card">
        <h2>{message.caregiverName}</h2>
        <p className="caring-muted">Para {message.pcsName} · Envío simulado</p>
        <p className="caring-message-text">{message.text}</p>
      </article>)}
    </main>
    <FloatingSupportBtn onPress={() => navigate(6)} bottom={18} />
  </div>
}
