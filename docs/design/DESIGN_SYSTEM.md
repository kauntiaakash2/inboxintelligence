# Inbox Intelligence — shared dark design system

## Direction and scope

Black/charcoal surfaces, off-white content and a restrained lime accent unify the public landing page, dashboard and optional onboarding. The public site uses expressive typography, whitespace and subtle glows; the workspace keeps dense, functional panels and semantic status colors. See [Clario adaptation](CLARIO_ADAPTATION.md) for observed reference, independent implementation and licensing provenance. These are approximate reference-inspired values, not extracted template tokens. Light/dark switching is not implemented; the current system is consistently dark.

## Semantic tokens

Source of truth: src/styles/tokens.css. src/styles/index.css imports it through the existing Tailwind Vite integration and maps page/panel/ink/brand into @theme utilities. Components use CSS properties rather than scattered hex values. Existing --green/--muted/--border/--accent names are compatibility aliases, not separate palettes.

| Role                     | CSS token / value                                        | Usage                                                                |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------- |
| Canvas                   | --page-bg #080808                                        | Public and workspace background                                      |
| Panel                    | --surface #141414                                        | Cards, sidebar, dialogs, connection/setup panels                     |
| Elevated / hover         | --surface-raised #1B1B1B / --surface-hover #222222       | Secondary surfaces and hover feedback                                |
| Primary / secondary text | --text-primary #F8F8F8 / --text-secondary #A3A3A3        | Content / metadata; do not lower opacity for readable text           |
| Decorative border        | --border-subtle #292929                                  | Nonessential panel dividers                                          |
| Control border           | --border-control #707070                                 | Inputs, toggles and buttons needing a distinguishable boundary       |
| Primary action           | --brand #A3FF3F / --on-brand #080808                     | Near-black text on lime; never white text on lime                    |
| Action hover / press     | --brand-hover #BAFF74 / --brand-active #8EE12F           | Primary hover/active feedback                                        |
| Selection                | --selected-bg #202C14                                    | Active navigation/checked choices with text and native checked state |
| Focus                    | --focus-ring #A3FF3F                                     | Visible offset outline independent of hover                          |
| Warning                  | --warning #F5C56B / --warning-bg #292216                 | High priority/demo/notice states, with text labels                   |
| Error                    | --error #FFB4AB / --error-bg #311B1B                     | Safe failure text; not brand accent                                  |
| Success                  | --success #8EDDB6 / --success-bg #16291F                 | Confirmed operational success                                        |
| Information              | --info #98D8CF / --info-bg #182826                       | Medium-priority/supporting state                                     |
| Disabled                 | --disabled-text #A3A3A3 / --disabled-bg #1B1B1B          | Disabled semantic controls with no opacity fade                      |
| Charts                   | --chart-0…4: #A3FF3F, #75DAC9, #F5C56B, #C4C4C4, #E6A4B4 | Data palette; labels/counts remain the source of meaning             |

Lime is an action/focus cue; do not make every statistic/icon lime. Chart colors are reused across 11 categories, so text legends/counts are required. Adjacent chart colors do not establish category identity on their own. Borders used only to group decorative surfaces need not meet the control-boundary contract; real control boundaries use the brighter token.

## Typography, spacing and shape

System-local Inter/Segoe UI/system-ui stack; no downloaded font or CDN. Public display scale clamps roughly 37–82px, tightly tracked with clear line breaks; public prose is 14–17px and 1.6–1.85 line height. Workspace headings retain the existing compact scale. Supporting labels may be smaller but must remain high contrast; important dashboard metadata/category values have been lifted to 12px. Compact-preview annotations are illustrative and labeled synthetic.

Retain workspace spacing (4/8/12/16/20/24/32 with existing panel adjustments). Public sections use larger 55–100px vertical rhythm and max-width containers. Panel corners are 6–12px; the final public CTA uses 16px. Decorative gradients/glows appear only on marketing surfaces; dashboard loading uses existing indeterminate/progress feedback, never fake percentages.

## Reused primitives and variants

