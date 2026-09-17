# CompareCode Agent Guidance

## Project Snapshot

- CompareCode is a free and open-source, local-first browser application for comparing text, code, images, and Markdown.
- The stack is Next.js, React, TypeScript, Tailwind CSS, Zustand, Vitest, Testing Library, Dexie, and IndexedDB.
- `package.json` is the source of truth for available commands and dependency versions.
- The root `AGENTS.md` is the only repository-wide agent instruction file. Keep repeatable task-specific workflows in `.agents/skills`; do not create nested, local, personal, or tool-specific instruction files.

## Working Agreements

- Keep changes focused on the active task. Preserve unrelated user changes and do not include them in edits, staging, commits, cleanup, or validation fixes.
- Prefer maintainable, long-term solutions that follow existing patterns. Avoid quick fixes, speculative abstractions, and unrelated refactors.
- Before editing, inspect the target code, its tests, its callers, and directly affected integration points in proportion to the change.
- Treat tests as behavior contracts. Fix production regressions instead of weakening, deleting, or bypassing tests; update expectations only for an explicitly accepted behavior change.
- When a repository change makes `AGENTS.md`, skill routing, a `SKILL.md`, or project documentation stale, update or remove that guidance in the same task.
- Preserve UTF-8, preferably without BOM. Do not run bulk encoding conversions or character-set transforms.
- Edit repository files deliberately and file by file. Command-line tools are appropriate for search, diagnostics, formatting, and validation, but not for unreviewed bulk rewrites.

## Communication and Language

- Reply in the language the user is currently using.
- Write code, identifiers, code comments, developer-facing messages, technical repository documentation, commit messages, branch names, and pull-request text in English.
- Avoid code comments when clear naming and structure are sufficient. Any necessary comment must be concise, current, and in English.
- After a repository modification task, end the final response with exactly one short English Conventional Commit suggestion. Label the suggestion naturally in the user's conversation language.

## Architecture and Implementation

- Keep module boundaries strict:
  - Text comparison logic and UI belong under `features/compare/text`.
  - Image comparison logic and UI belong under `features/compare/image`.
  - Compare-only shared contracts belong under `features/compare/shared` only when both compare modules genuinely use them.
  - Markdown editor, preview, formatting, import, paste, and history behavior belong under `features/markdown`.
  - Application-wide primitives, stores, services, hooks, utilities, configuration, and types belong in their established root-level owners only when they are genuinely cross-feature.
- Do not make Text depend on Image internals, Image depend on Text internals, or unrelated features depend on Markdown internals.
- Extend the existing canonical owner instead of duplicating business rules, defaults, persistence keys, mappings, UI policy, or state across components, stores, and services.
- Reuse existing UI primitives and semantic components before introducing a new component or one-off variant. A new parallel implementation requires a concrete unmet requirement.
- Use TypeScript consistently, prefer functional React components and hooks, use Tailwind utilities and existing theme tokens for styling, and use the established Zustand stores for global state.
- Avoid ad-hoc inline styling and feature-local variants when an existing token, primitive, or composition supports the requirement.
- Keep browser persistence compatible. Do not silently discard, reinterpret, or reset released IndexedDB or local-storage data without an explicit migration decision.
- Avoid N+1 data access, per-item persistence operations that can be batched, unnecessary rerenders, and repeated expensive calculations in render paths.
- Do not introduce secrets, unsafe HTML handling, or unvalidated untrusted-input boundaries. Preserve the established sanitize-before-render path for Markdown and rich content.
- Accessibility-only `aria-label` findings are non-blocking in normal repository work. Do not make `aria-label`-only changes unless the user explicitly requests them; continue to preserve meaningful keyboard, focus, role, and interaction behavior.

## Dependency Policy

- New direct runtime dependencies must use the MIT or Apache-2.0 license. Do not add LGPL, GPL, AGPL, or other copyleft runtime dependencies.
- Before adding or recommending a dependency, confirm that it is necessary, inspect its direct license, check notable transitive-license or security concerns, and prefer an existing dependency or small local implementation when that is simpler.
- Keep `package.json`, `package-lock.json`, and `THIRD_PARTY_NOTICES.md` consistent when dependency or notice changes require it.

