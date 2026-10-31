# Inbox Intelligence

An explainable, privacy-conscious email analytics product prototype. **Understand → Classify → Prioritize → Optimize → Measure.** The problem is attention overload: important messages compete with routine notifications, while naive integrations fetch more content than they need.

Phase 1 is a browser-only application using **96 synthetic messages**, not a connected Gmail account. It explores sender and subject rules, priorities, category distribution, and a simulated retrieval policy. It is not a generic email client or an AI model.

## Capabilities

- Overview with indexed/unread/priority counts, category distribution, sender patterns, and local processing activity.
- Inbox explorer with sender/subject/snippet search, combined category and priority filters, labels and read status.
- Keyboard-accessible message details with plain-text content, rule ID, reasons, heuristic confidence, and priority score.
- Analytics with category totals, top senders, daily frequency, priorities, and clearly labeled synthetic processing decisions.
- Settings explaining the mock data boundary and future Gmail connection.

## Local setup

Use the Linux filesystem in WSL Ubuntu, Node 24 LTS (24.13.0 or newer in the 24 line), and npm. `.nvmrc` selects the compatible installed LTS line. No environment file is required for the demo. Optional browser tests need `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright npx playwright install chromium` on a fresh machine (download approval may be required).

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4101
```

Open the printed localhost URL. `npm ci` reproduces the committed lockfile; the dev command starts Vite, not a production service. Do not expose it to a public interface.

| Script                                    | Purpose                                          |
| ----------------------------------------- | ------------------------------------------------ |
| `npm run dev`                             | Local Vite server                                |
| `npm run build`                           | TypeScript checks and static `dist/` output      |
| `npm run preview`                         | Preview a built bundle locally                   |
| `npm run lint`                            | ESLint code and hooks checks                     |
| `npm run typecheck`                       | Strict TypeScript checking                       |
| `npm test` / `npm run test:watch`         | Deterministic tests / interactive development    |
| `npm run test:coverage`                   | V8 coverage with enforced logic thresholds       |
| `npm run test:e2e`                        | Chromium browser workflows and local screenshots |
| `npm run format` / `npm run format:check` | Consistent source/document formatting            |
| `npm run check`                           | Types, lint, tests, production build             |

## Architecture and stack

React + TypeScript + Vite, Tailwind via its official Vite plugin, Lucide icons, React hooks, Vitest and Testing Library. The synthetic repository validates messages → `loadInbox` classifies and instruments → pure selectors/aggregators → React views. Metrics stay in bounded session memory. No router or charting library is needed for four local views and accessible CSS charts. IndexedDB/Dexie is designed for a later sync milestone, not installed speculatively.

```text
src/
  app/                    Four-view application shell
  components/common/      Reusable state feedback
  data/mock/              Reserved .example-address fixtures
  domain/                 Models and repository/instrumentation interfaces
  features/               Classification, inbox selection/list/dialog, analytics aggregation
  repositories/           Validated synthetic adapter
  services/               Load orchestration and privacy-safe metrics
  styles/                 Responsive tokens and presentation
  tests/                  Logic and component tests
```

## Screenshots

Browser verification artifacts are stored locally under `output/playwright/` and ignored by Git. Add curated, owner-reviewed screenshots here before publication. No screenshots of a real mailbox should be committed.

## Status, privacy and limitations

Implemented: mock dashboard, filtering, explanations, aggregation, instrumentation, tests and CI configuration. Planned: OAuth, Gmail requests, historical/incremental sync, IndexedDB, user corrections, evaluation corpus, deployment and multi-user operation. No private mailbox is accessed. Messages are rendered as text; no tracking images, telemetry endpoint, tokens, Google script, external model, or hosted database exists. Reload resets session state. Derived synthetic counts are not real users, accuracy measurements, or API savings. See [privacy](docs/security/PRIVACY.md), [verification](docs/quality/VERIFICATION.md) and [known security risks](docs/security/SECURITY.md).

## Roadmap and contribution

Next: owner-approved Google project setup, GIS token authorization in memory, and metadata for the newest 100 messages. Later: resumable import, history sync, adaptive retrieval, corrections and measured evaluation. [Roadmap](docs/product/ROADMAP.md) has dependencies and exit criteria.

Read [CONTRIBUTING](CONTRIBUTING.md) and [AGENTS](AGENTS.md) before changes. Run checks and document actual evidence. The owner has not chosen a license; **no LICENSE file is granted**. See [licensing decision](docs/LICENSING.md).

## Documentation

[Complete documentation index](docs/INDEX.md) · [environment](docs/ENVIRONMENT.md) · [implementation plan](docs/IMPLEMENTATION_PLAN.md) · [learning path](docs/learning/LEARNING_PATH.md) · [interview preparation](docs/learning/INTERVIEW_PREPARATION.md).
