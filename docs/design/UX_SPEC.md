# UX specification

## Implemented navigation and screens

Overview is the default workspace; four local views use React state without URL routes. Back/forward and deep links are not implemented. The sidebar shows active state and a persistent mock indicator; mobile uses accessible icon navigation.

Overview places the mock banner above counts, category distribution, recent high-priority messages, recurring senders and simulated processing. Clicking a category opens a filtered inbox. “Explore priority messages” sets High and resets other filters. Recent activity is one actual local demo-processing completion with synthetic counts; no invented history feed.

Inbox explorer searches sender/name/address/subject/snippet with trimmed case-insensitive substring matching. Category and priority combine with search using AND. Reset clears all controls. Results remain newest-first fixture order. Each row exposes sender, date, unread status, Gmail-style mock labels and classification. No read/write action mutates Gmail. Empty results offer a recovery action.

Message detail opens a native modal; shows plain-text body, sender/date, reason, category, rule/fallback, confidence caveat and fixed priority score. Escape/close returns focus. No reply/forward, remote images, attachments, HTML or category correction controls exist.

Analytics shows category totals, top sender counts, daily frequency, priority distribution and simulated retrieval decisions. Charts explain their unit, source and limitations. Categories can navigate back to filtered messages. Uniform fixture volume is explicitly described rather than interpreted as real behavior.

Settings identifies the active synthetic source, disconnected future Gmail, planned synchronization preferences and session-memory privacy rules. Gmail is a disabled placeholder, not a fake consent flow. There is no category-management screen; category exploration is implemented while rule/category editing is planned.

## Planned journeys

- OAuth: explain read-only scope/data minimization → owner-triggered GIS chooser → scope validation → connected status; decline/popup error leaves mock/disconnected mode safe.
- First import: state exact newest-sample coverage → show metadata progress → keep partial results labeled → retry failed IDs → distinguish completion from historical coverage.
- Correction: choose new category → show local-only change and explanation → persist provenance → undo → optionally refine future rules after evaluation. Never imply Gmail labels changed.
- Sync preferences: sync on open by default, explicit visible refresh, optional interval while open; display stale state when closed/expired.
- Failure/reconnection: sanitize error → identify auth/rate/network/storage class → preserve successful cache → retry with backoff or explicit reconnect. Expired history triggers reconciled full import, not deletion of all visible data.
- Export/deletion: deliberate choice, explain sensitive export file and difference between local deletion and revoking Google consent; completion verified across account stores.

No planned journey is represented as functional today. SCREEN_INVENTORY.md and quality verification track actual implementation and evidence.
