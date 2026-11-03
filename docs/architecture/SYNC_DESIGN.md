# Gmail synchronization — bounded retrieval implemented; durable sync planned

Phase 2 implements bounded list/get metadata retrieval with session memory. Full discovery, durable checkpoints, history replay and reconciliation below remain planned. This design prioritizes complete indexing and minimized retrieval depth. **Adaptive fetching decides depth and order, never whether a discovered message gets indexed.**

## Endpoint responsibilities

| Endpoint            | Role                                                                                                      | What it does not supply                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| users.messages.list | Discover message IDs/thread IDs; follow nextPageToken; choose explicit search and Spam/Trash coverage     | Does not return full message headers/body; resultSizeEstimate is not an authoritative exact count |
| users.messages.get  | Hydrate each ID with metadata headers, labels and internal date; full/raw only under a justified policy   | Does not discover the mailbox or replace history replay                                           |
| users.history.list  | Replay changes since a retained startHistoryId, handling additions/deletions/label changes and pagination | Is not a permanent complete mailbox listing; IDs are non-contiguous and retention can expire      |

## Initial import and race boundaries

Phase 2 discovers a bounded newest 100 sample with explicit partial-coverage UI; do not represent it as a complete mailbox. For full discovery, capture a baseline history marker before enumeration, page through the chosen coverage and upsert metadata by account+message ID. After enumeration replay history from the baseline to catch intervening additions, deletions and label changes. A mailbox can mutate during pagination; use history replay plus reconciliation rather than assuming an immutable snapshot. Google now explicitly documents reverse-chronological listing in its [listing guide](https://developers.google.com/workspace/gmail/api/guides/list-messages); Phase 2 follows it and sorts retrieved metadata by internalDate. Tests assert newest-first display.

Store message and thread IDs as opaque strings, and history IDs as strings; they may exceed numeric precision. `messages.get(format=metadata, metadataHeaders=[From,Subject,Date])` is the initial depth; request only necessary fields and use internalDate for consistent provider ordering. Headers and sender parsing are untrusted. Do not mistake a From address or security-themed subject for authenticated sender proof.

## Checkpoint transaction and replay

A checkpoint identifies account, coverage parameters/schema, page token or baseline history marker and last safe completion. Commit page upserts and page advancement atomically. Crash before commit means retry the page; unique-key upserts avoid duplicates. Persist per-ID failures for retry; do not declare full completion or advance a final history marker while required changes remain unapplied. Checkpoint only after all history pages are safely processed. Use a single-writer job lease per account and cancellation on disconnect/account switch.

## Incremental sync and expiration

On open, read the durable history marker and call history.list. Apply changes idempotently, fetching metadata for new/changed IDs where necessary and removing deleted IDs. For a specific deleted-message get 404, resolve as a deletion; distinguish it from a history.list 404. Google documents that stale startHistoryId can return HTTP 404, requiring a fresh full synchronization. Preserve the visible local cache as stale/partial during recovery. A resumed page token can also become invalid; restart a bounded reconciled scan rather than skipping coverage.

## Limits, retries and partial failure

Bound concurrency initially (e.g. 3–5 requests, tune only after measurements). Honor Retry-After; use bounded exponential backoff with jitter for 429, retryable 5xx and specific quota/rate-limit 403 reasons. A generic 403 is not always retryable: inspect a sanitized provider reason and stop for permission/disabled API failures. 401/token expiration requires user-driven reauthorization, not an infinite retry. Max attempts and elapsed budget end in a visible partial job; never log raw response content. Abort stops dependent work; completed metadata remains safe.

## Spam, Trash and reconciliation

messages.list excludes Spam/Trash by default. Make includeSpamTrash coverage explicit, and keep coverage fingerprint in checkpoints so changes force reconciliation. A safety-oriented review view can include Spam metadata without trusting content. Tombstones remove entries, label changes update in-place, and periodic ID reconciliation catches missed changes and coverage drift. Do not remove a local row merely because it is absent from one partial page.

## Sync-on-open limitations

No work is guaranteed while the app is closed. Optional refresh while visible needs pause/backoff and must not overlap jobs. Show last completed timestamp, partial status, current scope and reconnect state. Gmail watch/Pub/Sub push and server-managed refresh credentials require a backend and are outside this release. Browser suspension and storage eviction require safe restart and reimport.

Sources checked during bootstrap: [Google sync guide](https://developers.google.com/workspace/gmail/api/guides/sync), [messages.list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list), [messages.get](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get), [history.list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list). Validate endpoint details again before implementation.

## Current bounded implementation

No q or labelIds filter is supplied: the sample includes eligible Gmail folders such as Inbox/Sent, with includeSpamTrash=false explicitly. Follow nextPageToken while fewer than 100 unique IDs are selected; repeated tokens or malformed pages fail safely. At most 100 selected IDs are hydrated with METADATA, four workers, three attempts per transient request and 15-second deadlines. List fields omit resultSizeEstimate because it is not needed to claim coverage. Partial metadata failure counts are visible; successful metadata stays usable. Page tokens are temporary local variables, not durable checkpoints. Refresh repeats bounded discovery; no history.list or background sync occurs. Mailbox changes during paging may affect the sample; a fully consistent snapshot is not promised.
