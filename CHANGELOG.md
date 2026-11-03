# Changelog

The format follows Keep a Changelog conventions; versions follow semantic versioning while pre-1.0 interfaces may evolve.

## [Unreleased]

### Added

- Session-only client duration/API-attempt/retry diagnostics, retained-live-state checks and partial-failure refresh recovery tests.
- Separate owner-reported live measurement record; account acceptance outcomes remain explicitly pending where unconfirmed.

- Explicit GIS read-only authorization with in-memory tokens, expiry, cancellation and disconnect/revocation.
- Paginated newest-100 Gmail metadata adapter with runtime validation, bounded concurrency/retries and partial coverage.
- Source-aware dashboard, progress/errors and mocked OAuth/API/component/browser verification.
- Phase 2 security/architecture/learning records and an owner-approved manual-test plan; live account test not executed.

### Changed

- Development defaults fixed to 127.0.0.1:5173 with strictPort; intercepted browser tests retain their explicit 4101 override.

- Shared runtime validator moved to domain; missing sender addresses can be represented as unavailable.
- Real-source instrumentation records metadata classifications without simulated body requests; mock behavior preserved.

## [0.1.0] - 2026-10-31

### Added

- Browser-first dashboard with 96 synthetic messages, four views, combined filters, and explanatory message details.
- Ordered rule classification, unknown fallback, sender/category/priority/date aggregation and bounded instrumentation.
- Strict TypeScript, lint, deterministic unit/component tests, coverage thresholds and a no-deploy CI workflow.
- Product, architecture, security, design, operations and learning documentation.

### Limitations

- No Google authorization, Gmail API, IndexedDB persistence, user correction workflow or external AI integration.
- Simulated retrieval decisions are not measured API savings. Verification and dependency audit findings are recorded separately.
