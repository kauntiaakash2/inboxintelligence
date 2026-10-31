export const categories = [
  'Personal',
  'Jobs and internships',
  'Education',
  'Finance',
  'Security',
  'Orders',
  'Promotions',
  'Newsletters',
  'Events and deadlines',
  'Spam review',
  'Uncategorized',
] as const
export type EmailCategory = (typeof categories)[number]
export type Priority = 'High' | 'Medium' | 'Low'
export interface EmailSender {
  id: string
  name: string
  address: string
}
export interface EmailMessage {
  id: string
  sender: EmailSender
  subject: string
  snippet: string
  receivedAt: string
  labels: string[]
  unread: boolean
  body?: string
}
export interface ClassificationResult {
  category: EmailCategory
  confidence: number
  reason: string
  ruleId?: string
  priority: Priority
  priorityScore: number
  novel: boolean
}
export interface ClassifiedMessage extends EmailMessage {
  classification: ClassificationResult
}
export interface ClassificationRule {
  id: string
  category: EmailCategory
  keywords: readonly string[]
  senderDomain?: string
  label?: string
  priority: Priority
}
export interface SenderPattern {
  senderId: string
  category: EmailCategory
  count: number
  lastSeenAt: string
  version: number
}
export interface UserCorrection {
  id: string
  messageId: string
  previous: EmailCategory
  corrected: EmailCategory
  timestamp: string
}
export interface SyncCheckpoint {
  accountId: string
  historyId?: string
  pageToken?: string
  updatedAt: string
  schemaVersion: number
}
export interface SyncJob {
  id: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  indexed: number
  failed: number
}
export const metricNames = [
  'message_indexed',
  'classification_completed',
  'category_corrected',
  'sync_started',
  'sync_completed',
  'sync_failed',
  'full_body_retrieval_requested',
  'metadata_only_classification',
] as const
export type MetricName = (typeof metricNames)[number]
export interface MetricEvent {
  name: MetricName
  timestamp: number
  source: 'synthetic' | 'real'
  jobId: string
  durationMs?: number
}
export interface EmailRepository {
  list(): Promise<EmailMessage[]>
}
export interface Instrumentation {
  track(event: MetricEvent): void
  snapshot(): readonly MetricEvent[]
}
