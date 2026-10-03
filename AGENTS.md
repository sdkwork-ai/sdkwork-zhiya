# Repository Guidelines

## SDKWORK Soul

Agent execution follows `../sdkwork-specs/SOUL.md`: specs before memory, dictionary before context, evidence before completion, stop on ambiguity, long-running recovery.

## SDKWORK Standards

Canonical standards entrypoint: `../sdkwork-specs/README.md`. Behavior follows `../sdkwork-specs/AGENTS_SPEC.md`. Do not copy normative spec bodies into this repository; reference them by relative path. If this repository is checked out alone, fetch `sdkwork-specs` as a sibling checkout at `../sdkwork-specs` before running check/build tools.

## Application Identity

Application id: `sdkwork-zhiya`. Application code: `zhiya`. Domain: `zhiya`. Primary surface: mobile-first H5 family-education activity platform with five bottom tabs (首页 Home ｜ 活动 Activities ｜ AI ｜ 商城 Mall ｜ 我的 Profile). The current milestone is standalone mock-backed; no owned HTTP contracts yet.

## Local Dictionary Structure

- `AGENTS.md` is the repository execution entrypoint.
- `apps/README.md` indexes application roots: `apps/sdkwork-zhiya-common/` (shared family), `apps/sdkwork-zhiya-h5/` (primary H5, including the embedded org workspace); the repository root itself is not an app surface.
- `specs/` holds repository machine contracts (`component.spec.json`, `domain.yaml`, `topology.spec.json`).
- `etc/` is the deployable-root source configuration index (`etc/sdkwork.deployment.config.json` + `etc/topology/*.env`); the H5 app root owns its own `apps/sdkwork-zhiya-h5/etc/`.
- `docs/` holds the Canon documentation tree (`docs/product/prd/PRD.md`, `docs/architecture/tech/TECH_ARCHITECTURE.md`).
- `.sdkwork/` holds repository-local agent workspace metadata.

## Documentation Canon

Documentation index: `docs/README.md`. Product Canon: `docs/product/prd/PRD.md`. Technical architecture Canon: `docs/architecture/tech/TECH_ARCHITECTURE.md`.

## Spec Resolution Order

Use dynamic progressive loading: read this file, then the task row in `../sdkwork-specs/README.md`, then only the selected standards, and inspect implementation files last. Language-specific specs are on-demand only. Do not copy root spec bodies locally; do not contradict global standards.

## Required Specs By Task Type

- Agent workflow / repository structure: `../sdkwork-specs/AGENTS_SPEC.md`, `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`, `../sdkwork-specs/DOCUMENTATION_SPEC.md`, `../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`
- H5 app feature work: `../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md`, `../sdkwork-specs/APP_MOBILE_REACT_UI_SPEC.md`, `../sdkwork-specs/FRONTEND_CODE_SPEC.md`, `../sdkwork-specs/UI_ARCHITECTURE_SPEC.md`
- Cross-surface work: `../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` (route ids, i18n keys, and the common shared family are the only cross-surface seams)
- TypeScript work: `../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md`; language specs load on demand only
- Styling / theme: `../sdkwork-specs/TAILWIND_CSS_INTEGRATION_SPEC.md`, `../sdkwork-specs/THEME_DARKMODE_SPEC.md`
- i18n: `../sdkwork-specs/I18N_SPEC.md`
- List/search: add `../sdkwork-specs/PAGINATION_SPEC.md`
- Tests: `../sdkwork-specs/TEST_SPEC.md`, `../sdkwork-specs/FRONTEND_CODE_SPEC.md` §11
- Commands / packaging workflows / releases: `../sdkwork-specs/PNPM_SCRIPT_SPEC.md`, `../sdkwork-specs/GITHUB_WORKFLOW_SPEC.md`, `../sdkwork-specs/RELEASE_SPEC.md`
- App manifests / source config: `../sdkwork-specs/APP_MANIFEST_SPEC.md`, `../sdkwork-specs/SOURCE_CONFIG_SPEC.md`, `../sdkwork-specs/ENVIRONMENT_SPEC.md`
- Component contracts: `../sdkwork-specs/COMPONENT_SPEC.md`, `../sdkwork-specs/MODULE_SPEC.md`
- Naming: `../sdkwork-specs/NAMING_SPEC.md`

## Int64 Wire Contract (API_SPEC §13.6)

When API contracts are introduced, int64 values MUST be `type: string, format: int64` per `../sdkwork-specs/API_SPEC.md` §13.6.

## Code Style Rules

Keep responsibilities inside their owning package: shell owns navigation chrome; capability packages own screens/services/state/i18n/routes; core owns composition, route table, and SDK inventory; commons owns shared leaf components and utilities. TypeScript strict mode is mandatory. Public exports stay at package `src/index.ts`. UI never constructs SDK clients or HTTP directly — it flows through hooks/services with injected clients.

