# Verification record

Current: Phase 2 release checks refreshed on 2026-11-03. The owner supplied aggregate live timing/request measurements; the latest report confirms 100/100 metadata records and zero failures; account lifecycle confirmations remain tracked separately in LIVE_MEASUREMENTS.md. Historical mocked verification is retained below. Historical Phase 1 evidence is retained below.

## Phase 1 verification — 2026-10-31

## Actual results

| Command / check                                          | Result and evidence                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environment inspection                                   | Ubuntu 22.04.5 LTS / WSL2 kernel 6.6.87.2; Node 24.13.0; npm 11.6.2; Git 2.34.1; Codex 0.166.0; empty initial directory. See ENVIRONMENT.md.                                                                                                                                                                                |
| npm install (application/test tools)                     | Completed locally with lockfile; no global or system packages. Initial audit reported 12 moderate development-tool findings.                                                                                                                                                                                                |
| npm run typecheck                                        | Passed (exit 0); strict TypeScript and Vite client CSS declarations.                                                                                                                                                                                                                                                        |
| npm run lint                                             | Passed (exit 0); no errors/warnings after fixes. Downloaded browser cache and generated output excluded as third-party artifacts.                                                                                                                                                                                           |
| npm run test:coverage                                    | Passed (exit 0): 2 files, **36 tests**. Latest run 3.51 seconds; this is local test duration, not product performance.                                                                                                                                                                                                      |
| Scoped V8 coverage                                       | **100% statements/branches/functions/lines** across eight selected pure feature/service/repository/date-format modules and reusable StatusPanel. Counts 83 statements, 69 branches, 32 functions, 76 lines. App.tsx and message presentation are outside this coverage scope; browser tests cover important rendered flows. |
| npm run build                                            | Passed (exit 0): Vite production assets generated. Latest recorded sizes: HTML 0.62 kB, CSS 26.19 kB (gzip 6.76), JS 255.06 kB (gzip 79.84). Sizes are local build output, not transfer-cost or speed claims.                                                                                                               |
| npm run dev -- --host 127.0.0.1 --port 4101 --strictPort | Started successfully; Vite ready in 274 ms at http://127.0.0.1:4101/. Startup time is this local run only.                                                                                                                                                                                                                  |
| Project-local Playwright Chromium install                | Required revision 1248 downloaded into ignored .cache/ms-playwright after existing cached revisions proved incompatible. No sudo or system dependency installation.                                                                                                                                                         |
| npm run test:e2e                                         | Passed (exit 0): **3 Chromium scenarios**, 7.8 seconds on the recorded run. Desktop 1440×1000, mobile 390×844, loading/error/retry.                                                                                                                                                                                         |
| npm audit --omit=dev --json                              | Passed (exit 0), **0 known production dependency vulnerabilities** at execution. A clean audit is not proof of security.                                                                                                                                                                                                    |
| npm audit --json                                         | Exit 1: **12 moderate development-tool findings**, propagated from minimatch glob amplification advisory GHSA-g3hv-75wg-m249. No high/critical reported. No force downgrade or incompatible major override.                                                                                                                 |
| Frontend evidence checker                                | Passed: local report complete and referenced screenshots exist. This validates record completeness, not visual quality. Screenshots were separately inspected.                                                                                                                                                              |

Final formatting, document-link/required-file checks and local Git checkpoint evidence are recorded below. GitHub Actions configuration is created, **not executed remotely**. No push, deployment, cloud resource or actual Gmail request occurred.

## Browser assertions and inspected artifacts

The desktop flow verified trimmed/case-insensitive search with combined category/priority, six interview matches, zero conflicting Orders results, reset to 96, rule and confidence explanation, Enter activation, native modal state, close-button focus, Escape and restored trigger focus. Native modal focus can cycle through browser chrome; it must not activate page controls behind the modal. No unexpected external requests or page errors were observed in this flow. HTML-like search input produced no image elements; this is a narrow smoke assertion, not a comprehensive XSS proof.

The mobile flow navigated all four views with explicit accessible names, checked document width at 390px, opened/closed detail and refreshed under reduced-motion preference. No horizontal page overflow was observed. The delayed failing repository scenario captured loading and a sanitized error, withheld its private error text and verified retry through loading. Component tests additionally cover an empty source and safe failure handling.

Locally retained artifacts under ignored output/playwright/:

- desktop-overview.png and mobile-overview.png: inspected source disclosure, layout hierarchy, category counts and priority panels.
- message-detail.png: inspected body text, evidence, rule ID, priority and confidence caveat.
- desktop-analytics.png: inspected categories, tied sender ranking and uniform daily fixture chart.
- desktop-settings.png, mobile-inbox.png, mobile-analytics.png, mobile-settings.png: captured navigation/layout evidence.
- empty-state.png, loading-state.png, error-state.png: captured real rendered state feedback.
- design-evidence.json: local design/state contract and observations, checked by the installed skill's checker.

## Failures encountered and resolved

Initial type check lacked vite/client side-effect CSS import types; added vite-env.d.ts. Initial lint rejected mutable chart accumulation; changed to immutable count-derived segments. The first dev command used unsupported --hostname; corrected to --host. Playwright initially lacked its exact Chromium revision; approved project-local download fixed it. Real browser tests exposed missing accessible names on mobile and ambiguous exact filter labels; explicit names fixed both. One browser assertion incorrectly treated focus cycling through browser chrome as page focus leakage; it now tests native :modal state, background inertness and focus restoration. Downloaded browser JavaScript initially entered ESLint traversal; cache/output exclusions corrected the scope. All affected checks were rerun.

