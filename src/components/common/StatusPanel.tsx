import { Inbox } from 'lucide-react'
export function StatusPanel({
  title,
  description,
  action,
  onAction,
  error = false,
}: {
  title: string
  description: string
  action?: string
  onAction?: () => void
  error?: boolean
}) {
  return (
    <div className="status-panel" role={error ? 'alert' : 'status'}>
      <Inbox size={28} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {action && onAction && (
        <button className="button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}
