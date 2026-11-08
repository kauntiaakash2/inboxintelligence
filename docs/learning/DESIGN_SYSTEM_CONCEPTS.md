# Shared identity and public/workspace architecture — implementation lessons

The problem was visual consistency without disturbing verified onboarding and Gmail integration. Implementation references: src/styles/tokens.css, src/app/Entry.tsx, src/app/useDashboardNavigation.ts and src/features/landing. Evidence is in ../quality/VERIFICATION.md. No new dependency, real-mail test, proprietary asset or deployment is part of this milestone.

## 1. Design systems and semantic tokens

A token names a responsibility: --text-secondary means supporting readable text; --brand means action/identity. Hardcoding green into every icon gives no guidance about purpose. Our palette separates lime actions, amber warnings/high priority, mint success and muted metadata. Existing --green aliases keep old selectors stable during migration, but new styles should prefer semantic names.

Alternative: page-specific palettes are initially quick, but drift across settings, dialogs and onboarding. A complete component framework would introduce unnecessary work for this small product. Trade-off: compatibility aliases reduce risk now but need documented ownership. Test shared text/control pairs, then inspect actual rendered components. Industry practice: design tokens let designers and engineers change a contract instead of chasing hex literals. Interview framing: choose semantic names by intent rather than an implementation color.

## 2. CSS variables and Tailwind integration

Custom properties are resolved by the browser at runtime and inherit through the DOM. index.css imports tokens.css through the existing official Tailwind Vite pipeline. @theme exposes page/panel/ink/brand utility colors backed by the same custom properties. The category donut builds its segments with var(--chart-N), keeping data calculations independent of theme values.

Alternative: separate TypeScript and Tailwind color constants duplicate configuration. CSS variables avoid that duplication without adding a theme provider. Common mistakes: white text on a lime action, treating a decorative border as a sufficient input boundary, and hardcoding new chart colors in JSX. Token tests read the source file directly because this project's Vitest setup disables CSS imports. Industry practice: a single design-token source feeds multiple rendering contexts.

## 3. Component reuse and consistency

We retained App, MessageList, MessageDetail, StatusPanel, Gmail controls and the full onboarding component tree. Shared .button/.setup-primary, .panel, .tag and navigation selectors already provide meaningful primitives; a Button/Card wrapper was not required merely to rename classes. New public components stay in features/landing, and ProductPreview reuses actual pure classify/summarize functions over synthetic fixtures.

Alternative: rebuilding the dashboard or introducing a second design framework risks behavior regressions. Trade-off: existing CSS is adapted rather than rewritten into an ideal new abstraction. Tests preserve behavior and verify unchanged source areas. Industry practice: incremental visual migrations protect business logic with regression suites. Interview framing: reuse the responsibility, not necessarily every markup fragment.

## 4. Responsive design

Desktop marketing uses wide typography, a three-column feature grid and a two-panel product illustration. Tablet moves features to two columns; below 700px navigation becomes a disclosure and content stacks. Existing workspace breakpoints remain intact. minmax(0,1fr) allows grid tracks to shrink; wrapping text and explicit min-width avoid overflow.

The first mobile screenshot showed the header CTA wrapping awkwardly. A three-column mobile header grid with smaller wordmark spacing fixed composition without hiding the CTA. Alternatives: shrinking all text harms readability; horizontal overflow hides controls. Test widths 1440/768/390 plus original workspace mobile interactions. Industry practice: compose key viewport layouts and then test constraints between them, rather than treating responsive design as scaling a desktop screenshot.

## 5. Accessibility and contrast

Normal text needs at least 4.5:1 contrast, large text 3:1, and meaningful controls need distinguishable boundaries. Near-black on lime passes the intended button contract; white on lime does not. --border-subtle is decorative; --border-control is brighter for inputs/buttons/toggles. Colors also carry words, native checked state or aria-current so meaning is not hue-only.

Skip links focus the main region. Native details/summary provides FAQ semantics; native radios, checkboxes and modal behavior remain in onboarding/details. A mobile navigation disclosure uses aria-expanded/aria-controls and Escape focus return; it is not an ARIA menu with desktop-application keyboard expectations.

Token checks enforce text/status/control/chart pairs, and Chromium inspects actual solid-background text colors across views/onboarding. Gradient endpoints use the same dark range and are reviewed visually. These checks do not establish full WCAG, assistive-technology, zoom or non-Chromium conformance. Industry practice: combine automated contracts with manual task testing, and state evidence boundaries honestly.

## 6. Marketing versus application architecture

