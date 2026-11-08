# Engineering journal

## 2026-10-31 — Milestone 0: environment and architecture

1. **Problem:** start safely from an unknown repository. It was empty; no existing work or commits needed preservation.
2. **Concept:** reproducible environments and explicit trust boundaries.
3. **Choice:** compatible installed Node 24 LTS, npm lockfile, Linux filesystem and static browser application.
4. **Alternatives:** global tool installation, Windows-mounted source or an immediate server architecture.
5. **Trade-offs:** fewer operating services, but no protected browser secrets or guaranteed closed-app sync.
6. **Implementation:** inspect versions first; domain contracts isolate provider data; Vite/Tailwind official plugin setup.
7. **Mistakes to avoid:** inventing a license/identity, upgrading host tools without approval or silently overwriting files.
8. **Correctness:** versions and empty-directory status were actually read; toolchain compatibility checked by compilation/build.
9. **Industry analogue:** environment pinning and ADRs make onboarding and incident recovery reproducible.
10. **Interview framing:** “I chose a browser-first boundary to reduce data transfer and operations for one account, and documented when a backend becomes necessary.”

## 2026-10-31 — Milestone 1: domain, rules and instrumentation

1. **Problem:** build useful behavior now without coupling the UI to Gmail or pretending to measure real performance.
2. **Concept:** dependency inversion, decision lists, runtime validation and measurement provenance.
3. **Choice:** EmailRepository returns normalized EmailMessage; pure classify/select/summarize functions; allowlisted event collector.
4. **Alternatives:** render Gmail response objects directly, use an external model, or fetch full bodies by default.
5. **Trade-offs:** rules are cheap and explainable but brittle; a repository adds one justified boundary; memory data is lost on reload.
6. **Implementation:** MockEmailRepository validates/copies 96 fixtures. loadInbox classifies each, records indexing and simulated retrieval policy. First-match rules preserve Spam precedence; unknown messages remain visible. Confidence is evidence count, not probability.
7. **Mistakes to avoid:** suffix-based sender trust, confusing operation events with unique-message counts, treating synthetic avoidance as bytes saved, and leaking private fields through generic event objects.
8. **Correctness:** boundary/precedence/unknown/score tests; aggregate reconciliation; simulated/real source separation; snapshot mutation and bounded-memory tests.
9. **Industry analogue:** adapters protect domain logic from provider changes; observability schemas use field allowlists to reduce data exposure.
10. **Interview framing:** “TypeScript protects internal contracts, while runtime validation protects the external boundary. The two are complementary.”

## 2026-10-31 — Milestone 2: product surface and interaction

1. **Problem:** make classifications inspectable and exploration usable on desktop/mobile.
2. **Concept:** controlled UI state, derived data, progressive disclosure, semantics and accessibility.
3. **Choice:** four local React views, controlled search/native selects, CSS charts with text counts, native dialog.
4. **Alternatives:** route framework, large chart library, custom modal focus trap or server rendering.
5. **Trade-offs:** minimal dependencies and direct interaction; no URL deep links; dense supporting typography requires further real-user accessibility review.
6. **Implementation:** App state holds filters/view/selection. selectMessages composes filters with AND. Detail reveals evidence only when needed. Dialog showModal handles containment; cleanup restores trigger focus. Category donut segments derive from counts.
7. **Mistakes to avoid:** color-only priority, fake Gmail controls, interpreting uniform fixture dates as real trends and unchecked chart proportions.
8. **Correctness:** Testing Library interactions; actual Playwright browser tests for filters, Escape/focus, modal, narrow overflow and runtime network boundary. Exact outcomes are in VERIFICATION.md.
9. **Industry analogue:** observability/analytics tools pair concise aggregates with drill-down evidence rather than opaque scores.
10. **Interview framing:** “I kept derived summaries out of stored UI state so filters and analytics have one source of truth.”

## 2026-10-31 — Milestone 3: verification and operational records

