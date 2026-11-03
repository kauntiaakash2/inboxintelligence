# Product requirements — Inbox Intelligence

Status: Phase 3A optional onboarding implemented and locally verified. Phase 2 browser authorization/metadata sample remains implemented, with mocked checks and separately attributed owner-reported live observations. Personas, demand, time savings and commercial opportunity below are assumptions, not validated user research.

## 1. Problem statement

An inbox mixes meaningful conversations, opportunities and deadlines with recurring notifications. Users must repeatedly inspect familiar patterns. Fetching full email bodies by default also increases data exposure and processing work.

## 2. Target users

Initially one owner using Gmail with fewer than 5,000 messages. Later: privacy-conscious students and individual professionals; multi-user SaaS depends on validated demand and verification economics.

## 3. Personas (hypotheses)

- Student applicant: tracks interviews, coursework and deadlines while receiving promotions.
- Independent professional: needs financial/security alerts separated from newsletters.
- Privacy-conscious builder: wants explanations, local storage and evidence of processing efficiency.

## 4. Jobs to be done

When checking email, find urgent commitments; understand recurring sender patterns; know why categories were assigned; minimize unnecessary content access; measure whether the workflow improves attention.

## 5. Current alternatives

Manual Gmail search/labels, Gmail category tabs, email clients with folders, and custom scripts. These are conceptual alternatives, not a benchmarked competitive study. Gmail remains the source of truth.

## 6. Value proposition

An analytics and organization layer with visible classification evidence, complete message indexing, selective retrieval depth, and auditable processing metrics. No external model is required for the first release.

## 7. Goals

Deliver a usable synthetic dashboard; establish provider-independent contracts; validate classification and filter behavior; prepare safe Google authorization and synchronization design. Future targets: fit personal use within ₹0–₹300/month and evaluate with a consented dataset before claiming accuracy or time savings.

## 8. Non-goals

Sending mail, Gmail writes, perfect classification, autonomous deletion, background execution while closed, model-based classification, commercial launch, or SaaS authentication in Phase 1.

## 9. Functional requirements

FR1 display consistent totals and categories; FR2 search names/addresses/subjects/snippets; FR3 combine category and priority filters; FR4 open plain-text detail; FR5 explain matched rule/confidence/priority; FR6 show sender/category/date/priority analytics; FR7 mark every view as mock; FR8 show loading, empty and retryable error states; FR9 instrument content-free simulated decisions; FR10 preserve unfamiliar messages. Future FR11 authorize one account; FR12 index all discovered messages, independent of detail-fetch policy; FR13 durable resumable import; FR14 record local corrections with provenance.

## 10. Non-functional requirements

Strict types, deterministic tests, keyboard usability, responsive 390/1440 layouts, no private content logs, no raw email HTML, no third-party telemetry, static deployment feasibility and minimal dependencies. Personal import target below 5,000 messages is a scope assumption, not a measured capacity limit. Performance budgets will be set from real runs, not invented now.

## 11. User journeys

Open demo → inspect overview → explore priority list → read explanation → filter inbox → examine aggregate patterns. Future: explicitly consent → authorize read-only scope → import latest sample → display partial progress → complete/retry → disconnect/delete.

## 12. User stories

As an applicant I can isolate high-priority job messages; as a privacy-conscious user I can inspect rule evidence; as an owner I can see what is synthetic and disconnected. Detailed cases: USER_STORIES.md.

## 13. Acceptance criteria

Selectors combine all filters; reset restores 96 messages; unknown messages remain queryable; each detail exposes evidence and heuristic caveat; analytics reconcile to the fixture; errors hide raw private payloads; checks and browser verification pass. Full testable checklist: ../quality/ACCEPTANCE_CRITERIA.md.

## 14. MoSCoW