Public content explains capabilities and limitations; a workspace manages private state and ongoing operations. Entry renders LandingPage at / and lazy-loads App only at known /app paths. ProductPreview accepts no props carrying a live mailbox: its only input is the bundled synthetic dataset. There is no public authorization button that automatically opens Google consent.

Alternative: keeping the connected app mounted behind marketing content can accidentally expose data or continue hidden work. Our normal cross-boundary links reset the document; within the app, views retain the same mounted state. Trade-off: fresh workspace loads start without mail/auth, but browser back/forward cache can restore earlier page memory. Navigation is not a deletion/revocation control. Disconnect is still explicit. This is a public/workspace separation, not SaaS authentication or access control. Industry practice: separate public presentation from authorized data consumers.

## 7. Client-side routing

useDashboardNavigation maps fixed view names to /app, /app/inbox, /app/analytics and /app/settings. An explicit action pushes a path with null history state; popstate restores the view for Back/Forward. The app is not keyed/remounted on every view change, preserving OAuth/mailbox/onboarding session behavior. Direct loads restore the named view; filters and private IDs do not enter URLs.

Alternative: React Router would help with a larger nested route/data graph, but a dependency is not needed for four fixed views plus normal document links. Hash routing avoids a host fallback but does not naturally match the requested paths. Trade-off: static hosts must route client paths to index.html; the recovery UI alone does not produce a server HTTP 404. Test direct loads, reload, Back/Forward and unknown routes. Industry practice: reconsider a small custom router as requirements grow; do not build a framework accidentally.

## 8. Frontend performance

The landing page uses original HTML/CSS/SVG icons, local fonts and no autoplay/video/animation library. Content does not wait behind a loader. The App import is lazy with a readable Suspense status and home link. The preview computes small deterministic aggregates from 96 fixtures; it performs no network sync. Native FAQ avoids shipping an interaction library.

Alternative: a captured product image is simpler but may become stale, inaccessible or accidentally contain private data; the original fixture-only illustration remains text-readable. A full embedded live dashboard increases state/privacy complexity. Bundle sizes are recorded as build evidence, not user latency or Core Web Vitals. No LCP/CLS/performance benchmark is claimed without controlled measurement. Industry practice: avoid unnecessary requests/dependencies before optimizing a small arithmetic function.

## 9. UI testing and regression diagnosis

Unit tests verify public content, links, state isolation, route mapping/popstate and color contracts. Component tests retain all Phase 3A/Gmail behavior. Development Chromium runs the original workflows plus public/routing/privacy/contrast checks; production preview reruns the landing/Gmail/onboarding suites against dist. The dev-module failure injection test cannot work against bundled source, so it remains explicitly dev-only.

Failures taught two different lessons: the CSS import was empty under css:false and needed source-file reading; and old reload assertions expected Overview even after real view deep links were added. The latter assertions now verify the retained Inbox route, 96 mock messages and no silent reconnection, preserving the security intent. The first FAQ exact-text locator included a decorative plus; selecting the semantic summary resolved it. Tests must adapt to a justified navigation contract without weakening privacy/auth assertions.

Industry practice: use unit/component/browser/build evidence for different failure classes, inspect screenshots, fix composition and rerun affected gates. High coverage is neither design quality nor classifier accuracy.

## 10. Design licensing and intellectual property

A reference can inform general contrast, rhythm and hierarchy without supplying reusable code/assets. The Clario listing links a Limited license; its current terms allow some project use of free content while restricting standalone redistribution, competing assets and claiming original ownership. Free does not mean public domain. We did not acquire/remix/copy template source, illustrations, marks or fonts. Our preview, layout and CSS are independently authored; existing Lucide licensing remains with the dependency.

Alternative: using original template files would require applying their exact acquisition/license conditions and reviewing intended distribution. No such reuse was needed. Keep an asset provenance note and do not promise legal guarantees or affiliation. ../design/CLARIO_ADAPTATION.md records sources and implementation choices. Industry practice: licensing is an engineering input for assets/dependencies; ask a qualified reviewer when actual reuse is unclear.

## Commands and interview practice

npm run typecheck checks contracts; npm run lint checks code/hooks; npm run format:check checks consistent formatting. npm run test:coverage exercises deterministic logic/component cases, npm run test:e2e runs local browser flows, npm run build verifies bundling, and npx playwright test --config playwright.preview.config.ts exercises built assets. Tests use synthetic Google services only. No command deploys or needs a real mailbox.

Practice the five new questions in INTERVIEW_PREPARATION.md against tokens.css, Entry, the navigation hook and ProductPreview. Relevant primary references: [MDN History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API), [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [Framer listing](https://www.framer.com/marketplace/templates/clario/), [Community license terms](https://www.framer.com/legal/community-terms).
