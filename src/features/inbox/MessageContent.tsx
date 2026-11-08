import { ArrowDown, Sparkles, X } from 'lucide-react'
import type { ClassifiedMessage } from '../../domain/models'
import { formatDate } from './formatDate'
export interface MessageContentProps {
  message: ClassifiedMessage
  onClose: () => void
  isLive?: boolean
}
export function MessageContent({
  message,
  onClose,
  isLive = false,
}: MessageContentProps) {
  return (
    <>
      <div className="detail-top">
        <span className="mock-pill">
          {isLive ? 'Gmail metadata · body not retrieved' : 'Synthetic message'}
        </span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close message"
        >
          <X size={20} />
        </button>
      </div>
      <h2 id="detail-title" tabIndex={-1}>
        {message.subject}
      </h2>
      <div className="detail-sender">
        <strong>{message.sender.name}</strong>
        <span>{message.sender.address}</span>
        <span>
          {formatDate(message.receivedAt)} ·{' '}
          {message.unread ? 'Unread' : 'Read'}
        </span>
      </div>
      <div className="detail-body">
        {isLive
          ? 'Message bodies and attachments are not retrieved in metadata-only mode.'
          : (message.body ?? message.snippet)}
      </div>
      <section className="classification-box">
        <h3>
          <Sparkles size={17} /> Why this category?
        </h3>
        <div className="message-tags">
          <span className="tag">{message.classification.category}</span>
          <span
            className={`priority priority-${message.classification.priority.toLowerCase()}`}
          >
            {message.classification.priority} priority
          </span>
        </div>
        <p>{message.classification.reason}</p>
        <dl>
          <dt>Evidence confidence</dt>
          <dd>
            {Math.round(message.classification.confidence * 100)}% · heuristic,
            not probability
          </dd>
          <dt>Rule</dt>
          <dd>{message.classification.ruleId ?? 'Unknown-message fallback'}</dd>
          <dt>Priority score</dt>
          <dd>
            {message.classification.priorityScore}/100 · fixed rule weight
          </dd>
        </dl>
        <p className="quiet-note">
          Deterministic rules can misclassify messages. Corrections and learning
          are planned for Phase 6.
        </p>
      </section>
      <div className="detail-labels">
        <ArrowDown size={15} />{' '}
        {isLive ? 'Gmail labels:' : 'Gmail-style mock labels:'}{' '}
        {message.labels.join(', ')}
      </div>
    </>
  )
}
