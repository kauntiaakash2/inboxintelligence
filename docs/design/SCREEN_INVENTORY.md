# Screen inventory

| Screen or state                            | Status      | Scope / evidence                                                                                                 |
| ------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Overview                                   | Verified    | Synthetic counts, category donut, priority list, senders and processing; browser evidence in verification report |
| Inbox explorer                             | Verified    | Search, category/priority controls, labels and read state                                                        |
| Message detail                             | Verified    | Native modal with plain text, rule reasons, heuristic confidence                                                 |
| Analytics                                  | Verified    | Category/sender/day/priority aggregation and simulated metrics                                                   |
| Settings                                   | Verified    | Mock/live authorization status, read-only privacy explanation and disconnect                                     |
| Loading and retry error                    | Verified    | StatusPanel plus local load lifecycle; component tests cover load failure                                        |
| Empty filter result                        | Verified    | Clear-filters recovery; component/browser workflow                                                               |
| Category management                        | Planned     | Category exploration exists, editing and custom categories do not                                                |
| Google connection/consent                  | Implemented | Connect/Authorize/Cancel/Disconnect implemented; fake SDK/browser verification, real consent pending             |
| First historical import / partial progress | Planned     | No network synchronization or durable checkpoints                                                                |
| Correction and learning                    | Planned     | Domain type/event name only; no correction UI                                                                    |
| Export/delete account data                 | Planned     | No real cache exists yet                                                                                         |
| Dark mode                                  | Planned     | Light theme only                                                                                                 |
| Multi-user identity and billing            | Planned     | Feasibility phase only                                                                                           |

“Implemented” describes code; “verified” marks the executed mock/component/browser scope, not exhaustive correctness or certification. See ../quality/VERIFICATION.md for verification status of each implemented surface; do not upgrade planned/mock placeholders based on visual presence.

Phase 2 coverage/progress/error states are implemented and tested with fake Google responses, including mobile controls. Live-source UI verification uses synthetic intercepted metadata; it is not evidence of a successful real Google consent flow. Historical import/progress remains planned.

Current-run aggregate Gmail diagnostics are implemented and verified with mocked responses, including desktop/mobile layouts and cleanup on disconnect. The owner reported one actual diagnostic run; owner-reported live coverage/revocation/reconnection evidence and its limits are recorded in ../quality/LIVE_MEASUREMENTS.md. Default development origin is now http://127.0.0.1:5173; browser fixture tests intentionally override to 4101.

## Phase 3A surfaces

| Screen/state                                         | Status   | Scope                                                                                        |
| ---------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| First-run setup invitation / skip                    | Verified | Dashboard and Gmail remain available; no first-load write                                    |
| Profile / goals / review form                        | Verified | Optional native controls, back/continue/skip, category toggles, keyboard and mobile Chromium |
| Saved / skipped returning summary                    | Verified | Reloaded declared preferences; no automatic Gmail authorization                              |
| Settings preference edit/restart/reset               | Verified | Existing profile/goal/category draft controls; key-only reset                                |
| Invalid/unsupported or blocked storage               | Verified | Safe defaults/notices and tab-local fallback                                                 |
| Personalized mock / intercepted Gmail presentation   | Verified | All messages available; unchanged auth/classification; no extra mailbox requests             |
| Cross-device portability / cross-tab synchronization | Planned  | No profile backend, export/import or storage-event listener                                  |

These verification labels refer to synthetic automated tests and inspected local screenshots, not real-Gmail onboarding, formal screen-reader certification or user research. Custom classifier categories remain planned; suggested-category toggles are implemented.
