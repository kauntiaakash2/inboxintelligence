# Email workspace engineering and UX lessons

This milestone implements an inbox-focused surface and documents future capabilities. It does not implement a complete Gmail reader, sending or AI. Actual checks/screenshots live in ../quality/VERIFICATION.md; source evidence and the unexecuted user study are in ../product/EMAIL_UX_RESEARCH.md.

## 1. Human-computer interaction principles

People recognize familiar structures more easily than they recall a hidden navigation path. Header search, sender/subject/date rows and optional reading context align the UI with an email task. This is a design rationale, not measured proof that our audience is faster. Cognitive load also includes clutter: analytics are retained as contextual navigation/secondary views rather than required first-screen KPI interpretation. The existing Overview is preserved for users who prefer it.

Alternative: an analytics-first product can be appropriate for reporting tasks. Trade-off: inbox-first prioritizes triage and makes analytics one action away. Test actual discovery/reading tasks before claiming benefit; first-click success and task interviews are more informative than screenshot preference alone. Industry practice: match task hierarchy to the user's mental model while preserving secondary workflows.

## 2. User-centered design

A product requirement is not user research. We inspect the current surface, identify assumptions, research documented patterns, build a bounded prototype and plan evaluation. Goals/roles remain optional declarations; density/layout/default are separate explicit preferences. Working users can select Overview or Analytics rather than being forced into our preferred workflow.

Alternative: infer a role/layout from private email or mandate a pane. That creates unnecessary profiling and assumes a universal preference. The implementation separates settings without migrating the existing profile schema. Tests prove scoped reset and no extra Gmail requests. Industry practice: preserve user control and make decisions reversible while evidence matures.

## 3. Qualitative versus quantitative research

Qualitative observations/interviews explain why a user cannot find search or distrusts a summary. Quantitative task success/time/error counts describe what happened under a defined protocol. Published enterprise log findings do not establish causal benefits for our app, and a forum complaint does not establish prevalence. Official documentation establishes capabilities, not usability success.

Our research matrix labels source type, confidence and transfer limitations. The small proposed study uses paired descriptive results plus explanatory notes. Do not manufacture participants, generalize from a convenience sample or treat automated tests as user outcomes. Industry practice: combine methods and retain disconfirming findings.

## 4. Usability testing

The proposed counterbalanced study compares preserved baseline and revised builds with synthetic tasks. Task order/targets vary to reduce learning effects; equal introductions prevent coaching one condition more. Timing excludes hints only when clearly reported; failures/assistance remain recorded. Common tasks can be paired; an unavailable baseline feature should not be counted as a failed feature-specific task in a speed comparison.

Measures include unaided success, descriptive paired time, errors/focus recovery, ease, context retention and privacy comprehension. The proposed thresholds are decision rules, not collected results. Recruitment/recording need approval/consent and anonymous notes outside Git; no real mailbox is required. Industry practice: formative studies find actionable problems before larger outcome experiments.

## 5. Email MIME structure

A message is not always one text string. MIME represents typed parts: mixed content can include attachments, alternative can offer plain/HTML versions of the same content, and related can carry inline resources. A future FULL response exposes a parsed part tree; Gmail body transport data is base64url and must become bytes before charset decoding. Choosing an alternative is different from concatenating every part.

Current MessageContent renders only existing domain text/metadata. Future reader code needs bounded recursion/bytes/parts, encoded-word/charset handling, honest unsupported states and adversarial fixtures. RAW parsing would require a separate standards-compliant parser. Do not blindly double-decode transfer encodings or treat a named attachment as the body. Industry practice: normalize MIME at an adapter boundary and keep the UI independent of provider JSON. See GMAIL_READER_DESIGN.md.

## 6. Gmail conversation threading

A Gmail message ID identifies one stored message; threadId groups a provider conversation; RFC Message-ID identifies a message in email headers. They are not interchangeable. Subject similarity alone is not reliable grouping. A future thread read can expand beyond the newest-100 sample and needs deliberate expansion/coverage disclosure.

Current inbox rows are individual messages, not conversation counts. Future replies need correct threadId, References/In-Reply-To and subject rules as documented by Google. Test incomplete/reordered threads and quotation handling; do not claim full context from a selected metadata sample. Industry practice: retain provider relationships and source provenance rather than guessing threads from titles.

