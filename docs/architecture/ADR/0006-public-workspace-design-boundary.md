# ADR 0006 — Public/workspace boundary and shared semantic identity

Status: Accepted implementation; owner review pending. Date: 2026-11-03.

Context: A public landing page must not expose the state of an optional connected Gmail workspace. The existing four-view app has no router; the verified onboarding and authorization lifecycles must survive view changes. Design should unify the product without changing classification/storage logic or copying restricted template assets.

Decision: Use Entry for /, four known /app paths and unknown-route recovery. Public/workspace links are normal document navigation. Lazy-load App with an accessible fallback; keep all app views within its existing mounted component and use the native History API for view paths/Back/Forward. Only fixed public view names enter URL/history; no filters, message IDs, tokens or declarations. Use one independently authored semantic CSS token layer and adapt existing components. Public preview reads only synthetic fixtures.

Alternatives: A router library supplies nested/layout/data-routing features but adds an unnecessary dependency for five fixed surfaces. Hash-only routing avoids a hosting fallback but does not satisfy requested /app paths cleanly. Keeping the live app mounted behind the landing surface risks accidental private-state reuse and hidden background work. Rebuilding the dashboard would jeopardize verified functionality for a visual objective.

Trade-offs: Cross-boundary links use document navigation; fresh loads reset app state, while browser back/forward cache may restore earlier page memory. Navigation does not revoke Google consent and is not a deletion control. In-place app view navigation preserves it. New direct app paths need static-host SPA fallback. Unknown route UI does not control the HTTP status. Growing route complexity should trigger reassessment instead of expanding an ad hoc router. Tokens preserve existing class hooks at the cost of compatibility aliases; new styles should use semantic names.

Evidence: unit route/hook tests, existing fake Gmail/onboarding workflows, new public/privacy/keyboard/contrast checks and production-preview Chromium tests. No real-account access, deployment or Google change. This is visual inspiration, not template asset reuse; see the adaptation/license note.

Reference: [MDN History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API).