## Build, Test, and Verification

Run from the repository root; use the narrowest command first: `pnpm --filter <package> typecheck`, then `pnpm typecheck`, `pnpm test`, `pnpm build:h5:dev`. Verification before completion: `pnpm typecheck && pnpm test && pnpm build:h5:dev` plus the standards checks wired under `pnpm check`.

## Agent Execution Rules

Follow `../sdkwork-specs/SOUL.md`. Development happens on `main` directly. Stop on ambiguity in identity, ownership, or authority. Capture verification evidence before claiming completion.

## App SDK Consumer Imports Routing

This repository currently declares no generated SDK dependencies (`sdkDependencies: []` in the component specs). App SDK consumer import work routes to `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` §9 — copy the canonical managed text from there when the first SDK family lands; never restate the normative body here. Generated clients are imported only through `src/bootstrap/sdkClients.ts` and the core SDK inventory, never constructed inside UI components.

## HTTP API Response Envelope

All L2+ SDKWork-owned custom HTTP contracts, including `app-api`, `backend-api`, and SDKWork-owned business `open-api`, `MUST` follow `API_SPEC.md` section 4.5, section 14, and section 15:

- **Default classification:** omitted `x-sdkwork-wire-protocol` means SDKWork-owned custom API (`sdkwork-v3`); only operation-level `x-sdkwork-wire-protocol: external` plus `x-sdkwork-external-protocol-id` identifies a third-party compatibility `open-api` operation.
- **Input:** typed request bodies, section 14.1 list/search/command input, `SdkWorkListQuery`, and `q` for free-text search.
- **Success output:** `SdkWorkApiResponse` with `{ "code": 0, "data": <payload>, "traceId": "<server-uuid>" }`.
- **Error output:** HTTP 4xx/5xx `application/problem+json` (`ProblemDetail`) with numeric `code` and `traceId`; SDKWork-owned errors may include `i18nKey` and `locale` presentation metadata.
- Success `code` is numeric `int32`; HTTP 2xx JSON bodies `MUST` use `0` only. REST semantics remain on HTTP status (`201`, `202`, etc.).
- Platform error codes are numeric non-zero values per section 15.3 (`40001`, `40101`, `40401`, …).
- Single resource: `data.item`
- Lists: `data.items` + `data.pageInfo` (`PageInfo.mode` is `offset` or `cursor`)
- Commands: `data.accepted` plus optional `resourceId` / `status`
- Async accept (`202`): `data.operationId`, `data.status`, optional `pollUrl`
- Operation patterns: retrieve/list/search/create/update/delete/command/async/bulk semantics follow `API_SPEC.md` section 15.4; create uses `201`, delete uses `204` with no JSON body, and `PUT`/`PATCH` use SDK action `update`.

Vendor compatibility `open-api` routes that mirror upstream tool or provider wire (for example OpenAI `/v1/*`, Anthropic/Claude `/anthropic/v1/*`, Google/Gemini `/google/v1beta/*`, Claude Code, or Codex) `MAY` opt out only when every exempt operation declares operation-level `x-sdkwork-wire-protocol: external` and `x-sdkwork-external-protocol-id` per `API_SPEC.md` section 4.5.2. SDKWork-owned business `open-api` operations `MUST NOT` opt out. Mixed OpenAPI documents are validated per operation; one external operation never exempts SDKWork-owned operations in the same document.

Errors `MUST` use HTTP 4xx/5xx with `application/problem+json` (`ProblemDetail`) including required numeric `code` and `traceId`. Optional `i18nKey` and `locale` are display metadata only. Business failures `MUST NOT` use HTTP 2xx with non-zero `code`, string wire codes, `success`, or human `message`.

Forbidden legacy envelopes and fields: `PlusApiResult`, `AppbaseApiResult`, `StoreApiResult`, `SdkWorkResponse`, per-domain `*ApiResult`, wire field `requestId`, bare domain DTOs at the HTTP root, and top-level `{ items, pageInfo, traceId }` without `data`.

Handlers `MUST` serialize success and map errors through `sdkwork-web-framework` response mapping. Generated HTTP SDKs (`--standard-profile sdkwork-v3`) unwrap `data` by default and expose typed numeric `ProblemDetail.code` / `traceId` and returned localization metadata on errors; use `.raw` when the full envelope is required.

Before completing API contract, SDK generation, or frontend service work, run:

```bash
node <sdkwork-specs>/tools/check-api-operation-patterns.mjs --workspace <workspace-root>
node <sdkwork-specs>/tools/check-api-response-envelope.mjs --workspace <workspace-root>
```

