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
