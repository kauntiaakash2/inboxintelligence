# Phase 1 acceptance criteria

| ID   | Checkable criterion                                                              | Evidence required                            |
| ---- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| AC1  | Development server starts in WSL Ubuntu with loopback URL                        | Actual Vite startup output                   |
| AC2  | Overview shows 96 indexed, 32 unread, 30 high-priority messages                  | Fixture aggregation test and browser render  |
| AC3  | Search is trimmed/case-insensitive over sender/address/subject/snippet           | Deterministic selector and component tests   |
| AC4  | Category and priority compose with search; empty/reset works                     | Interview→6; Orders→0; clear→96; High→30     |
| AC5  | Detail displays matched evidence, rule ID or unknown fallback, confidence caveat | Browser dialog and rule tests                |
| AC6  | Analytics reconcile category and priority totals to 96; trend has 24 days        | Aggregation test and rendered analytics      |
| AC7  | Every view states synthetic/mock; Gmail unavailable                              | Global banner and disabled settings control  |
| AC8  | Layout works at 1440×1000 and 390×844 without page overflow                      | Browser assertions and inspected screenshots |
| AC9  | Keyboard modal supports opening, containment, Escape and restored focus          | Real-browser keyboard assertions             |
| AC10 | Loading, empty and generic error recovery are present                            | Component tests, empty browser screenshot    |
| AC11 | Types, lint, coverage and production build succeed                               | Actual exit codes in VERIFICATION.md         |
| AC12 | Required documentation, no license assumption, no secret/config leak             | Document inventory and staged-file scan      |
| AC13 | No real credentials, Gmail requests or external model integrations               | Source review and runtime network smoke      |
| AC14 | Local Git implementation checkpoint created without pushing                      | Commit ID and clean status                   |

Completion results are recorded in VERIFICATION.md after execution. Planned Gmail/storage/correction screens do not count as implemented capabilities. No performance, product-market, security-certification or classification-accuracy claim is part of this phase's acceptance.