1. **Problem:** make the foundation reviewable and avoid declaring completion from source inspection alone.
2. **Concept:** layered verification, coverage scope, threat modeling, reproducible artifacts and evidence-based claims.
3. **Choice:** strict types, ESLint, Vitest/Testing Library, scoped coverage, production build and real-browser smoke checks; private local artifact output.
4. **Alternatives:** manual-only testing, implementation-mirroring snapshots, or equating high coverage with product accuracy.
5. **Trade-offs:** tooling adds development dependencies and browser binaries; unresolved development advisories need honest tracking.
6. **Implementation:** CI checks have read-only repository permissions and no secrets/deployment; docs record design vs implementation. No LICENSE file is chosen without owner decision.
7. **Mistakes encountered:** initial tsc lacked vite/client CSS import types; first chart implementation mutated an accumulator rejected by hooks lint; initial dev flag --hostname was invalid for Vite; cached Chromium revision did not match installed Playwright. Fixes: Vite declaration, immutable chart calculation, --host, project-local approved browser download.
8. **Correctness:** rerun relevant failed gates; record actual counts, durations and audit findings only. See VERIFICATION.md for final execution.
9. **Industry analogue:** delivery evidence plus known-risk records let reviewers decide what is production-ready and what remains a prototype.
10. **Interview framing:** “Coverage showed executed branches in seven scoped modules. Real classifier quality still needs independently labeled holdout data; browser behavior needed a separate test layer.”

Future journal entries should record actual work and measurements, not predictions. No user research, deployment, Google verification, real accuracy result or real Gmail optimization has occurred.

## Verification refinements

Browser testing found mobile controls lost their accessible names when visible labels were hidden; explicit names now survive CSS changes. Exact filter-label lookup also needed unambiguous names. Native modal focus can cycle through browser chrome while page controls stay inert; test actual modal state rather than demanding a custom focus trap. Loading/error/retry now have rendered browser evidence. Downloaded browser resources initially fell into ESLint traversal; the project-local cache/output are now explicitly excluded. Message list/detail were extracted for maintainability; Prettier provides consistent readable source. Final verification covers eight scoped modules, 36 unit/component tests and three browser scenarios. These fixes are engineering evidence, not production product metrics.

## 2026-11-02 — Phase 2: explicit authorization and metadata retrieval

1. **Problem:** connect the existing dashboard to Gmail without turning a static browser into an unsafe credential store or claiming full coverage.
2. **Concepts:** delegated authorization, public clients, short-lived bearer tokens, adapter boundaries, runtime validation, pagination and cancellation.
3. **Choice:** GIS browser token model with Connect/script-load followed by a synchronous Authorize click; private in-memory token fields and a GmailEmailRepository implementing the existing list contract.
4. **Alternatives:** a server code flow with protected refresh tokens could support offline work but adds server/security obligations; localStorage token caching is prohibited; a Gmail SDK dependency is unnecessary for two REST endpoints.
5. **Trade-offs:** every reload needs explicit reconnect; only up to 100 metadata records are available; Spam/Trash excluded; no snippets/bodies/attachments; complex encoded sender names are not fully decoded. Metadata itself is still private.
6. **Implementation:** validate scope/lifetime → fixed-origin GET list pages → deduplicate at most 100 IDs → four metadata workers → normalize headers/internalDate/labels → existing classifier and selectors. Source/session keys mask stale rows immediately; subscription clearing and abort cleanup prevent late reappearance. Selection stores an ID, not another message object.
7. **Mistakes and fixes:** a test initially expected a body property with undefined; it now verifies bodies are absent. Security review added SDK exception containment, duplicate callback guards, missing optional metadata normalization and reconnect blocking during pending revoke. Preserving old mock-only labels in live views would mislead users, so all views branch on the data source.
8. **Correctness:** fake SDK tests cover denial, cancellation, missing scope, expiry and revocation; API tests cover malformed pages/metadata, pagination, empty/partial mailboxes and 401/403/429/5xx; component/browser checks verify mock/live switching, source labels, no persistent storage and no Gmail writes. Actual counts/outcomes are recorded in VERIFICATION.md. No real account test has run.
9. **Industry analogue:** production integrations separate authorization lifecycle, provider transport/normalization and presentation, with bounded retries and provenance-aware observability. A read-only scope limits write authority but does not make mailbox data non-sensitive.
10. **Interview framing:** “I kept OAuth tokens out of React/persistent state, fetched a bounded metadata sample through a provider adapter, and tested both happy paths and source-switch races with synthetic services. Real provider acceptance remains a separate evidence gate.”

