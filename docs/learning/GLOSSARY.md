# Glossary

| Term                  | Meaning in this project                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| WSL2                  | Linux running through Windows' virtualization layer; the inspected kernel identifies WSL2.                              |
| Repository root       | Directory containing this application's package/config/source and eventual .git history.                                |
| Dependency / lockfile | Reused software package / exact resolved versions needed to reproduce installation.                                     |
| LTS                   | Long-term-support release line; Node 24 is the chosen compatible installed line.                                        |
| Vite                  | Local development server and production asset bundler.                                                                  |
| TypeScript            | JavaScript plus static types checked before execution; not automatic runtime input validation.                          |
| Domain model          | Product-shaped data independent of a particular provider's response format.                                             |
| Repository interface  | Contract for obtaining domain data, allowing synthetic and future Gmail adapters.                                       |
| Pure function         | Calculation whose output depends on inputs without changing outside state; used for classification and selectors.       |
| Deterministic         | Same input produces the same result; our rules do not learn or call a model.                                            |
| Heuristic             | Practical scoring rule without a statistical correctness guarantee.                                                     |
| Decision list         | Ordered rules where the first match determines the result.                                                              |
| Novelty               | Message did not match known evidence; currently a simple boolean fallback.                                              |
| Metadata              | Sender, subject, date and labels; still potentially sensitive even without body text.                                   |
| Hydration             | Fetching additional details for an already-discovered message ID.                                                       |
| Pagination            | Reading a long collection in pages using a provider token.                                                              |
| Checkpoint            | Last safely persisted progress from which work can resume.                                                              |
| Idempotent            | Repeating an operation has the same final effect; unique-key upserts make page replay safe.                             |
| Upsert                | Insert a new record or update the existing record with the same key.                                                    |
| History ID            | Opaque Gmail change-stream marker, not a message ID or a contiguous sequence number.                                    |
| Reconciliation        | Comparing local and remote membership/state to repair missed changes.                                                   |
| Backoff and jitter    | Increasing retry delay plus randomness to avoid repeated synchronized overload.                                         |
| IndexedDB             | Browser database with transactions and indexes; planned, not used in Phase 1.                                           |
| OAuth                 | Delegated API permission without giving this app your Gmail password.                                                   |
| Scope                 | Named permission granted to an app; gmail.readonly is broad read access and restricted by Google policy.                |
| Public client         | Application such as browser JavaScript that cannot protect a client secret.                                             |
| Access token          | Short-lived credential authorizing API requests; future design stores it only in memory.                                |
| XSS                   | Attacker-controlled script running in the app's origin; can expose tokens and cached mail.                              |
| CSP                   | Browser policy restricting executable/resources origins; needs actual hosting headers and testing.                      |
| CORS                  | Browser rules for cross-origin requests; not a substitute for authorization.                                            |
| STRIDE                | Threat categories: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege. |
| Telemetry             | Measurements sent to an operator; this demo only keeps local session instrumentation.                                   |
| Precision / recall    | Of predicted members, how many are right / of actual members, how many were found.                                      |
| Holdout               | Labeled examples kept separate from rule tuning to reduce evaluation leakage.                                           |
| Concept drift         | Patterns changing over time, potentially making old rules less useful.                                                  |
| Coverage              | Code paths executed by tests; does not prove all behavior or classifier accuracy.                                       |
| E2E                   | End-to-end browser workflow exercising rendered application behavior.                                                   |
| CI                    | Automated repository checks on pushes/PRs; current workflow does not deploy.                                            |
| ADR                   | Architecture Decision Record: context, choice, alternatives and consequences.                                           |
| Multi-tenancy         | Multiple users sharing a service while their data and authority remain isolated.                                        |
