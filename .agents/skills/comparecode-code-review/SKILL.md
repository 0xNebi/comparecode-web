---
name: comparecode-code-review
description: Review CompareCode diffs, pull requests, or uncommitted changes for correctness, regressions, architecture, component reuse, dependencies, licenses, security, performance, and merge readiness.
---

# CompareCode Code Review

Prioritize concrete production risk and must-fix issues over stylistic preferences.

## Review Workflow

1. Inspect the complete diff, repository status, relevant tests, and surrounding implementation. Do not modify files unless the user separately asks for fixes.
2. Verify the stated requirement, visible product behavior, edge cases, failure paths, persistence compatibility, and interactions with existing callers.
3. Apply the root `AGENTS.md` code-review rules and module boundaries. Look for duplicated sources of truth, cross-feature coupling, bypassed stores or services, and workaround logic that hides a bug.
4. Search existing shared and feature components before accepting a new component, primitive, hook, or style variant. Flag a parallel implementation when an existing semantic and interaction contract can be extended or composed.
5. For dependency changes, establish whether the dependency is actually needed, whether an installed dependency or local implementation already covers the use case, and whether bundle/runtime cost is justified.
6. Verify every new direct runtime dependency is MIT or Apache-2.0 licensed. Treat LGPL, GPL, AGPL, other copyleft licenses, an unknown direct license, or a missing required notice as blocking. Call out notable transitive license or security findings and confirm `THIRD_PARTY_NOTICES.md` remains accurate when applicable.
7. Check security boundaries, especially secrets, unsafe HTML or script handling, Markdown sanitization, file input, browser storage, and untrusted content rendering.
8. Check material performance risks such as N+1 access, repeated IndexedDB writes, avoidable rerenders, unbounded work, and expensive render-path calculations.
9. Require targeted tests for meaningful logic and regression risks. For UI changes, require a focused manual walkthrough or browser evidence when automated coverage is insufficient.
10. Confirm relevant lint, tests, and build checks are reported honestly. Identify any validation gap that must be closed before merge.

Do not treat an `aria-label`-only concern as a merge blocker unless the user explicitly included it in scope. Continue to flag broken keyboard, focus, role, or interaction behavior when it has real user impact.

## Findings and Verdict

Report findings first in severity order: Critical, High, Medium, then Low. For each finding, include:

- the concrete impact or failure mode;
- a precise file and line reference;
- the affected contract, component, dependency, or integration point;
- a practical safe fix;
- whether it blocks merge.

Avoid speculative warnings, formatting-only noise, and optional refactors that do not materially improve correctness or maintainability. End with a clear ready-or-not-ready merge verdict in the user's conversation language and list only meaningful residual validation gaps. If no findings remain, say so directly.
