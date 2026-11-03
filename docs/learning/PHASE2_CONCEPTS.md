# Phase 2 concepts from the implementation

## OAuth and public clients

OAuth delegates permission to an API; it is not sharing a password or automatically establishing a SaaS login. GmailAuthorization asks for read-only mailbox authority through GIS. A browser's code/config are visible, so the public client ID belongs in VITE_GOOGLE_CLIENT_ID while a client secret must not exist here. An access token is a bearer credential: possession grants authority until expiry/revocation, so never print or persist it. The implemented alternative to a server session is short-lived memory-only access and deliberate reconnect. This sacrifices offline/background access for a smaller operating surface.

Connect prepares the SDK; Authorize calls requestAccessToken directly from a fresh user gesture. A common mistake is awaiting a script/network request before opening a popup, losing transient user activation. Another is silently requesting a token on page load. Tests assert creation does nothing, missing scope prevents Gmail calls and reload returns to mock. In an interview, distinguish client identity, user consent, API authorization and a future application session.

## Browser state and security

The token is a private field in GmailAuthorization, not React state. React receives only status/message/version through useSyncExternalStore. Tokens never enter storage, URLs, events or logs. In-memory retention does not prevent XSS, malicious extensions, compromised SDKs or devtools from observing an authorized page. React text rendering, blocked remote email resources, fixed API destinations and minimized metadata reduce exposure; deployment CSP remains future work.

useMailbox creates an AbortController per load and a source/session key per displayable result. Disconnect or expiry changes the key immediately, discards retained records/metrics and aborts work. Selection stores only message ID/key. A late response cannot restore the wrong source. This resembles generation counters used to invalidate stale asynchronous work in production clients. Test races, not only sequential happy paths. Reconnect also waits for pending remote revoke, avoiding revocation racing a new grant.

## REST and adapter boundaries

REST-style Google resources are addressed by HTTPS URLs. This adapter uses GET on a fixed /users/me/messages path for discovery and a selected message ID for hydration. HTTP status and headers describe transport outcomes; payloads must still be normalized into product domain objects. No arbitrary method/URL option is exposed, redirects are rejected and credentials/referrers/cache are suppressed. The existing EmailRepository.list contract means React does not need Gmail JSON types.

An alternative full SDK would add dependency surface without changing the need for scope, validation and error controls. A full-body request is unnecessary for current sender/subject/label rules. We omit snippets too because they contain body-derived content. Live search therefore uses sender/subject, while mock snippets remain searchable. This is a deliberate functionality/privacy trade-off, not measured optimization.

## Runtime validation and pagination

Types cannot validate network JSON at runtime. normalizeGmailMetadata checks required IDs/internalDate, validates header/label shapes and creates a domain message with an absent body. Missing optional headers get visible fallbacks; unknown addresses stay empty, not invented. The basic display parser is not a complete MIME/RFC address decoder. A From header and security-themed subject do not authenticate a sender.

messages.list provides IDs and nextPageToken; messages.get supplies required metadata. Follow pages until 100 unique IDs or exhaustion, detect repeated tokens, and never treat resultSizeEstimate as an exact mailbox count. Gmail documents newest-first listing; sorting successful metadata by internalDate preserves display order after concurrent fetching. The sample is not an atomic snapshot: the mailbox may change during pagination. Full reconciliation/checkpoints/history require later work. Test duplicate IDs, malformed pages, absent fields, empty mailbox and partial failures.

## Error handling, concurrency and observability

Four workers bound concurrent metadata requests. 401 means local authorization is no longer usable; 403 stops with a safe refusal; 429/5xx use at most three attempts with exponential delay, jitter and Retry-After. If Google asks for over 30 seconds, stop this interactive job rather than retrying earlier. Network and payload failures map to fixed descriptions. Individual unavailable/malformed metadata may be skipped with explicit loaded/failed counts. Do not copy raw provider error messages into UI or telemetry.

In production distributed systems, bounded retries protect both provider quotas and user experience; unlimited retries amplify outages. Cancellation prevents obsolete consumers from using results. Source-aware counters record session operations without private IDs/content. Real-source code tests use fake metadata: test source semantics are not evidence of actual user activity, latency, accuracy or savings. In an interview, explain the denominator and provenance before quoting any metric.

## Hands-on exercises and correctness checks

Trace a fake grant from googleFixtures through GmailAuthorization, useMailbox, GmailEmailRepository, normalizeGmailMetadata and loadInbox into App. Then deny the scope; no Gmail request should occur. Return two list pages and one malformed message; successful records should remain with a failure count. Delay discovery, disconnect, then resolve it; the page must stay mock. These exercises cover the underlying concepts without exposing a real mailbox. Use VERIFICATION.md under quality for executed commands and PHASE2_MANUAL_TEST.md for the separate owner-approved account procedure.
