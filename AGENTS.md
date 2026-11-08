# Inbox Intelligence — agent instructions

## Mission and current state

Build explainable, privacy-conscious email intelligence: Understand → Classify → Prioritize → Optimize → Measure. Phase 3A adds optional, user-declared onboarding to the Phase 2 synthetic/Gmail dashboard. Only the strictly validated preference allowlist persists under inbox-intelligence.preferences; tokens, mail and diagnostics remain memory-only. No AI model or backend exists. Real account verification is separate and requires explicit owner approval; automated Google services must remain mocked. Never describe planned work as implemented. Inspect relevant files and Git status before modifying anything; preserve existing changes.

## Architecture

`domain/models.ts` is the application contract. `MockEmailRepository` validates and copies the fixture; `loadInbox` runs deterministic classification and session instrumentation; pure selectors and aggregators feed React. UI has Overview, Inbox explorer, Analytics, and Settings. Browser session memory holds mailbox and authorization data. PreferenceStore validates versioned declared choices in localStorage; pure personalization selectors reorder presentation without changing classification, retrieval or coverage. GmailEmailRepository maps METADATA responses through gmailMetadata and shared domain validation; no snippets, bodies, attachments or write operations. GmailAuthorization holds private in-memory tokens; useMailbox isolates sources/sessions and aborts obsolete work. Never put raw Gmail responses or tokens into components.

## Coding standards

Use strict TypeScript, explicit domain unions, functional components, and hooks. No unjustified `any`, non-null assumptions at untrusted boundaries, or broad type casts. Keep business logic pure and outside rendering. Use small named functions and meaningful boundary validation. Prefer feature folders; avoid empty abstractions. Use semantic controls, labeled inputs, visible keyboard focus, native modal focus containment, and reduced-motion support. Update design tokens rather than adding arbitrary one-off styles. Extract components as responsibilities grow.

## Dependencies

Use npm and commit its lockfile. Check official documentation before changing setup patterns; use the Tailwind Vite plugin. Add a dependency only for a foreseeable responsibility, inspect audit findings, and record unresolved advisories. No global installation, paid API, or dependency major upgrade merely to silence an audit without compatibility checks.

## Privacy and prohibited actions

Never request Gmail passwords; access actual mail in mock milestones; store tokens in localStorage, IndexedDB, source or logs; render raw email HTML; load remote email images; send email content to external models; commit secrets; invent Google verification, accuracy, savings, user counts, or test results. VITE_ configuration is public. Metric events must be allowlisted and content-free. Ask before host changes, external account operations, publication, paid resources, deployment, destructive commands, or anything outside authorized scope. Do not modify Git identity. Do not push without approval.

## Testing and documentation

Run `npm run typecheck`, `npm run lint`, `npm run test:coverage`, and `npm run build` for relevant implementation changes. Use deterministic boundary, rule precedence, unknown, empty, and failure tests. Browser verification must exercise actual rendered interactions and narrow/wide viewports; record limitations honestly. Do not claim untested code works. Keep README, roadmap, screen inventory, engineering journal, and verification report synchronized with feature status. Record important decisions in ADRs. Metrics must specify synthetic versus real, formula, and limitations.

## Git workflow and review checklist

Inspect diffs; work on a scoped branch; use conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Preserve commits and user changes. A checkpoint requires checks to pass. Never invent identity. Review: correct source labels, safe rendering, input validation, no credentials, empty/error/loading states, responsive behavior, semantic controls, tests, lockfile, docs, and actual command evidence.

## Definition of done

Search and combined filters work; explanations and analytics are visible; mock labels are unmistakable; build, lint, types and meaningful tests pass; dev server and browser workflows are verified; docs distinguish limitations; no real account touched. Unmet criteria remain explicitly open.

## Teaching and uncertainty

Explain each milestone through its problem, concept, chosen approach, alternatives, trade-offs, code walkthrough, mistakes, tests, industry use, and interview framing. Keep permanent lessons in `docs/learning`. State assumptions and inspect code or primary sources to resolve uncertainty. Ask concise questions only when the answer materially blocks safe progress. Never fill gaps with fabricated evidence.

## Personalized onboarding boundary

Inspect domain/preferences.ts, preferenceStore, usePreferences and onboarding selectors before changing setup. Goals override role defaults using existing category IDs only. All choices are optional; keep Gmail and dashboard usable. Never add mail, account identifiers, tokens, inferred traits or free text to the preference schema. Unknown schema versions fall back safely; an explicit migration must precede accepting another version. Clear only the app preference key. Test read/write/delete failures, keyboard use and source-state preservation. Run format:check and intercepted Chromium checks alongside the existing gates. Phase 3A changes must remain uncommitted until owner review, per the current instruction.

## Public/workspace identity

Entry serves the public landing page at / and lazy-loads the existing workspace at known /app paths. useDashboardNavigation owns fixed view URLs/popstate; never put private IDs, search values or tokens into history. Public preview accepts no mailbox state and uses synthetic fixtures only. Shared dark/lime semantic tokens live in styles/tokens.css; preserve onboarding business logic/format and Gmail contracts during styling. Run public routing/privacy/contrast checks and production-preview Chromium after visual changes. Template references require documented license review; no proprietary assets were incorporated. No commit/push/deployment without owner approval.

## Email workspace revision boundary

/app is Inbox-first unless a valid separate display default is chosen; /app/overview preserves explicit Overview. Keep global local search, filters, source labels and metadata-only disclosure. Workspace density/layout/default use a separate allowlisted key; never migrate/expand the original onboarding schema merely for UI settings. MessageContent is shared by dialog/pane and accepts already-loaded domain records, never raw Gmail HTML or a fetch client. FULL reading, sending and AI are designs requiring separate scopes of work; do not infer authorization from a reading pane or Gmail-like layout. User-study protocol is unexecuted; no participant outcomes may be invented. Preserve all preexisting uncommitted Clario work and do not commit/push/deploy without approval.
