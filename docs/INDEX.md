# Documentation index

Every document below describes this project. Implemented and planned behavior are distinguished throughout. Verification is local; no cloud deployment occurred. Phase 2 has mocked verification plus separately attributed owner-reported live observations. Phase 3A onboarding is verified with synthetic services; it performs no new real-account test.

## Root and bootstrap

| Document                                              | Purpose                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [README.md](../README.md)                             | Product, capabilities, setup, scripts, status, privacy, roadmap and repository tree. |
| [AGENTS.md](../AGENTS.md)                             | Persistent agent engineering, privacy, evidence and teaching instructions.           |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                 | Branches, conventional commits, review, checks and documentation workflow.           |
| [CHANGELOG.md](../CHANGELOG.md)                       | Versioned record of the synthetic foundation.                                        |
| [SECURITY.md](../SECURITY.md)                         | Short private reporting policy without an invented contact.                          |
| [docs/LICENSING.md](LICENSING.md)                     | Owner decision pending; deliberately no LICENSE grant.                               |
| [docs/ENVIRONMENT.md](ENVIRONMENT.md)                 | Detected WSL/Ubuntu/tool versions and setup constraints.                             |
| [docs/IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Bootstrap milestones, boundaries and exit gates.                                     |
| [docs/INDEX.md](INDEX.md)                             | This complete document map.                                                          |

## Product

| Document                                                | Purpose                                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [docs/product/PRD.md](product/PRD.md)                   | Twenty-part requirements, persona assumptions, MoSCoW and acceptance scope.             |
| [docs/product/USER_STORIES.md](product/USER_STORIES.md) | Ten concrete stories, criteria and implementation status.                               |
| [docs/product/ROADMAP.md](product/ROADMAP.md)           | Phases 0–10 with dependencies, exit criteria and required evidence.                     |
| [docs/product/METRICS.md](product/METRICS.md)           | Seventeen metric definitions/formulas/sources/limitations and synthetic event contract. |

## Architecture

| Document                                                                                    | Purpose                                                                          |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [docs/architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)                           | Browser/provider boundaries, responsibilities, Mermaid flows and future scaling. |
| [docs/architecture/DATA_MODEL.md](architecture/DATA_MODEL.md)                               | All eleven domain models, keys, relationships, indexes and privacy.              |
| [docs/architecture/SYNC_DESIGN.md](architecture/SYNC_DESIGN.md)                             | Planned discovery/get/history, replay, checkpoints, failures and coverage.       |
| [docs/architecture/CLASSIFICATION_DESIGN.md](architecture/CLASSIFICATION_DESIGN.md)         | Ordered evidence rules, priority, limitations, future learning and evaluation.   |
| [docs/architecture/ADR/0001-technology-stack.md](architecture/ADR/0001-technology-stack.md) | React/TypeScript/Vite/browser-first choice and trade-offs.                       |
| [docs/architecture/ADR/0002-storage-strategy.md](architecture/ADR/0002-storage-strategy.md) | Memory now, planned transactional IndexedDB instead of hosted storage.           |
| [docs/architecture/ADR/0003-sync-strategy.md](architecture/ADR/0003-sync-strategy.md)       | Sync-on-open choice versus server push/background work.                          |

## Security and privacy

| Document                                                  | Purpose                                                                                |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [docs/security/SECURITY.md](security/SECURITY.md)         | Threat boundaries, rendering, token/CSP design, audit findings and checklist.          |
| [docs/security/THREAT_MODEL.md](security/THREAT_MODEL.md) | STRIDE threats with existing mitigations and future work.                              |
| [docs/security/PRIVACY.md](security/PRIVACY.md)           | Current synthetic data flow and future minimization/control/transfer policies.         |
| [docs/security/OAUTH_DESIGN.md](security/OAUTH_DESIGN.md) | Official-source GIS lifecycle, restricted scopes, token safety and server differences. |

## Design

| Document                                                      | Purpose                                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [docs/design/DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md)       | Brand/tokens/components, viewport contract, state table and accessibility.       |
| [docs/design/UX_SPEC.md](design/UX_SPEC.md)                   | Implemented workflows and explicitly planned connection/import/correction flows. |
| [docs/design/SCREEN_INVENTORY.md](design/SCREEN_INVENTORY.md) | Verified/implemented/planned screen and state inventory.                         |

## Quality and operations

| Document                                                              | Purpose                                                                     |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [docs/quality/TEST_STRATEGY.md](quality/TEST_STRATEGY.md)             | Unit/component/browser layers, coverage scope and future auth/sync testing. |
| [docs/quality/ACCEPTANCE_CRITERIA.md](quality/ACCEPTANCE_CRITERIA.md) | Fourteen verifiable Phase 1 criteria.                                       |
| [docs/quality/VERIFICATION.md](quality/VERIFICATION.md)               | Actual command outcomes, browser evidence, limits and risk record.          |
| [docs/operations/DEPLOYMENT.md](operations/DEPLOYMENT.md)             | Proposed static host, release checks, headers and rollback; no deployment.  |
| [docs/operations/OBSERVABILITY.md](operations/OBSERVABILITY.md)       | Allowlisted instrumentation, timing, error taxonomy and monitoring plan.    |
| [docs/operations/RUNBOOK.md](operations/RUNBOOK.md)                   | Development failures and planned Gmail/storage recovery procedures.         |

## Learning

| Document                                                                    | Purpose                                                                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [docs/learning/LEARNING_PATH.md](learning/LEARNING_PATH.md)                 | Dependency-ordered engineering curriculum linked to phases and exercises. |
| [docs/learning/ENGINEERING_JOURNAL.md](learning/ENGINEERING_JOURNAL.md)     | Ten-part milestone lessons, actual fixes and implementation trade-offs.   |
| [docs/learning/INTERVIEW_PREPARATION.md](learning/INTERVIEW_PREPARATION.md) | Ten technical questions and answers grounded in the actual code.          |
| [docs/learning/GLOSSARY.md](learning/GLOSSARY.md)                           | Plain-language technical terms with project context.                      |

## Configuration and evidence files

`.gitignore` excludes secrets, dependencies, outputs, local database/token patterns and browser binaries. `.env.example` has only public mock placeholders. `.nvmrc`, package.json and package-lock.json specify the toolchain and resolved dependencies. tsconfig, Vite/ESLint/Prettier/Playwright configs define local checks; `.github/workflows/ci.yml` runs them without deployment. Local screenshots, browser traces and design-evidence.json are under ignored `output/playwright/`; coverage is under ignored `coverage/`.

## Phase 2 additions

| Document                                                  | Purpose                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Phase 2 concepts](learning/PHASE2_CONCEPTS.md)           | Code-grounded OAuth/browser/REST/validation/pagination/error-handling lessons.       |
| [Manual account test plan](quality/PHASE2_MANUAL_TEST.md) | Concrete count-only live test requiring explicit owner approval after mocked checks. |
| [Phase 2 change report](quality/PHASE2_CHANGE_REPORT.md)  | Complete changed-file inventory, test evidence and remaining limitations.            |

[ADR 0004](architecture/ADR/0004-browser-oauth-metadata-sample.md) records the chosen explicit token flow, bounded metadata policy, alternatives and consequences.

[Live measurements](quality/LIVE_MEASUREMENTS.md) separates owner-reported actual-account observations from mocked tests and theoretical request arithmetic; pending values are explicitly unmeasured.

## Phase 3A additions

| Document                                                           | Purpose                                                                                                          |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| [ADR 0005](architecture/ADR/0005-optional-declared-preferences.md) | Optional declared setup, isolated localStorage, alternatives and limitations                                     |
| [Phase 3A concepts](learning/PHASE3A_CONCEPTS.md)                  | Ten code-grounded form/state/storage/privacy/accessibility/metrics lessons, mapping tables and interview framing |
| [Phase 3A change report](quality/PHASE3A_CHANGE_REPORT.md)         | Complete file inventory, review boundaries and recommended Phase 3B                                              |

Phase 3A updates the existing PRD, roadmap, metrics, UX/design/screen inventory, privacy/security/threat model, architecture/data model/storage ADR, test strategy, verification and learning records. Historical Phase 1/2 command results remain attributed to their own runs.