- `.button`: outlined neutral utility control; `.setup-primary`: lime fill with on-brand text. Shared hover/press/focus/disabled behavior applies to anchors and native buttons. CTA links navigate; buttons perform local actions.
- `.panel`, existing cards and connection/settings panels: neutral surfaces and subtle dividers. No duplicate generic Card abstraction is needed.
- `.tag`, `.mock-pill`, priority labels: text plus status styling; source and priority never rely on hue alone.
- Search/native select/fieldset inputs: visible labels and brighter boundaries; checked native controls keep familiar keyboard behavior.
- `.nav-item.active`: selected background plus lime/text and aria-current. Dashboard navigation preserves component state while view URLs change.
- StatusPanel and Gmail progress/errors: preserve existing semantic loading/empty/error contracts and safe messages. Initial route chunk loading uses a text status with a usable home link.
- MessageDetail: existing native dialog, showModal, Escape/focus return and text-only rendering; dark surface/scrim.
- FAQ: native details/summary; mobile navigation is an aria-expanded disclosure, not a custom menu widget.
- Tooltips: no new tooltip responsibility was introduced; avoid abstractions without a current use.

## Optional onboarding

Existing Profile → Goals → Review logic, optional fields, skip/back/continue, Settings edits/restart/reset and preference schema are preserved. Native checked choices use the selected background/brand outline; current step has visible text/number with aria-current; primary confirmation uses dark-on-lime. No modal overlay, new data collection, classification changes or permission request was introduced by styling.

## Accessibility and responsive contract

Normal text token pairs must meet 4.5:1; meaningful control boundaries/focus/chart-to-surface contrast must meet 3:1. Automated token and rendered-solid-background checks enforce the tested scope; gradient endpoints use the same dark surface range and need visual review. See [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Do not infer full WCAG conformance from contrast alone.

Skip links, visible focus, semantic links/buttons, fieldset/legend, native dialog and text/status labels remain required. Landing navigation collapses below 700px; features move 3→2→1 columns; preview panels stack on mobile. Workspace navigation switches at 768px and optional split reading at 1100px. Target checks include 1440, 1024, 390 and 320 widths, native keyboard actions and no horizontal overflow. Reduced motion disables transitions/animation; all content remains visible. No autoplay, smooth-scroll engine or animated first-load delay exists. Actual Chromium 200% browser zoom is exercised separately; screen-reader and non-Chromium checks remain open.

## Simplified email workspace layer

Application-only styles live in src/styles/workspace.css; the public Clario-inspired composition and semantic palette remain unchanged. Expanded sidebar is 208px; the explicit collapsed rail is 64px. The main width follows the same CSS variable, overriding legacy fixed widths. Below 768px, navigation is a native modal drawer (up to 280px / 86vw); labels remain visible in the drawer. Do not add a parallel top navigation.

One toolbar holds the view title, refresh and contextual filters. Native details/summary is appropriate for a small form disclosure, not an ARIA menu: Category and Priority stay ordinary labeled selects. Escape/outside pointer dismisses; Escape restores summary focus. Background disclosures must defer Escape to an active modal. The source disclosure contains the sole connection control and aggregate diagnostics; live coverage stays visible. Settings owns display density/layout/default controls.

Message rows use a subtle bottom separator, read dot plus unread weight, sender, subject/preview (category fallback) and date. No per-row badge stack or card border. Comfortable minimum height is 56px desktop / 64px mobile; Compact is 44px / 54px. Natural content can increase these dimensions. All classification details and Gmail labels remain in the existing reader. The optional split pane appears only on selection at >=1100px; narrow screens use the native dialog.

Use 160ms width/margin transitions and a restrained disclosure/drawer appearance. Reduced motion disables workspace animation and transitions. No scrolling reveal, floating element or list entrance effect. Preserve visible semantic focus rings and existing contrast tokens. Native title tooltips complement icon accessible names; they are not the only accessible label. Screenshots, contrast checks and zoom workflows are evidence, not a full accessibility certification or owner design acceptance.
