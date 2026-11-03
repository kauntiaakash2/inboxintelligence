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
  options: { source?: 'synthetic' | 'real'; signal?: AbortSignal } = {},
): Promise<ClassifiedMessage[]> {
  const start = now()
  const track = (name: MetricName, durationMs?: number) =>
    instrumentation.track({
      name,
      timestamp: Date.now(),
      source: options.source ?? 'synthetic',
      jobId,
      ...(durationMs !== undefined ? { durationMs } : {}),
    })
  track('sync_started')
  try {
    const messages = await repository.list()
    options.signal?.throwIfAborted()
    const classified = messages.map((message) => {
      const classification = classify(message)
      track('message_indexed')
      track('classification_completed')
      // Only mock runs simulate deeper retrieval. Real runs record metadata classification, never body requests.
      track(
        options.source !== 'real' && classification.novel
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
