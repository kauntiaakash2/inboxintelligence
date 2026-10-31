# Classification design

## Implemented deterministic prototype

`src/features/classification/classify.ts` evaluates an ordered list of explicit rules. First match wins. Spam label review has precedence; then security, careers, deadlines, finance, orders, education, promotions, newsletters and personal. Input features are subject keywords, exact sender domain and existing labels. Case-insensitive substring matching is simple and intentionally imperfect: a subject such as “no interview required” can still match careers.

Within a rule, any feature can trigger it. Confidence is `min(.95, .65 + .10 × matched evidence types)`. Current rules have at most two evidence types, so observed matches score .75 or .85; fallback scores 0. This is a documented evidence heuristic, not calibrated probability or measured accuracy. Keyword, domain and labels are not independent signals statistically; the formula makes no such claim. Exact domains avoid suffix tricks but do not authenticate a sender. Security subject rules flag for attention, not trust.

Priority is a fixed category-rule weight: High=90 (security/careers/deadlines), Medium=55 (personal/education/finance/orders), Low=20 (promotions/newsletters/spam). Fallback Medium=50 preserves unfamiliar mail for review. No body or attachment is required. Reasons identify matched evidence and rule ID; unmatched messages remain Uncategorized with a visible novelty flag. The current prototype is not an AI model, learned sender profile or adaptive learner.

## Planned retrieval and learning

Persistent sender profiles can combine count, category distribution, recency, correction history and rule version. Novelty may include new sender/domain, new subject template, changed category distribution and low-confidence evidence. Avoid assigning new senders blanket low priority. Allocate an exploration budget to unfamiliar messages so selective full retrieval does not perpetuate blind spots. Index metadata for every ID before deciding which messages need deeper content.

Selective body retrieval requires measured benefit, explicit retention policy, plain-text extraction, sensitive content controls and no remote-image loads. Bodies are not fetched by the current code: a synthetic event represents a candidate decision. User corrections will record provenance, override rules transparently and permit undo. Corrections must not silently rewrite Gmail labels in read-only mode.

Concept drift includes changing sender purposes, new subject conventions and evolving user priorities. Version rules/profiles, examine unknown/correction rates over time, and decay outdated patterns only after an evaluation demonstrates benefit. Sender frequency alone is not importance.

## Evaluation

Build a consented, minimized, independently labeled dataset and separate time/sender-based holdout from rule tuning data. Synthetic rule tests verify code paths, not product accuracy. Include multilingual subjects, ambiguous words, spoofed names, long headers, absent bodies, new senders and conflicting labels. Report accuracy, per-category precision TP/(TP+FP), recall TP/(TP+FN), confusion matrix, support and unknown rate. Undefined denominators stay unavailable. Review high-priority false negatives and security false positives separately. Compare baseline and adaptive policies with equal indexing coverage, measured API calls/bytes and the same holdout labels. No evaluation results are claimed yet.
