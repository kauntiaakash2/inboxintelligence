# Phase 3A — Optional declared personalization

This milestone adapts presentation from explicit choices. It does not learn a profile from mail, alter classification or measure user benefit. Source files are under src/features/onboarding, src/domain/preferences.ts, src/repositories/preferenceStore.ts and src/hooks/usePreferences.ts. Final command outcomes live in ../quality/VERIFICATION.md.

## 1. Controlled React forms

Problem: keep profile, goal and category selections consistent across three steps. OnboardingWizard owns a PreferenceDraft; each native input receives checked and updates that draft through onChange. The browser raises an event; React computes the next state and renders the selected value. Back changes only the step, so selections survive.

Alternative: uncontrolled inputs/FormData can simplify a single submission, but deriving category suggestions while navigating steps needs extra synchronization. Trade-off: controlled inputs require explicit update code. Common mistakes include mutating arrays in place, switching between controlled/uncontrolled inputs and using checkbox value instead of checked. Tests select goals, toggle categories and go Back/Continue. Industry analogue: checkout/configuration wizards. Interview framing: the draft is the single source of truth for the form, not the persisted record.

## 2. React state and lifecycle

Applied preferences, unsaved draft and Gmail session are separate responsibilities. usePreferences lazily reads its store when mounted. Opening a wizard creates a draft; confirming updates applied preferences; dismissing an existing edit leaves saved state intact. A keyed wizard resets the draft when Settings deliberately starts another editing step. A small effect focuses the current heading after step navigation; no effect persists choices or requests authorization.

Alternative: one global object containing auth, mailbox and form state would make unrelated edits trigger shared lifecycle changes. Explicit event handlers avoid write-on-mount and StrictMode double-effect surprises. Tests prove setup save/reset makes no additional Gmail requests and preserves loaded records. Industry analogue: keeping a settings editor separate from a running data job. Interview framing: React rerendering is not a reason to restart a service; stable service identity and effect dependencies matter.

## 3. State persistence

Tab state disappears on reload; preferences should survive it. PreferenceStore reads/writes one named key only on explicit actions. usePreferences keeps a valid in-memory result even if writing fails and shows that it may not survive reload. Clear always restores tab defaults, with a warning if durable deletion failed.

Alternatives: session-only state has less retention but loses the user's choices; a server profile enables portability but adds authentication, transfer and deletion duties. Never call localStorage.clear(): unrelated origin data may exist. Browser getter denial, quota and eviction are normal failure cases, not reasons to block dashboard access. Tests inject storage doubles for all outcomes and reload Chromium for returning-user behavior. Industry analogue: resilient preference repositories. Interview framing: persistence success and in-memory success are distinct outcomes.

## 4. localStorage versus IndexedDB

localStorage is synchronous and stores strings scoped to an origin. One bounded enum-only record is small enough for this design. IndexedDB is asynchronous, structured, indexed and transactional, fitting future account-scoped message caches and atomic checkpoints. Neither provides encryption against same-origin script access or a device user.

Using IndexedDB now would add unnecessary machinery; using localStorage later for thousands of messages and checkpoint consistency would be a poor fit. A hosted database introduces a new trust/operations boundary. Tests keep the preference key isolated; mail/token persistence remains prohibited. Industry analogue: lightweight UI settings versus transactional offline data. Interview framing: choose storage by access patterns, size, atomicity and privacy, not by a blanket browser-storage preference.

## 5. Data serialization

JSON.stringify turns the validated five-field object into a string; JSON.parse returns untrusted runtime data, which is treated as unknown. The schema contains only literal enums and arrays, so it does not need Date or class reconstruction. Save builds a canonical allowlisted object rather than serializing arbitrary application state.

Alternative: serializing the whole React state would silently capture mailbox/session fields and couple future state changes to storage. Common mistakes: assuming parse cannot throw, treating JSON as trusted and storing a token alongside settings. Round-trip and unknown-field tests check the boundary. Industry analogue: explicit wire/storage DTOs. Interview framing: serialization is a data boundary, not a generic dump of process state.

## 6. Runtime schema validation and evolution

TypeScript types disappear at runtime. validatePreferences accepts unknown and checks exact keys, schemaVersion 1, allowed status/profile, known unique goal/category arrays and category membership in recommendations. It returns a new canonical object. Read length is capped at 4096 characters; exceptions never echo stored bytes or raw error text.

Version 1 is the first schema. Invalid/unknown versions use defaults and remain untouched until explicit save/reset. Future versions require tested migration functions validating both input and output; do not guess unknown schemas. A schema library could help a larger product, but manual validation keeps dependencies minimal for five fields. Tests cover malformed JSON, extra token/message fields, duplicate arrays, unsupported versions and invalid suggestions. Industry analogue: versioned persisted contracts and compatibility gates. Interview framing: compile-time correctness and runtime trust are complementary, not substitutes.

## 7. Deterministic personalization

