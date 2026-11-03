# Security design and current limits

## Threat model, assets and boundaries

Real message headers/bodies, sender profiles, corrections, OAuth access and future checkpoints are sensitive. Default mode is synthetic; Phase 2 can read a real metadata sample only after explicit user consent. Automated verification remains synthetic. Boundaries are untrusted mailbox input → normalized domain → React text nodes, browser code → installed dependencies, and browser token → allowlisted Google API. See THREAT_MODEL.md for STRIDE analysis.

## Authentication, access control and sessions

Gmail delegated authorization is implemented; separate SaaS authentication is not. Gmail authorization uses GIS with gmail.readonly and explicit owner approval for account setup. A public browser client has no client secret. Keep short-lived access tokens only in memory; no localStorage/IndexedDB/logs/URLs. Do not add refresh tokens to browser persistence. Clear token references on disconnect, require user-driven renewal, and treat expiration/revocation separately. Future SaaS login requires its own authenticated session, server-side tenant checks and secure credential storage; a Google API token is not a shared app-session strategy.

## Rendering and network surfaces

React escapes subject, sender, snippet and body as text. No dangerouslySetInnerHTML, attachment execution, embedded HTML, remote fonts, remote message images or tracking pixels. If HTML becomes essential, sanitize with a maintained allowlist sanitizer, strip active content/URLs/styles, isolate it and test adversarial payloads; never assume React sanitizes inserted HTML. Keep remote content blocked by default. CORS is enforced by the browser, not an authorization mechanism; never “fix” it with a public proxy or wildcard credentialed backend.

## CSP and deployment recommendations

Before deployment test a response-header CSP such as default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'. Current React charts use inline style attributes, so a strict style policy requires hashed/nonce strategy or eliminating dynamic style attributes; do not claim the example is production-ready unchanged. Vite development HMR has different allowances. GIS requires reviewed Google script/frame/connect hosts based on official guidance, never blanket *. Add nosniff, no-referrer and a restrictive Permissions-Policy; use HTTPS. Headers are planned, not configured on a host.

## Supply chain and dependencies

Commit package-lock.json and use npm ci; CI checks run on push/PR without secrets or deployment. Review dependency scripts, licenses and changes. Initial full audit reported 12 moderate development dependency findings rooted in minimatch GHSA-g3hv-75wg-m249 (glob-pattern amplification/DoS). The graph propagates through ESLint/typescript-eslint. npm suggests incompatible major downgrades and reports no complete fix for one plugin. No force fix or untested major override was applied. Limit tooling to trusted local source/config; monitor upstream patched compatible releases. See VERIFICATION.md for runtime audit result. A clean audit is not proof of security.

## Secrets, logging and error reporting

.env and token-file patterns are ignored; .env.example contains only public placeholders. VITE_ values are bundled and public. Instrumentation copies only name/time/source/opaque job ID/duration and caps memory. Never log email subjects/addresses/bodies, provider payloads, authorization headers, page tokens or access credentials. UI errors are generic and retryable. No external error reporter exists; future reporting must scrub in the browser before transfer, be opt-in and have retention limits. Structured future logs use codes and sanitized counts.

## Retention, deletion and backups

Current reload clears application session data; bundled fixtures remain static assets. Browser devtools and build/test artifacts can persist locally but contain only synthetic data. Before persistent personal-production use implement account-wide transactional deletion, export controls, cache retention and storage failure handling. Current disconnect/revocation guidance is implemented for session-only data. Browser/profile backup may contain local mail; no cloud backup by default. Use device encryption and an OS lock for local-device risk; the app cannot enforce either.

## Incident response

Stop affected processing, disconnect/revoke exposed credentials using verified account controls, preserve sanitized diagnostic IDs without copying mail, assess dependency/token/data impact, fix and verify, then notify affected users through an established private channel when applicable. Do not publish private exploit payloads or invent a contact address/SLA. No production incident service exists.

## Security verification checklist

