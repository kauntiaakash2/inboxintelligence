# ADR 0004 — Explicit GIS authorization and bounded metadata sample

Status: Accepted for Phase 2 implementation; real-account acceptance pending. Date: 2026-11-02.

Context: A Web OAuth client/API are owner-configured. The existing browser dashboard needs a first live data source without a backend, persistent credentials or mailbox mutation.

Decision: GIS token model with on-demand script loading and a second explicit authorization click; request only gmail.readonly with previous-scope inclusion disabled. Validate grants and hold tokens in private memory, with clock/timer expiration and explicit disconnect/revoke. Block reconnect until the bounded revoke request settles. Keep default mock mode and never silently reconnect.

Use GET-only messages.list pagination to select at most 100 unique IDs, excluding Spam/Trash; retrieve METADATA with required headers/labels/internalDate only. Omit snippets, bodies and attachments. Normalize through the existing EmailRepository contract; expose partial coverage/progress separately. Four workers, 15-second request deadlines and three-attempt transient retry limits bound the work. A source/session key plus aborts and state clearing prevent stale private views. Real-source instrumentation records metadata-only processing, never simulated body requests.

Alternatives: preload GIS on every mock visit (unnecessary third-party contact); open a popup after awaiting script load (browser activation may expire); persist a token (prohibited retention risk); full SDK (unneeded dependency for two endpoints); server authorization-code/offline flow (adds server/credential/session responsibilities); full body import (unnecessary content exposure).

Consequences: Reload requires deliberate reauthorization; only a sample is visible and it is not a consistent mailbox snapshot. Metadata remains sensitive and same-origin compromise can expose memory tokens. Sender header parsing is basic and label IDs are shown without a custom-label name lookup. Remote revocation may be unconfirmed and post-cancel consent may still exist. Hosted use needs current Google restricted-scope/policy review and actual security-header testing. No real-mail acceptance, deployment or Google verification is claimed.

Validation: fake SDK/API/component tests and intercepted Chromium workflows; actual results in ../../quality/VERIFICATION.md. A real account read needs the approved plan in ../../quality/PHASE2_MANUAL_TEST.md and explicit owner permission.