See PHASE2_CONCEPTS.md for a code-level walkthrough and PHASE2_MANUAL_TEST.md under quality for the owner-approved next step.

## 2026-11-03 — Release verification and measurable live-test preparation

The owner requested aggregate-only live acceptance and a verified Phase 2 commit. Local HTTP checks confirmed the app responds at the owner-confirmed registered origin http://127.0.0.1:5173 and serves the configured public client ID without printing it. Browser connector access failed, so consent/account outcomes require owner-run steps rather than an invented success claim.

Added content-free per-load client fetch/retry counters and a monotonic load/classification duration. Counting at the fetch call site distinguishes attempted retries from scheduled retries and API operations from quota units. A root aggregate retained-live-record count lets acceptance checks distinguish state cleanup from hiding rows. Regression tests cover retry accounting, no request with an expired token, partial-failure refresh recovery and actual result-state clearing. No token getter, private payload export, persistent telemetry or new dependency was added.

The trade-off is that a client attempt count cannot prove server receipt and the duration excludes consent/paint. The safe alternative to network/HAR logging is a narrow numeric diagnostic contract. Live measurements remain separate from fixture/test timings, and a single run is not a benchmark. This resembles production client observability: define counting boundaries and provenance before publishing metrics. In an interview, explain why 101 theoretical operations cannot be substituted for an observed request count.

## 2026-11-03 — Phase 3A: optional declared personalization

1. **Problem:** emphasize declared goals without blocking exploration, inferring a profile from private mail or disturbing a connected Gmail session.
2. **Concept:** controlled drafts, explicit persistence boundaries, runtime contracts, immutable ranking and optional product onboarding.
3. **Choice:** inline three-step form, native inputs, explicit confirm/skip, version-1 enum-only localStorage record, pure display selectors outside the classifier.
4. **Alternatives:** mandatory modal setup, inferred personas, rewriting classifier priority, an immediate profile backend or IndexedDB for one tiny record.
5. **Trade-offs:** simple local persistence with no new dependency; no account binding, cross-tab synchronization or device portability. Shared-device/same-origin access and browser eviction remain limitations.
6. **Implementation:** domain/preferences defines five fields; PreferenceStore validates/copies canonical values and catches storage errors; usePreferences separates applied state from wizard drafts. Goals replace role defaults using existing category IDs. All messages remain in discovery/search/analytics; unchanged High/Medium/Low bands precede preferred category/date ordering.
7. **Mistakes encountered:** initial compilation found an unused focus indicator before its label was wired, a Testing Library option belonging to a different query API and an excess-property test fixture passed directly to a typed method. Fixed the actual wiring/query/fixture while retaining runtime-rejection coverage. No unchecked cast of malformed input was added to bypass tests.
8. **Correctness:** deterministic mapping/validation/storage tests, component workflows and isolated fake Gmail state preservation; desktop/mobile Chromium keyboard/reload/storage/error/source cases. Actual commands, counts and limits are in ../quality/VERIFICATION.md; screenshots contain only synthetic data.
9. **Industry analogue:** separate preference, authorization and data-job lifecycles; stable provider adapters allow presentation features without new API authority. Versioned schemas support evolution without accidental private-state serialization.
10. **Interview framing:** “I personalized ranking from optional explicit declarations, kept classifier evidence intact, persisted a strict allowlist and tested that saving/resetting preferences could not restart or erase the mailbox session.”

