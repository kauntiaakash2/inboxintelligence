# Test strategy

## Executable layers

Unit tests exercise ordered rule matching, spam precedence, exact-domain matching, unknown fallback and evidence-score boundaries. Deterministic fixtures test combined filters and searches across all supported fields, sender/date/category/priority aggregation, malformed data and duplicate IDs. Metrics tests verify source separation, nullable denominators, error events, bounded memory and content allowlisting. Repository tests verify returned mutation cannot alter the fixture.

Component tests use Vitest/jsdom and Testing Library user interactions: combined filters, empty recovery, refresh, navigation, explicit connection flow, empty source and safe error rendering. StatusPanel semantics are tested. Native dialog behavior is checked in a real browser rather than faked as equivalent jsdom behavior.

Playwright browser tests cover desktop/mobile screenshots, navigation, search/filter combinations, message rule detail, modal keyboard entry/Escape/focus return, empty state, safe Connect/Authorize/Disconnect states, no horizontal overflow, reduced motion and unexpected external requests/page errors. `npm run test:e2e` uses loopback port 4101 and an existing compatible Chromium cache; on a clean machine Playwright browser installation may be required. Do not install host libraries without approval. This is smoke coverage, not every browser or accessibility conformance certification.

## Commands and CI

Run types, lint, test:coverage and build; browser test script starts/reuses local Vite. CI runs npm ci, format checking, types, lint, coverage and build on pushes/PRs without secrets or deployment. Browser checks are locally executable but are not yet in CI because browser system dependencies need a deliberate runner configuration. Coverage includes pure feature/service/repository .ts files and reusable components, not all App.tsx rendering. Thresholds: 80% statements/lines/functions and 75% branches. Report scope alongside percentages.

## Mocked Phase 2 verification and future tests

Implemented mocked auth cases: success, consent denial, missing scope, expiration/revocation, popup errors, SDK failures and stale callbacks. Wrong-account real chooser behavior remains manual-only. API mocks cover: paginated IDs, partial metadata, absent headers, malformed/oversized input, 401/403/429/5xx, abort/race and unknown labels. Sync integration: atomic checkpoints, replay, invalid page token, expired history 404, deletion, label changes, Spam/Trash coverage, concurrent job prevention and IndexedDB eviction/migration. Never use a real mailbox as a CI fixture.

Classification evaluation requires independent human labels and held-out sender/time splits; rule tests do not demonstrate accuracy. Report precision/recall with support and error review. Accessibility combines semantic tests, keyboard checks, contrast review and future automated axe scans; include zoom and assistive technology feedback before production. Regression suites should target observed defects and meaningful contracts, not snapshots mirroring implementation. Preserve synthetic test artifacts locally and avoid private content in reports.

Phase 2 suites use injected GoogleOAuth/fetch doubles and HTTPS interception in Chromium. No real mailbox or token is a fixture. Added coverage includes domain validation and useMailbox; thresholds are unchanged. The Phase 2 unit/component suites cover source switching, metadata normalization, read-only request shape, pagination, failure handling and cancellation. Browser fixtures block unhandled HTTPS requests, capture only synthetic screenshots, and verify reload does not silently reconnect. Tests must never be redirected at a live account without a separately approved manual procedure.

## Phase 3A declared preferences

Unit cases cover every supported role/goal, goal precedence, canonical deduplication, all-off/default ordering, immutable complete message sets and unchanged priority bands. PreferenceStore tests enforce exact version/key/enum/unique-array/subset constraints, copy semantics, malformed/oversized/unknown-version input, read/getter/write/delete failure and key-scoped reset. Hook tests verify safe tab-local fallback and refusal of invalid programmatic updates.

