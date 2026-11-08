# UX specification

## Implemented navigation and screens

The public page is at /. Inbox is the default workspace at /app (or a saved display default); explicit views are /app/inbox, /app/overview, /app/analytics and /app/settings. Native History API navigation preserves the mounted dashboard and supports Back/Forward; direct loads restore the named view. Filters/message selections remain session state, not URL parameters. The sidebar has Inbox, Insights and Settings, with an explicit persistent expand/collapse choice. Below 768px, the header opens a native modal navigation drawer; Escape, backdrop, close or destination selection dismisses it and restores toggle focus. A persistent header disclosure identifies Mock data or Live Gmail sample and contains the single connection control, privacy explanation and aggregate diagnostics.

Insights consolidates the former Overview and Analytics presentations. Both /app/overview and /app/analytics remain valid; one sidebar destination opens /app/analytics. Category totals, top senders, daily frequency, priority distribution and processing metrics retain their original calculations. Compact totals replace decorative KPI cards; the high-priority action still opens a filtered inbox.

Inbox explorer searches sender/name/address/subject/snippet with trimmed case-insensitive substring matching. Category and priority combine with search using AND. Reset clears all controls. Results remain newest-first fixture order. Each compact row exposes read state, sender, subject/preview (category fallback) and date. Labels, priority, category and explanations remain in message details. Category and priority controls are inside the keyboard-accessible Filters disclosure, which indicates active filters; Escape restores its trigger. Reset and empty-state Clear filters preserve the existing selector behavior. No read/write action mutates Gmail. Empty results offer a recovery action.

Message detail opens a native modal; shows plain-text body, sender/date, reason, category, rule/fallback, confidence caveat and fixed priority score. Escape/close returns focus. No reply/forward, remote images, attachments, HTML or category correction controls exist.

Analytics shows category totals, top sender counts, daily frequency, priority distribution and simulated retrieval decisions. Charts explain their unit, source and limitations. Categories can navigate back to filtered messages. Uniform fixture volume is explicitly described rather than interpreted as real behavior.

Settings identifies the active mock/live source, authorization status, read-only boundary, disconnect control, planned synchronization preferences and session-memory privacy rules. The working connection controls live once in the persistent source disclosure, available from every view. There is no category-management screen; category exploration is implemented while rule/category editing is planned.

## Planned journeys

- OAuth is implemented for the bounded sample; later account/persistence journeys must retain explicit consent and safe reconnect behavior.
- First import: state exact newest-sample coverage → show metadata progress → keep partial results labeled → retry failed IDs → distinguish completion from historical coverage.
- Correction: choose new category → show local-only change and explanation → persist provenance → undo → optionally refine future rules after evaluation. Never imply Gmail labels changed.
- Sync preferences: sync on open by default, explicit visible refresh, optional interval while open; display stale state when closed/expired.
- Failure/reconnection: sanitize error → identify auth/rate/network/storage class → preserve successful cache → retry with backoff or explicit reconnect. Expired history triggers reconciled full import, not deletion of all visible data.
- Export/deletion: deliberate choice, explain sensitive export file and difference between local deletion and revoking Google consent; completion verified across account stores.

Full historical import, corrections, preferences and export/deletion journeys remain planned; bounded OAuth/sample retrieval is implemented below. SCREEN_INVENTORY.md and quality verification track actual implementation and evidence.

## Phase 2 implemented flow

Every view can open the header source disclosure to reach Connect/Authorize or Disconnect. Authorization errors and expiration reopen it for an accessible alert. Initial mock mode makes no Google requests. Connect loads GIS; a second explicit Authorize click opens consent. While waiting, Cancel keeps mock mode and invalidates late callbacks. A valid grant triggers metadata progress, then source-aware counts/charts and a permanent partial-coverage banner. Live message detail states that bodies/attachments were not retrieved; snippet search only applies to mock fixtures. Empty samples and skipped metadata failures are explicit.

Refresh Gmail repeats the bounded read without opening consent automatically. Expiry/401 clears live state and restores mock with an explicit reconnect message; denial/missing scopes never issue mailbox requests. Disconnect clears local state first, then attempts remote revoke. It can affect all app-granted scopes, and failure to confirm revocation is shown. Planned journeys above describe later full import/correction/export work; the former Phase 1 disabled OAuth placeholder has been replaced.

## Phase 3A implemented onboarding

A small first-run invitation appears above the list, with Set up your view and Skip setup; returning users manage saved choices in Settings without a repeated summary card. It never locks navigation, opens automatically as a modal or delays usable content. Start opens an inline three-step form: Profile → Goals → Review. Every field is optional. Native radio buttons select one profile; Leave profile blank clears it. Native checkboxes select any goals, including none. Goals replace role-based category defaults; changing declarations can refresh recommendations. Back keeps the draft and unchanged recommendations keep category toggles.

Review lists only suggested **existing** categories with on/off controls; all can be off. The explanation separates focus/display from discovery, classification and Gmail actions. Progress is an honest Step N of 3 with aria-current, not a processing percentage. Step headings receive keyboard focus after explicit navigation. The wizard uses fieldset/legend, labels, visible focus and ordinary Tab/Space/arrow/Enter behavior; it is nonmodal and does not trap focus.

