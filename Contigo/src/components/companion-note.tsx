import { type ReactNode } from "react"

export default function CompanionNote({
  children,
  affection = false,
}: {
  children: ReactNode
  affection?: boolean
}) {
  return (
    <div className="pcs-companion-note">
      <span
        aria-hidden="true"
        className={`caring-avatar caring-avatar--${
          affection ? "affection" : "welcome"
        }`}
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}media/caring-messages/avatar.png)`,
        }}
      />
      <div className="pcs-companion-cloud">{children}</div>
    </div>
  )
}
