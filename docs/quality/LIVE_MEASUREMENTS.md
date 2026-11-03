# Live Gmail acceptance measurements

## Evidence boundary

The owner requested a bounded real-account test on 2026-11-03 at http://127.0.0.1:5173. The assistant browser connector is unavailable. The owner supplied the following aggregate diagnostics from the current live run on 2026-11-03. These are **owner-reported client measurements**, not an assistant-observed browser run. The latest report confirms 100 selected, 100 loaded, zero failed and more messages beyond the sample. The owner confirmed disconnect returned to mock mode and Google revocation was confirmed. The owner then reported explicit reconnection succeeded, followed by a locally disconnected/mock state. The final SDK revocation confirmation was not observed, but the owner subsequently checked Google Account connections and reported this app was not listed. This is owner-reported grant absence, not an independently inspected account or a recovered SDK callback. Mocked tests and theoretical arithmetic remain separate evidence.

| Live observation                               | Result                                                                               | Evidence source                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Selected message IDs (count only, maximum 100) | 100                                                                                  | Owner-reported coverage, latest run                                             |
| Successfully loaded metadata count             | 100                                                                                  | Owner-reported coverage, latest run                                             |
| Failed metadata count                          | 0                                                                                    | Owner-reported coverage, latest run                                             |
| Client-observed sync duration (ms)             | 17,061 (17.061 seconds)                                                              | Owner-reported diagnostics, latest run                                          |
| API request attempts                           | 101                                                                                  | Owner-reported live diagnostics                                                 |
| List request attempts                          | 1                                                                                    | Owner-reported live diagnostics                                                 |
| Metadata request attempts                      | 100                                                                                  | Owner-reported live diagnostics                                                 |
| Retries actually attempted                     | 0                                                                                    | Owner-reported live diagnostics                                                 |
| Mock mode restored on disconnect               | Confirmed; 96-message synthetic dashboard restored                                   | Owner-reported live UI observation                                              |
| Retained live-record count after disconnect    | 0 verified in mocked state-level checks; not independently inspected in live browser | Regression tests plus owner-observed return to mock                             |
| Google revocation callback confirmed           | Confirmed on first disconnect                                                        | Owner-reported fixed application status                                         |
| Explicit reconnection succeeded                | Confirmed                                                                            | Owner selected successful reconnection; second revocation initially unconfirmed |
| Final disconnect completed                     | Local disconnected/mock state confirmed; app absent in Google Account connections    | Owner-reported application status and Google Account review                     |
| Unexpected sensitive browser logging           | Not independently inspected                                                          | Owner may report yes/no without copying logs                                    |

## Separate reported runs

| Run reported on 2026-11-03            | Selected / loaded / failed         | Duration (ms) | API / list / metadata attempts | Retries | Evidence                                     |
| ------------------------------------- | ---------------------------------- | ------------- | ------------------------------ | ------- | -------------------------------------------- |
| Earlier diagnostic report             | Coverage not supplied for that run | 17,609        | 101 / 1 / 100                  | 0       | Owner-reported live diagnostics only         |
| Latest diagnostic and coverage report | 100 / 100 / 0                      | 17,061        | 101 / 1 / 100                  | 0       | Owner-reported live diagnostics and coverage |

The latest coverage states more messages exist beyond the sample. Spam/Trash are excluded; no full-mailbox sync is claimed. These runs are not assumed to prove reconnection, because a refresh can also start another load. No average or statistically meaningful performance claim is derived from two reports.

## Definitions and limitations

Sync duration uses performance.now from immediately before loadInbox until normalized/classified results settle. It includes metadata discovery/hydration, retries/backoff and classification, excludes consent/script preparation and final browser paint, and is rounded to milliseconds for display. This is the bounded sample load, not full-mailbox or incremental synchronization.

Counters increment on actual client fetch invocations after token validation, not when a retry is merely scheduled. Retries count attempts after the first attempt of a particular list/get operation. Counts include failed requests/network attempts and cannot prove how many requests reached Google. They count application-issued Gmail list/get attempts; they exclude browser-generated OPTIONS/preflight, GIS script/consent/revocation traffic and other page assets. They are not quota units, transferred bytes, API savings, or billing metrics. Fresh refresh replaces the per-run summary; disconnect removes it and live message state. Capture aggregate values before disconnect.

Coverage excludes Spam/Trash and includes eligible folders beyond Inbox. Pagination and concurrent metadata retrieval are bounded, not an atomic mailbox snapshot. Failed records remain counted; a refresh can retry current-window metadata. A single owner-reported run does not establish a performance distribution, classification quality, ROI, user retention or production reliability.

For an ordinary one-page selection of 100 messages, one list plus 100 metadata operations would imply 101 baseline fetch attempts before retries; this is a **theoretical expectation**, not a measured result. Record actual counters rather than filling results from that formula.

Only aggregate numbers/status belong here. No sender names/addresses, subject/snippet/body text, message IDs, tokens, OAuth client ID, account identifier, screenshots, HAR files or browser traces. Mocked validation evidence remains in VERIFICATION.md.

## Lifecycle result and uncertainty

The first disconnect explicitly reported Google revocation confirmed and restored the 96-message synthetic dashboard. The owner then reported successful reconnection but did not observe final revocation confirmation. On follow-up the visible status was the generic disconnected/mock sentence. That establishes local UI state only; it does not establish why a confirmation was absent or whether the final remote grant was revoked. No cause (SDK failure, expiration, reload, timeout or provider delay) is inferred from this observation.

The owner was directed to Google Account connections to remove this app's grant if still present, or report it absent. The owner reported **this app was not listed** in Google Account connections. Record this as account-side grant absence reported by the owner; it does not establish why the final in-app confirmation was absent. This does not change Google Cloud client settings. [Google grant-management guidance](https://support.google.com/accounts/answer/13533235).