## Acceptance and limitations

AC1–AC14 passed in the described local scope. Documentation/content/link scan and Git checkpoint evidence for AC12/AC14 are recorded below. Responsive smoke evidence covers two viewports and Chromium only. No Safari/Firefox, screen-reader certification, formal WCAG audit, cloud CI execution, Gmail authentication, real API behavior, IndexedDB, real classification accuracy or production efficiency were tested or claimed. The synthetic classifier remains a simple ordered rule prototype. Development-only dependency risk remains open and documented in the security design.

## Final repository checks and checkpoint

- `npm run format:check`: passed; all matched files use the configured style.
- Required-file validation: 36 requested root/document/config files present and nonempty; intentional LICENSE omission confirmed.
- Markdown link validation: local links across all 37 Markdown documents resolve.
- Limited credential-pattern scan: no Google API key, access-token or private-key literals detected in checked source/config/docs; this is not comprehensive secret detection.
- `git diff --cached --check`: passed before checkpoint; 70 reviewed project files staged, with generated dependencies/build/browser/cache/coverage excluded.
- Git initialized on scoped branch `feat/bootstrap`; existing configured identity preserved. Repository-local settings: core.autocrlf=input, pull.ff=only, fetch.prune=true.
- Implementation checkpoint: **09b70c4**, `feat: bootstrap privacy-conscious inbox intelligence dashboard`. Commit succeeded; working tree was clean immediately afterward. This final evidence update is recorded in a follow-up documentation commit.
- Tracked-artifact inspection found no .env secrets, local token JSON, node_modules, dist, coverage, browser binary or output paths. No remote is configured; no push or deployment occurred.
- CI uses current official checkout/setup-node v7 examples with contents:read and credential persistence disabled. The workflow has not been executed on GitHub.

The Phase 1 foundation is ready for the separately authorized Gmail integration milestone. Remaining development dependency advisories and the scope of accessibility/browser testing remain explicit limits.

## Phase 2 — 2026-11-02: executed mocked verification

Starting branch: feat/gmail-oauth, clean working tree. Existing source and product/architecture/OAuth/security/Phase 1 records were inspected before changes. Official GIS token-model/JavaScript/error documentation and Gmail list/get guides were consulted. Google's current list guide explicitly states newest-first order; adapter also sorts hydrated metadata by internalDate. No account settings were modified.

| Check                                   | Actual result                                                                                                                                                                                                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm run format and npm run format:check | Passed; final source/config/docs formatted.                                                                                                                                                                                                                                                          |
| npm run typecheck                       | Passed, exit 0.                                                                                                                                                                                                                                                                                      |
| npm run lint                            | Passed, exit 0.                                                                                                                                                                                                                                                                                      |
| npm run test:coverage                   | Passed: **93 tests in 5 files**, including the original 36 behavior tests (the obsolete disabled-placeholder assertion was updated for the working connection control).                                                                                                                              |
| Scoped V8 coverage                      | **97.53% statements, 94.82% branches, 100% functions, 98.19% lines**. Includes domain validation, pure feature logic, repositories/services, useMailbox and reusable StatusPanel; most App/message/settings JSX is excluded and covered by interaction/browser checks instead. Thresholds unchanged. |
| npm run build                           | Passed: Vite production build; JS 269.39 kB (gzip 84.60), CSS 26.86 kB (gzip 6.89), HTML 0.62 kB on the recorded run. This is bundle size, not a product speed/savings result.                                                                                                                       |
| npm run test:e2e                        | Passed: **9 Chromium scenarios**, recorded final run 15.1s. Local Vite started on port 4101 through Playwright.                                                                                                                                                                                      |
| git diff --check                        | Passed; no whitespace errors.                                                                                                                                                                                                                                                                        |
| Local configuration protection          | git check-ignore confirms .env.local ignored; git ls-files .env.local returned no tracked file. Its contents were not displayed, inspected, changed or staged; Vite loads the local public configuration as intended.                                                                                |
| Production source scan                  | No localStorage/sessionStorage/IndexedDB calls, console logging, dangerouslySetInnerHTML, client secret, gapi or Gmail write-scope references in production src. This is a limited static review, not an exhaustive security proof.                                                                  |

### Tested behavior and network isolation

Fake SDK cases: success, denied consent, popup cancellation, missing required scope, invalid/expired grant, SDK scope-check exception, duplicate/stale callbacks, canceled script preparation, expiry timer plus clock check, missing configuration, script network/timeout errors, revoke success/failure/deadline and reconnect blocked during pending revoke. Tests assert status snapshots contain no token and persistent storage remains empty.

Fake API cases: unique newest-100 cap, pagination/deduplication/repeated-token protection, METADATA/header-only fixed-origin GETs without request bodies, no credentials/cache/redirects, 401/403/429/5xx, Retry-After, network/malformed JSON, malformed metadata, missing optional fields, empty mailbox, per-record partial failure, cancellation and source-aware instrumentation. No full-body or attachment retrieval code was added.

Component/browser cases: original mock search/filter/explanation behavior, Connect→Authorize, source disclosure, partial coverage, empty/partial sample, disconnect and revoked-token mock fallback, ignored late discovery and no silent reconnect after reload. Browser Gmail fixtures intercept **all HTTPS requests**: fulfill only synthetic GIS/Gmail data and block anything else. Browser tests do not reach a real mailbox or perform actual revocation. No real Google credential is used by test fixtures; Playwright's launched server supplies a test public client ID.

### Rendered evidence