Component cases exercise optional/blank setup, selection/toggle/back, skip, saved returning state, direct Settings edits/restart/reset, invalid data and storage failure. Fake Gmail cases ensure save/reset do not change authorization, issue requests or lose loaded records; disconnect clears live data while preferences remain. Browser scenarios use native keyboard interactions, focus changes, reload persistence, 1440/390 layouts with reduced motion, poisoned/blocked storage and mocked Gmail compatibility. The extracted browser-tests/fixtures/google.ts helper continues intercepting all HTTPS, fulfilling only synthetic GIS/Gmail fixtures and blocking other requests.

No real Gmail tests, personal screenshots or external onboarding telemetry are permitted. Most new form JSX is covered through component/browser behavior rather than included in pure-logic coverage percentages. All numerical outcomes belong in VERIFICATION.md. Browser cache/profile state and local screenshots are ignored artifacts; test cleanup removes only the preference key it owns.

## Unified design and public routes

Existing browser suites now enter /app; their first-run/skip/returning/reset/restart, fake OAuth/source switching, search/filter/detail/analytics assertions remain. Reload assertions now retain Inbox via its URL while still verifying mock fallback and no silent reconnect. Unit tests cover landing sections/CTA/controls, no public preference or fetch access, fixed view-path validation, popstate and semantic contrast pairs.

New Chromium scenarios cover / at 1440/768/390 widths, mobile disclosure, native FAQ keyboard behavior, skip link, reduced motion, overflow, public→app links, view Back/Forward, direct routes, unknown recovery and intercepted live→public content isolation. Rendered solid-background text checks supplement token tests; gradient endpoint/visual review is separate. No axe/full screen-reader/non-Chromium certification is claimed.

Run npm run test:e2e for all development-server scenarios. After npm run build, run npx playwright test --config playwright.preview.config.ts for the production bundle on loopback 4102. That configuration runs all landing/Gmail/onboarding suites; dashboard.spec.ts source-module failure injection is dev-only, so its three scenarios remain in the normal 4101 suite. Production preview still intercepts all Google traffic. Never point these tests at real mail. Artifacts stay in ignored output/playwright; all application screenshots use synthetic data.

## Inbox-first revision

Keep all earlier source/OAuth/classification/onboarding tests. New unit cases cover the independent display schema, missing/corrupt/unsupported/oversized/extra-field input, no initial write, blocked read/write/delete, scoped reset, default/explicit routes, global local search and read-state counts. A stubbed matchMedia tests responsive pane activation/change/cleanup; shared detail content preserves existing native dialog tests.

New intercepted Chromium scenarios cover desktop rows/density, wide pane focus/Escape/list context, mobile dialog fallback, default/reload/reset without changing onboarding, search/filter composition and fake Gmail pane/display changes with unchanged request counts/GET METADATA shape. Existing Overview-specific checks now use /app/overview; root default assertions now expect Inbox. Production configuration includes workspace.spec.ts alongside the earlier landing/Gmail/onboarding suites. Dev-only module failure injection stays in the normal suite. Screenshots compare the freshly captured pre-change surface with synthetic revised UI; no real mailbox, send request or external model is used.

Future reader/send/AI fixtures and failure/security requirements are specified in their architecture documents, not implemented tests. The proposed user study is separate from automated correctness checks and has no results. Actual counts, coverage, failures fixed and screenshot review limits belong in VERIFICATION.md.

## Simplification regressions

Use native browser interactions for the drawer's modal containment, Escape/close/destination focus restoration, filters and reader. The simplification suite covers 320, 390, 1024 and 1440px, reduced motion, named destinations, rail reload persistence, no empty pane, density/layout, combined filters, row selection and rendered solid-text contrast. Component tests cover exact v1→v2 display migration/no load write/invalid state, independent onboarding reset and storage failures. Existing mocked Google/onboarding suites remain required; contextual helpers open controls and wait for the mounted app after reload. A temporary project-local extension exercises actual Chrome tabs.setZoom(2), not a CSS/deviceScaleFactor approximation. Record getZoom(), CSS width and overflow alongside synthetic screenshots. Never use a live mailbox for these checks.