- Validate malformed messages and duplicate IDs; test spoofed domain suffixes and conflicting rules.
- Verify text rendering with HTML-like content; no unexpected external network requests.
- Check keyboard dialog containment and safe retry errors.
- Run dependency audits and inspect Git diff for secrets before checkpoint.
- Before OAuth: test denied scope, popup failure, wrong account, expired/revoked tokens, API 401/403/429 and redacted errors.
- Before storage: test eviction, migration, account isolation and complete deletion.
- Before deployment: verify actual CSP/security headers, origin restrictions and dependency notices.

Unimplemented controls are not claimed as passed security tests. Prototype rules do not authenticate email senders.

## Phase 2 implemented security boundary

GIS is loaded only after Connect; Authorize is a separate explicit browser gesture. Only gmail.readonly is requested, previous scope inclusion is disabled, granted scopes are verified, and tokens stay in private memory. The adapter constructs fixed-origin GET requests beneath gmail.googleapis.com/gmail/v1/users/me/messages; caller-supplied URLs/methods are not accepted. Credentials are omitted, redirects rejected, referrers suppressed and request cache disabled. Requests have a 15-second timeout. List/get calls never request snippets, bodies or attachments. Browser network/devtools may still expose authorized data to the device user; do not capture/share real-account traces.

Runtime normalization validates IDs, internal dates, headers and labels. Invalid entries count as partial failures and do not render. Missing sender becomes Unknown sender with an empty address; it is not a fabricated mailbox. Same-origin React renders text only; classification evidence does not authenticate senders.

401 clears authorization; 403 stops safely; 429/5xx get at most three attempts with backoff/jitter and Retry-After. A requested wait over 30 seconds ends the interactive job rather than retrying early. Four metadata workers are bounded; aborts and source/session keys prevent obsolete results from appearing. One failed metadata record can be skipped with an explicit failure count; auth/rate/permission failures stop the job. No full coverage is claimed.

Disconnect clears live records/metrics and token references, cancels work and attempts GIS revocation. Remote revocation failure is visible. Canceling an unfinished chooser cannot guarantee removal of a later remote grant. Same-origin XSS and compromised GIS/dependencies remain token-exposure risks; in-memory storage narrows retention, not authority. Before deployment test actual CSP rules for accounts.google.com/gsi/client, GIS frames/connections and gmail.googleapis.com against Google's then-current guidance; no hosting policy was configured here.

Phase 2 added no npm dependencies and did not apply an unverified forced audit fix. The original audit is historical; the 2026-11-03 release review below records the refreshed result. Real-mail manual verification is pending; mocked checks are recorded in VERIFICATION.md.

Reconnect is blocked while a previous revoke is pending (bounded to ten seconds), preventing an old grant-revocation request racing a newly accepted authorization. Local live data is already cleared during that wait.

## Aggregate acceptance review — 2026-11-03

Session diagnostics expose only client timing, request-attempt/retry counters and a retained-live-result count. They do not record endpoints, headers, message IDs, sender/subject/body text, tokens or account identity, and have no external reporting endpoint. The owner's live measurement is recorded only as aggregates with owner-reported provenance. Actual browser/Google logs are not accessible through the unavailable connector and are not claimed audited.

A local file/history pattern scan found no credential literals or local-configuration value matches in inspected versioned file contents. Scan results and limits are in VERIFICATION.md. Standard configured Git author metadata is intentionally preserved and is outside the mailbox-PII/file-content claim. Ignoring .env.local and generated artifacts does not protect secrets already committed, so staged file contents are checked before the release checkpoint. The prior dependency advisories remain an open historical risk; no incompatible forced upgrade was applied.

The refreshed 2026-11-03 audit still reports 12 moderate development findings and zero known runtime findings; see the verification record for commands. A timed-out revocation can leave its remote outcome uncertain even after local clearing. If an old remote revoke completes after the confirmation deadline, a later grant may require explicit reauthorization; the client cannot guarantee remote request cancellation through GIS. No reliable production-background/offline behavior or security certification is claimed.
