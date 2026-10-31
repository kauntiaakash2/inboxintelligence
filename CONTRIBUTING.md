# Contributing

This is an owner-controlled early product with no selected open-source license. Obtain the owner's agreement before external redistribution or collaboration. Do not publish the repository or open a remote PR automatically.

Create a scoped branch (`feat/gmail-metadata`, `fix/category-filter`) from the current integration branch. Keep commits small and conventional: `feat(inbox): add priority filter`, `fix(classification): preserve spam precedence`, `test(metrics): isolate event snapshots`, `docs(sync): explain checkpoint replay`, or `chore: update lockfile`. Use the existing Git identity; do not invent one.

Before implementation inspect the relevant files, current status, AGENTS.md, and design/architecture decisions. Separate domain logic from React and provider shapes. Reproduce bugs with deterministic fixtures. Keep dependency changes justified and lockfile-backed.

Before review run `npm run typecheck`, `npm run lint`, `npm run test:coverage`, `npm run build`, and browser tests for changed flows. Include commands, actual results, responsive evidence, and unresolved risks in the PR. Review validation boundaries, semantics, error paths, accessibility, rule precedence, metric denominators and synthetic/real separation. Never attach private emails or tokens to an issue.

A PR should explain the concrete problem and final behavior, include screenshots only of synthetic data, and link changed ADRs or product requirements. Update roadmap, screen inventory, verification, and learning notes when behavior changes. Reviewers should reject misleading mock claims, fabricated measurements, untested completion claims, raw HTML rendering and persistent token storage. CI has no deployment or secrets configuration.