Inspected synthetic-interception screenshots at 1440×1000 and 390×844: output/playwright/phase2-live-1440.png, phase2-live-390.png, phase2-detail-1440.png. They show clear live-source/sample labels, 2 loaded of 3 selected with one deliberately malformed record, excluded Spam/Trash, metadata-only detail and no horizontal overflow. phase2-detail-390.png also captured. These are **fake metadata**, not evidence of a live account connection. Existing Phase 1 screenshots were regenerated by the passing suite. No formal WCAG/screen-reader or non-Chromium certification is claimed.

### Acceptance and remaining evidence

Implemented/mock-verified: explicit read-only GIS flow, no silent reconnect, memory-only authorization, up-to-100 metadata retrieval, source/partial/progress/error controls, mock mode, cancellation/disconnect, safe errors, no mailbox writes, and required local checks. Real OAuth client origin/consent/test-user configuration, actual Google grant/revocation and real newest-message display are **not verified**. The bounded manual test in PHASE2_MANUAL_TEST.md is ready for owner approval; it must not capture tokens, senders, subjects, IDs, screenshots or traces from real mail.

No dependency was added and package-lock.json is unchanged. Previous Phase 1 development-tool advisories remain historical known risk; no new audit outcome is fabricated. No deployment, push, paid resource, Google Cloud setting change, real mailbox read, or real product accuracy/savings metric occurred. Changes remain on feat/gmail-oauth for review; no new commit was created during this milestone. Full file inventory: PHASE2_CHANGE_REPORT.md.

### Final repository review

Local Markdown links resolved across 41 documents. PHASE2_CHANGE_REPORT.md covers all 51 added/modified files. A limited scan of changed source/config/docs found no Google API-key/access-token/private-key literals; synthetic grants in tests are deliberate fixtures. The ignored local environment file and generated bundle were excluded from that scan. Final format checking and git diff --check passed. No real account was contacted. The review server was then started in default mock mode at http://127.0.0.1:4101/ (Vite ready in 224 ms on this run); Google authorization remains user-triggered.

## 2026-11-03 — Aggregate live-test and release review

### Observed versus reported evidence

The assistant browser connector was unavailable. The owner confirmed the registered origin as http://127.0.0.1:5173. A local HTTP check independently confirmed the Vite application responds there and serves the same public client ID as local configuration, without displaying the ID or file contents. Google Console configuration was not independently inspected or changed.

The owner then reported **17,609 ms (17.609 seconds)**, **101 client API fetch attempts**, **1 list attempt**, **100 metadata attempts**, **0 retries** from the live diagnostics panel. These are owner-reported actual-account measurements, not fixture/test timings or theoretical arithmetic. The owner subsequently supplied a separate report: **100 selected, 100 loaded, zero failed**, more messages beyond the sample, **17,061 ms**, **101 / 1 / 100 API/list/metadata attempts**, **zero retries**. The earlier 17,609-ms report remains separate; its coverage was not supplied. The owner then confirmed that Disconnect reported Google revocation confirmed and restored the 96-message mock dashboard. The owner later explicitly confirmed reconnection succeeded, followed by a generic locally disconnected/mock status rather than a final remote revocation confirmation. The owner then checked Google Account connections and reported this app was not listed. This supplies owner-reported account-side grant-absence evidence; final SDK callback confirmation remains unobserved and no SDK/provider cause is inferred. Live retained React state was not independently inspected; the retained-result count is verified as zero by automated state-level checks. Detailed acceptance status and definitions: LIVE_MEASUREMENTS.md and PHASE2_MANUAL_TEST.md.

### Executed local checks

- npm run typecheck: passed.
- npm run lint: passed.
- npm run test:coverage: **94 tests in 5 files passed**. Scoped coverage: **97.59% statements, 94.49% branches, 100% functions, 98.23% lines**; excludes most application JSX rendering as previously documented.
- npm run test:e2e: **9 intercepted Chromium scenarios passed**, including desktop/mobile aggregate diagnostics, denial, missing scope, canceled consent, 401 fallback, disconnect state count zero and no silent reconnect. The reported suite duration (15.5s on this run) is a test-run statistic, not live sync performance.
- npm run build: passed; JS 271.37 kB (gzip 85.13), CSS 27.15 kB (gzip 6.97), HTML 0.62 kB on the recorded run.
- npm run format:check and git diff --check: passed.
- npm audit --json: refreshed, exit 1; **12 moderate development-tool findings** rooted in minimatch GHSA-g3hv-75wg-m249; no high/critical findings. No forced downgrade/major override applied.
- npm audit --omit=dev --json: refreshed, exit 0; **0 known runtime dependency vulnerabilities**. Audit is not proof of security.

The new regression case verifies a failed metadata record is recovered on explicit refresh, with the displayed selection moving from one success/one failure to two successes/no failures. API retry tests count actual fetch attempts and verify no request counter increments for unusable authorization. Post-disconnect tests inspect the aggregate count derived from retained mailbox-result state, not just hidden rows. Real denied consent/expiry/failure injection was not forced against the owner's mailbox; those remain isolated mocked tests.

### Privacy and Git review

Candidate tracked/untracked non-ignored files were scanned locally for Google access-token/API-key/client-secret, private-key and GitHub-token patterns, non-fixture email-address patterns and exact local-configuration value matches. No findings; scanned content/values were not printed. Historical review scanned **72 file blobs** with no credential/configuration matches. All 89 candidate files at that scan excluded .env.local, generated bundles, dependencies, browser artifacts/cache and coverage. Later staged checks repeat the review before committing. This is a limited pattern/content review, not a proof that all possible personal information is absent. Standard configured Git author metadata is intentionally preserved.

