# Design system and interaction contract

## Direction and evidence contract

Purpose: help a personal Gmail user scan priorities and explore reasons, starting with synthetic data. Tone: calm, precise and approachable. Reference: the owner's requested overview/inbox/analytics/settings workflows, not a marketing page. Memorable detail: muted green editorial dashboard, small evidence labels and transparent explanations. Primary action: explore priority messages; detail exposes the reason. Hierarchy: source disclosure → counts → categories and priority messages → sender/processing context.

Target viewports: desktop 1440×1000 and mobile 390×844. Wide layouts show fixed sidebar and two-column panels; narrow layouts show sticky icon navigation and one column. Long subjects truncate only in lists; full detail wraps. Source truth is always visible in the banner and header. No remote visual assets or fonts are loaded.

## Typography and tokens

Local font stack Inter when installed, then Segoe UI/system-ui. No CDN dependency. Heading sizes scale 23–33px; section headings 14–15px; body/metadata deliberately compact. Core CSS tokens in src/styles/index.css: text #253a35, background #f7f9f7, primary green #205c4b, muted #67766f, border #e3e9e4, white surface, pale green accent. Supplemental amber indicates priority/demo, never color alone. Category palettes use five muted tones with labels and counts; repeated colors mean the legend/labels are essential. Dynamic donut segments derive from actual category counts.

Spacing uses a restrained 4/8/12/16/20/24/32 family with 18/22px panel adjustments. Panels have subtle 9px corners, thin borders and minimal shadows. No decorative imagery or gradients beyond the actual category chart.

## Components

- Buttons: semantic button, clear action text, outlined primary utility style; disabled Gmail control states its future phase. Icon-only buttons have accessible names.
- Navigation: labeled nav, aria-current on active view; narrow sidebar becomes horizontal icon controls retaining labels for assistive technology.
- Inputs: labeled search and native category/priority selects; minimum 42px primary control height, visible focus rings. Do not replace native dropdown behavior unnecessarily.
- Lists: full-row message button, sender initials, subject/snippet, date, unread dot plus accessible label, text category/priority and Gmail-style labels. Do not make unread state color-only.
- Charts: CSS donut/bars with counts, legends and accessible text; trends describe the fixture's uniform daily counts. Chart numbers reconcile to loaded messages.
- Dialog: native showModal, heading association, Escape and close button, focus containment and focus restoration to trigger.

## Content states

| State      | Trigger / visible feedback / safe action                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Loading    | Local load starts; preparing status and disabled refresh; wait for completion                                |
| Empty      | Filter result is empty; no-results explanation; clear filters                                                |
| Error      | Repository fails/invalid data; generic alert without payload; retry                                          |
| Partial    | Not applicable to this all-or-error fixture load; future import must show indexed count and pending failures |
| Success    | 96 classified messages and processing complete; explore messages or refresh                                  |
| Permission | No permission request exists in mock mode; Gmail connection disabled with phase label                        |

## Accessibility and responsive behavior

Visible 3px amber focus ring; semantic buttons/labels and status/alert roles; native dialog focus; priority conveyed with words; reduced motion disables transitions/spinner. Check keyboard navigation, screen reader names, contrast and touch controls in rendered browser evidence. Compact supporting text warrants user testing at zoom; current checks are not a formal WCAG certification. Breakpoints: 1150px compact panels, 850px icon rail, 560px mobile top nav and 2-column stats. Analytics/settings stack early to preserve legibility. Never hide essential source disclosure on mobile.

Dark mode is planned, not implemented. Add semantic theme tokens and independently test chart/text contrast rather than inverting colors. Current preference follows a deliberate light-only design.