Confirm validates and applies a fresh preference record. Only explicit confirm/skip writes storage. Skip from first setup stores an empty skipped marker; skipping an edit discards its draft and preserves previous choices. Returning users get their saved ordering without a forced wizard or repeated summary; Settings displays the declared profile/goals/categories. Settings supports Change profile/goals, Manage suggested categories, Restart onboarding and Clear preferences. Restart opens saved values for review; nothing changes until confirmation. Clear removes only preferences, restores default presentation and leaves Gmail connected. Storage denial/full/reset failure produces a safe notice and usable defaults or tab-local preferences.

Active focus sorts categories in charts/filter options and messages by unchanged rule priority, then preferred category, then date. Default/skipped/all-off preserves original newest-first inbox ordering. No category or message is removed; analytics totals and classification explanations are unchanged. The earlier planned category-management journey still refers to custom classifier/rule editing, which is not implemented. Onboarding and sync progress are distinct.

## Unified public/workspace identity

Entry renders public LandingPage for / and lazy-loads App only for known workspace paths. Normal anchors cross the public/workspace boundary; there is no fake login or SaaS authentication guard. Google authorization remains an explicit optional action inside the app. Public sections link by fragment; mobile disclosure navigation has an accessible toggle and Escape returns focus. Native FAQ disclosure supports keyboard activation. Unknown paths show a designed recovery page with working home/app links.

The landing preview is original illustrative UI derived only from bundled synthetic fixtures; it never reads Gmail authorization, preferences or live state. Public Privacy and FAQ explain actual limits and link the existing development privacy document, without presenting it as finalized legal terms. No email addresses or actual message subjects appear in the preview. All CTAs enter a usable mock workspace; no signup/waitlist backend is implied.

Workspace view changes push only a public route, keeping auth/mailbox/preferences mounted. Back/Forward restores the view; reload restores its URL but resets mail/auth as before. Opening the public page uses document navigation and does not revoke Google consent. A fresh load resets workspace memory; browser back/forward cache may restore earlier page memory, so navigation is not a deletion control. Use Disconnect to request revocation; returning to the app never silently authorizes. No mail identifiers, search text, tokens or profile choices enter the URL/history state. Static hosting will require an SPA fallback for direct /app paths.

Current colors/components are defined in DESIGN_SYSTEM.md. Existing workflows above remain functional; the visual update does not change onboarding mappings, optionality, validation/persistence, classifier priorities or API access.

## Inbox-first workspace revision

The app interior uses an email task hierarchy while the public landing stays unchanged. Sidebar Inbox comes first; contextual category filters apply only to the loaded set and do not modify Gmail labels. Global header search focuses with / outside editable fields/modals and retains the existing local substring matching plus category/priority AND filters. The accessible search description distinguishes this from Gmail operators/full-mailbox search. Search from another view opens Inbox while preserving the current filter state.

Inbox displays sender → subject/mock preview → category/priority → date. Unread rows have stronger text and a status marker with an accessible name; read status never changes on open because writes remain prohibited. Density is Comfortable or Compact. Contextual unread count and sender/category-insight navigation replace KPI-first task entry; Overview and full Analytics remain available rather than removed.

Reading is a dialog by default. Side-by-side is an explicit display choice active at >=1100px, with a dialog fallback on smaller widths. No empty reading pane is rendered; split columns appear only after a message is selected. The side pane shares the original text-only content/explanation renderer and opens already-loaded content only. Live detail always says body/attachments were not retrieved. No full reader or conversation view is implied. A selected message remains visible while filters change until closed/source-cleared; this preserves reading context rather than silently discarding a selected record. Pane heading receives focus; Escape/close returns focus to the selecting row, while the list remains reachable by keyboard. Native modal focus behavior is preserved.

Settings supports default Inbox/Insights, density, layout and independent display reset. Legacy Overview defaults still validate and open Insights through the preserved route. Defaults apply on the next /app visit, never override an explicit view URL or force navigation while editing. Values persist in inbox-intelligence.workspace; profile/goals stay in their existing key. Neither reset disconnects Gmail. No stored message/search/selection/account field exists. Blocked/corrupt storage produces safe defaults/tab-only notices. First-run/skip/return/reset/restart onboarding remains optional and separate from synchronization.

Compose/reply/forward, complete message/thread reading and AI summaries are architecture-only follow-ups. Do not add a fake actionable Compose button or a summary placeholder that looks generated. Study tasks and source-confidence labels: ../product/EMAIL_UX_RESEARCH.md.

### Simplified workspace composition

The page heading, refresh action and Filters disclosure form one compact toolbar. Display settings live solely in Settings. No permanent category shortcut list, secondary top navigation, empty pane or application marketing footer remains. Source details and full diagnostics are contextual; live partial-coverage text stays visible outside the disclosure. Search remains global, with its full limitation description accessible to assistive technology. Inbox is the primary task; Insights holds detailed analytics.

Selections remain tied to source/session **and view**. Moving to Insights does not open a surprise dialog; Back restores Inbox reading context. Closing locates the selected row for focus or falls back to search. Drawer state is transient; desktop sidebar choice persists only in the separate validated display record. First-run setup remains dismissible and independent of synchronization. No onboarding algorithm, token handling or Gmail request change accompanies this composition.

Trade-off: filtering and source diagnostics require an explicit disclosure action; persistent search, source identity, active-filter indication and a direct Settings destination provide discovery. Icon rails have accessible names and native title tooltips. No new keyboard shortcut scheme or simulated compose/write controls were added. Owner evaluation and assistive-technology testing remain outstanding.