Production source has no content console logger, browser storage calls or raw HTML insertion. The only Gmail scope requested is gmail.readonly with prior-scope inclusion disabled and granted-scope validation. The fixed-origin transport invokes only GET on list/METADATA endpoints; no body/attachment or mailbox-write path exists. SDK grant revocation is a separate authorization action. Browser/Google logs cannot be independently audited through the unavailable connector; no real network dumps, screenshots or traces were captured by the assistant.

### Remaining gates

Live coverage, first disconnect/revocation and explicit reconnect were owner-confirmed. Final local disconnected state was reported; the owner subsequently reported the app absent from Google Account connections. Only received observations are recorded as completed. Local verified implementation may be checkpointed with these remaining manual acceptance items explicitly open; no full-release/live-lifecycle completion is claimed in advance. No deployment, push, paid resource or Google Cloud/credential change is authorized or performed.

### Local Phase 2 checkpoint evidence

This verification record accompanies the requested Phase 2 implementation checkpoint on feat/gmail-oauth. All 53 changed files were individually inventoried and staged only after branch/link/artifact checks. The exact commit is identified by Git history (`feat(gmail): add read-only OAuth, metadata integration and diagnostics`); the resulting hash is reported in the delivery response. No push or deployment is performed.

Final live result provenance: owner-reported 100/100 load with zero failures, latest 17,061 ms, 101 client fetch attempts (one list plus 100 metadata), zero retries. Earlier 17,609-ms run remains separate. First disconnect explicitly confirmed Google revocation; reconnection succeeded; final local disconnect was reported. Final in-app SDK revocation confirmation was not observed, and the owner confirmed this app was not listed in Google Account connections. No claim of an independent account inspection or a diagnosed provider failure is made.

## 2026-11-03 — Phase 3A optional declared onboarding

### Baseline and boundary

Initial inspection confirmed **feat/personalized-onboarding**, clean working tree and **4a06d27**. Read AGENTS, PRD/roadmap, design/UX, security/privacy, architecture, existing verification and actual React/mailbox state. React, MDN Web Storage and WAI form references are linked in ADR 0005 and PHASE3A_CONCEPTS.md. Existing source/configuration was preserved; no package, lockfile, Vite/OAuth configuration or credential file changed. This milestone uses only synthetic mail and intercepted Google services. Phase 2 owner-reported live measurements above are historical and are not Phase 3A test outcomes.

### Executed implementation checks

| Command               | Actual result                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| npm run typecheck     | Passed                                                                                                                             |
| npm run lint          | Passed                                                                                                                             |
| npm run test:coverage | **144 tests in 7 files passed**; final recorded run 5.68s                                                                          |
| Scoped V8 coverage    | **98.03% statements (450/459), 95.27% branches (363/381), 100% functions (114/114), 98.55% lines (409/415)**; thresholds unchanged |
| npm run test:e2e      | **15 Chromium scenarios passed**, final recorded run 22.2s; local fixture server on 4101                                           |
| npm run build         | Passed; 2073 modules; JS **283.89 kB** (gzip **88.59**), CSS **30.24 kB** (gzip **7.62**), HTML **0.62 kB** on the recorded run    |

Coverage includes pure domain/feature/repository/service/hook .ts files and reusable common components; most App/form/settings JSX is excluded from the percentage and covered through component/browser interactions. Test durations and bundle sizes describe this environment/run, not user performance, live Gmail sync time, classification accuracy or onboarding conversion. Existing 94 Phase 2 tests remain in the passing 144-test suite; nine original Chromium scenarios remain in the 15-scenario suite.

### Behavior and rendered evidence

Unit/component checks cover every role/goal mapping, goal-over-role precedence, canonical order/deduplication, category-subset validation, optional/blank/all-off choices, supported/unsupported schemas, malformed JSON, extra sensitive fields, immutable complete message sets, safe storage reads/writes/deletes, scoped reset and unchanged declarations preserving draft toggles. Applied preferences and unsaved draft are separate; skipping an edit retains previous saved values.

Chromium checks exercise first run, native radio arrow keys, checkbox Space, Tab/Enter, heading focus after step changes, review/save/reload, returning-user summary, skipped setup, all categories remaining accessible, invalid/blocked storage, unrelated-key preservation and unchanged mocked Gmail request/live-state counts through save/reset. Synthetic Gmail disconnect still clears retained live results. The extracted Google helper intercepts all HTTPS, fulfills synthetic SDK/API responses and blocks anything else. No automatic real OAuth, mailbox read, revoke or credential operation occurred.

Inspected local screenshots **output/playwright/phase3a-review-1440.png** and **phase3a-review-390.png**. The inline review uses existing tokens, clear optional/presentation-only copy, native toggles and responsive columns; all dashboard/Gmail controls remain present. Browser tests assert no horizontal overflow at these viewports and reduced-motion mode. Artifacts are ignored and contain only synthetic data. No screen-reader, non-Chromium, zoom or formal WCAG certification is claimed.

### Security, limits and review status

The sole new persistent application surface is the strict five-field preference allowlist. Tokens, email, Gmail identifiers and diagnostics remain memory-only. Preferences cannot change OAuth scopes, classifier output, labels, retrieval depth or indexing coverage. Defaults/skipped/all-off retain original order; active focus only orders existing priority bands/category/date. Same-origin XSS, shared-device/profile backup access, synchronous storage and browser eviction remain risks. No cross-tab updates, cross-device portability, encrypted settings, custom categories, inferred profiles or onboarding telemetry exists.

