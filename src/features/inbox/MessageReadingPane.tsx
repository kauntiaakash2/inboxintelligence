import { useEffect, useRef } from 'react'
import { MessageContent, type MessageContentProps } from './MessageContent'
export function MessageReadingPane(props: MessageContentProps) {
  const pane = useRef<HTMLElement>(null)
  useEffect(() => {
    pane.current?.querySelector('h2')?.focus()
  }, [props.message.id])
  return (
    <section
      ref={pane}
      className="reading-pane"
      aria-label="Message reading pane"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          props.onClose()
        }
      }}
    >
      <MessageContent {...props} />
    </section>
  )
}
