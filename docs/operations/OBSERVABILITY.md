# Observability foundation

Implemented instrumentation is an in-memory allowlisted collector with source, event name, epoch timestamp, opaque job ID and optional duration. It holds at most 10,000 events, evicting oldest entries, and returns copied snapshots. `loadInbox` records start/completion/failure, indexing/classification and simulated retrieval-policy events. The category-corrected name is defined but no correction UI emits it yet. Refresh replaces the displayed collector, so counters represent the latest synthetic run.

Use monotonic performance.now for local duration; use epoch time for event correlation. Never infer production Gmail latency from fixture-processing duration. Metric formulas, denominators and limitations are in ../product/METRICS.md. There is no external telemetry, console content logger, error-reporting service or durable operational ledger.

Planned structured logs: event code, severity, operation, opaque job ID, source, attempt number, duration and aggregate counts. Prohibit sender/subject/body/token/header/page-token fields. Define error categories auth_denied, auth_expired, insufficient_scope, quota_limited, network_unavailable, provider_retryable, invalid_payload, storage_unavailable and checkpoint_expired. Map provider errors locally to these codes rather than forwarding raw payloads.

Future sync diagnostics should show coverage, last safe checkpoint age, indexed/pending/failed counts, request retries and stale/partial state. Counters must distinguish discovered IDs, unique indexed messages, hydration depth, API request count and quota units. Include cancellation and resume timing semantics. Performance studies compare policies on the same coverage with timestamps, application/rule versions and limitations, never content dumps.

Before external monitoring, establish opt-in consent, browser-side redaction, retention/deletion and access controls. For a single personal user prefer a local diagnostics/export summary with deliberate sharing. Alerts for a future service should use aggregate failure/latency signals and documented runbooks; no alerting system exists now.