No new dependency/audit was run; Phase 2's recorded development-tool findings remain unresolved and are not presented as a fresh security result. Production Gmail/auth/mailbox/classifier implementations remain unchanged. No new commit, push, deployment, Google Cloud change, host installation, paid resource or real-account test was performed. **Owner code review is required before any commit**, per the Phase 3A instruction. Full changed-file inventory and proposed 3B scope: PHASE3A_CHANGE_REPORT.md.

### Final Phase 3A repository checks

- npm run format:check: passed; all matched files follow Prettier style.
- git diff --check: passed.
- Relative Markdown links: **45 documents checked, zero broken targets**.
- All **39 added/modified non-ignored files** are inventoried in PHASE3A_CHANGE_REPORT.md. A limited scan of those file contents for Google access-token/API-key/client-secret, private-key and GitHub-token literal patterns found zero matches. No environment files, build artifacts or dependencies were read by this scan. Pattern matching is not an exhaustive personal-information/security audit.
- git check-ignore confirms .env.local and synthetic browser screenshots remain ignored. No local credential/environment file was displayed, edited or staged. Production source scan found browser storage access only in PreferenceStore; no console logger, sessionStorage/IndexedDB call or raw HTML insertion was found.
- git diff confirms Gmail services/adapter, useMailbox, classifier, package/lockfile, Vite configuration and .env.example are unchanged. Scoped coverage includes the new preference store/hook/pure selectors. HEAD remains 4a06d27 on feat/personalized-onboarding; no staging, identity change or commit was performed.

## 2026-11-03 — Unified public landing and dark design milestone

### Baseline, scope and preservation

Inspected a clean **feat/clario-design** branch at **5ad1b62**, the owner-checkpointed Phase 3A baseline. This differs from the prompt's expected onboarding branch; the existing scoped branch was preserved. Read agent/product/design/security/architecture/quality instructions and actual components/styles/tests. Reference listing, public preview and linked current license terms were consulted; CLARIO_ADAPTATION.md records independent provenance. No proprietary source/assets, new dependencies, credential/Cloud changes, real mailbox test, commit, push or deployment occurred.

The public page is /; workspace paths are /app, /app/inbox, /app/analytics and /app/settings. Entry lazy-loads the existing App for fixed known paths and provides unknown-route recovery. History API view changes preserve the mounted app; normal public/app links navigate documents. Fresh loads reset session auth/mail, but browser back/forward cache may restore earlier memory; navigation is not deletion/revocation. Google consent remains governed by existing explicit controls.

Gmail services/adapters, useMailbox, classifier, domain preferences, onboarding components, preference hook/store/format/migration and personalization algorithms have **no source diff**. App changes are limited to view navigation, chart-token references, a public link and skip-link/main focus semantics. Existing browser suites now start at /app; Inbox reload assertions verify the retained path, mock data, zero retained live results and no silent reconnection. A preexisting browser helper Page annotation now imports its type explicitly.

### Executed verification

| Command                                                   | Actual result                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| npm run typecheck                                         | Passed                                                                                                              |
| npm run lint                                              | Passed                                                                                                              |
| npm run test:coverage                                     | **155 tests in 8 files passed**; final complete run 12.65s                                                          |
| Scoped V8 coverage                                        | **98.03% statements, 95.27% branches, 100% functions, 98.55% lines**; scope/thresholds unchanged                    |
| npm run test:e2e                                          | **21 development Chromium scenarios passed**, including all 15 baseline scenarios; final complete run reported 1.0m |
| npm run build                                             | Passed; lazy app and public entry assets emitted, including the intentionally public development privacy document   |
| npx playwright test --config playwright.preview.config.ts | **18 production-preview Chromium scenarios passed**, recorded run 29.9s                                             |
| npm run format:check                                      | Passed after documentation formatting; final whitespace/link checks recorded below                                  |

Coverage continues to include domain/pure feature/repository/service/hook logic and reusable common components; it excludes most page/form JSX and the new app-boundary/navigation files. Those are covered by explicit unit/component/browser interactions. These durations are suite statistics, not user performance or Gmail sync benchmarks. Earlier failed attempts were corrected: disabled CSS import and transformed file URL in the contrast test; FAQ locator containing a decorative plus; stale reload/Overview-only assertions after view deep links were introduced. The first mobile header composition was refined and reverified. No failed gate is presented as passed before execution.

Production checks use loopback 4102 and all Google traffic remains intercepted. The normal 4101 suite includes three dashboard scenarios whose source-module error injection requires Vite development; these are deliberately excluded from the production configuration. No real OAuth flow or mail was contacted by automated tests. No LCP/CLS/core-vitals or user-benefit claim is made.

### Accessibility, rendering and privacy evidence

Token checks enforce 4.5:1 normal-text pairs and 3:1 meaningful control/focus/chart-to-surface pairs. Measured token ratios: on-brand/brand **16.15:1**; secondary text/hover surface **6.31:1**; control border/hover surface **3.21:1**. Warning/error/success/info text against their named backgrounds measure **9.80/9.49/9.60/9.53:1** respectively. White text is not used on lime-filled primary actions. Decorative divider borders are separate from brighter control boundaries.

Rendered solid-background text checks report no failures across / and all four app views plus onboarding profile/review. They do not analyze gradient pixels or replace full accessibility testing; public gradients use the same tested dark surface endpoints and were inspected visually. Native FAQ, mobile navigation disclosure, skip link, radio/checkbox keyboard use, modal Escape/focus, focus rings, reduced motion and no horizontal overflow are tested. Public widths: **1440, 768, 390 and 320**; workspace/onboarding retain 1440/390 evidence. Screen-reader, 200% zoom, non-Chromium, exhaustive state and formal WCAG certification remain open.

