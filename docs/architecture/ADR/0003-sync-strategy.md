# ADR 0003 — Sync on open with optional visible refresh

Status: Accepted as future implementation design. Date: 2026-10-31.

Context: An always-on backend and background credentials conflict with the initial cost and privacy goals. The owner accepts synchronization when opening the app.

Decision: Start with explicit user-authorized metadata retrieval, then sync on application open and optionally while visible. Use Gmail history after durable initial enumeration. Jobs have single-account serialization, resumable checkpoints, bounded retries and visible partial states.

Alternatives: Gmail watch/Pub/Sub push with a backend reduces update delay but needs server lifecycle and credential management. Frequent polling wastes quota and cannot guarantee work in a closed browser. Service workers do not provide a dependable always-running sync process.

Consequences: Closed apps become stale. Token expiration may require user-driven reauthorization. History can expire and require a full rescan. Display last success and coverage rather than promising real-time sync. Adaptive fetching changes hydration depth/order while every discovered message is indexed. Revisit once alpha evidence shows continuous freshness is necessary.
