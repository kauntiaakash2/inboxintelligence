import { ChevronRight } from 'lucide-react'
import { categories, type ClassifiedMessage } from '../../domain/models'
import { formatDate } from './formatDate'
export function MessageList({
  items,
  compact = false,
  onSelect,
  workspace = false,
  selectedId,
}: {
  items: ClassifiedMessage[]
  compact?: boolean
  workspace?: boolean
  selectedId?: string
  onSelect: (message: ClassifiedMessage) => void
}) {
  if (workspace)
    return (
      <div className="message-list mail-list" aria-label="Loaded messages">
        {items.map((message) => (
          <button
            key={message.id}
            className={`message-row mail-row ${message.unread ? 'unread' : ''} ${selectedId === message.id ? 'is-selected' : ''}`}
            aria-current={selectedId === message.id ? 'true' : undefined}
            onClick={() => onSelect(message)}
          >
            <span
              className="mail-read-state"
              aria-label={message.unread ? 'Unread' : 'Read'}
            >
              <span aria-hidden="true" />
            </span>
            <span className="mail-sender">{message.sender.name}</span>
            <span className="mail-summary">
              <strong>{message.subject}</strong>
              {(message.snippet || message.classification.category) && (
                <span className="mail-preview">
                  {' '}
                  · {message.snippet || message.classification.category}
                </span>
              )}
            </span>
            <span className="mail-date">{formatDate(message.receivedAt)}</span>
          </button>
        ))}
      </div>
    )
  return (
    <div className="message-list">
      {items.map((message) => (
        <button
          className={`message-row ${message.unread ? 'unread' : ''} ${selectedId === message.id ? 'is-selected' : ''}`}
          aria-current={selectedId === message.id ? 'true' : undefined}
          key={message.id}
          onClick={() => onSelect(message)}
        >
          <span className="sr-only">
            {message.unread ? 'Unread' : 'Read'} message.{' '}
          </span>
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
              <span className="message-snippet">
                {message.snippet || message.classification.category}
              </span>
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
