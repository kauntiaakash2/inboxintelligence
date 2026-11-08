import { useEffect, useRef } from 'react'
import type { ClassifiedMessage } from '../../domain/models'
import { MessageContent } from './MessageContent'
export function MessageDetail({
  message,
  onClose,
  isLive = false,
}: {
  message: ClassifiedMessage
  onClose: () => void
  isLive?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement
    const element = dialog.current
    element?.showModal()
    return () => {
      element?.close()
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className="message-dialog"
      onCancel={onClose}
      aria-labelledby="detail-title"
    >
      <MessageContent message={message} onClose={onClose} isLive={isLive} />
    </dialog>
  )
}
