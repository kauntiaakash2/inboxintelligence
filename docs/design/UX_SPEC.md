# UX specification

## Implemented navigation and screens

Overview is the default workspace; four local views use React state without URL routes. Back/forward and deep links are not implemented. The sidebar shows active state and a persistent mock/live source indicator; mobile uses accessible icon navigation.

Overview places the mock banner above counts, category distribution, recent high-priority messages, recurring senders and simulated processing. Clicking a category opens a filtered inbox. “Explore priority messages” sets High and resets other filters. Recent activity is one actual local demo-processing completion with synthetic counts; no invented history feed.

Inbox explorer searches sender/name/address/subject/snippet with trimmed case-insensitive substring matching. Category and priority combine with search using AND. Reset clears all controls. Results remain newest-first fixture order. Each row exposes sender, date, unread status, Gmail-style mock labels and classification. No read/write action mutates Gmail. Empty results offer a recovery action.

Message detail opens a native modal; shows plain-text body, sender/date, reason, category, rule/fallback, confidence caveat and fixed priority score. Escape/close returns focus. No reply/forward, remote images, attachments, HTML or category correction controls exist.

Analytics shows category totals, top sender counts, daily frequency, priority distribution and simulated retrieval decisions. Charts explain their unit, source and limitations. Categories can navigate back to filtered messages. Uniform fixture volume is explicitly described rather than interpreted as real behavior.

Settings identifies the active mock/live source, authorization status, read-only boundary, disconnect control, planned synchronization preferences and session-memory privacy rules. The working connection controls also appear above every view. There is no category-management screen; category exploration is implemented while rule/category editing is planned.

## Planned journeys

- OAuth is implemented for the bounded sample; later account/persistence journeys must retain explicit consent and safe reconnect behavior.
- First import: state exact newest-sample coverage → show metadata progress → keep partial results labeled → retry failed IDs → distinguish completion from historical coverage.
- Correction: choose new category → show local-only change and explanation → persist provenance → undo → optionally refine future rules after evaluation. Never imply Gmail labels changed.
- Sync preferences: sync on open by default, explicit visible refresh, optional interval while open; display stale state when closed/expired.
- Failure/reconnection: sanitize error → identify auth/rate/network/storage class → preserve successful cache → retry with backoff or explicit reconnect. Expired history triggers reconciled full import, not deletion of all visible data.
- Export/deletion: deliberate choice, explain sensitive export file and difference between local deletion and revoking Google consent; completion verified across account stores.

Full historical import, corrections, preferences and export/deletion journeys remain planned; bounded OAuth/sample retrieval is implemented below. SCREEN_INVENTORY.md and quality verification track actual implementation and evidence.

## Phase 2 implemented flow

Every view has the same Connect/Authorize or Disconnect control. Initial mock mode makes no Google requests. Connect loads GIS; a second explicit Authorize click opens consent. While waiting, Cancel keeps mock mode and invalidates late callbacks. A valid grant triggers metadata progress, then source-aware counts/charts and a permanent partial-coverage banner. Live message detail states that bodies/attachments were not retrieved; snippet search only applies to mock fixtures. Empty samples and skipped metadata failures are explicit.

Refresh Gmail repeats the bounded read without opening consent automatically. Expiry/401 clears live state and restores mock with an explicit reconnect message; denial/missing scopes never issue mailbox requests. Disconnect clears local state first, then attempts remote revoke. It can affect all app-granted scopes, and failure to confirm revocation is shown. Planned journeys above describe later full import/correction/export work; the former Phase 1 disabled OAuth placeholder has been replaced.

## Phase 3A implemented onboarding

A compact invitation appears below Gmail controls, above the existing dashboard. It never locks navigation, opens automatically as a modal or delays usable content. Start opens an inline three-step form: Profile → Goals → Review. Every field is optional. Native radio buttons select one profile; Leave profile blank clears it. Native checkboxes select any goals, including none. Goals replace role-based category defaults; changing declarations can refresh recommendations. Back keeps the draft and unchanged recommendations keep category toggles.

Review lists only suggested **existing** categories with on/off controls; all can be off. The explanation separates focus/display from discovery, classification and Gmail actions. Progress is an honest Step N of 3 with aria-current, not a processing percentage. Step headings receive keyboard focus after explicit navigation. The wizard uses fieldset/legend, labels, visible focus and ordinary Tab/Space/arrow/Enter behavior; it is nonmodal and does not trap focus.

Confirm validates and applies a fresh preference record. Only explicit confirm/skip writes storage. Skip from first setup stores an empty skipped marker; skipping an edit discards its draft and preserves previous choices. Returning users see Your focus or the skipped summary rather than a forced wizard. Settings supports Change profile/goals, Manage suggested categories, Restart onboarding and Clear preferences. Restart opens saved values for review; nothing changes until confirmation. Clear removes only preferences, restores default presentation and leaves Gmail connected. Storage denial/full/reset failure produces a safe notice and usable defaults or tab-local preferences.

Active focus sorts categories in charts/filter options and messages by unchanged rule priority, then preferred category, then date. Default/skipped/all-off preserves original newest-first inbox ordering. No category or message is removed; analytics totals and classification explanations are unchanged. The earlier planned category-management journey still refers to custom classifier/rule editing, which is not implemented. Onboarding and sync progress are distinct.
