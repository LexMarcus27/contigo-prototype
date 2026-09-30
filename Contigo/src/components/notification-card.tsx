import { type CSSProperties } from "react"
import { Ic } from "../ui"
import { notificationStyle, NOTIFICATION_STYLES, type DemoNotification } from "../notifications"

export default function NotificationCard({
  notification,
  onOpen,
  onDismiss,
}: {
  notification: DemoNotification
  onOpen: () => void
  onDismiss?: () => void
}) {
  const colors = notificationStyle(notification)
  const label = notification.subtype
    ? `${NOTIFICATION_STYLES[notification.type].label} · ${colors.label}`
    : colors.label
  return (
    <div
      className="notification-card"
      data-notification-type={notification.type}
      data-notification-subtype={notification.subtype}
      style={{ "--notification-background": colors.background, "--notification-accent": colors.accent } as CSSProperties}
    >
      <button
        type="button"
        className="notification-content"
        onClick={onOpen}
        aria-label={`${label}${notification.personName ? ` con ${notification.personName}` : ""}. ${notification.text}. Abrir herramienta`}
      >
        {notification.showType && <span className="notification-type">{label}</span>}
        <span className="notification-text">{notification.text}</span>
      </button>
      {onDismiss && (
        <button type="button" className="notification-dismiss" aria-label="Cerrar notificación" onClick={onDismiss}>
          <span aria-hidden="true">{Ic.x}</span>
        </button>
      )}
    </div>
  )
}
