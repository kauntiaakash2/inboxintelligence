# Implementation-based interview questions and answers

1. **Why a repository interface instead of calling Gmail in components?** EmailRepository.list returns normalized EmailMessage objects, so the same UI works with the mock source and a future validated Gmail adapter. Provider pagination/auth errors stay outside React rendering. The cost is one small abstraction with a clear replacement responsibility.

2. **Does TypeScript make API input safe?** No. Types disappear at runtime. MockEmailRepository validates unknown input for required fields, dates, labels, sender shape, optional body and duplicate IDs before returning typed messages. A future adapter must also enforce size limits and provider normalization.

3. **How does the classifier handle conflicting evidence?** It is an ordered decision list: first matching rule wins, so a Spam label takes precedence over a security-themed subject. Matching evidence is exposed in the reason and rule ID. This is deterministic behavior, not a learned model.

4. **What does 85% confidence mean here?** It means two configured evidence types matched: min(.95,.65+.10×2)=.85. It is not an 85% chance of correctness. Real confidence calibration would require independently labeled examples and evaluation.

5. **How do search and filters compose?** selectMessages trims and lowercases the query, searches sender name/address and subject/snippet, then combines that predicate with exact category and priority predicates using AND. Empty input matches all text; reset restores all 96 fixture messages. Tests cover conflicts and empty results.

6. **How are metrics protected from leaking mail?** Instrumentation constructs a new allowlisted event object instead of storing arbitrary input. No body, subject, sender address or token fields are accepted. Snapshots are copied; the buffer caps at 10,000. Synthetic and real sources are calculated separately. Caller-provided job IDs must remain opaque.

7. **Why isn't 93.75% demo avoidance a real performance result?** The fixture policy classifies 90 of 96 messages from metadata and flags six unknown messages. Full bodies are already bundled and no Gmail call occurs. To claim savings we need actual request/byte measurements against a full-fetch baseline with identical message coverage.

8. **Why native dialog and browser tests?** showModal provides modal semantics and focus containment; the app handles Escape/close and restores trigger focus. jsdom is not a substitute for actual modal behavior, so Playwright checks keyboard activation, focus, visibility and mobile layout in Chromium. This still is not a complete accessibility audit.

9. **How would resumable Gmail sync avoid duplicates or missing changes?** Use account+message ID unique keys, transactional page upserts/checkpoints and idempotent replay. Capture a history baseline before enumeration, replay changes afterward and reconcile periodically. Expired history 404 triggers full rescan. This is a documented future design, not implemented Phase 1 behavior.

10. **Why browser-first, and where would tokens live?** Static hosting and local processing suit one personal account and a low operating budget. The browser cannot hide a client secret or guarantee closed-app work. Implemented GIS access tokens stay only in memory, with explicit consent/reconnect; IndexedDB would hold minimized metadata and checkpoints, never long-lived browser credentials. SaaS/offline access requires a separate backend security design.

Practice each answer with the actual relevant function or ADR. Do not claim production users, accuracy, real-account Google acceptance or paid infrastructure experience from mocked milestones.

## Phase 2 questions grounded in the current implementation

11. **Why two buttons for Connect and Authorize?** Loading GIS is asynchronous and can consume the browser's transient user activation. The second explicit click calls requestAccessToken synchronously, avoiding silent authorization or popup dependence on an earlier gesture.
12. **Why is a frontend environment variable not a secret?** Vite compiles VITE_ values into downloadable code. The OAuth client ID identifies a public client; an embedded client secret would not remain confidential.
13. **How are granted scopes checked?** The callback first validates shape/scope, then uses hasGrantedAllScopes for gmail.readonly, with include_granted_scopes=false in the request. Missing permission causes no Gmail request.
14. **What if the browser sleeps through token expiry?** The service uses a timer and checks the expiry clock before every token use. A Gmail 401 also clears authorization; no hidden reconnect is attempted.
15. **How is the sample bounded?** Follow nextPageToken until 100 unique IDs or the list ends, request only METADATA, use four workers, and sort by internalDate. Always disclose excluded Spam/Trash and skipped failures.
16. **Why validate provider JSON?** Gmail carries sender-controlled headers, and TypeScript is erased at runtime. IDs, date strings, header shapes and labels must be validated before producing domain records.
17. **How do you handle 429 versus 403?** Retry 429/5xx at most three times with backoff/jitter and Retry-After. This version conservatively stops on 403 rather than parsing private error payloads or assuming every refusal is retryable.
18. **How do you prevent stale mailbox data after disconnect?** Abort the load, invalidate its source/session key and clear retained result state. Detail selection stores an ID/key, so it cannot retain a separate private message object. Late callbacks/results are ignored.
19. **Why block reconnect during revocation?** A delayed revoke can invalidate a newly issued token for the same app grant. Clear local state immediately and wait at most ten seconds for revocation before permitting a fresh flow.
20. **What did the tests actually prove?** They verified the implemented lifecycle, request shapes and UI with fake services, including negative cases. They did not prove real consent configuration, account eligibility, live Gmail behavior, accuracy or API savings.

## Phase 3A — five additional implementation questions

21. **Why isolate a controlled draft from applied preferences?** Back/Continue can retain selections while Skip discards an edit without changing saved presentation. Confirmation is the only point that validates, saves and applies; React render/effects do not persist data or authorize Gmail.
22. **Why validate localStorage when TypeScript already defines the schema?** Stored JSON can be malformed, obsolete or edited outside the app. Types are erased; exact runtime key/version/enum/array/subset validation returns a safe canonical object before use. Unsupported versions fall back without invented migrations.
23. **Why localStorage here but IndexedDB later?** One small enum-only record needs simple persistence. A mailbox cache needs asynchronous indexed access, account isolation and transactions for messages/checkpoints, plus retention/deletion decisions. Neither browser store defeats same-origin XSS.
24. **How do you personalize without changing classification or coverage?** Pure selectors copy/sort every record by existing priority bands, preferred category and date. Classification objects, discovery and all filter options remain intact. Tests compare IDs, identity and classifications and confirm preference edits create no Gmail requests.
25. **How do you evaluate optional onboarding responsibly?** Use synthetic tests for correctness and separately consented usability/outcome evidence. Future opt-in aggregate completion/skip metrics need explicit denominators; skipping is legitimate and not failure. No profile/goal values need enter telemetry, and no activation or benefit is claimed from test results.

Code walkthrough and alternatives: [Phase 3A concepts](PHASE3A_CONCEPTS.md).