| Priority         | Scope                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Must             | Synthetic views, search, combined filters, reasons, accurate aggregates, safe rendering, tests and docs |
| Should           | Keyboard modal, mobile layout, retry flow, sender analytics and coverage enforcement                    |
| Could            | Curated screenshots, optional local preference persistence                                              |
| Won't this phase | OAuth, actual Gmail, indexed history cache, external models, deployment, payments                       |

## 15. MVP definition

The Phase 1 engineering MVP is a verified synthetic product surface. The personal-use MVP additionally requires safe OAuth, full and incremental sync, local deletion controls and actual diagnostics. Neither is evidence of product-market fit.

## 16. Future capabilities

Adaptive detail retrieval, durable sender profiles, corrections, drift analysis, meaningful evaluation and owner-approved deployment; multi-account and SaaS only after feasibility review.

## 17. Success metrics

Use METRICS.md. Phase 1 proves arithmetic and instrumentation only. Future measure activation, sync latency/errors, precision/recall, correction rate, unknown rate, fetch avoidance and user-reported time saved. No user metrics collected yet.

## 18. Risks and assumptions

Restricted-scope verification may exceed budget; browser eviction can lose cached data; XSS can access tokens and mail; heuristic confidence can mislead; missed changes can corrupt state; generated fixtures cannot establish real accuracy. Assume sync-on-open is acceptable to the initial owner; validate that assumption.

## 19. Open questions

Which messages are truly important to this owner? Required Spam/Trash coverage? Retention period and content depth? Desired export format? How will correction evaluation be consented? What verification expense is acceptable? What license and private security reporting channel will the owner choose?

## 20. Roadmap

Phases 0–1 foundation; 2 authorized latest 100; 3 historical import; 4 incremental cache; 5 adaptive patterns; 6 corrections; 7 real measurement; 8 personal deployment; 9 small alpha; 10 SaaS feasibility. ROADMAP.md provides dependencies, exits and evidence gates.

## Phase 2 implementation addendum — 2026-11-02

FR11 (explicit read-only authorization) and a bounded part of FR12 (up to 100 listed IDs) are implemented with mocked verification. Default mock exploration remains available. Live UI exposes source, progress, selected/loaded/failed counts, excluded Spam/Trash and partial mailbox coverage. No durable full index, bodies, attachments, mailbox writes, silent authorization, correction learning or product accuracy result is included. A real account test and full sync remain separate exit gates; this does not turn the prototype into a personal-production MVP.

## Phase 3A requirements — optional declared personalization

Current scope extends Phase 2 with optional onboarding; the original Phase 1 MoSCoW table remains a historical scope description. Role/persona usefulness is still an assumption rather than validated research. Existing owner-reported Phase 2 live observations are in the verification record; no new live test is part of Phase 3A.

- **Must:** nonblocking three-step setup, five optional profiles, six optional multi-select goals, review/toggle suggested existing categories, skip/back/continue and explicit save. Dashboard and Gmail remain accessible throughout.
- **Must:** goals override role defaults, deterministic presentation only, all messages searchable, classifier scores and Gmail scope/retrieval untouched. Empty selections and all suggestions off are valid.
- **Must:** versioned strict preference allowlist, safe read/write/reset failure behavior, returning-user state, settings edits/restart/reset and keyboard/mobile tests.
- **Should:** explain suggestions, storage location and why profile is user-declared. Preserve drafts when navigating backward and saved choices when dismissing edits.
- **Could, later:** explicit preference export/import and cross-tab updates with version handling.
- **Won't:** infer traits, store mail/tokens, add classifier categories, add onboarding telemetry, access live mail automatically or claim onboarding increases activation.

Journey: open dashboard → optionally start setup → declare profile/goals or leave blank → review/toggle categories → confirm → inspect reordered view → edit/reset in Settings. Skip remembers only a skipped marker with null/empty choices. Acceptance: reload restores saved presentation, every original message remains available, High rule priorities precede lower bands, reset returns default ordering, storage errors do not block access, and preference changes do not start/stop Gmail requests. Metrics and limitations: METRICS.md. Future portability must remain explicit and independent of mailbox data.
