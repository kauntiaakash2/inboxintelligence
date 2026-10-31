# Screen inventory

| Screen or state                            | Status   | Scope / evidence                                                                                                 |
| ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| Overview                                   | Verified | Synthetic counts, category donut, priority list, senders and processing; browser evidence in verification report |
| Inbox explorer                             | Verified | Search, category/priority controls, labels and read state                                                        |
| Message detail                             | Verified | Native modal with plain text, rule reasons, heuristic confidence                                                 |
| Analytics                                  | Verified | Category/sender/day/priority aggregation and simulated metrics                                                   |
| Settings                                   | Verified | Mock status, privacy explanation, future controls clearly disabled                                               |
| Loading and retry error                    | Verified | StatusPanel plus local load lifecycle; component tests cover load failure                                        |
| Empty filter result                        | Verified | Clear-filters recovery; component/browser workflow                                                               |
| Category management                        | Planned  | Category exploration exists, editing and custom categories do not                                                |
| Google connection/consent                  | Planned  | Disabled placeholder is mocked, not an implemented OAuth screen                                                  |
| First historical import / partial progress | Planned  | No network synchronization or durable checkpoints                                                                |
| Correction and learning                    | Planned  | Domain type/event name only; no correction UI                                                                    |
| Export/delete account data                 | Planned  | No real cache exists yet                                                                                         |
| Dark mode                                  | Planned  | Light theme only                                                                                                 |
| Multi-user identity and billing            | Planned  | Feasibility phase only                                                                                           |

“Implemented” describes code; “verified” marks the executed Phase 1 test scope, not exhaustive correctness or certification. See ../quality/VERIFICATION.md for verification status of each implemented surface; do not upgrade planned/mock placeholders based on visual presence.
