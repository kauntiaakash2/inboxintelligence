# Security design and current limits

## Threat model, assets and boundaries

Real message headers/bodies, sender profiles, corrections, OAuth access and future checkpoints are sensitive. Today only synthetic data exists. Boundaries are untrusted mailbox input → normalized domain → React text nodes, browser code → installed dependencies, and (future) browser token → allowlisted Google API. See THREAT_MODEL.md for STRIDE analysis.

## Authentication, access control and sessions

No authentication is implemented. Future Gmail authorization uses GIS with gmail.readonly and explicit owner approval for account setup. A public browser client has no client secret. Keep short-lived access tokens only in memory; no localStorage/IndexedDB/logs/URLs. Do not add refresh tokens to browser persistence. Clear token references on disconnect, require user-driven renewal, and treat expiration/revocation separately. Future SaaS login requires its own authenticated session, server-side tenant checks and secure credential storage; a Google API token is not a shared app-session strategy.

## Rendering and network surfaces

React escapes subject, sender, snippet and body as text. No dangerouslySetInnerHTML, attachment execution, embedded HTML, remote fonts, remote message images or tracking pixels. If HTML becomes essential, sanitize with a maintained allowlist sanitizer, strip active content/URLs/styles, isolate it and test adversarial payloads; never assume React sanitizes inserted HTML. Keep remote content blocked by default. CORS is enforced by the browser, not an authorization mechanism; never “fix” it with a public proxy or wildcard credentialed backend.

## CSP and deployment recommendations

Before deployment test a response-header CSP such as default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'. Current React charts use inline style attributes, so a strict style policy requires hashed/nonce strategy or eliminating dynamic style attributes; do not claim the example is production-ready unchanged. Vite development HMR has different allowances. Future GIS requires reviewed Google script/frame/connect hosts based on official guidance, never blanket *. Add nosniff, no-referrer and a restrictive Permissions-Policy; use HTTPS. Headers are planned, not configured on a host.

## Supply chain and dependencies

Commit package-lock.json and use npm ci; CI checks run on push/PR without secrets or deployment. Review dependency scripts, licenses and changes. Initial full audit reported 12 moderate development dependency findings rooted in minimatch GHSA-g3hv-75wg-m249 (glob-pattern amplification/DoS). The graph propagates through ESLint/typescript-eslint. npm suggests incompatible major downgrades and reports no complete fix for one plugin. No force fix or untested major override was applied. Limit tooling to trusted local source/config; monitor upstream patched compatible releases. See VERIFICATION.md for runtime audit result. A clean audit is not proof of security.

## Secrets, logging and error reporting

.env and token-file patterns are ignored; .env.example contains only public placeholders. VITE_ values are bundled and public. Instrumentation copies only name/time/source/opaque job ID/duration and caps memory. Never log email subjects/addresses/bodies, provider payloads, authorization headers, page tokens or access credentials. UI errors are generic and retryable. No external error reporter exists; future reporting must scrub in the browser before transfer, be opt-in and have retention limits. Structured future logs use codes and sanitized counts.

## Retention, deletion and backups

Current reload clears application session data; bundled fixtures remain static assets. Browser devtools and build/test artifacts can persist locally but contain only synthetic data. Before real use implement account-wide transactional deletion, export controls, cache retention, storage failure handling and token revocation guidance. Browser/profile backup may contain local mail; no cloud backup by default. Use device encryption and an OS lock for local-device risk; the app cannot enforce either.

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