Inspected synthetic artifacts under ignored output/playwright: **clario-hero-390.png**, **clario-hero-320.png**, **clario-landing-1440.png**, **clario-landing-390.png**, **mobile-overview.png**, and **phase3a-review-1440.png**. Additional tablet/desktop hero, analytics/settings, dialog, loading/error and fake Gmail screenshots were generated by the suites. These contain only bundled/intercepted synthetic application data. The separately named clario-reference.png captures only the public reference site and is never shipped as an asset.

Public tests block external HTTPS, verify no storage reads or Google fetch/UI, and confirm an intercepted live fixture's email address/subjects/token do not appear after returning to /. ProductPreview accepts no connected data and calculates only synthetic counts; it does not publish private screenshots. Fixed view paths/history state contain no private fields. Gmail scope/GET-only, disconnect/state cleanup, mock switching and original denied/expired/partial-failure protection tests remain passing. Same-origin scripts/device access, browser history cache and unresolved historical development-tool audit findings remain risks; no fresh dependency audit was run.

### Review and next milestone

Implementation and documentation are ready for owner review; no commit or staging has been performed. Complete inventory: CLARIO_CHANGE_REPORT.md. Recommended next: visual/assistive-technology/zoom/non-Chromium review and consented usability feedback before agreeing Phase 3B portability/metrics. Deployment still requires separately approved host fallback, headers, legal/privacy and origin review. Historical cache/sync, adaptive processing, learned corrections, signup, payments and SaaS authentication remain planned.

### Final unified-design repository review

- Final production rebuild after the public privacy text update passed: HTML 0.68 kB (gzip 0.40), shared CSS 47.87 kB (gzip 10.16), public entry JS 251.66 kB (gzip 79.91), lazy App JS 53.53 kB (gzip 16.14), privacy Markdown 7.70 kB. These are emitted asset sizes, not real-user performance measurements.
- Final production-preview run: **18/18 passed in 30.4s**. The preceding complete development run passed 21/21, including all original workflows; no code changed between those checks apart from finalized public document content.
- npm run format:check and git diff --check passed. **49 Markdown documents** checked with zero broken relative links. All **39 changed files** are included in CLARIO_CHANGE_REPORT.md.
- A limited credential-literal pattern scan of the 39 non-ignored changed file contents found zero Google access-token/API-key/client-secret, private-key or GitHub-token matches. Environment files, ignored outputs and dependencies were not read by this scan. This does not certify absence of every possible personal detail or security flaw.
- .env.local and local screenshots are ignored; .env.local is not tracked or displayed/edited. Source scanning found no new console logger, raw HTML insertion or persistent token/mail storage path. The only production localStorage access remains the unchanged PreferenceStore; public prose mentions it accurately.
- git diff confirms no source change to domain preferences, onboarding logic/mappings, settings preference logic, preference hook/store, Gmail/auth/metadata services/adapters, useMailbox, classifier, package/lockfile, Vite or .env.example. Color literals reside in the centralized token file, with the HTML theme-color fallback matching it.
- HEAD remains **5ad1b62** on **feat/clario-design**. No staging/identity change/commit/push/deployment or actual Google account operation was performed. Formal accessibility, deployment headers/fallback and consented user feedback remain review tasks, not fabricated completed work.

## 2026-11-03 — Inbox-first email workspace revision

### Baseline and boundaries

Started on feat/clario-design at 5ad1b62 with the **39-file uncommitted unified Clario milestone already present**. That work was preserved; no clean-tree assumption, reset, branch switch, staging or commit. Before changing the workspace, npm run test:e2e passed **21/21 in 48.0s** and synthetic baseline screenshots were copied to workspace-before-* names. Public LandingPage/ProductPreview/landing.css were not edited in this revision.

Implemented: /app Inbox-first with saved display default, explicit /app/overview, global existing local search, familiar message rows/read state, category shortcuts, optional density/layout/default settings, contextual analytics and a wide pane using already-loaded text/metadata. Phase 3A profile/goals schema/mappings/store/wizard are unchanged. PersonalizationPanel gains only a compact presentation/copy option. Current Gmail OAuth, gmail.readonly constant, METADATA GET adapter, message discovery, token lifetime, source cancellation, classification, metrics and search selector are unchanged.

Reader/send/AI documents are designs only. No FULL, thread, attachment or write request; no external AI, new dependency, Google setting, real mailbox operation, user-study participant, paid resource, deployment or push occurred. Source and study evidence: ../product/EMAIL_UX_RESEARCH.md. Scope and cumulative-diff interpretation: WORKSPACE_CHANGE_REPORT.md.

### Executed checks and actual outcomes

| Command                                                   | Actual result                                                                                                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm run typecheck                                         | Passed after implementation fixes                                                                                                                                                                             |
| npm run lint                                              | Passed                                                                                                                                                                                                        |
| npm run format:check                                      | Passed; final report formatting checked again below                                                                                                                                                           |
| npm run test:coverage                                     | **174 tests in 9 files passed**; last recorded complete run 6.79s                                                                                                                                             |
| Scoped V8 coverage                                        | **98.21% statements (496/505), 95.64% branches (395/413), 100% functions (126/126), 98.68% lines (449/455)**                                                                                                  |
| npm run test:e2e                                          | **24/24 development Chromium scenarios passed** after final mobile connection fix; reported 1.0m                                                                                                              |
| npm run build                                             | Passed; 2085 modules; HTML 0.68 kB, public entry JS 251.92 kB (gzip 80.05), lazy App JS 63.05 kB (gzip 18.22), shared CSS 48.53 kB (gzip 10.29), app CSS 9.56 kB (gzip 2.17), public privacy Markdown 8.90 kB |
| npx playwright test --config playwright.preview.config.ts | **21/21 production Chromium scenarios passed in 35.8s**                                                                                                                                                       |
| git diff --check                                          | Passed                                                                                                                                                                                                        |