Authority: `sdkwork-specs/API_SPEC.md` section 4.5 and sections 14–16, `SDK_SPEC.md` section 4.2, `FRONTEND_SPEC.md`, `MIGRATION_SPEC.md` section 4.2.

## Human Review Rules

Human review is required before landing: breaking API/contract changes, security-sensitive changes, deletion of generated or shared assets, release/publish actions, and any destructive operation beyond narrow enumerated paths. Follow `../sdkwork-specs/CODE_REVIEW_SPEC.md` and `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`.

## Destructive Operation Safety

Authority: `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`. Deletion must be explicit, enumerated, and reviewable; wildcard/recursive deletion is forbidden; use the enumerate–contain–classify–batch–confirm–report sequence. Fix forward instead of rolling back; follow `../sdkwork-specs/ROLLBACK_RESTRICTION_SPEC.md`.

## Main-Branch Development

Authority: `../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. The default and development branch is `main`. Authored changes are committed onto `main` directly; side branches and detached HEAD are not development venues.

<!-- SDKWORK-DESTRUCTIVE-OPERATION-STANDARD: v1 -->
## Destructive Operation Safety

Authority: `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md`.

Deletion must be explicit, enumerated, and reviewable. Deleting by pattern instead of by named
path is forbidden. Wildcards are for read-only commands only.

- `git rm -r`, `git rm` over a directory or pattern, and `git clean -f`/`-fd`/`-fdx` are
  FORBIDDEN. A recursive `git rm` stages many deletions in one index transaction; if the process
  is interrupted (SIGTERM, timeout, sandbox kill, crash) entries are already gone from disk while
  the index is only half-written, which is silent non-atomic mass data loss.
- Delete tracked files with `rm <exact/path>` on each named path, let `git status --short`
  record the `D` entries, then stage only the enumerated paths. Commit the deletion separately
  from functional changes.
- Shell and script deletion by wildcard is FORBIDDEN: `rm -rf`/`rm -r`/`rm -f` with
  `*`/`**`/`?`/`[...]`/brace expansion, `find ... -delete`, `find ... -exec rm`,
  `find ... | xargs rm`, `for f in *; do rm ...`, `del /S /Q`, `rd /S /Q`,
  `Remove-Item -Recurse -Force` on a glob, `shutil.rmtree`, `fs.rm(dir, { recursive: true })`,
  and `rimraf` over a glob.
- A deletion MUST NOT be combined in one shell invocation with a build, install, network, or
  publish step, and MUST NOT derive its targets from an unvalidated argument, environment
  variable, or configuration value.
- Permitted narrow deletion: `rm <exact/path>`; a short literal path list owned by the tool that
  declares it; the module's own generated artifacts through its owning tool
  (`pnpm clean`, `cargo clean`) per `CODE_STYLE_SPEC.md` §7; and
  `git restore --worktree --source=HEAD -- <exact paths>`.
- Required sequence before any deletion: enumerate exact paths; confirm every path resolves inside
  the active repository or module root; classify tracked/generated/cached/unknown; prefer `rm`
  plus tracked `git status`; delete in batches of 20 or fewer with a status check between
  batches; report the removed paths and the authorizing decision.
- Request explicit human confirmation before deleting any git-tracked path, any directory tree,
  any path resolving outside the active repository root, or more than 20 paths.
- Recovery after an accidental mass deletion: clear a stale `.git/index.lock`, write the path
  list to a file INSIDE the repository (never `/tmp` on Windows, where the Git Bash path space
  and the native tool path space disagree), and run a single
  `git restore --worktree --pathspec-from-file=<repo-relative-list>`. Never loop one
  version-control call per path; the same termination cause interrupts the loop part-way.

Verification (from the repository root):

```bash
node ../sdkwork-specs/tools/sync-agent-destructive-operation-standard.mjs --root . --check
```
<!-- /SDKWORK-DESTRUCTIVE-OPERATION-STANDARD: v1 -->

<!-- SDKWORK-ROLLBACK-RESTRICTION-STANDARD: v1 -->
## Rollback Restriction And Fix-Forward Discipline

Authority: `../sdkwork-specs/ROLLBACK_RESTRICTION_SPEC.md`.

Errors are fixed forward. Version-control history is never rewound to make an error disappear.

- A rollback is any operation that moves a ref, resets the index or the working tree to an earlier
  state, discards uncommitted or committed work, or rewrites published history. It is FORBIDDEN as
  the remedy for a defect — a build failure, a type error, a lint failure, a failing test, a merge
  conflict, a runtime regression, a bad refactor, or an unclear diff. Repair forward instead, by
  adding, editing, or restoring content through a new commit.
- FORBIDDEN by an agent or a human-issued command: `git reset --hard` in any form;
  `git reset --merge`/`--keep`; `git reset <ref>` that discards staged or working-tree content;
  `git checkout -f`, `git switch -f`, `git restore --source=<ref> --worktree .`;
  `git revert` as a reflex error remedy; `git stash drop`/`clear` and `git stash pop` over a
  conflict; `git branch -D` on a branch with unmerged work; `git update-ref -d` and direct
  `.git/refs/` edits; `git reflog expire`, `git gc --prune=now`, `git prune`;
  `git commit --amend` over a pushed commit; `git rebase`, `git rebase -i`, `git rebase --onto`;
  `git filter-branch`; `git push --force`, `git push --force-with-lease`, and
  `git push --delete`.
- A rollback is never inferred from context or tone. "Fix it", "it's broken", "this is a mess",
  "start over", "just revert it", and "退回" are not rollback instructions. If the intent is
  ambiguous, STOP and ask — including whether the instruction means to discard work or to restore
  lost work, because that distinction decides the permissible operation.
- Discarding work requires a separate, explicit, human-issued instruction that names the operation,
  the target ref, the discarded span, and the reason, and that acknowledges the loss. The
  authorization must be quoted in the commit message. A standing authorization is not accepted.
- Recovery is ADDITIVE: `git restore --worktree --source=<ref> -- <exact paths>`, or
  `git checkout <good-ref> --pathspec-from-file=<repo-relative-list>` with the list written inside
  the repository. The pathspec must be an explicit enumerated list — never a directory, glob, brace
  expansion, or the repository root — and a restore is never combined with a build, install,
  publish, or commit step in the same shell invocation.
- Before a bulk restore: commit any local modification as a checkpoint; create a backup branch AND a
  tag AND a patch file and verify they point at the pre-restore state; produce a written
  three-snapshot blob comparison (damaged revision vs its parent vs the candidate older snapshot)
  that separates REPLACED files from files the damaged revision legitimately AUTHORED; restore the
  relative complement, not the whole tree; and keep the files the damaged revision added.
- Never treat a local tracking ref as evidence about a remote. Confirm with
  `git ls-remote <remote> <branch>` and record the returned object id.
- After a restore, verify by content hash rather than by reading files, re-run the gates that cover
  the restored surface, and classify each remaining failure as caused-by-the-restore or
  pre-existing. A pre-existing claim must be proven by showing the same failure at the prior
  revision with `git show <ref>:<path>`, not reasoned about. Fix forward. Never un-restore.
- Never bypass a hook, signature, or gate with `--force`, `--no-verify`, or `--no-gpg-sign` to
  land a repair.

Verification (from the repository root):

```bash
node ../sdkwork-specs/tools/sync-agent-rollback-restriction-standard.mjs --root . --check
```
<!-- /SDKWORK-ROLLBACK-RESTRICTION-STANDARD: v1 -->

<!-- SDKWORK-MAIN-BRANCH-STANDARD: v1 -->
## Main-Branch Development

Authority: `../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md` section 1.

Development happens on `main`. Everything authored in this repository is committed onto `main`.

- A working tree that receives authored content MUST have `main` checked out as its current branch
  for the whole time that work is in progress. Commit onto `main` directly; do not commit onto a
  branch a later merge is expected to bring in.
- A detached HEAD MUST NOT be used as a development venue. A commit created while HEAD is detached
  from every branch is reachable only through the reflog — absent from every branch history, from a
  fresh `git clone` of this repository, and from every other working tree — so the work it carries
  is one `git gc` away from being unrecoverable. Do not check out a bare commit, a tag, or an older
  ref in order to "get a clean starting point" and commit there.
- A side branch MUST NOT be used as a development venue either. There is no long-lived feature,
  release, maintenance, or personal branch, and this repository MUST NOT accumulate local commits
  that `main` cannot reach: making them findable would then depend on a merge that may never happen.
- A checkout off `main` is legitimate only while it stays read-only — a dependency or SDK pinned to
  an explicit commit, a release artifact checkout, or a bisect. No authored change is committed there.
- A working tree found detached, or on a branch other than `main`, with work in it is a STOP, not a
  cleanup. Do not move refs, do not rewrite history, and do not discard the commits. Report the
  branch, the commits, and the state, and let a human decide: moving commits onto `main` and
  discarding work are both governed by `../sdkwork-specs/DESTRUCTIVE_OPERATION_SPEC.md` and
  `../sdkwork-specs/ROLLBACK_RESTRICTION_SPEC.md`.

Verification (from the repository root):

```bash
node ../sdkwork-specs/tools/audit-repository-baseline.mjs --root . --only branch-main
node ../sdkwork-specs/tools/sync-agent-main-branch-standard.mjs --root . --check
```

The first fails when the current branch is anything other than `main`, and reports a detached HEAD
as `detached`. The second fails when this block is out of date.
<!-- /SDKWORK-MAIN-BRANCH-STANDARD: v1 -->