## 7. Incremental OAuth authorization

Permission is authority; UI layout is not authority. The pane consumes already-loaded records and does not justify a new scope/request. A future FULL reader can use the existing read-only scope but still expands the privacy purpose. A future send action needs separately reviewed gmail.send capability requested only when a user enables it, followed by granted-scope/account checks.

Denial must keep read-only exploration usable; expiry must not trigger hidden replay of a send. Access tokens remain in memory, never in the new display key. Google access consent is independent from external AI-transfer consent. Industry practice: separate capability gates/lifecycles rather than requesting every possible permission at startup. No incremental-send flow was implemented here.

## 8. Safe rich-content rendering

Untrusted HTML can contain scripts, handlers, forms, remote pixels or CSS loads. React text nodes are safe from HTML interpretation; React does not sanitize dangerously inserted HTML. Current modal and pane reuse a single text-only component, so visual layout does not create a new renderer trust boundary.

Future rich reading requires a maintained allowlist sanitizer, isolated sandbox/CSP, blocked remote content and validated explicit links/attachments. Sanitization, sandboxing and user control are complementary, not an absolute guarantee. Plain-text-first reduces attack surface but loses formatting. Test resource requests and adversarial payloads as well as text appearance. Industry practice: treat email as attacker input even when Google delivers it.

## 9. Email sending architecture

A send is a write with external consequences. Proposed compose state must separate editing, review, permission, in-flight, confirmed and unknown outcomes. Validate recipients/header injection, encode MIME safely, bind one immutable reviewed draft to a user action and block duplicate clicks. Do not enable auto-send through a shortcut or model output.

An in-flight guard prevents repeated local submission, not exactly-once delivery. A timeout after provider acceptance is ambiguous; blind retries can duplicate mail. A future send transport must handle unknown outcome and user reconciliation rather than reuse read-GET retry policy. All automatic tests stay synthetic, including accepted-but-response-lost cases. Industry practice: distinguish idempotent reads from non-idempotent side effects. See GMAIL_SEND_DESIGN.md; no compose/send code exists now.

## 10. AI summaries and prompt injection

Native Gmail Gemini summaries belong to Google's UI and eligibility rules; the consulted Gmail Message API has no native-summary field. Our future summarizer would be a separate provider/quality/cost responsibility. Summary, action/deadline and deep-analysis outputs need source evidence, uncertainty and independent evaluation, not a deterministic rule confidence label reused as model accuracy.

Mail can instruct a model to leak other messages, follow a URL or send a reply. Treat content as data, constrain the selected set, deny tools/action authority, validate structured output/source anchors and test adversarial examples. Delimiters alone do not guarantee safety. Separate provider transfer consent and budgets precede any request; no email content goes to external AI now. Industry practice: evaluate faithfulness, citation validity, abstention, harmful errors, latency and cost together. See AI_SUMMARIZATION_DESIGN.md.

## Implementation walkthrough and trade-offs

useWorkspacePreferences reads one strict four-enum record; no initial write. Invalid/blocked storage produces defaults and safe notices, explicit writes keep tab-local choices if persistence fails, and reset removes only this key. The unchanged Phase 3A store owns profile/goals separately. useDashboardNavigation resolves /app through a chosen default and explicit view paths through a fixed map; private state never enters history.

MessageList's workspace variant presents familiar rows without read-state writes. App owns a session/view-keyed selection. Closing a pane finds the current aria-current row for focus return instead of retaining a detached message DOM node. MessageContent supplies shared plain text/evidence to native MessageDetail or responsive MessageReadingPane; no renderer has a Gmail fetch client. matchMedia switches to the native dialog on narrow screens, keeping keyboard access and avoiding squeezed split columns.

Native Tab/Enter/Space, focused pane heading, Escape return and / search focus are tested; slash inside editable fields is not intercepted. Existing substring search/filters and all-loaded coverage are preserved; the visible help explicitly declines Gmail-operator support. Tests found that wrapping-label/select names needed explicit naming, and new direct-App fixtures needed to specify the actual /app route. Strict TypeScript also required a real unknown-object type guard. Fix contracts instead of casting around them.

Sources and full proposed study: ../product/EMAIL_UX_RESEARCH.md. API/security references are linked in the three architecture designs. None of these lessons or passing synthetic tests establishes participant benefit, production accessibility certification or real-world summary quality.
