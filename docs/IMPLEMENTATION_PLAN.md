# Bootstrap milestones

1. **Inspect and decide.** Preserve existing work, inspect tools and permissions, verify official stack/Google guidance. Exit: environment record, architecture direction, no credential access. Initial directory was empty.
2. **Domain foundation.** Define provider-independent messages, repository boundary, deterministic rules, bounded event instrumentation, fixtures. Exit: rules and aggregations have deterministic tests.
3. **Usable mock dashboard.** Overview, inbox filters/detail, analytics, settings, responsive design and clear mock labels. Exit: actual browser workflows and narrow/wide layouts inspected.
4. **Product and engineering records.** Document requirements, future synchronization and security boundaries, operating procedures and implementation-specific learning. Exit: every requested document exists with implemented/planned distinctions.
5. **Verification and checkpoint.** Execute types/lint/coverage/build, dev startup, browser interactions, dependency audit and secret checks. Fix failures, record actual results, create local conventional checkpoint; never push or deploy.

No real account, cloud setup, paid resources, Gmail credentials, or OAuth scripts are in scope. IndexedDB is deferred until it has an actual sync responsibility. Browser charting uses native CSS and accessible counts rather than a new chart dependency. Playwright is development-only because browser binaries were available.

Follow-up findings and evidence live in docs/quality/VERIFICATION.md and docs/learning/ENGINEERING_JOURNAL.md. Approval is needed only where the execution sandbox or owner account/host boundary requires it.
