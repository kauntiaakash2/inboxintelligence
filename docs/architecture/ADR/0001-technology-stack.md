# ADR 0001 — React, TypeScript, Vite and browser-first execution

Status: Accepted for Phase 1. Date: 2026-10-31.

Context: One personal Gmail account, under 5,000 messages and ₹0–₹300/month target. We need interactive analytics, explainable rules and a path to replace synthetic data without a backend.

Decision: React with hooks, strict TypeScript, Vite static build, Tailwind's Vite plugin and Lucide icons. Provider-independent domain contracts isolate Gmail mapping. Use native controls and CSS charts rather than router/chart packages for four local views. Vitest/Testing Library verify logic and components; Playwright verifies actual browser behavior.

Alternatives: Next.js would provide server routes and rendering but adds server/auth deployment decisions before a backend is needed. Plain DOM JavaScript reduces tooling but makes typed cross-feature contracts and component reuse harder. A full Gmail SDK is unnecessary before an API adapter exists.

Consequences: Static hosting and local processing minimize operating complexity. A browser cannot hide secrets, guarantee background work or provide tenant isolation for a SaaS backend. OAuth must use public-client constraints. TypeScript does not validate network JSON; runtime adapters must. Revisit when SSR, offline server access, large datasets or multi-user authorization becomes justified.

Official setup references: [Vite](https://vite.dev/guide/) and [Tailwind](https://tailwindcss.com/docs/installation/using-vite). Exact versions live in package-lock.json.
