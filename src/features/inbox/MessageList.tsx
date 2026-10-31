import { ChevronRight } from 'lucide-react'
import { categories, type ClassifiedMessage } from '../../domain/models'
import { formatDate } from './formatDate'
export function MessageList({
  items,
  compact = false,
  onSelect,
}: {
  items: ClassifiedMessage[]
  compact?: boolean
  onSelect: (message: ClassifiedMessage) => void
}) {
  return (
    <div className="message-list">
      {items.map((message) => (
        <button
          className={`message-row ${message.unread ? 'unread' : ''}`}
          key={message.id}
          onClick={() => onSelect(message)}
        >
          <span
            className={`avatar avatar-${categories.indexOf(message.classification.category) % 4}`}
          >
            {message.sender.name
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span className="message-copy">
            <span className="message-heading">
              <strong>{message.sender.name}</strong>
              {message.unread && (
                <span className="unread-dot" aria-label="Unread" />
              )}
              <span className="message-date">
                {formatDate(message.receivedAt)}
              </span>
            </span>
            <span className="message-subject">{message.subject}</span>
            {!compact && (
              <span className="message-snippet">{message.snippet}</span>
            )}
            <span className="message-tags">
              <span className="tag">{message.classification.category}</span>
              <span
                className={`priority priority-${message.classification.priority.toLowerCase()}`}
              >
                {message.classification.priority} priority
              </span>
              {!compact && (
                <span className="label-text">{message.labels.join(' · ')}</span>
              )}
            </span>
          </span>
          <ChevronRight className="row-chevron" size={16} />
        </button>
      ))}
    </div>
  )
}