Recommendations use existing EmailCategory IDs. Selected goals replace role defaults, union/deduplicate in canonical goal order, then review toggles select a subset. Click order never becomes hidden priority. This is a documented heuristic, not an AI model or validated prediction of importance.

| Profile (no goals selected)         | Existing category suggestions in order                |
| ----------------------------------- | ----------------------------------------------------- |
| Student                             | Education; Jobs and internships; Events and deadlines |
| Working professional                | Security; Events and deadlines; Finance               |
| Freelancer/business owner           | Personal; Finance; Events and deadlines               |
| General / Prefer not to say / blank | Personal; Security; Orders; Newsletters               |

| Goal (canonical combination order)  | Existing category suggestions            |
| ----------------------------------- | ---------------------------------------- |
| Find important messages             | Security; Personal; Events and deadlines |
| Track deadlines                     | Events and deadlines; Education          |
| Career and internship opportunities | Jobs and internships; Education          |
| Understand inbox clutter            | Promotions; Newsletters; Spam review     |
| Analyze email patterns              | Newsletters; Promotions; Personal        |
| Organize financial notifications    | Finance; Orders                          |

Professional/Important/Projects/Clients are not invented classifier categories. For example, Student plus the finance goal recommends Finance/Orders, replacing Education/Jobs/Deadlines. Changes can refresh suggestions; leaving declarations unchanged preserves toggles.

orderMessagesForDisplay copies and sorts: unchanged rule High/Medium/Low first, then focus rank, then receivedAt descending. With no enabled focus, preserve default ordering. Category charts/options move focus first while retaining all categories and counts. Search filters the entire ordered set. Alternatives: modifying classifier scores conflates user preference with evidence; hiding non-focus messages would violate discovery coverage. Tests compare all message IDs, object identity and serialized classifications before/after sorting. Industry analogue: separating ranking policy from retrieval and classification. Interview framing: user-controlled ranking is a presentation layer, with explicit invariants protecting data completeness.

## 8. Accessibility and keyboard navigation

Native radio buttons provide arrow navigation; checkboxes use Space; buttons/forms support Enter and Tab. fieldset/legend groups related controls; labels give accessible names. A focused step heading and text Step N of 3 communicate progress without fake percentages. The wizard is inline, so dashboard/Gmail remain reachable and focus is not trapped. Existing reduced-motion styles apply; mobile choice rows stack and meet the intended touch size.

Alternative: custom clickable div controls require recreating semantics and keyboard behavior. Mistakes: color-only progress, hidden labels, autofocus on every render and modal behavior without need. Chromium tests exercise actual keys, heading focus, 1440/390 layouts and no horizontal overflow. Formal assistive-technology/zoom testing remains open. Industry analogue: semantic forms reduce both implementation cost and accessibility defects. Interview framing: test real browser interactions in addition to DOM attributes.

## 9. Privacy by design

Collect only declared enums needed for presentation, make every choice optional, and explain scope before saving. No name/account ID, mail, token, free text or inferred trait enters the record. These choices can still be personal; local does not mean anonymous or encrypted. Reset is key-scoped and independent of Gmail revocation. Switching sources retains declared preferences without triggering requests.

Alternative: automatic mail-derived personas or cloud profile storage introduce unnecessary inference/transfer. A future mail cache needs a separate retention/deletion and account-isolation decision. Tests scan serialized preferences for synthetic private fields and assert no Gmail write/additional request paths. Same-origin compromise/shared devices remain risks. Industry analogue: purpose limitation and minimization at schema boundaries. Interview framing: separate UI preferences from authorization and sensitive data lifecycles.

## 10. Product onboarding metrics

No onboarding telemetry or conversion/time-saved result is implemented. Future opt-in aggregate starts/completions/skips, step abandonment and storage outcomes need defined denominators and windows. Setup is optional: skipping may be successful, and Gmail activation must remain independent of selecting a role. Completion rate alone cannot show usefulness; matched voluntary tasks and qualitative feedback are needed.

Alternative: tracking every selected profile/goal adds personal data without proving benefit. Mistakes: treating test passes as activation, counting visits as unique users or treating skips as failures. Formula/source/limitations are in ../product/METRICS.md. Industry analogue: measure a product outcome, not just funnel compliance. Interview framing: privacy limits what we collect, and good experiment design limits what we claim.

## Commands and correctness

TypeScript checks internal contracts; ESLint checks code/hooks; Prettier checks formatting; Vitest/Testing Library test pure logic and stateful interactions; intercepted Playwright tests native Chromium behavior and layouts; the Vite production build verifies bundling. These commands write only project artifacts. No real Gmail test is needed or authorized for this milestone. Initial compilation caught an unused display flag, an unsupported Testing Library option and an excess-property fixture; each was corrected before the passing checks. Do not equate synthetic timing, coverage or screenshot appearance with production user outcomes.

Official references consulted: [React controlled input](https://react.dev/reference/react-dom/components/input), [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [storage availability/error handling](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API), [WAI grouping related controls](https://www.w3.org/WAI/tutorials/forms/grouping/).
