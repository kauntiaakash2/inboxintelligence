# ADR 0005 — Optional declared preferences, isolated from mailbox state

Status: Accepted for Phase 3A implementation; owner code review pending. Date: 2026-11-03.

Context: The dashboard should emphasize declared goals without profiling private correspondence or coupling onboarding to Gmail consent. Existing categories are a fixed domain union; Projects, Clients and Important are not classifier IDs.

Decision: Provide an optional inline three-step controlled form, explicit confirm/skip and settings edits/reset. Goals replace role defaults using existing categories. Display selectors reorder all categories and messages while preserving classifier priority bands, classification objects and coverage. Professional maps to Security/Events and deadlines/Finance; freelancer maps to Personal/Finance/Events and deadlines rather than inventing unsupported categories.

Persist only schemaVersion/status/profile/goals/enabledCategories in a single localStorage key. Validate unknown JSON strictly at load and save. Version 1 is the first schema; unknown versions are ignored with an explanation and can be reset or explicitly replaced. A future version needs a tested migration, not silent coercion. Storage errors leave usable tab-local state. Keep unsaved drafts out of persistence.

Alternatives: Mandatory setup would block users who do not want profiling. Inferring a role from mail would create a sensitive unnecessary processing purpose. A hosted profile database adds identity, network, cost and deletion obligations before portability is validated. IndexedDB is asynchronous and transactional but excessive for one tiny preference record; it remains appropriate for a later mailbox cache. Deriving priority by altering classifier results would mix user preference with rule evidence and make explanations misleading.

Consequences: No new dependency or external request; all messages remain discoverable. This is a heuristic presentation policy, not adaptive learning. localStorage is synchronous, origin-local and readable by same-origin scripts/shared-device users. No account binding, cross-tab synchronization, encryption or cross-device portability is provided. Clear and storage-failure notices are necessary. Classifier category renaming may later require a schema migration.

References: [React controlled inputs](https://react.dev/reference/react-dom/components/input), [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [storage availability](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API), [WAI form grouping](https://www.w3.org/WAI/tutorials/forms/grouping/).