Permanent ten-concept walkthrough: PHASE3A_CONCEPTS.md. Branch inspected as feat/personalized-onboarding at clean 4a06d27 before edits. No new dependencies, credentials/Cloud changes, real Gmail access, push, deploy or commit; implementation awaits owner review. Historical Phase 2 owner-reported live observations remain separate from this synthetic verification.

## 2026-11-03 — Unified public landing and dark identity

1. **Problem:** establish a public product surface and shared visual identity while preserving verified Phase 3A and read-only Gmail behavior.
2. **Concept:** semantic tokens, incremental component migration, responsive composition and public/private state boundaries.
3. **Choice:** independently authored black/charcoal/off-white/lime system; native CSS/controls, an original synthetic preview, Entry plus fixed History API workspace paths.
4. **Alternatives:** copy/remix template assets, add a router/animation/design framework, rebuild the dashboard or mount live mail behind marketing content.
5. **Trade-offs:** minimal dependencies and unchanged business contracts; compatibility CSS aliases and a small routing hook need maintenance. Direct paths require host fallback; normal public/app document navigation does not revoke Google consent; fresh loads reset state, but browser history cache may restore earlier memory.
6. **Implementation:** tokens.css drives existing selectors and Tailwind theme aliases; landing components accept no connected state. App gains route/view navigation, chart-token references, a public return link and skip-link/main semantics; personalization/auth/storage algorithms remain untouched.
7. **Mistakes and refinements:** contrast test initially read an empty disabled CSS import, then used a URL transformed by the test environment; reading the explicit repository source path fixed the test boundary. FAQ decorative text required a summary locator. Existing reload assertions needed to verify retained Inbox routes instead of Overview-only completion text. Visual review found a wrapped mobile header CTA, corrected with a compact grid and reverified in production.
8. **Correctness:** 155 unit/component tests pass; all original 15 Chromium workflows plus new route/privacy/contrast scenarios pass as recorded in VERIFICATION.md. Production-preview suites and inspected synthetic screenshots supplement dev checks. Token pairs and rendered solid backgrounds meet tested contrast thresholds; no full accessibility certification or user performance claim is made.
9. **Industry analogue:** design migrations work best when presentation, data authority and persistent contracts remain separate. Asset/license provenance and real browser evidence belong in the review, not just source code.
10. **Interview framing:** “I unified tokens across public and private surfaces, kept Gmail/onboarding contracts unchanged, and tested direct navigation plus live-fixture-to-public isolation without adding a framework or copying restricted assets.”

Initial tree was clean on feat/clario-design at 5ad1b62; this was the existing scoped branch despite the prompt's expected onboarding branch. No branch switch, dependency install, credential/Cloud change, real mailbox access, commit, push or deployment. Ten-topic lesson with alternatives: DESIGN_SYSTEM_CONCEPTS.md. Actual checks, limitations and screenshot paths: ../quality/VERIFICATION.md.

## 2026-11-03 — Inbox-first workspace and capability roadmap

