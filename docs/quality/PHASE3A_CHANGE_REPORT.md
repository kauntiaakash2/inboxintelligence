# Phase 3A change report — ready for owner review

Baseline: clean feat/personalized-onboarding at 4a06d27. No commit created; do not commit before owner review. No deployment, push, real Gmail access, Google configuration or credential change. No dependency/configuration/lockfile change. Actual test results and limitations: [VERIFICATION.md](VERIFICATION.md).

## Implementation and structure

```text
src/
  domain/preferences.ts
  repositories/preferenceStore.ts
  hooks/usePreferences.ts
  features/
    onboarding/{OnboardingWizard,PersonalizationPanel}.tsx
    onboarding/personalize.ts
    settings/PreferenceSettings.tsx
  app/App.tsx                         existing shell integration
  tests/{preferences,onboarding}.test.{ts,tsx}
browser-tests/
  fixtures/google.ts                 extracted synthetic helper
  onboarding.spec.ts
```

Draft declarations → strict version-1 validation → one localStorage preference key → applied hook state → pure display sorting. Existing repository → loadInbox/classifier → mailbox state remains independent. Goals replace role defaults. All records remain searchable and analytics reconcile to the full loaded set; classification explanations/priority scores are untouched.

## Complete changed-file inventory

| File                                                          | Responsibility                                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                                   | Current architecture, narrow preference-persistence rule and review/test guidance               |
| `CHANGELOG.md`                                                | Unreleased Phase 3A capability record                                                           |
| `README.md`                                                   | Setup/use/settings/storage limits and delivery links                                            |
| `browser-tests/fixtures/google.ts`                            | Shared synthetic SDK/API helper, blocks unhandled HTTPS and records writes                      |
| `browser-tests/gmail.spec.ts`                                 | Reuse extracted synthetic Google interceptor without changing scenarios                         |
| `browser-tests/onboarding.spec.ts`                            | Keyboard/mobile/reload/skip/invalid/blocked-storage and Gmail-preservation workflows            |
| `docs/INDEX.md`                                               | Index the new ADR, concept guide and complete change report                                     |
| `docs/architecture/ADR/0002-storage-strategy.md`              | Record the narrow preference exception to memory-only storage                                   |
| `docs/architecture/ADR/0005-optional-declared-preferences.md` | Decision for optional declared presentation and isolated local preference storage               |
| `docs/architecture/ARCHITECTURE.md`                           | Preference data-flow diagram and separation from mailbox/auth lifecycles                        |
| `docs/architecture/DATA_MODEL.md`                             | Five-field preference contract, version rules, privacy and storage identity                     |
| `docs/design/DESIGN_SYSTEM.md`                                | Setup tokens, native controls, responsive choice rows and accessibility scope                   |
| `docs/design/SCREEN_INVENTORY.md`                             | Verified onboarding/settings/error surfaces and planned portability                             |
| `docs/design/UX_SPEC.md`                                      | Optional setup/edit/skip/review/reset journeys and ordering rules                               |
| `docs/learning/ENGINEERING_JOURNAL.md`                        | Actual decisions, alternatives, encountered compile errors and lessons                          |
| `docs/learning/INTERVIEW_PREPARATION.md`                      | Five onboarding implementation questions and grounded answers                                   |
| `docs/learning/LEARNING_PATH.md`                              | Dependency-ordered Phase 3A exercises and proposed next learning step                           |
| `docs/learning/PHASE3A_CONCEPTS.md`                           | Ten code-grounded lessons, mapping tables, alternatives and interview framing                   |
| `docs/product/METRICS.md`                                     | Unimplemented opt-in onboarding metric formulas, denominators and limitations                   |
| `docs/product/PRD.md`                                         | Optional personalization requirements, non-goals and verifiable acceptance                      |
| `docs/product/ROADMAP.md`                                     | Distinguish implemented 3A, proposed 3B and planned historical sync                             |
| `docs/quality/PHASE3A_CHANGE_REPORT.md`                       | This complete file inventory, architecture and recommended next milestone                       |
| `docs/quality/TEST_STRATEGY.md`                               | Preference unit/component/browser cases, coverage scope and fake Google isolation               |
| `docs/quality/VERIFICATION.md`                                | Actual Phase 3A checks, scope, artifacts and review limits                                      |
| `docs/security/PRIVACY.md`                                    | Declared choice retention, reset, shared-origin risks and separate mail-cache decision          |
| `docs/security/SECURITY.md`                                   | Preference schema/storage trust boundary and security-review limits                             |
| `docs/security/THREAT_MODEL.md`                               | STRIDE delta for poisoned storage, disclosure, denial and privilege risks                       |
| `src/app/App.tsx`                                             | Integrate optional setup, settings and display selectors while preserving mailbox/auth services |
| `src/domain/preferences.ts`                                   | Typed versioned declared-only schema and selectable enum options                                |
| `src/features/onboarding/OnboardingWizard.tsx`                | Controlled three-step optional draft with native accessible inputs                              |
| `src/features/onboarding/PersonalizationPanel.tsx`            | First-run invitation, skip, returning summary and safe notices                                  |
| `src/features/onboarding/personalize.ts`                      | Deterministic role/goal mappings and immutable display order                                    |
| `src/features/settings/PreferenceSettings.tsx`                | Edit/restart/reset controls and privacy boundary explanation                                    |
| `src/hooks/usePreferences.ts`                                 | Applied preference lifecycle and in-memory fallback independent of Gmail                        |
| `src/repositories/preferenceStore.ts`                         | Strict runtime validation, version handling and key-scoped storage/errors                       |
| `src/styles/index.css`                                        | Responsive setup/summary/settings styles using existing design tokens                           |
| `src/tests/onboarding.test.tsx`                               | Component workflows, persistence/returning state, settings and fake Gmail compatibility         |
| `src/tests/preferences.test.ts`                               | Mapping/invariant/schema/storage-error/reset/hook tests                                         |
| `src/tests/setup.ts`                                          | Remove only the test-owned preference key after component tests                                 |