## Skill Routing

- Use `$comparecode-browser-testing` for Playwright MCP, browser automation, responsive checks, or a visible local browser preview. Keep agent-owned sessions isolated from personal browser profiles and do not impose a fixed launch size.
- Use `$comparecode-git-workflow` for branch, staging, commit, push, fork, pull-request title, or pull-request description work.
- Use `$comparecode-code-review` for code reviews, pull-request reviews, diff audits, or pre-merge assessments.
- Use `$comparecode-clarify-open-questions` when material requirements remain unresolved or the user explicitly asks for questions, options, or a recommendation before implementation.
- Use `$comparecode-agent-files` when adding, changing, auditing, moving, or removing `AGENTS.md`, repository skills, or their routing.
- Use `$comparecode-ui-components` for shared UI primitives, theme-aware styling, responsive component behavior, or reusable interaction patterns.
- Use `$comparecode-data-migration` for IndexedDB, local-storage, session-storage, persisted settings, saved history, schema, key, or serialized-format changes.

## Validation

- Run targeted tests while iterating when they give useful feedback.
- For production code, configuration, or dependency changes, complete `npm run lint`, `npm run test`, and `npm run build` before a requested commit or pull request unless the environment prevents a check. Report every skipped or failing check.
- For test-only changes, run the affected tests and lint. Run the production build when the change can affect compilation or bundling.
- For instruction-only or documentation-only changes, validate Markdown/YAML structure, referenced paths, skill discovery, `git diff --check`, and the final diff; an application build is not required.
- Never claim a check passed unless it was run successfully in the current task.

## Git and Change Authority

- Creating or switching branches, committing, pushing, and opening pull requests require the user's explicit request. An explicit pull-request request also authorizes only the minimum branch publication needed to open that pull request.
- In the user's terminology, `dev`, `develop`, and `developer` refer to the repository's actual `development` branch.
- Never commit directly to, merge locally into, or push changes directly to `development` or `main`. Changes reach either protected branch only through a pull request from a focused topic branch.
- Create every `feature/*` branch directly from the latest fetched canonical `development` branch, never from `main` or another topic branch.
- Use an English `feature/<descriptive-name>` or `fix/<descriptive-name>` topic branch. Keep one branch and one pull request focused on one feature or fix.
- Default every pull request to `development`. Do not open a pull request to `main` unless the user explicitly authorizes that exact target in the current task.
- Never merge, close, or otherwise finalize a pull request unless the user explicitly requests that separate action. Authorization to create or update a pull request does not authorize merging it.
- Create commits only through `$comparecode-git-workflow`. Every commit requires a DCO sign-off and an English, subject-only Conventional Commit message; the mandatory `Signed-off-by` trailer is the only permitted footer.
- Treat commits created by the user as legitimate repository history. Refresh status and history, build on them normally, and never amend, squash, rebase, reset, or otherwise rewrite them without an explicit request.
- Do not change Git identity, signing configuration, remotes, branch protection, or repository settings on the user's behalf unless explicitly requested.

## Code Review Rules

- Treat correctness, user-visible regressions, data loss, security issues, and violations of explicit product behavior as merge blockers.
- Treat cross-module coupling, duplicated sources of truth, bypassed canonical stores/services, and unjustified duplicate components as blocking when they create conflicting behavior or maintenance risk.
- Treat prohibited runtime dependency licenses, missing required notices, secrets, unsafe content rendering, and material dependency risks as blocking.
- Require meaningful tests for non-trivial logic changes or a concrete manual validation plan when automation is not practical.
- For UI changes, verify visible behavior and relevant responsive or interaction paths; use `$comparecode-browser-testing` when browser validation is warranted.
- Keep review findings specific and actionable. Prioritize must-fix issues over optional improvements, and leave formatting-only concerns to deterministic tooling when possible.
