# Google authorization design — not implemented

Reviewed against official Google documentation during bootstrap; revalidate before Phase 2. No real credentials are requested or configured.

## Fundamentals and public-client constraints

OAuth 2.0 delegates access to a resource API without sharing the user's password. Gmail authorization is distinct from signing into a future Inbox Intelligence account. A static browser application is a public client: client IDs are public, client secrets cannot be protected in a Vite bundle. Never put a client secret or long-lived refresh credential in VITE_ variables or browser storage.

## Planned browser token model

Use Google Identity Services `google.accounts.oauth2.initTokenClient` for user-triggered authorization, then `requestAccessToken` from an explicit connection/reconnect action. Google's GIS token model returns a short-lived access token to a callback for direct REST/CORS calls. The SDK's documented token flow should not be confused with a hand-built authorization-code exchange in the browser. Inspect granted scopes before requests. Hold token and expiry in memory only; use Authorization headers only with allowlisted Google endpoints. Never append credentials to logs, query strings, error objects or redirect URLs.

## Scope selection and verification

The proposed `https://www.googleapis.com/auth/gmail.readonly` allows read-only mailbox access and is classified by Google as **restricted**. Do not request gmail.modify, mail.google.com or send/delete scope. gmail.metadata has narrower access but does not support all desired future search/body behaviors; revisit whether it is sufficient before final consent design. Minimizing fetched fields does not narrow the authority of a broader scope.

Configure the Google project, authorized JavaScript origins, consent branding, user support and test users only after owner approval. Testing/public/internal status and eligible verification exceptions depend on actual account and publication context. Restricted-scope verification and security assessment considerations can materially affect SaaS economics, especially when restricted data is transferred/stored on servers. No verification or exemption is claimed. Check Google Workspace API user-data policies before release.

## Lifecycle and errors

Connect → explain read-only access and local retention → user opens GIS chooser/consent → callback validates grant → retrieve bounded metadata → show partial scope/coverage → expire or disconnect. Denied consent or popup failure returns to a safe disconnected state. A running job handles 401 by stopping safely and asking the user to reauthorize; it does not retry forever or silently persist tokens. Tokens have finite expiry from the response; renew through the user-driven GIS flow. On disconnect cancel account work and clear references; offer explicit revocation using GIS revoke with a valid token or direct users to verified Google account controls. Explain that clearing app memory alone does not revoke consent.

## Future hosted backend differences

Server authorization-code flow with protected refresh-token custody could support offline work, but requires secure redirect/state binding, backend session controls, encryption/key management, CSRF protections, tenant isolation, audit, retention/deletion and greater operational cost. Choose the documented Google server flow, not ad hoc browser refresh-token storage. This is a separate ADR and approval boundary.

## Phase 2 tests

Mock denied and partial scopes, popup failure, wrong origin, expired/revoked token, 401/403/429, cancellation and account switch. Verify browser storage and logs contain no credentials. A real consent smoke test requires explicit owner approval and must record sanitized status/counts only.

Official sources: [GIS token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model), [authorization behavior](https://developers.google.com/identity/oauth2/web/guides/how-user-authz-works), [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [OAuth production readiness](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance), [Google Workspace user data policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy). Browser scope/consent configuration must be checked again against then-current official requirements.
