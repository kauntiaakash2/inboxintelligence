# Compose, reply and send — planned architecture only

Reviewed 2026-11-03. **No compose form, send permission, Gmail write transport or real sending is implemented.** This design is separate from the UI revision and complete reader milestone.

## Authority and incremental consent

[Google's scope catalog](https://developers.google.com/workspace/gmail/api/auth/scopes) distinguishes gmail.send from read-only access. A future send feature should request only the required additional send capability at the explicit moment the user enables it, using [GIS incremental authorization](https://developers.google.com/identity/oauth2/web/guides/use-token-model). Validate actually granted scopes and the selected account; denial leaves read-only exploration usable. Do not broaden the current constant, include-granted-scopes behavior or token service during this milestone. Future combined grants need a reviewed capability model, tests for partial grants and explicit reconnection/revocation UX. Tokens remain in memory; no browser secret/refresh-token persistence.

## Proposed compose and review experience

A separate accessible compose dialog/page owns an in-memory draft with From identity, To, optional Cc/Bcc, subject and plain-text body. No persistent drafts, attachments or autosend initially. Losing a nonempty draft through navigation/disconnect asks for explicit discard or offers user-controlled local copy; never silently send or persist it. From must be an authorized sender identity, not arbitrary user text; send-as aliases require separate eligibility handling, not assumed broad settings permission.

Recipient validation needs an actual mailbox/address parser for display-name lists, Unicode domains and supported address syntax. Reject CR/LF/header injection, malformed lists, unsupported control characters and unreasonable recipient/body sizes; deduplicate thoughtfully without claiming that syntax proves a recipient exists. Expose chips as labeled removable items with keyboard access. Show To/Cc/Bcc and attachment absence clearly on review; warn before an empty subject/body or a large recipient set. A valid recipient field alone does not authorize sending.

Reply/Reply-all/Forward need full addressing/thread context from an approved reader: Reply-To versus From, original recipients minus the sending identity, explicitly included Cc and user review. Do not guess Bcc recipients. Forward requires deliberate new recipients and review of quoted private text; do not automatically include attachments. Quote source content as data, never executable HTML. Native Gmail familiarity does not justify a hidden or auto-selected send action.

## MIME encoding and transport

The [sending guide](https://developers.google.com/workspace/gmail/api/guides/sending) specifies an RFC-compatible MIME message encoded as base64url in the raw field. Use a tested encoder, UTF-8 handling and canonical line endings; do not hand-concatenate unchecked header strings. [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322) and [RFC 6532](https://www.rfc-editor.org/rfc/rfc6532) inform header/Unicode handling. Initial scope is plain text; richer multipart/attachments require separate tests.

[users.messages.send](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send) is a POST operation returning a Message. Keep a future send transport separate from the current fixed GET-only adapter. A user-reviewed immutable draft snapshot should be used for one explicit send action. Google's [threading requirements](https://developers.google.com/workspace/gmail/api/guides/threads) include threadId, suitable References/In-Reply-To and matching subject; subject matching alone is not sufficient. RFC Message-ID and Gmail message ID are different identifiers.

## Duplicate prevention and uncertain outcomes

Proposed states: editing → review → authorization required → ready → sending → confirmed / rejected / outcome unknown. Disable repeated submission and hold an in-flight guard for the reviewed snapshot; editing a draft invalidates a prior review. This prevents double-click duplication in one running tab, **not exactly-once delivery** across tabs/reloads/network failures.

Gmail send does not document a general client idempotency-key guarantee in the consulted endpoint. Do not automatically retry a timed-out/ambiguous POST or treat a repeated Message-ID as server deduplication. If the provider may have accepted it before the response was lost, show outcome unknown, keep the draft snapshot in memory and require the user to inspect sent mail/reconcile before an explicitly confirmed retry. Do not turn on a broad historical sent-mail import just to hide uncertainty. Cross-tab durable outbox/idempotency design is later work with a separate privacy decision.

Only explicit provider success is a confirmed-send state. 400/recipient validation, 401 reauthorization, 403 permissions/policy, 429 and server/network failures need safe messages, no raw recipient/body logs and conservative retry semantics. Do not promise undo-send from the Gmail API; native Gmail's UI cancellation experience is not an automatically available API feature. Reauthorization must never replay a previously failed send automatically.

## Tests and release gate

All automatic tests use synthetic addresses/fetch doubles with external network blocked. Test recipient/header injection, non-ASCII MIME round trips, reply context/thread headers, consent denial/partial grants, token expiry, wrong account, double clicks, draft edits during review, 401/403/429/5xx, connection lost after simulated acceptance and unknown-outcome no-retry. Assert no live send occurs during development/CI. Current GET-only/read-only tests must remain in place, scoped independently from a future explicitly enabled send adapter.

Manual real sending requires a separate owner-approved milestone and recipient/test-account plan after mocked review. No send authorization, Google configuration change, paid service, draft persistence or actual message is requested or sent here.
