# Ten implementation-based interview questions and answers

1. **Why a repository interface instead of calling Gmail in components?** EmailRepository.list returns normalized EmailMessage objects, so the same UI works with the mock source and a future validated Gmail adapter. Provider pagination/auth errors stay outside React rendering. The cost is one small abstraction with a clear replacement responsibility.

2. **Does TypeScript make API input safe?** No. Types disappear at runtime. MockEmailRepository validates unknown input for required fields, dates, labels, sender shape, optional body and duplicate IDs before returning typed messages. A future adapter must also enforce size limits and provider normalization.

3. **How does the classifier handle conflicting evidence?** It is an ordered decision list: first matching rule wins, so a Spam label takes precedence over a security-themed subject. Matching evidence is exposed in the reason and rule ID. This is deterministic behavior, not a learned model.

4. **What does 85% confidence mean here?** It means two configured evidence types matched: min(.95,.65+.10×2)=.85. It is not an 85% chance of correctness. Real confidence calibration would require independently labeled examples and evaluation.

5. **How do search and filters compose?** selectMessages trims and lowercases the query, searches sender name/address and subject/snippet, then combines that predicate with exact category and priority predicates using AND. Empty input matches all text; reset restores all 96 fixture messages. Tests cover conflicts and empty results.

6. **How are metrics protected from leaking mail?** Instrumentation constructs a new allowlisted event object instead of storing arbitrary input. No body, subject, sender address or token fields are accepted. Snapshots are copied; the buffer caps at 10,000. Synthetic and real sources are calculated separately. Caller-provided job IDs must remain opaque.

7. **Why isn't 93.75% demo avoidance a real performance result?** The fixture policy classifies 90 of 96 messages from metadata and flags six unknown messages. Full bodies are already bundled and no Gmail call occurs. To claim savings we need actual request/byte measurements against a full-fetch baseline with identical message coverage.

8. **Why native dialog and browser tests?** showModal provides modal semantics and focus containment; the app handles Escape/close and restores trigger focus. jsdom is not a substitute for actual modal behavior, so Playwright checks keyboard activation, focus, visibility and mobile layout in Chromium. This still is not a complete accessibility audit.

9. **How would resumable Gmail sync avoid duplicates or missing changes?** Use account+message ID unique keys, transactional page upserts/checkpoints and idempotent replay. Capture a history baseline before enumeration, replay changes afterward and reconcile periodically. Expired history 404 triggers full rescan. This is a documented future design, not implemented Phase 1 behavior.

10. **Why browser-first, and where would tokens live?** Static hosting and local processing suit one personal account and a low operating budget. The browser cannot hide a client secret or guarantee closed-app work. Planned GIS access tokens stay only in memory, with explicit consent/reconnect; IndexedDB would hold minimized metadata and checkpoints, never long-lived browser credentials. SaaS/offline access requires a separate backend security design.

Practice each answer with the actual relevant function or ADR. Do not claim production users, accuracy, Google integration or paid infrastructure experience from this synthetic milestone.
