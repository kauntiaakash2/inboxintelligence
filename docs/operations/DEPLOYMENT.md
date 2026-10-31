# Proposed deployment — no deployment performed

Build `npm run build`; the output is static `dist/` assets. A future owner-approved Cloudflare Pages or equivalent static host can serve them over HTTPS without an always-on backend or paid database. Hosting free-tier eligibility and limits must be verified when deployment is requested; the ₹0–₹300/month target is not a guaranteed price quote. No cloud account, project, billing, DNS or deployment workflow has been created.

Before deployment: choose license and reporting channel, review dependency notices/audit, test production bundle, configure security headers/CSP against actual dynamic styles, verify no source credentials, then approve a preview environment. No history routing rewrite is currently necessary because navigation is local state. Public variables are compiled at build time; client secrets never belong in frontend environment variables.

Future Gmail origins must be explicitly registered with Google and match approved HTTPS/local development origins. Update CSP for only documented GIS/Google endpoints and test consent/reconnect. Review restricted-scope verification requirements before exposing Gmail access to other users. Keep preview and production origins separate; never ship sample tokens or real mailbox fixtures.

Post-deploy validation: open fresh browser, inspect response headers and requests, exercise search/modal/mobile, verify stale-cache upgrade behavior, check disconnected auth path and export/delete before personal data use. Rollback restores a known static build; future IndexedDB schema changes require backward/forward migration planning. A rollback is not sufficient to undo a leaked credential—revoke it.

No GitHub Actions deployment is configured. Existing CI validates only. Future multi-user hosting/backend is a separate design and cost decision.