Coverage scope/thresholds remain unchanged: pure domain/feature/repository/service/hook .ts logic and reusable common components; most page/reader JSX and app navigation are verified through explicit interactions, not included in that percentage. The new display preference logic is included. Browser durations/bundle sizes are environment diagnostics, not usability improvements, sync timings, accuracy or AI performance. Production omits the three source-module-injection dashboard scenarios, which run on the development server; all landing/Gmail/onboarding/workspace suites run against dist.

### Behavior, privacy and accessibility

New unit cases cover strict four-field display validation, bad/unknown/oversized/expanded payloads, no initial write, read/write/delete failures, independent key reset, default/explicit route precedence, local search/filters, read/unread counts, pane activation/responsive change/cleanup and keyboard focus. Existing 155 tests remain in the passing 174. A read-only UI never marks a message read.

Browser cases preserve all earlier workflows and add comfortable/compact geometry, native Display options, pane heading/Escape/current-row focus, Analytics navigation without a surprise modal, Back restoring reading context, 390px dialog fallback, default/reload/reset independent of onboarding and fake Gmail display changes with **unchanged request count and METADATA-only GETs**. Disconnect clears retained live records and the private detail. No message content/identifier/token is serialized into either preference key or route history.

Visual QA exposed two real layout issues: mobile boilerplate pushed messages down, and a long connected-state Disconnect label overflowed its control. Concise Inbox-only summary/source copy, native progressive disclosure, adjacent reset and safe button wrapping fixed them. The normal first-run 390×844 test now asserts the first message starts within the viewport. This is a bounded layout check; long notices/expanded options can still require scrolling. A view/session selection guard prevents an already-open pane turning into an unexpected modal on Analytics navigation, and close focus uses current DOM lookup rather than retaining detached private row nodes.

Other corrected test/development failures: strict object-to-record narrowing required a real type guard; browser-style exact options were removed from Testing Library role queries; direct-App fixtures were given the actual /app path; display selects gained explicit accessible names; duplicated test-local variable/missing disclosure activation were corrected. No failed command is represented as a passing run. No untrusted-input cast or real account was used to bypass a gate.

### Inspected synthetic screenshots and comparison

- Before: output/playwright/workspace-before-desktop-overview.png, workspace-before-mobile-overview.png, workspace-before-mobile-inbox.png. These were captured from the actual pre-change uncommitted design, not reconstructed mockups.
- After: workspace-after-desktop-viewport.png, workspace-after-split-viewport.png, workspace-after-mobile-viewport.png; full-list variants workspace-after-desktop.png, workspace-after-split.png, workspace-after-mobile.png are also captured.
- Existing suites regenerated synthetic Overview/Analytics/Settings/loading/error/native dialog/fake Gmail/onboarding captures. Public landing snapshots remain synthetic and visually unchanged.

Actual desktop/mobile viewports were inspected. The default now prioritizes message access rather than KPI cards; header search and row hierarchy are visible, while Overview/Analytics remain available. All message/source labels remain explicit. Reduced motion, native keyboard controls and no horizontal overflow pass, including the repaired fake-live mobile state. Solid-background text/token contrast checks remain green; full screen-reader/zoom/non-Chromium certification is **not** claimed. No participant was studied and before/after speed or satisfaction improvements are **not measured**.

### Documentation, preservation and remaining gates

Research separates empirical papers, official capability docs, anecdotal complaints and product hypotheses. The proposed 6–8-person counterbalanced study has tasks, anonymous consented collection, denominators and proposed gates but no results. PRD/roadmap/design/architecture/security/OAuth/threat/test/journal/interview documents distinguish implemented workspace behavior from planned reader/send/AI capabilities. ADR 0007 explains the deliberate root-default change; the new display key does not migrate the original onboarding schema.

A limited scan of **60 cumulative non-ignored changed files** found zero Google access-token/API-key/client-secret, private-key or GitHub-token literal matches. **56 Markdown documents** had zero broken relative links. Environment files, dependencies and ignored artifacts were not read by that scan; pattern checks are not comprehensive PII/security certification. .env.local and synthetic screenshots remain ignored. No refreshed dependency audit was run; historical development-tool findings and same-origin/device/browser-cache risks remain.

The final diff is cumulative with the earlier uncommitted design. No source diff exists for Gmail services/repositories, useMailbox, domain preferences, profile/goal mappings, OnboardingWizard, original preference hook/store, classifier, selectMessages, package/lockfile, Vite or .env.example. Landing components/style are unchanged relative to the start of this revision. No tokens/mail persist; only separate declared preference allowlists do. HEAD remains 5ad1b62 on feat/clario-design.

Remaining work: owner review of the cumulative change, the proposed formative study, formal accessibility/other-browser checks and separately approved plain-text FULL/MIME reader implementation. Rich HTML, threads, file downloads, sending, external summaries, complete synchronization/caching and deployment are not implemented. No commit/push/deployment is authorized by this report.

## 2026-11-03 — UX simplification after owner rejection

Scope: presentation and separate display-state persistence on feat/clario-design. Preserved all preexisting uncommitted Phase 3A/Clario/workspace work. No commit, push, deployment, additional permission, real mailbox access or external service added. This is engineering verification; owner visual acceptance and user-study outcomes remain open.

