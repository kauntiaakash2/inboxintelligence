# Clario visual adaptation — independent implementation

Date: 2026-11-03. Baseline inspected: clean feat/clario-design at 5ad1b62 (verified Phase 3A). The requested expected branch was feat/personalized-onboarding; the existing scoped design branch was preserved. No onboarding work was overwritten, no branch was switched and no commit/push/deployment was performed.

## Observed reference and our direction

Reviewed the [Clario listing](https://www.framer.com/marketplace/templates/clario/), its [public preview](https://clario.framer.website/) and the linked [Framer Community terms](https://www.framer.com/legal/community-terms). Local reference screenshot is ignored under output/playwright/clario-reference.png; it is not an application asset.

Observed: near-black canvas, large centered typography, sparse top navigation, bright lime actions, a prominent finance-dashboard illustration, charcoal cards, generous section spacing and restrained glows. The reference includes light dashboard imagery inside the dark marketing surface. Our product instead uses the requested dark workspace throughout, reserving lime for actions/selection and keeping semantic status colors separate. We did not inspect proprietary source or extract original color tokens. The six requested approximate colors are independently selected project tokens, not claimed exact Clario values.

Original Inbox Intelligence content follows the actual product boundary: deterministic rules; up to 100 Gmail metadata records; optional declared personalization; no full bodies, attachments, mail writes, external AI or durable email cache. Adaptive processing/history/corrections remain planned. No waitlist, invented customers, performance claim, pricing tier or finalized legal guarantee is added.

## Licensing and asset provenance

The listing labels Clario as free with a Limited license. The linked Community terms describe a limited commercial license for free content: project use/modification is permitted subject to terms; standalone redistribution, competing marketplace assets and claiming ownership are restricted. Free does not mean unrestricted ownership. This is a factual implementation note, not a legal opinion or a blanket permission for future asset reuse. Recheck the applicable terms before acquiring/reusing template material.

No Clario code, logo, illustration, photos, fonts or downloaded template file was incorporated. Layout/CSS, wordmark treatment and shield illustration are independently authored. Lucide icons reuse the existing dependency; system fonts avoid a new remote asset/license dependency. ProductPreview derives counts from the existing synthetic fixture with the actual classification/aggregation functions and accepts no mailbox data props. It contains no real email screenshot, address or subject. No affiliation with Clario, Kadir Calik or Framer is claimed. The repository's own licensing decision remains unchanged in ../LICENSING.md.

## Implemented composition

- Header: original wordmark, section links, mobile disclosure navigation and functional /app CTA.
- Hero: explicit product purpose, lime headline/action, demo and workflow links; no automatic Gmail connection.
- Preview: original responsive HTML illustration using 96 synthetic records; source badge and caption.
- Problem/features: attention-overload explanation, six current/planned capabilities with visible status.
- Workflow: five text steps that distinguish current actions from future learning.
- Privacy: actual memory/localStorage boundaries, read-only limits and residual risks; existing development notice linked as a build asset.
- FAQ: native details/summary for permission, storage, accounts, pricing, limitations and optional setup.
- CTA/footer: real workspace/settings navigation and development/legal-status disclosure.

Use native CSS gradients only in the public surface; no animation engine, autoplay video, remote assets, loader theatrics or extra dependency. Static content remains visible with reduced motion. The dashboard reuses its existing components and receives token/style changes; onboarding mappings, persistence, validation and algorithms have no diff.

## Review evidence and limits

See ../quality/VERIFICATION.md and ../quality/CLARIO_CHANGE_REPORT.md for actual commands/file inventory. Chromium covers 1440, 768 and 390 widths, keyboard controls, reduced motion, routing, public-state isolation and existing fake Gmail/onboarding workflows. Production preview verification supplements development-server tests. Screenshots remain ignored and synthetic except the explicitly named public Clario reference. Contrast checks cover semantic pairs and rendered solid-background text; gradients require endpoint/visual review. No full WCAG, assistive-technology, non-Chromium or production hosting/security certification is claimed.
