import type {
  ClassifiedMessage,
  EmailRepository,
  Instrumentation,
  MetricName,
} from '../domain/models'
import { classify } from '../features/classification/classify'
export async function loadInbox(
  repository: EmailRepository,
  instrumentation: Instrumentation,
  jobId: string,
  now: () => number = () => performance.now(),
): Promise<ClassifiedMessage[]> {
  const start = now()
  const track = (name: MetricName, durationMs?: number) =>
    instrumentation.track({
      name,
      timestamp: Date.now(),
      source: 'synthetic',
      jobId,
      ...(durationMs !== undefined ? { durationMs } : {}),
    })
  track('sync_started')
  try {
    const messages = await repository.list()
    const classified = messages.map((message) => {
      const classification = classify(message)
      track('message_indexed')
      track('classification_completed')
      // This is a policy simulation. No network or body request is performed.
      track(
        classification.novel
          ? 'full_body_retrieval_requested'
          : 'metadata_only_classification',
      )
      return { ...message, classification }
    })
    track('sync_completed', now() - start)
    return classified
  } catch (error) {
    track('sync_failed', now() - start)
    throw error
  }
}
