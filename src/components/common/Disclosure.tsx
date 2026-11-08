import { useEffect, useRef, type ReactNode } from 'react'
/** Native disclosure, with predictable dismissal and focus restoration. */
export function Disclosure({
  label,
  className = '',
  children,
  attention = false,
}: {
  label: string
  className?: string
  children: ReactNode
  attention?: boolean
}) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (attention && ref.current) ref.current.open = true
  }, [attention])
  useEffect(() => {
    const dismiss = (event: KeyboardEvent | PointerEvent) => {
      const details = ref.current
      if (!details?.open) return
      const modal = document.querySelector('dialog[open]')
      if (modal && !modal.contains(details)) return
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        event.preventDefault()
        details.open = false
        details.querySelector('summary')?.focus()
      } else if (
        event instanceof PointerEvent &&
        event.target instanceof Node &&
        !details.contains(event.target)
      )
        details.open = false
    }
    document.addEventListener('keydown', dismiss)
    document.addEventListener('pointerdown', dismiss)
    return () => {
      document.removeEventListener('keydown', dismiss)
      document.removeEventListener('pointerdown', dismiss)
    }
  }, [])
  return (
    <details ref={ref} className={`workspace-disclosure ${className}`}>
      <summary>{label}</summary>
      <div className="disclosure-content">{children}</div>
    </details>
  )
}
