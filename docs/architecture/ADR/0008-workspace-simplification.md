# ADR 0008 — Consolidated workspace navigation and local rail preference

Status: implemented for engineering verification; owner visual acceptance pending.

## Context

The owner rejected the crowded inbox-first composition. Categories and display controls repeated across surfaces, four permanent destinations overlapped in purpose, and an empty pane consumed reading width. Existing OAuth, metadata, onboarding and analytical contracts are verified boundaries.

## Decision

Use Inbox, Insights and Settings as the sole primary destinations. Preserve both Overview/Analytics URLs as consolidated Insights and retain all calculations. Use a persistent 208px/64px desktop sidebar, transient native mobile drawer and contextual filter/source disclosures. Settings owns display controls. Show split columns only after selection.

Add sidebarState only to the separate strict display schema v2. Exact v1 data migrates without writes or changes to prior values; explicit save writes v2. The original personalization schema is untouched.

## Alternatives and consequences

A permanent mobile rail, expanded category sidebar and separate KPI Overview improve shortcut visibility but retain the rejected competition with messages. Full hiding was unnecessary once a small desktop rail recovered width. A router rewrite or new component library adds unrelated risk. Disclosures add a discovery interaction, so persistent source/active-filter indications and owner/user evaluation remain necessary. Native dialogs provide modal focus behavior, but browser verification must still cover Escape, dismissal, resizing and restoration. This decision authorizes no new message access, Gmail writes or caching.
