import type { GmailRequestDiagnostics } from '../../repositories/gmailEmailRepository'
export function GmailDiagnostics({
  diagnostics,
  durationMs,
}: {
  diagnostics: GmailRequestDiagnostics
  durationMs: number | null
}) {
  return (
    <section
      className="connection-panel"
      aria-label="Gmail aggregate diagnostics"
    >
      <div>
        <strong>Gmail aggregate diagnostics · current run</strong>
        <p>
          Client-observed measurements; excludes consent time. No tokens,
          message IDs, sender information or message text.
        </p>
        <dl className="aggregate-diagnostics">
          <dt>Sync duration</dt>
          <dd
            data-sync-duration-ms={
              durationMs === null ? '' : Math.round(durationMs)
            }
          >
            {durationMs === null
              ? 'Unavailable'
              : `${Math.round(durationMs)} ms`}
          </dd>
          <dt>API request attempts</dt>
          <dd>{diagnostics.requestAttempts}</dd>
          <dt>List attempts</dt>
          <dd>{diagnostics.listAttempts}</dd>
          <dt>Metadata attempts</dt>
          <dd>{diagnostics.metadataAttempts}</dd>
          <dt>Retries attempted</dt>
          <dd>{diagnostics.retries}</dd>
        </dl>
        <p>
          Counts include failed/network attempts and completed retry attempts,
          not provider quota units. Refresh replaces this summary; disconnect
          clears it. A single run is not an accuracy, cost or optimization
          benchmark.
        </p>
      </div>
    </section>
  )
}
