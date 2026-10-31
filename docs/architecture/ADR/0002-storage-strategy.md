# ADR 0002 — Session memory now, IndexedDB for durable local sync

Status: Accepted. Date: 2026-10-31.

Context: Mock data needs no durable storage. Real synchronization will need transactional checkpoints and indexed metadata without a paid database.

Decision: Phase 1 stores data only in React state and a bounded in-memory event buffer. Design future IndexedDB tables for account-scoped messages, profiles, corrections and atomic checkpoints. Prefer Dexie when implementing transactions/migrations; do not add it until there is a real persistence responsibility. Access and refresh tokens never belong in these tables.

Alternatives: localStorage is synchronous, string-based and lacks appropriate transaction/query semantics. A hosted SQL database offers multi-device access and centralized backup but adds cost, access control, privacy exposure and operational work. IndexedDB is a better initial fit for a single local user.

Consequences: Reload resets the demo. Future local data can be evicted, copied with a browser profile or read by malicious same-origin JavaScript. IndexedDB is not encryption. Need quota/error handling, schema migrations, export/delete controls, reimport and per-account keys before personal use. Revisit for multi-device or SaaS with an explicit server security design.
