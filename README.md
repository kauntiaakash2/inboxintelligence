# Inbox Intelligence

An explainable, privacy-conscious email analytics product prototype. **Understand → Classify → Prioritize → Optimize → Measure.** The problem is attention overload: important messages compete with routine notifications, while naive integrations fetch more content than they need.

Phase 2 keeps **96 synthetic messages** as the default and adds explicit read-only Gmail authorization for the newest **up to 100 metadata records**. Live account access has not been exercised by the agent; automated verification uses mocked Google services. It explores sender and subject rules, priorities, category distribution, and a simulated retrieval policy. It is not a generic email client or an AI model.

## Capabilities

- Overview with indexed/unread/priority counts, category distribution, sender patterns, and local processing activity.
- Inbox explorer with sender/subject/snippet search, combined category and priority filters, labels and read status.
- Keyboard-accessible message details with plain-text content, rule ID, reasons, heuristic confidence, and priority score.
- Analytics with category totals, top senders, daily frequency, priorities, and clearly labeled synthetic processing decisions.
- Connect → Authorize Gmail flow, safe error states, progress, partial coverage, explicit refresh, and disconnect/revocation.
- Source-aware dashboard and settings; all live charts describe only the loaded sample. Spam and Trash are excluded.

## Local setup

Use the Linux filesystem in WSL Ubuntu, Node 24 LTS (24.13.0 or newer in the 24 line), and npm. `.nvmrc` selects the compatible installed LTS line. No environment file is required for the demo. Gmail needs the public `VITE_GOOGLE_CLIENT_ID` in ignored `.env.local`; restart Vite after changing it. Never configure a client secret. Optional browser tests need `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright npx playwright install chromium` on a fresh machine (download approval may be required).

```sh
npm ci
npm run dev
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

## Gmail usage and approval boundary

Open the exact local origin registered for the OAuth client on port 5173; `localhost` and `127.0.0.1` are distinct origins. Google Cloud project/client configuration is owner-managed and was not modified. Click **Connect Gmail** to load GIS, then **Authorize Gmail** to open Google's chooser/consent from a fresh user gesture. Only `https://www.googleapis.com/auth/gmail.readonly` is requested; included previous scopes are disabled. No silent authorization occurs on load or refresh.

The app follows message-list pagination until it selects 100 unique IDs or the listing ends, then retrieves `format=METADATA` with only From/Subject/Date headers, labels and internalDate. No bodies, snippets or attachments are requested. Live search uses sender and subject; mock search retains snippets. Messages sort newest first by internalDate. Partial failures are counted without exposing provider errors. Missing metadata may render Unknown sender/(No subject); complex encoded address headers are not fully decoded.

Tokens, messages and metrics stay in page memory. Disconnect aborts work, clears live state, returns to mock and requests Google grant revocation. Revocation can affect the app's entire Google grant; if confirmation fails, the UI explains how to remove access in Google Account permissions. Reload clears local authorization but does not itself revoke Google consent. Remote revocation is detected on the next 401 response or expiry, not through background polling.

The mocked implementation is verified. The latest owner-reported live run loaded 100/100 messages with zero failures in 17,061 ms, using 101 fetch attempts and zero retries. An earlier 17,609-ms run is recorded separately. The owner also confirmed first-disconnect revocation and reconnection. Final local disconnect was confirmed; after the final in-app revoke confirmation was not observed, the owner checked Google Account connections and reported this app absent. These are owner-reported results, not an independent browser/account audit. Do not run automated tests against a real mailbox. See [manual test plan](docs/quality/PHASE2_MANUAL_TEST.md) and [live measurements](docs/quality/LIVE_MEASUREMENTS.md).

## Architecture and stack

React + TypeScript + Vite, Tailwind via its official Vite plugin, Lucide icons, React hooks, Vitest and Testing Library. Either repository validates domain messages → `loadInbox` classifies and instruments with a synthetic/real source → pure selectors/aggregators → React views. `GmailAuthorization` holds the token privately; `useMailbox` cancels obsolete work and isolates source/session state. Metrics stay in bounded session memory. No router or charting library is needed for four local views and accessible CSS charts. IndexedDB/Dexie is designed for a later sync milestone, not installed speculatively.

```text
src/
  app/                    Four-view application shell
  components/common/      Reusable state feedback
  data/mock/              Reserved .example-address fixtures
  domain/                 Models and repository/instrumentation interfaces
  features/               Classification, inbox selection/list/dialog, analytics aggregation
  repositories/           Synthetic and Gmail metadata adapters
  services/               GIS, authorization, safe errors, loading and metrics
  styles/                 Responsive tokens and presentation
  hooks/                  Source-safe mailbox lifecycle
  tests/                  Mocked OAuth/API, logic and component tests
```

## Screenshots

Browser verification artifacts are stored locally under `output/playwright/` and ignored by Git. Add curated, owner-reviewed screenshots here before publication. No screenshots of a real mailbox should be committed.

## Status, privacy and limitations

Implemented: mock dashboard plus explicit GIS authorization, a bounded Gmail metadata adapter, source-aware explanations/analytics, cancellation, expiry and safe failures. Planned: historical/incremental sync, IndexedDB, corrections, evaluation corpus, deployment and SaaS. No private mailbox was accessed during automated verification. No raw HTML, remote email images, external AI, telemetry endpoint, persistent tokens or message database is used. GIS loads only after an explicit click. Current dependency-audit findings remain documented; no new package was added in Phase 2. See [privacy](docs/security/PRIVACY.md), [verification](docs/quality/VERIFICATION.md) and [security](docs/security/SECURITY.md).

## Roadmap and contribution

Next: owner-approved manual consent/import/disconnect validation. Then: resumable import, history sync, adaptive retrieval, corrections and measured evaluation. [Roadmap](docs/product/ROADMAP.md) has dependencies and exit criteria.

Read [CONTRIBUTING](CONTRIBUTING.md) and [AGENTS](AGENTS.md) before changes. Run checks and document actual evidence. The owner has not chosen a license; **no LICENSE file is granted**. See [licensing decision](docs/LICENSING.md).

## Documentation

[Complete documentation index](docs/INDEX.md) · [environment](docs/ENVIRONMENT.md) · [implementation plan](docs/IMPLEMENTATION_PLAN.md) · [learning path](docs/learning/LEARNING_PATH.md) · [interview preparation](docs/learning/INTERVIEW_PREPARATION.md).

## Local origin and aggregate diagnostics

`npm run dev` uses http://127.0.0.1:5173 with strictPort enabled, preserving a stable OAuth origin. The owner confirmed this is the registered JavaScript origin; localhost is a different hostname. No Google configuration or credential was changed. The intercepted Playwright suite still explicitly uses port 4101 with a fake public client ID; it is separate from live acceptance.

After a Gmail run, the current-run diagnostics panel shows only monotonic load/classification duration and API/list/metadata fetch-attempt/retry counts. It excludes consent/paint, contains no private message/token fields, resets on refresh and clears on disconnect. A single run is not a benchmark or proof of optimization. The aggregate root attribute data-retained-live-message-count supports checking actual mailbox-result cleanup without exposing content.
