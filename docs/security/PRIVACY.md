# Privacy notice and data minimization

## Current prototype

The app loads 96 generated messages with reserved `.example` addresses. It stores messages, selected view/filter state and bounded diagnostic events in browser session memory. It does not connect Gmail until explicit Connect/Authorize actions. Neither mode persists messages in a database, contacts an AI provider, sends telemetry, or loads remote email images. Development/build tools download packages when installed; that is distinct from the running application's data flow.

No real personal information is required. Displayed sender identities are synthetic. Search stays local. Reloading drops session state, though fixture data remains part of the static bundle. The local development server receives asset requests and does not receive an uploaded mailbox.

## Implemented Google integration; live observations recorded separately

After explicit consent, browser requests go directly to approved Google endpoints using the user's access token; Google sees API requests, account authorization and requested message IDs. The application retrieves only IDs, labels, sender/subject/date headers and internalDate. It does not request snippets, bodies or attachments. Metadata is still sensitive. Bodies/attachments are not required by default. Scope and coverage must be explained before import. No Gmail password or browser client secret is ever required.

## Local storage and control (planned)

IndexedDB will hold minimized account-scoped metadata, derived categories, sender statistics, corrections and sync markers. Tokens stay in memory. Offer clear account disconnection, local data deletion, export and retention settings before personal production. Exported files contain sensitive content and require deliberate user action and handling guidance. Deletion must cover all related stores; revoking Google authorization and deleting local data are separate operations. No persistent cache/export/delete UI exists. Disconnect clears the live session, returns to mock and attempts Google revocation; reload clears local state without revoking remote consent.

## External transfer policy

No private message content goes to external AI services. A future integration requires a separate explicit informed consent step covering provider, exact fields, purpose, retention, cost and opt-out; default remains disabled. Anonymous-looking metadata can still identify a person. No raw content in error reports, metrics or support tickets. Any external telemetry requires opt-in and content-free allowlists.

## Future multi-user implications

Hosted account records, refresh-token custody, tenant isolation, deletion/export obligations, region/retention commitments and Google user-data requirements change the privacy boundary. Do not infer compliance from local-only architecture. Revisit this notice and obtain owner approval before collecting real user data or publishing the product.

## Phase 2 source and retention controls

Live charts cover only successfully loaded records among the newest up to 100 selected IDs, excluding Spam/Trash. They do not claim complete mailbox coverage or independently measured accuracy/savings. Token and real message state remain in application memory; there are no localStorage/sessionStorage/IndexedDB writes. A session/source key masks obsolete records immediately, state subscriptions discard them, and request cancellation prevents late reappearance. JavaScript garbage collection is not secure erasure. External revocation is detected on the next request/expiry, and unconfirmed disconnect revocation is explained. GIS itself and Google account pages may use their own cookies; the application does not store its access tokens there. Automated browser artifacts contain synthetic fixtures only. A manual live test requires explicit owner approval and count-only records without message text/tokens.

## Phase 3A: declared preferences are the only persisted application data

This supersedes the earlier blanket statement of no browser-storage writes: **mail, tokens and diagnostics remain session-only**. The app now stores one origin-local preference record, only after explicit save or skip. It contains schemaVersion, completed/skipped status, profile (optional enum), goals (enum array) and enabledCategories (existing-category array). Role and goals are user-declared, potentially personal choices; they are not anonymous by definition, inferred from email, or sent to Google/telemetry. No name, account, sender, subject, Gmail ID, body or token is accepted by this schema.

Setup is optional because mailbox access and exploration do not require profiling. Blank role/goals, Prefer not to say, skipped setup and all categories off remain supported. Goals take precedence over role defaults. Personalization affects display ordering only; indexing, discovery coverage, classifier evidence/scores, Gmail scopes, labels and retrieval do not change.

Settings Clear preferences deletes only `inbox-intelligence.preferences`. Disconnect clears Gmail state and attempts revocation while retaining declared preferences; reload retains preferences but clears auth/mail. Denied/quota storage errors keep the application usable and disclose when choices or reset may not survive reload. Invalid/unsupported/oversized records are ignored without rendering or logging their contents; reset or a new explicit save replaces/removes them. No silent migration or deletion of unfamiliar versions is attempted.

Preferences belong to this browser origin, not a Gmail identity. Shared-device users and same-origin scripts can read them; browser backups may copy them. There is no encryption, cross-tab update listener, automatic expiration or multi-device portability. Future explicit preference-only export/import must validate the schema and explain the portable file's contents. Full email caching requires a **separate** privacy decision, account-scoped IndexedDB, retention/deletion controls and review; a local preference key does not authorize durable mail storage. No real mail was accessed during Phase 3A verification.