1. **Problem:** move task entry from analytics cards to familiar email search/reading without broadening Gmail access or overwriting uncommitted Clario work.
2. **Concept:** recognition/task hierarchy, optional user control, source-quality labeling and separate authority/content boundaries.
3. **Choice:** Inbox default with explicit Overview route, global existing search, scan-friendly rows, separate display enums and optional wide reading pane reusing already-loaded text.
4. **Alternatives:** keep analytics first, force a pane/density, emulate all Gmail operators/writes, change onboarding schema or combine full reading/send/AI into a visual task.
5. **Trade-offs:** more familiar surface and reversible layout choices are design hypotheses; no participant benefit is measured. Root /app behavior changes intentionally, while explicit Overview and all other views remain reachable. Local UI preferences remain origin-bound and unencrypted.
6. **Implementation:** a strict workspace-preference hook validates four fields; navigation resolves default only for /app. MessageContent shares the existing text/explanation renderer across modal/pane. Search/filter/classification/Gmail/onboarding services are retained. Full reader/send/AI are separate documented plans.
7. **Issues fixed:** unknown JSON needed a proper type predicate; Testing Library role options differ from browser locators; direct-App tests needed the actual /app path; new select controls needed explicit accessible names. No malformed-input cast or weakened Gmail assertion was used to hide errors.
8. **Correctness:** pre-change 21-browser baseline passed and screenshots were preserved. Implementation checks passed as recorded in VERIFICATION.md, including display reset/default/pane keyboard and fake Gmail request-count preservation. Before/after screenshots are synthetic structural evidence, not user-study outcomes.
9. **Industry analogue:** maintain capability separation when a product grows: a reading layout is not body-fetch consent; read retry policy is not safe send retry policy; Google authorization is not external AI consent.
10. **Interview framing:** “I made the task surface inbox-first, kept private API authority unchanged, separated reversible display preferences from onboarding declarations, and designed evidence-driven usability/reader/send/AI milestones rather than claiming unbuilt capabilities.”

The user-study protocol has no participants/results. Sources/confidence: EMAIL_UX_RESEARCH.md; ten-topic teaching guide: EMAIL_WORKSPACE_CONCEPTS.md. No real Gmail, extra OAuth permission, send, external model, paid resource, commit, push or deployment occurred. Existing uncommitted Clario work remains preserved on feat/clario-design.

Workspace visual QA refinement: the first mobile capture showed status/setup/filter boilerplate crowding messages despite functional tests passing. Concise Inbox-only copy, native Display options disclosure and adjacent reset action reduced that space; a 390×844 first-row check was added. A duplicated local variable in that new test and a missing disclosure click were corrected before final passing runs. Selection was additionally bound to its view so Analytics does not unexpectedly open a modal; focus return now looks up the current row rather than retaining detached message DOM content. These are engineering/design corrections, not measured user-study improvements.

## 2026-11-03 — Simplification after owner rejection

Problem: a functional inbox was crowded by repeated navigation/categories, connection/setup/status cards and duplicated display controls. Inspected the real synthetic application at four widths and actual 200% Chrome zoom before editing. Preserved the cumulative uncommitted Phase 3A/Clario/workspace work; no commit, account access or deployment.

Decision: one three-destination navigation, desktop rail/mobile native drawer, one compact toolbar, Filters/source disclosures, Settings-only display controls and no empty reader. Consolidate Overview/Analytics presentation while preserving their URLs and all aggregators. Extend only display schema v1→v2 for sidebar state; strict allowlists, no load write and independent resets protect the existing profile schema. Smaller flat rows retain complete explanations in the original reader.

A browser regression exposed background disclosure Escape handling swallowing a modal dismissal; background handlers now defer to an active dialog. Another check exposed inherited fixed content widths that collapsed the rail without enlarging the list; main width now uses the same sidebar variable. Tests must assess actual geometry and keyboard behavior rather than only checking a class. The shared responsive nav rule also needed explicit visible drawer labels. See verification for final measured outcomes and limitations, not earlier failed-run counts as successes.

Teaching notes: [progressive disclosure, cognitive load, hierarchy, navigation, focus and persistence](UX_SIMPLIFICATION_CONCEPTS.md). Removing controls from permanent view creates a discovery trade-off; owner review and a comparative study remain necessary. Pixel positions and passing tests do not establish faster task completion.

Verification lesson: overlapping development/production Playwright runs shared an output directory and caused an ENOENT trace-cleanup failure despite passing interaction assertions. Production artifacts now use preview-runs; final suites run sequentially. Test infrastructure failures are recorded and rerun, never counted as passing evidence.
