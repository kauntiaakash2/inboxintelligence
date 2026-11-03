# Phase 2 manual live-account acceptance

Status on 2026-11-03: live acceptance requested by the owner; two aggregate diagnostic reports and a successful 100/100, zero-failure coverage report have been received; first disconnect restored mock mode and reported Google revocation confirmed; explicit reconnection succeeded and final local mock/disconnected state was reported; final SDK confirmation was not observed, and the owner confirmed the app was absent from Google Account connections. The assistant browser connector is unavailable. No live account outcome or performance result is inferred from mocked tests. This procedure reads real Gmail metadata and changes the app's Google authorization grant within the requested test scope. No Google Cloud settings, deployment, remote publication or paid resources are involved.

## Preconditions

- Types, lint, unit/component coverage, production build and intercepted browser tests pass; inspect current VERIFICATION.md.
- Owner confirms the intended account is an OAuth test user if required and the local origin matches the configured Web client on port 5173. Do not change these settings automatically.
- VITE_GOOGLE_CLIENT_ID exists locally; do not copy it or the .env.local file into chat/reports. No client secret is needed.
- Disable automated screenshots, recordings, traces and console/network dumps for real mail. Do not collect subjects, senders, IDs, headers or tokens as test artifacts.

## Bounded owner-run procedure

1. Start/open the local app at its registered origin. Confirm mock data is the initial source and no silent chooser appears.
2. Owner clicks Connect Gmail, then Authorize Gmail, and completes the Google chooser/consent personally. Never request or enter their password through the assistant.
3. Confirm the granted permission is Gmail read-only. The app selects at most 100 IDs, follows necessary pagination and retrieves metadata only; Spam/Trash excluded. Other eligible folders are included.
4. Record only aggregate selected/loaded/failed counts and the current-run Gmail aggregate diagnostics: sync duration in ms, API request attempts, list attempts, metadata attempts and retries. Duration starts immediately before loading and ends after normalization/classification, excluding consent and paint; attempts include failed fetches and are not quota units. Do not inspect or transmit real subjects, snippets or sender values to the assistant. Owner can visually assess sender/subject/date/labels in their own UI.
5. Owner checks search/filters and an explanation locally; no bodies/attachments should be present. Optional single Refresh Gmail repeats the same bounded read if included in the approval.
6. Disconnect. Confirm mock data returns, live rows/details vanish and revocation outcome is displayed. The aggregate-only console expression `Number(document.querySelector('.app-shell')?.getAttribute('data-retained-live-message-count'))` should return 0; it reflects retained mailbox state rather than only visible rows. Reconnect explicitly once, record success/failure, then disconnect again. Reload: mock remains and no silent authorization occurs.
7. If Google revocation cannot be confirmed, owner uses their verified Google Account permissions to remove app access. Do not claim a remote grant was removed without evidence.

## Stop conditions and reporting

Stop for unexpected scopes, non-metadata requests, token/content persistence, wrong account, raw error text or unexpected write operations. Do not deliberately trigger provider rate limits or alter real email to test error paths; automated mocks cover those. Report only aggregate outcomes and unresolved issues in VERIFICATION.md. Actual consent/metadata acceptance remains pending until the owner completes the browser steps and supplies aggregate results. Do not mark a live checkbox complete based only on a fixture run. Record results separately in LIVE_MEASUREMENTS.md, with owner-reported versus directly observed provenance.

## Preflight completed on 2026-11-03

- The actual local origin http://127.0.0.1:5173 responds with the Vite application. The owner confirmed this registered origin. Served app configuration matches the local public client ID; no ID value or .env.local contents were displayed. Google Console itself was not independently inspected.
- Mocked checks cover scope denial, popup cancellation, expiry, revoked-token fallback, partial failure recovery, GET-only transport, aggregate request/retry counting and retained-live-state clearing. These do not establish actual Google account outcomes.
- All real-account screenshots, recordings, traces, network dumps and mailbox-content logging remain prohibited for this procedure. Browser tests run separately with intercepted synthetic Google responses.
- The assistant's browser connector was unavailable; the owner was asked to complete consent and report only counts/status. Never request their password or copy their authenticated browser profile.

## Live acceptance checklist

- [x] Owner reported 100 selected, 100 loaded, zero failed; more messages beyond the sample.
- [x] Latest owner report: 17,061 ms; 101 API / 1 list / 100 metadata attempts; zero retries. Earlier run separately recorded at 17,609 ms.
- [x] Owner observed disconnect restored mock data and removed live views. Retained-result count zero is regression-tested; live browser internals were not independently inspected.
- [x] Owner reported: Gmail disconnected and Google revocation confirmed. Mock mode is active.
- [x] Explicit reconnection succeeded; owner reported final local disconnected/mock state. Final remote revocation was not confirmed and is not marked successful.
- [ ] Owner checked browser logs locally and reported only whether any unexpected sensitive logging occurred.

Denied consent, expiry and partial failures are verified with mocked regression tests; do not deliberately damage real data or exhaust provider limits to reproduce them.

## Observed lifecycle follow-up

First disconnect: explicit Google revocation confirmed; mock data restored (owner report). Reconnect: successful (owner report). Final state: generic local disconnected/mock message, without an observed final remote revocation confirmation. The owner checked Google Account connections and reported this app was not listed. The account-side absence is recorded as owner-reported; the final in-app SDK confirmation remains unobserved. Do not diagnose the absent confirmation without evidence.

- [x] Owner checked Google Account connections after the unconfirmed final SDK result and reported this app was not listed. No account screenshot, identity or private content was collected.

Acceptance evidence: latest sample 100/100 loaded, zero failures; measured 17,061 ms and 101 client attempts with zero retries. First revoke confirmation, reconnection and final local disconnect were owner-observed. Retained-state zero, negative auth cases and partial-failure recovery are regression-tested; live browser internals/logs were not independently inspected. Final in-app revocation confirmation remains a documented observation limit, with owner-reported account-side grant absence as fallback evidence.
