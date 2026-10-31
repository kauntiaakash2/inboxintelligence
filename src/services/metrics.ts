import type { Instrumentation, MetricEvent, MetricName } from '../domain/models'
export class MemoryInstrumentation implements Instrumentation {
  private events: MetricEvent[] = []
  track(event: MetricEvent): void {
    // Copy a whitelist: callers cannot accidentally persist extra private properties.
    this.events.push({
      name: event.name,
      timestamp: event.timestamp,
      source: event.source,
      jobId: event.jobId,
      ...(event.durationMs !== undefined
        ? { durationMs: event.durationMs }
        : {}),
    })
    if (this.events.length > 10000) this.events.shift()
  }
  snapshot(): readonly MetricEvent[] {
    return this.events.map((event) => ({ ...event }))
  }
}
export function calculateMetrics(
  events: readonly MetricEvent[],
  source: MetricEvent['source'] = 'synthetic',
) {
  const selected = events.filter((event) => event.source === source)
  const count = (name: MetricName) =>
    selected.filter((event) => event.name === name).length
  const indexed = count('message_indexed')
  const metadataOnly = count('metadata_only_classification')
  const requests = count('full_body_retrieval_requested')
  return {
    indexed,
    classified: count('classification_completed'),
    corrections: count('category_corrected'),
    metadataOnly,
    bodyRequests: requests,
    avoidance:
      metadataOnly + requests ? metadataOnly / (metadataOnly + requests) : null,
    syncFailures: count('sync_failed'),
  }
}
