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

Phase 2 suites use injected GoogleOAuth/fetch doubles and HTTPS interception in Chromium. No real mailbox or token is a fixture. Added coverage includes domain validation and useMailbox; thresholds are unchanged. Five unit/component files currently cover source switching, metadata normalization, read-only request shape, pagination, failure handling and cancellation. Browser fixtures block unhandled HTTPS requests, capture only synthetic screenshots, and verify reload does not silently reconnect. Tests must never be redirected at a live account without a separately approved manual procedure.
