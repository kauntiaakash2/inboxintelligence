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
| Saved / skipped returning experience                 | Verified | Reloaded declared preferences; no automatic Gmail authorization                              |
| Settings preference edit/restart/reset               | Verified | Existing profile/goal/category draft controls; key-only reset                                |
| Invalid/unsupported or blocked storage               | Verified | Safe defaults/notices and tab-local fallback                                                 |
| Personalized mock / intercepted Gmail presentation   | Verified | All messages available; unchanged auth/classification; no extra mailbox requests             |
| Cross-device portability / cross-tab synchronization | Planned  | No profile backend, export/import or storage-event listener                                  |

These verification labels refer to synthetic automated tests and inspected local screenshots, not real-Gmail onboarding, formal screen-reader certification or user research. Custom classifier categories remain planned; suggested-category toggles are implemented.

## Unified public and dark workspace surfaces

| Surface                                      | Status   | Evidence scope                                                                          |
| -------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| Public / landing                             | Verified | Hero, synthetic preview, problem/features, five-step workflow, privacy, FAQ, CTA/footer |
| Mobile public navigation / FAQ               | Verified | Native disclosure, accessible names, keyboard, 390px layout and reduced motion          |
| /app /app/inbox /app/analytics /app/settings | Verified | Direct loads, in-place view changes, Back/Forward and existing mock/Gmail workflows     |
| Unknown route recovery                       | Verified | Home/app links; client-rendered recovery, not a server HTTP 404 guarantee               |
| Shared dark dashboard / onboarding           | Verified | Existing functional suites plus token/rendered contrast and synthetic screenshots       |
| Production-host routing fallback / headers   | Planned  | Local Vite preview tested; no deployment or host configuration performed                |

The previous light-only/dark-mode-planned entry is superseded: a consistent dark identity is implemented; a light/dark preference switch is not. Historical screenshots/verification describe their respective commits. Current evidence and limits are in ../quality/VERIFICATION.md.

## Email workspace revision

| Surface                                       | Status   | Scope                                                                                        |
| --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| Inbox-first /app and explicit /app/inbox      | Verified | Global search, familiar rows/read state, category/priority filters and contextual insights   |
| Overview /app/overview and Analytics          | Verified | Consolidated Insights; both legacy URLs retained; original analytical calculations unchanged |
| Density/layout/default display settings       | Verified | Separate strict local enum record; independent reset and storage-failure fallback            |
| Wide reading pane / narrow dialog             | Verified | Already-loaded synthetic text or live metadata only; no FULL retrieval                       |
| Full plain-text / HTML / thread reader        | Planned  | Separately scoped API/content/security follow-ups                                            |
| Compose/reply/forward/send                    | Planned  | Design only; no new scope or transport                                                       |
| Own summaries/actions/deadlines/deep analysis | Planned  | No model integration or native Gemini-summary API                                            |
| Comparative user study                        | Planned  | Protocol documented; no participants/results                                                 |

Executed browser evidence, before/after screenshots and limitations belong in ../quality/VERIFICATION.md. Earlier design entries retain their original verification scope; this section does not convert planned features into completed work.

## Simplification revision

Current surfaces supersede earlier navigation/card composition descriptions above. Inbox, Insights and Settings are the three primary destinations. Desktop expanded/rail states persist independently of onboarding; mobile uses a transient native drawer. Filters and source controls are disclosures. There is no empty reading pane, category shortcut sidebar, duplicate display control or application marketing footer. See [audit](UX_SIMPLIFICATION_AUDIT.md) and [verification](../quality/VERIFICATION.md) for executed evidence and open acceptance limits.