## Verification and security review

TypeScript, lint, coverage, intercepted Chromium and production build pass as recorded in VERIFICATION.md. Formatting and final whitespace/link/privacy checks are recorded there after execution. Preferences are an enum-only explicit declaration, not sensitive mail inference or an authenticated identity. Runtime validation rejects extra fields, unsupported versions and invalid arrays/categories. Storage exceptions never expose payloads. No mail/token/ID is added to durable state. Fake Google tests verify saving/resetting does not change request counts or retained live records; existing denial/expiry/retry/read-only tests still pass.

The Gmail services, useMailbox, classifier, OAuth configuration, scopes and API adapter have no implementation diff. Browser helper extraction retains network interception and synthetic responses. No test contacts real Google. Existing generated artifacts and local environment files remain ignored; contents are not added to the change inventory.

## Known limitations

- Heuristic role/goal mappings are transparent defaults, not validated user research or a learned model. Projects/Clients/Important are not new classifier IDs.
- Preferences are per-origin/browser and shared between whichever Gmail account the user explicitly connects in that origin. No account association or automatic cross-tab/device updates exists.
- localStorage is synchronous and readable by same-origin scripts/device users; it is not encryption. Browser eviction, quota and profile backups remain concerns. Failure notices distinguish current-tab changes from durable success.
- Unsupported schema versions are ignored, preserved and resettable/replaceable through explicit actions. Version 1 has no legacy migration; future migration must be tested before accepting a new version.
- No onboarding telemetry, preference export/import, persistent mailbox, full sync, new OAuth feature, formal accessibility certification or outcome claim is included.

## Recommended Phase 3B (planned, requires scope agreement)

1. Review the Phase 3A diff and perform synthetic usability/keyboard tasks; verify that category ordering is understandable and optional setup adds value.
2. Define explicit preference-only JSON export/import with schema/size/version validation, a preview, replace confirmation and no mailbox/account fields. Decide cross-tab update/conflict semantics before adding a storage listener.
3. Design opt-in content-free onboarding outcome metrics with denominators and retention; validate user benefit separately from setup completion. Do not include profile/goal/category choices in telemetry.
4. Keep historical synchronization separate: approve email-cache retention/deletion/account-isolation boundaries before implementing transactional IndexedDB and resumable sync. No cloud profile service, real mailbox test or deployment is implied.