| Check                                                     | Actual result                                                                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| npm run typecheck                                         | Passed                                                                                                                          |
| npm run lint                                              | Passed, including temporary local verification scripts                                                                          |
| npm run format:check                                      | Passed                                                                                                                          |
| npm run test:coverage                                     | 179 tests / 9 files passed; enforced thresholds passed                                                                          |
| npm run build                                             | Passed; Vite static bundle generated                                                                                            |
| npm run test:e2e                                          | 29 Chromium tests passed, sequential final run (2.2m)                                                                           |
| npx playwright test --config=playwright.preview.config.ts | 26 Chromium production-preview tests passed (1.1m)                                                                              |
| Actual 200% Chromium zoom                                 | getZoom() = 2; 720 CSS px in a 1440px window, scrollWidth = 720; search, filters, drawer Escape/focus and message dialog passed |
| Rendered interaction/visual inspection                    | 320, 390, 1024, 1440px; first-run, rail, drawer, filter and reader states; no horizontal overflow in checked flows              |
| Supplemental drawer resize                                | Open at 320px → resize to 1024px closes drawer and focuses desktop toggle                                                       |
| Protected-file comparison                                 | 27 protected files compared byte-for-byte against the task-start snapshot; no changes                                           |
| git diff --check                                          | Passed                                                                                                                          |

Coverage scope is the existing configured domain/feature .ts, hooks, repositories, services and reusable .tsx components, not all App rendering or CSS. Statements 95.00%, branches 93.17%, functions 97.14%, lines 95.82%. Native drawer behavior is deliberately exercised in Chromium rather than claimed from jsdom coverage. The extra final source-control assertion is rechecked in the focused simplification suite; its log is listed below.

### Geometry and accessibility evidence

At 900px viewport height, synthetic first-run comfortable layout produced:

| Width | First row top (CSS px) | Complete rows within viewport | Document width |
| ----- | ---------------------- | ----------------------------- | -------------- |
| 320   | 317                    | 9                             | 320            |
| 390   | 281                    | 9                             | 390            |
| 1024  | 256                    | 11                            | 1024           |
| 1440  | 236                    | 11                            | 1440           |

These are measured layout properties, not time-saved or cognitive-load results. Baseline narrow screenshots show only the beginning of the first message near the viewport bottom. Checked flows cover named/titled rail destinations, keyboard summary activation, labeled filters, native modal containment, Escape/close/destination focus restoration, reduced-motion computed transitions, density, selected-only pane, dialog fallback, search and analytical routes. Rendered solid-text contrast checks passed in the exercised states; this is not full WCAG certification. Native title tooltips do not replace accessible names. Screen-reader, other engines/platforms and owner preference testing remain open.

### Failures found and resolved

- Background disclosure consumed Escape while a message modal was active: background handlers now defer to the active modal.
- A legacy fixed main width left unused space after rail collapse: sidebar and main sizing now use one variable, and browser tests compare actual row width.
- Legacy mobile nav selectors hid drawer text: explicit simplified navigation rules retain labels.
- Browser helpers needed to wait for the lazy-mounted app after reload before opening contextual controls.
- Overlapping development/production runs shared trace output and caused ENOENT during cleanup. That failed run is not counted as passing; preview-runs is now separate, and final suites ran sequentially.
- Playwright's default screenshot cropped actual browser zoom; the final zoom screenshot uses CDP's full visible-surface capture. The earlier before-zoom image is cropped and is not a complete comparison surface; the four normal-width before/after pairs are complete viewport captures.

### Artifacts and privacy boundary

All screenshots contain synthetic fixtures only. Local, ignored artifacts: output/playwright/simplification-before-{320,390,1024,1440}.png and simplification-after-{320,390,1024,1440}.png; simplification-rail-{1024,1440}.png; simplification-drawer-{320,390}.png; simplification-filters-320.png; simplification-after-zoom200.png; simplification-layout-results.json; simplification-zoom-after.json. Normal screenshots are 900px tall; zoom capture represents the actual Chrome window viewport. Existing workspace-after-split-viewport.png shows the selected-only reader.

Command logs (ignored .tmp): simplification-coverage-final.log, simplification-build.log, simplification-dev-passed.log, simplification-production-passed.log, simplification-final-assertions.log. Baseline hash comparison: simplification-baseline.json; per-task changes: simplification-changes.json. Temporary zoom extension has no declared permissions, operates only in its isolated local Chromium profile, and is not shipped. External requests were blocked for standalone visual/zoom inspection; Google behavior uses intercepted synthetic responses in integration tests.

Original onboarding schema/mappings/wizard, OAuth service/token lifecycle/scopes, repositories, metadata validation, search selector, analytical calculations, routing hook, dependencies, Vite setup and brand tokens were not changed. Mail/tokens still stay in memory; only allowlisted UI preferences persist. Automated Google checks retain denied/missing-scope/cancelled/401 and no-write coverage; service unit tests retain 403/429/5xx/expiry/retry cases. No new claim about real token revocation or mailbox reliability is made by this UI milestone.

Known trade-offs: filters and source diagnostics require an explicit disclosure; row badges now live in details; Overview and Analytics URLs share Insights. No full-body reader, sending, caching, cross-device UI preferences or new product feature is implemented. [Change report](SIMPLIFICATION_CHANGE_REPORT.md), [audit](../design/UX_SIMPLIFICATION_AUDIT.md), [learning notes](../learning/UX_SIMPLIFICATION_CONCEPTS.md).
