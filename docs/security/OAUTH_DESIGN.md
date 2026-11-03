# Google authorization — Phase 2 implementation

Status: implemented and verified with mocked SDK/API services. Real Google consent/mailbox test awaits explicit owner approval. No Google project setting, secret, verification status or external account was modified. Reviewed 2026-11-02 against official sources below.

## Public client and least privilege

OAuth delegates Gmail API permission without giving this application a password. The browser is a public client: its code/config can be inspected, so `VITE_GOOGLE_CLIENT_ID` is public and a client secret cannot be protected here. Only `https://www.googleapis.com/auth/gmail.readonly` is requested. Token configuration sets `include_granted_scopes: false`, so prior broader grants are not intentionally combined; no identity/profile/write scope is requested. Read-only still grants broad mailbox authority even though the adapter retrieves a narrow metadata sample. The scope is restricted under Google's policy; verification/assessment and any exception must be reviewed before publication. None is claimed complete.

## Explicit two-step lifecycle

1. Default page loads synthetic data without contacting GIS or requesting consent.
2. Connect Gmail loads only `https://accounts.google.com/gsi/client`, with a 15-second timeout and safe retry. Mock data remains usable.
3. Authorize Gmail synchronously invokes initTokenClient/requestAccessToken from a fresh click. This avoids losing the browser's transient user activation while awaiting the script.
4. Callback validates response shape, token type/lifetime and granted scope, using both response scopes and hasGrantedAllScopes. Denial, popup cancellation/blocking, missing scope and malformed SDK responses stay in mock mode without Gmail calls. Error details are not copied to UI/logs.
5. Accepted access token lives in a JavaScript private field, never React state, snapshots, URLs, storage, logs or metric events. Only the Google API adapter obtains it at request time.
6. Expiry uses the response lifetime with a five-second safety margin, both a timer and a clock check before requests. Browser suspension can delay timers, so timer-only protection is insufficient.
7. 401 invalidates authorization and returns to mock. 403 reports refusal without an automatic retry loop. No refresh token, silent reconnect or background authorization is implemented.
8. Disconnect clears local authorization, cancels pending work, removes live records/metrics from current state and requests GIS revoke. Revocation confirmation has a 10-second deadline; reconnect is disabled during that wait so a delayed revoke cannot invalidate a fresh grant. Failure does not restore local access; the UI points to Google Account permissions.

## Races and revocation limitations

Attempt counters reject callbacks from canceled/obsolete flows; duplicate callbacks cannot replace an accepted token or convert a connected session into a late popup error. Cancel cannot programmatically close Google's own chooser. If consent finishes after cancellation, that remote grant may still exist; the stale token is ignored and users may need to remove access in their Google Account. Disconnect with no available valid token cannot prove remote revocation. Google revoke can revoke all app-granted scopes, not merely disconnect one view. External revocation is noticed on an API 401 or local expiry, not instantaneously.

Page reload clears application memory but not Google consent. JavaScript strings cannot be cryptographically zeroed, and same-origin XSS, malicious extensions/dependencies or developer tooling can access live memory. Private fields reduce accidental exposure, not this threat. No screenshots/traces/logs of real mail or tokens belong in Git or an AI conversation.

## Origins and local configuration

Use the exact owner-registered JavaScript origin on port 5173. `http://localhost:5173` and `http://127.0.0.1:5173` differ; this task does not modify either registration. Public client ID is read from ignored .env.local, never reproduced in documents. Restart Vite after changing it. Missing configuration displays a safe setup error. Local application remains a static browser client; no redirect code exchange or browser refresh-token storage is added.

## Tests and future boundary

Automated tests inject fake GoogleOAuth services, synthetic grants/errors and intercepted HTTPS responses. They cover success, missing scope, denied consent, popup cancellation, SDK exceptions, expiry, stale callbacks, disconnect and unconfirmed revocation. They never target a real account. The manual approval plan is ../quality/PHASE2_MANUAL_TEST.md.

A hosted backend for offline access requires a separate authorization-code-flow design, protected refresh-token custody, secure session/cookie/CSRF controls, tenant authorization, retention and revised cost/privacy review. Browser-first implementation does not establish SaaS security or Google verification.

Official references: [GIS token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model), [JavaScript API](https://developers.google.com/identity/oauth2/web/reference/js-reference), [error handling](https://developers.google.com/identity/oauth2/web/guides/error), [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [message listing and newest-first order](https://developers.google.com/workspace/gmail/api/guides/list-messages), [messages.get](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get). Python credential-file examples in Gmail docs are not the GIS browser flow and must not be copied into this app.

## 2026-11-03 release review

The owner confirmed http://127.0.0.1:5173 as the registered origin. Local HTTP checks confirm the actual app and that its public client configuration matches the local file without displaying the value. Google Console was not independently inspected. The owner reported two live diagnostic runs, including a confirmed 100/100, zero-failure sample; approval/coverage/revocation/reconnection evidence is tracked explicitly in ../quality/LIVE_MEASUREMENTS.md. Automated negative cases remain mocked.

The owner-run lifecycle check confirmed a first revoke callback and successful reconnection. A final revoke callback was not observed; the owner subsequently reported this app absent from Google Account connections. Local mock/disconnected state alone was never treated as proof of remote revocation. No token introspection, private browser dump or unsupported SDK/provider diagnosis was used to fill that evidence gap.
