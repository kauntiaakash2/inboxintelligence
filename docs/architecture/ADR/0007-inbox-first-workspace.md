# ADR 0007 — Inbox-first task entry with optional reading context

Status: implemented, pending owner review and usability evaluation. Date: 2026-11-03.

Context: The existing public/dashboard identity is coherent, but /app starts with analytics cards and puts search inside a secondary view. The owner wants an email workspace with differentiated intelligence. Published studies support email as contextual reading/triage work; official Gmail docs establish familiar patterns, while actual preference/performance in our audience remains unvalidated. Sources and study protocol: ../../product/EMAIL_UX_RESEARCH.md.

Decision: /app defaults to Inbox or an explicit saved UI default. Keep Overview at /app/overview and preserve /app/inbox, Analytics and Settings. Global local search, familiar rows/read-state cues, density choice and contextual insights lead the task flow. Preserve existing search/classification/Gmail/onboarding behavior. Add optional side-by-side rendering of already-loaded content at >=1100px; keep the native dialog default/fallback. The pane is a presentation change, not permission to request FULL data.

Persist only four display enums in a separate versioned key, with strict runtime validation and reset/errors. Do not modify the Phase 3A role/goals schema or priority algorithms. Explicit routes override defaults; editing the default does not force navigation or restart Gmail. Native controls and ordinary keyboard behavior take precedence over a custom Gmail-shortcut emulation.

Alternatives: retain analytics-first entry; force a pane on everyone; rebuild a complete Gmail clone; overload the onboarding schema; add body fetching, sending or AI in the redesign. Those either miss the requested task emphasis, reduce control, risk compatibility or cross unauthorized data/authority boundaries.

Consequences: Root /app changes initial behavior deliberately; explicit /app/overview preserves access to the old entry. Tests must distinguish the root default from explicit views instead of weakening security assertions. The loaded set is still not Gmail INBOX-only or full mailbox coverage. Opening does not mark read. Preferences remain per-origin and readable by same-origin code/device users; no cross-device profile or cache exists. Maintain the small native routing approach until complexity warrants a library.

Evidence: regression/browser/build results in ../../quality/VERIFICATION.md; synthetic before/after screenshots are design evidence, not participant outcomes. Run the proposed counterbalanced study before claiming greater usability. Full reading, sending and AI remain separate approved milestones with documented security/consent gates.
