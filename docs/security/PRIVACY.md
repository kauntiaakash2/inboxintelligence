# Privacy notice and data minimization

## Current prototype

The app loads 96 generated messages with reserved `.example` addresses. It stores messages, selected view/filter state and bounded diagnostic events in browser session memory. It does not connect Gmail, request a password/token, persist messages in a database, contact an AI provider, send telemetry, or load remote email images. Development/build tools download packages when installed; that is distinct from the running application's data flow.

No real personal information is required. Displayed sender identities are synthetic. Search stays local. Reloading drops session state, though fixture data remains part of the static bundle. The local development server receives asset requests and does not receive an uploaded mailbox.

## Planned Google integration

After explicit consent, browser requests go directly to approved Google endpoints using the user's access token; Google sees API requests, account authorization and requested message IDs. The application will minimize fields to IDs, labels, sender/subject/date metadata and necessary snippets. Metadata is still sensitive. Bodies/attachments are not required by default. Scope and coverage must be explained before import. No Gmail password or browser client secret is ever required.

## Local storage and control (planned)

IndexedDB will hold minimized account-scoped metadata, derived categories, sender statistics, corrections and sync markers. Tokens stay in memory. Offer clear account disconnection, local data deletion, export and retention settings before personal production. Exported files contain sensitive content and require deliberate user action and handling guidance. Deletion must cover all related stores; revoking Google authorization and deleting local data are separate operations. No export/delete UI is claimed today because no personal cache exists.

## External transfer policy

No private message content goes to external AI services. A future integration requires a separate explicit informed consent step covering provider, exact fields, purpose, retention, cost and opt-out; default remains disabled. Anonymous-looking metadata can still identify a person. No raw content in error reports, metrics or support tickets. Any external telemetry requires opt-in and content-free allowlists.

## Future multi-user implications

Hosted account records, refresh-token custody, tenant isolation, deletion/export obligations, region/retention commitments and Google user-data requirements change the privacy boundary. Do not infer compliance from local-only architecture. Revisit this notice and obtain owner approval before collecting real user data or publishing the product.
