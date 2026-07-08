# Changelog
All notable changes to this project will be documented in this file.

## Future version — n8n Creator Portal (Cloud submission)

**Planned approach:** split into two packages — **this package** as the verified, n8n Cloud–submittable build **without** the `HuduAiTools` node (main Hudu node remains, including `usableAsTool` where applicable), and a **separate package** that includes full Hudu AI Tools for self‑hosted installs only (not submitted to n8n Cloud). The items below come from Creator Portal / community package scanner review and are to be closed as part of that split and follow‑up work.

### Outstanding — Cloud / scanner

- **[HIGH] Official scanner rejects `require(‘module’)` in AI tools runtime** (`nodes/Hudu/ai-tools/runtime.ts`): `@n8n/scan-community-package` reports that require of `’module’` is not allowed. Hudu AI Tools uses `createRequire` from Node’s `module` built-in (after resolving an anchor via `require.resolve`) so `@langchain/core` and `zod` load from n8n’s dependency tree and avoid class identity mismatches with bundled copies. The scanner still flags this pattern for verified nodes. **Resolution:** either a different mechanism to obtain LangChain’s `DynamicStructuredTool` that satisfies the scanner, or confining the AI Tools node to the non–Cloud package only.

### Resolved — Cloud / scanner

- **[MEDIUM] ~~`HuduAiTools` AI tool output connection type~~** — Fixed in 2.5.0: `NodeConnectionTypes.AiTool` enum value now used in place of the `’ai_tool’ as NodeConnectionType` string cast.

## [2.6.0] - 2026-07-08

### Fixed
- **`RuntimeDynamicStructuredTool`/`getLazyLogWrapper` unresolvable on pnpm-strict-isolated n8n installs (issue #26).** On n8n v2.29.x+ installs where n8n-nodes-hudu lives outside n8n's own `node_modules` tree (e.g. `~/.n8n/nodes/`), pnpm's strict dependency isolation means neither `require.main` nor the `@langchain/classic/agents`/`langchain/agents` anchor candidates can resolve into the pnpm subtree containing `@langchain/core`/`@langchain/classic` — even though those packages are reachable from inside n8n's own process. Any workflow with an MCP Server Trigger (or other AI Agent node) connected to a `huduAiTools` sub-node then failed the entire request with HTTP 500 (`Workflow could not be started!`), because `supplyData()` threw during `RuntimeDynamicStructuredTool` construction. **Fix:** added `findCachedExports()`, a lazy, memoized fallback that scans Node's process-global `require.cache` for `@langchain/core/tools` and `@n8n/ai-utilities` once they're resident — n8n's own Agent/MCP Trigger machinery always loads `@langchain/core/tools` before ever calling into a connected tool's `supplyData()`, so by execution time the module is guaranteed to be in cache regardless of install layout, and scanning the cache returns the exact same class identity n8n itself uses (preserving `instanceof` checks). The original anchor-probing path is unchanged and still tried first; the cache scan only runs as a fallback, and only at first actual use (not at module load, since n8n discovers/registers node files before any workflow runs and before langchain is loaded). `zod` resolution is untouched — not reported broken and structurally different (more commonly hoisted) than `@langchain/core`. Also fixed `getLazyLogWrapper()`'s memoization: it previously locked in a permanent `undefined` result after a single failed resolution attempt (guarding on a `_logWrapperResolved` boolean set before the attempt ran), which defeated its own cache-scan fallback in the same pnpm-isolated scenario this fix targets. Now guards on the result itself (like `resolveDynamicStructuredTool()`), so it retries on every call until it succeeds once.

## [2.5.0] - 2026-05-15

### Added
- **`describeFields` operation on all AI Tools resources.** Call `operation: ‘describeFields’` (optionally `targetOperation: ‘create’|’getAll’|...`) to get the field list, types, required flags, descriptions, and enum values for any resource/operation pair — without an API call. Auto-enabled on every tool regardless of UI selection.
- **Zod v4 dual support in `toRuntimeZodSchema`.** Schema conversion now reads both `_def.typeName` (Zod v3) and `_def.type` (Zod v4 string variant). Adds `ZodEffects`/`effects` passthrough and `unknown()` fallback with console warning for unrecognised types.
- **`logWrapper` integration in `supplyData()`.** `getLazyLogWrapper()` is now applied to the tool before returning, enabling n8n’s built-in AI tool call logging when `@n8n/ai-utilities` is available.
- **Module-level schema cache (`_readOnlySchemaCache`, max 200).** `buildUnifiedSchema` results are memoized by resource + operations + config flags — cache is credential-independent and survives across executions.
- **Module-level description cache (`_descriptionTemplateCache`, max 600).** `buildUnifiedDescription` results are memoized — same schema always produces the same description string.
- **`describeSchemaFields` / `FieldDescriptor` exported from `schema-generator.ts`.** Provides field introspection for the `describeFields` operation without going through the runtime Zod proxy.

### Fixed
- **`NodeConnectionTypes.AiTool` enum value** used in `HuduAiTools.node.ts` output definition — replaces the `’ai_tool’ as NodeConnectionType` string cast. Resolves the MEDIUM cloud scanner finding.
- **`runtimeZod` Proxy symbol/thenable/constructor guards.** Framework probes for `Symbol.toPrimitive`, `Symbol.toStringTag`, `.then` (Promise thenable detection), and `.constructor` no longer throw misleading errors during structural inspection. Proxy now returns `undefined` for these probes.
- **`.positive()` → `.min(1)` on all 64 numeric ID fields** in `schema-generator.ts`. `z.number().positive()` is removed in Zod v4; `.min(1)` is equivalent and supported in both v3 and v4.

### Changed
- **Result envelope migrated to v3 (flat shape).** `error-formatter.ts` rewritten: success/failure now signalled solely by presence of `error: true`. Drops `schemaVersion`, `wrapSuccess`, `addResultWarning`, `SuccessEnvelope`, `ErrorEnvelope`. Adds `wrapError` (backward-compatible 5-arg signature), `buildListResponse`, `buildItemResponse`, `buildMutationResponse`, `buildDeleteResponse`, `buildMetadataResponse`, `addWarning`. New `ERROR_TYPES`: `INTERNAL_ERROR`, `INVALID_PICKLIST_VALUE`, `INVALID_FIELDS`, `INVALID_WRITE_FIELDS`, `MISSING_REQUIRED_FIELDS`, `INVALID_FILTER_CONSTRAINT`, `WRITE_RESOLUTION_INCOMPLETE`, `CONCURRENCY_CONFLICT`. `ACTIONABLE_TYPES` auto-sets `actionRequired: true` and prefixes summary with `REQUIRED NEXT STEP:` for errors that require an immediate follow-up.
- **Outer catch in `executeHuduAiTool`** now distinguishes `TypeError | ReferenceError | RangeError` → `INTERNAL_ERROR` (do not retry) vs API errors → `API_ERROR` (check params and retry).
- **Envelope preamble** in tool descriptions updated from "Envelope v2" to "Envelope v3 — ‘error:true’ = failure; absent ‘error’ = success." Propagated through `description-builders.ts` and all 7 occurrences in `help-registry.ts`.
- **Three-module-tree comment** added to `runtime.ts` documenting n8n’s three distinct module resolution trees and why each dependency must come from a specific tree to avoid silent `instanceof` failures.

## [2.4.4] - 2026-05-14

### Fixed
- **2.4.3 side-effect: help-only tool when user-selected ops collapsed to empty.** Previously the auto-include for `'help'` ran BEFORE the "No tools to expose" guard, so a node where the user ticked only write ops without enabling `allowWriteOperations` silently degraded to a help-only tool instead of throwing the explicit error. The empty-check now runs against the pre-help count: if no non-help ops survive the filter, the original `No tools to expose. Select operations and enable "Allow Write Operations" if you need mutating operations.` error fires. Help auto-include runs after the guard passes. Mirrored in both `supplyData()` and `execute()` paths.

### Changed
- **`Help / workflow notes` option in the node UI now labelled `(always on)`** with a description: `Auto-enabled regardless of selection — agents reach long-form workflow prose via operation='help' topic='overview'.` Makes it visually clear to users opening the node that help is not a toggle they need to think about. The option still appears in the multiOptions list so users see what `operation=help` does; ticking or un-ticking it has no effect at runtime.

## [2.4.3] - 2026-05-14

### Fixed
- **`operation: 'help'` rejected by Zod enum on resources where help was added in a later release without re-editing each workflow node.** Symptom: agent calls `hudu_companies operation=help` → `Expected 'get'|'getAll'|...|'getIdByName', received 'help'`. Same for `hudu_folders`, `hudu_procedures`, `hudu_relations`. Root cause: `supplyData()` and `execute()` filtered the resource's available ops by the saved `operations` multiOptions array on the node. If the node was created before `help` was registered for that resource, the saved selection has no `help` entry, so the runtime enum never includes it — even though the tool description (built from the same filtered list) also lists `help` as available. Description and validator agreed on absence in that path, but the description for OTHER tools that DID have `help` selected suggested to the agent that help worked everywhere. Worse than absent: agents try and fail.

### Changed
- **`help` is now auto-enabled** in both `supplyData()` and `execute()` paths whenever the resource registers it in `config.ops`, regardless of UI multiOptions selection. Help is read-only metadata/discoverability, not a regular operation — it should always be reachable when the resource has help content, without forcing users to manually re-tick `Help / workflow notes` on every Hudu AI Tools node in every workflow after each release that extends help coverage. The `Help / workflow notes` toggle remains in the node UI for visibility but is no longer load-bearing.

### Migration
No code or workflow changes required. After `npm run build && npm link` (and `npm link n8n-nodes-hudu` in `~/.n8n/nodes`, then restart n8n), `operation=help topic=overview` works on all 8 enabled resources regardless of which operations are ticked in each node's UI.

## [2.4.2] - 2026-05-14

### Added
- **`operation: 'help'` propagated to 6 additional resources**: `companies`, `folders`, `websites`, `procedures`, `procedure_tasks`, `relations`. Each registers an `overview` topic capturing the resource's filter set, gotchas, and create/archive rules. Articles, public_photos help unchanged.
- **HELP_TOPICS entries** added in `help-registry.ts` for the 6 new resources (overview prose per resource — ~600-900 chars each).
- **HELP_TOPIC_ENUM entries** added in `schema-generator.ts` so the tool schema declares the valid `topic` enum per resource. Without this, agents would call `operation=help` without knowing which topics exist.
- **`RESOURCE_HINTS` entries updated** to mention `operation=help topic=overview` for each newly-registered resource — agents now see the help pointer in the lean tool description.

### Notes for deployment
**If observing pre-2.4.1 behaviour (UTC preamble, multi-thousand-char tool descriptions, missing help op):** the n8n install is running stale code. Verify by:
- Check `package.json` version inside n8n's installed copy: `cat ~/.n8n/nodes/node_modules/n8n-nodes-hudu/package.json | grep version`. Must show 2.4.2 (or 2.4.1 at minimum for the description lean).
- Reinstall: `cd /path/to/n8n-nodes-hudu && npm run build && npm link`, then `cd ~/.n8n/nodes && npm link n8n-nodes-hudu`, then restart n8n.
- After restart, dump `tools/list` from the MCP server. `hudu_articles` description ≤ 500 chars and contains no "Reference: current UTC date-time" text. Other six tools ≤ 350 chars and include `operation=help topic=overview` reference.

### Char-count regression check (measured live from dist/)
With `help` added to every brief-listed resource (one extra operation in the enum + an `operation=help topic=overview` reference in the hint), descriptions remain under target. Folder + procedure hints were trimmed to compensate for the longer operation list.
| Tool | Target | Actual |
|---|---|---|
| articles | ≤500 | 374 |
| companies | ≤300 | 291 |
| folders | ≤300 | 268 |
| websites | ≤300 | 249 |
| procedures | ≤300 | 274 |
| procedure_tasks | ≤300 | 258 |
| relations | ≤300 | 255 |
| public_photos | ≤300 | 233 |

### Help-op smoke-test (measured live from dist/)
All 8 enabled resources return a valid envelope on `operation=help topic=overview`. Topic content sizes:
- articles 1392, public_photos 1232, companies 879, folders 861, websites 803, procedures 1099, procedure_tasks 1022, relations 1104 chars.
- Unknown topic → `VALIDATION_ERROR` with `availableTopics` hint.
- Unsupported resource (no entry in HELP_TOPICS) → `INVALID_OPERATION`.

### QA fixes applied
- **procedures help**: `name` filter labelled "EXACT match, case-insensitive" (was wrongly "case-sensitive"). Hudu API spec for `/procedures` GET explicitly states case-insensitive exact match.
- **procedure_tasks help**: `name` filter labelled "EXACT match" (dropped misleading "case-sensitive" qualifier; spec is silent — neutral is safer).
- **relations help**: corrected `IpAddress` → `IPAddress` to match the canonical `RESOURCE_TYPES` enum in `nodes/Hudu/utils/constants.ts`. Wrong casing would have caused 422 validation errors on relation create.

## [2.4.1] - 2026-05-14

### Fixed
- **Tool description bloat.** Every `hudu_*` tool's description started with a 50-token `Reference: current UTC date-time when these tools were loaded is …` preamble and continued with verbose per-operation prose (workflow tutorials, photo-verification dance, ID-resolution prerequisites). `hudu_articles` was ~5028 chars; the other six tools 3300-3550 each. Replaced with a single-paragraph template:
  ```
  Manage Hudu {Label} records. Operations: {list}. {one-line usage hint}. Envelope v2 — 'error' key = failure; default-valued fields omitted.
  ```
  Projected char counts (all ops enabled): `hudu_articles` ~395, others 190-285. ~5000-token reduction across the seven-tool MCP workflow per session.

### Added
- **`operation: 'help'` on `hudu_articles` and `hudu_public_photos`** — returns long-form workflow prose on demand. Accepts optional `topic` (enum):
  - articles: `overview` (default), `photos`, `search`, `create`
  - public_photos: `overview`
  Response shape: `{ topic, availableTopics, content }`. Costs zero tokens until invoked.
- **`nodes/Hudu/ai-tools/help-registry.ts`** — central `HELP_TOPICS` map + `runHelp(resource, params)` executor. Pure read-side metadata module; no API calls.
- **`HuduOperation.help`** in `resource-config.ts` and the schema-generator `SUPPORTED_OPERATIONS` set.

### Changed
- **`buildUnifiedDescription` signature**: dropped `referenceUtc` parameter. The fresh-timestamp regen in `HuduAiTools.node.ts` (`new Date().toISOString()…`) is gone.
- **`buildGetAllDescription` / `buildCreateDescription` signatures**: dropped `referenceUtc` parameter. (These helpers are now unreferenced by the unified path but retained as exports for potential future surfaces.)
- **Per-operation prose** (per-op workflow tutorials) no longer ships with the tool description. The relevant guidance now lives in (a) the per-parameter `description` field in the inputSchema (already shipped), or (b) the new `help` operation for the two resources where it materially helped.
- **Removed** the centralised `Response envelope: schemaVersion '2'…` preamble from the unified description. Replaced with the terse `Envelope v2 — 'error' key = failure; default-valued fields omitted.` clause inside the new template.
- **Dead-code purge** in `description-builders.ts` — removed nine orphaned helpers (`buildGetDescription`, `buildGetAllDescription`, `buildCreateDescription`, `buildUpdateDescription`, `buildDeleteDescription`, `buildArchiveDescription`, `buildGetIdByNameDescription`, `buildMoveDescription`, `buildGetByLayoutDescription`), `getRequiredFields`, `REQUIRED_FIELDS_BY_RESOURCE`, and `dateTimeReferenceSnippet`. File is now exclusively `RESOURCE_HINTS` + `buildUnifiedDescription`.

### Breaking Changes
| Change | Severity | Migration |
|--------|----------|-----------|
| Tool description prose dramatically shortened; per-op workflow tutorials no longer in the description | LOW | Use `operation='help'` on articles or public_photos for the offloaded prose. Other resources rely on per-parameter `description` in the inputSchema. |
| `buildUnifiedDescription` no longer accepts `referenceUtc` | LOW (internal) | Only impacts users importing the helper directly — unlikely. |

## [2.4.0] - 2026-05-14

### Fixed
- **`hudu_articles getAll folder_id` returned zero items for sparse folders.** Bounded post-filter scanned upstream's default-ordered first 2000 articles client-side and silently dropped folders whose articles were ranked beyond that window. Now pre-resolves the folder's owning `company_id` (one extra `/folders/{id}` GET) and injects it as a NATIVE Hudu upstream filter, drastically narrowing the scan. Folders flagged as global (`company_id:null` on the folder record) fall back to the unnarrowed bounded scan. `result.warnings[]` documents the auto-resolve.
- **`hudu_articles search` ranked unrelated body-hits above exact-title matches.** Existing word-overlap ranking only ran when `name` was supplied. Now `search` on `nameResolutionBaked` resources (articles) triggers the same wide-fetch-then-rerank path, AND the ranker has been extended with a substring-boost tier: titles containing the full query string as a substring score +1000 above word-overlap, so exact-title matches surface ahead of generic body hits.
- **`procedures` read responses leaked Rails write-payload key `procedure_tasks_attributes`.** That key is the Hudu/Rails convention for `accepts_nested_attributes_for` on CREATE/UPDATE bodies and has no place on a READ. Renamed to `tasks` on the read side only.
- **`draft` (and other documented booleans) inconsistent — null on some records, false on others.** Now uniformly omitted when default (null/false). Same omit-policy applied to all documented-default fields per resource → identical field sets across same-resource records.

### Added
- **`result-processor.ts`: `omitDefaults(item, resource)`** — uniform default-strip driven by the new `DEFAULT_FIELD_VALUES` map in `resource-config.ts`. Every record runs through it; absence of a field means "default applies".
- **`result-processor.ts`: `reshapeProcedureRecord` and `reshapeProcedureTaskRecord`** — single `assignee:{id,name,initials}` block on procedure tasks ONLY when an assignee exists; the legacy assignment fields are dropped (five `*_user_*` keys plus `assigned_users` and `subtask_ids`). Procedures get the renamed `tasks` array with per-task reshape applied.
- **`result-processor.ts`: `slimPhotoRecord(photo)`** — slims each public photo to `{numeric_id, url, file_name, size}`. Drops slug `id` (not callable), `record_type` and `record_id` (echo parent context), renames `file_size` → `size`. Applied to `hudu_public_photos get`, and to article `public_photos` arrays when `include_photos=true`.
- **`tool-executor.ts`: `postProcessRecord(record, resource, config, includeContent, includePhotos)`** — single shaping pipeline invoked from both `get` and `getAll` for consistent record shape.
- **Title-match ranker is now two-tier**: full-query-substring on `name` scores `+1000` over per-token overlap. Stable sort preserves upstream order on ties.

### Changed
- **Response envelope schemaVersion bumped to `'2'`.** Fields:
  - `success: boolean` discriminator REMOVED from both success and error envelopes — presence of `error` = failure, absence = success.
  - `count` REMOVED from list payloads (`{items}` only; LLM reads `items.length`). Applied to `getAll`, `getIdByName`, and `getByLayout`.
  - `note` REMOVED alongside `truncated:true` — the boolean is sufficient; remediation guidance lives in the tool description.
  - Documented default values (null/false/empty array) OMITTED from each record per the `DEFAULT_FIELD_VALUES` map (articles, companies, websites, procedures, procedure_tasks).
- **`hudu_articles getAll` folder_id description** rewritten to document the folder→company auto-resolve, the native-filter injection, and the global-folder fall-through.
- **`hudu_articles getAll` search description** rewritten to document the substring-boost ranking and clarify when to prefer `name`.
- **`hudu_articles getAll/get` include_photos description** notes the slim shape (`numeric_id, url, file_name, size`).
- **`hudu_public_photos get` description** notes the slim shape.
- **Unified tool description prefix** describes the envelope v2 contract, omit-defaults policy, and procedures `tasks`/`assignee` shape.

### Breaking Changes
| Change | Severity | Migration |
|--------|----------|-----------|
| `success` boolean field dropped from response envelope (both success and error) | MEDIUM | Check for `error` key presence instead. `schemaVersion` now `'2'`. |
| `count` dropped from list payloads (getAll, getIdByName, getByLayout) | LOW | Read `items.length` instead. |
| `note` dropped alongside `truncated:true` | LOW | `truncated:true` is the sole signal; tool descriptions document remediation. |
| Documented default-value fields omitted from records (e.g. `archived:false`, `enable_sharing:null`, `draft:false`) | LOW-MEDIUM | Absence of a field on a record now means "default value applies" — handle missing keys with the resource's documented default. |
| Procedure read responses: `procedure_tasks_attributes` renamed to `tasks` (always emitted as an array — `[]` when no tasks); each task drops five `*_user_*` keys plus `assigned_users` and `subtask_ids`, and gains an `assignee:{id,name,initials}` block when assigned | MEDIUM | Update consumers to read `tasks` (not `procedure_tasks_attributes`) and `task.assignee.*` (not `task.first_assigned_user_*`). |
| Public photo records slimmed to `{numeric_id, url, file_name, size}` on both `hudu_public_photos get` and article `public_photos` arrays | MEDIUM | Use `numeric_id` (was already the callable id), `url`, `file_name`, `size` (was `file_size`). Drop reliance on slug `id`, `record_type`, `record_id`. |

## [2.3.1] - 2026-05-12

### Fixed
- **`hudu_articles getAll slug` filter regression introduced in 2.3.0.** Round-1's "dual-form slug handling" was built on an incorrect model of Hudu's stored slug field. The stored `slug` is the 12-character short hash alone (e.g. `22a0a2941fb1`), NOT `{seoSlug}-{shortHash}`. The Round-1 SEO-detection branch routed every form through a search + post-filter path that never matched, causing `NO_RESULTS_FOUND` for every slug input. Reverted to verbatim passthrough — Hudu /articles GET natively accepts `slug` per `api-docs-v2.41.0.json`.
- **`hudu_articles getAll folder_id` over-filtered.** Single-page upstream fetch + client-side folder_id filter silently dropped target articles when they weren't in the first page of upstream's default sort. Now performs bounded pagination via the new `paginatedPostFilter` helper (default cap: 20 pages × 100 records = 2000 records scanned). Result includes scan stats in `result.warnings[0]` so the LLM understands what was scanned.

### Added
- **`nodes/Hudu/ai-tools/pagination-helper.ts`** — new reusable `paginatedPostFilter<T>(context, endpoint, pluralKey, baseFilters, predicate, limit, maxPages=20, pageSize=100)` utility. Pages upstream until `limit` matches collected, upstream exhausted, or `maxPages` reached. Returns `{items, pagesScanned, recordsScanned, capHit, exhausted}`. Designed for future declared filters that Hudu doesn't support natively.

### Changed
- **`hudu_articles getAll slug` description** — now documents the actual stored slug shape (12-hex short hash, first path segment after `/kba/`). SEO-suffix portion of URLs called out as not queryable.
- **`hudu_articles getAll folder_id` description** — documents the bounded pagination behaviour, scan cap, and recommendation to combine with company_id/search for folders with deeply-ranked articles.
- **`result.warnings[0]` for folder_id** — now reports scan stats (`pagesScanned`, `recordsScanned`, `exhausted` / `capHit` / `limit satisfied`) instead of generic downgrade prose.

### Removed
- **Slug downgrade warning** — Round-1 emitted `result.warnings` entry for SEO-slug routing. With Round-2's verbatim passthrough fix, no client-side downgrade occurs — warning was misleading and is gone.

## [2.3.0] - 2026-05-12

### Fixed
- **AI Tools: bare `{"success":true}` regression on companies, folders, websites, procedures and their `_get_id_by_name` helpers** — caused by `supplyData()` returning `{response: [unifiedTool, enrichmentTool]}` (array form). n8n MCP Trigger only handles single-tool responses; the array path collapsed every tool call to a bare success echo. Empirical proof: articles/relations/procedure_tasks (no enrichment, single-tool response) returned the full envelope while every enrichment-enabled resource returned bare success. Fold-in (see Changed) eliminates the array path entirely.
- **`hudu_articles` photo blowout** — article responses included full `public_photos` arrays (often 25+ entries × ~180 chars each per article) regardless of `include_content`. Single `getAll limit=10` calls blew the 25k-token output budget. Default flip to `include_photos=false` (see Added).
- **`hudu_articles` slug filter only matched the suffixed DB form** — Hudu URLs are `/kba/{shortHash}/{seoSlug}` but the stored slug is `'{seoSlug}-{shortHash}'`. Pasting the SEO-only portion from a URL returned `NO_RESULTS_FOUND`. Now accepts either form (see Changed).
- **`hudu_articles.folder_id` filter silently ignored** — Hudu API does not list `folder_id` as a supported GET `/articles` query parameter (verified against `api-docs-v2.41.0.json`). Filter was passed in the query string and dropped upstream. Now applied client-side as a post-filter after fetch; warning emitted in result payload to flag the downgrade.

### Added
- **`hudu_articles` (`get`, `getAll`): `include_photos` flag (default `false`)** — opt-in to the `public_photos` array. Default false matches `include_content` ergonomics. Set true only when verifying or surfacing embedded photo references.
- **`HuduResourceConfig`: `supportsPhotosField` + `photosField`** — flag pair mirroring the existing `supportsContentField`/`contentField` infrastructure. Currently enabled for `articles` only; generalises cleanly to any future resource that returns a large photo array.
- **`result-processor.ts`: `stripPhotosField()`** — sibling of `stripContentField()`, opt-in retention semantics.
- **Result `warnings` channel** — getAll success envelopes now optionally include `result.warnings: Array<{filter, reason}>` populated when a declared filter is downgraded to a client-side post-filter (folder_id) or routed through alternative fields (SEO slug). Lets the LLM understand why result narrowness may differ from naive expectations.
- **Truncation accuracy probe** — getAll fetches `limit+1` records upstream (where pagination semantics permit) and uses the explicit `upstreamHasMore` signal to set `truncated`. Eliminates false positives where the last page contained exactly `limit` records. Skipped for `nameResolutionBaked` (already overfetches 100 and slices) and post-process-filtered resources (relations, public_photos).
- **Slug dual-form acceptance on `hudu_articles getAll`** — schema description documents Hudu's `/kba/{shortHash}/{seoSlug}` URL pattern. Executor detects the suffixed form via `/-[0-9a-f]{12}$/` regex; passes that through to Hudu. SEO-only form is routed via the `search` query param and client-side post-filtered on `slug.startsWith('{seoSlug}-')`. Warning emitted.

### Changed
- **AI Tools: enrichment tools folded into operations on the unified tool**. `hudu_companies_get_id_by_name`, `hudu_assets_move`, `hudu_assets_by_layout` (and the per-resource `_get_id_by_name` siblings) are gone. Same behaviour now reachable via `operation: 'getIdByName'` on 12 resources (companies, assets, asset_layouts, asset_passwords, folders, groups, networks, procedures, users, vlans, vlan_zones, websites) and `operation: 'move'` / `operation: 'getByLayout'` on assets. Single tool per resource, single registration path, no array form.
- **`HuduAiTools` node: dropped the `enrichmentTools` UI field.** Replaced by the unified operations list — operations enabled in the multiOptions field are the only configuration surface.
- **`supplyData()` always returns `{response: unifiedTool}`** — single tool. Array form removed.
- **Tool descriptions for `getIdByName` / `move` / `getByLayout`** integrated into the unified tool description (per-operation lines under "Pass one of the following values in the required 'operation' field").

### Breaking Changes
| Change | Severity | Migration |
|--------|----------|-----------|
| `hudu_*_get_id_by_name` tools removed; replaced by `operation: 'getIdByName'` on the corresponding `hudu_*` tool | HIGH | Update agent tool calls to use `hudu_<resource>` with `operation: 'getIdByName'`. No more separate tool names. Workflows that had `enrichmentTools: ["getIdByName"]` set on `HuduAiTools` nodes will silently drop the field; ensure `getIdByName` is selected in the operations multiOptions instead. |
| `hudu_assets_move` / `hudu_assets_by_layout` tools removed; replaced by `operation: 'move'` and `operation: 'getByLayout'` on `hudu_assets` | HIGH | Use `hudu_assets` with the new operations. Enable them in the operations multiOptions. |
| `hudu_articles` default photo behaviour: `public_photos` now stripped unless `include_photos=true` | MEDIUM | Add `include_photos: true` to any workflow that relied on photos being auto-present. |
| `enrichmentTools` UI field removed from `HuduAiTools` | MEDIUM | n8n will ignore the persisted value on existing workflows. Re-edit nodes to select the new operations in the operations multiOptions list. |

## [2.2.1] - 2026-05-06

### Fixed
- Assets create/update: custom field values (including AssetTag fields) were silently dropped — API requires `custom_fields` array with snake_case field label keys, not `fields` array with `asset_layout_field_id`/`value` objects (fixes #22)

## [2.2.0] - 2026-05-06

### Added
- `hudu_articles` (`create`): `global` boolean field (default `false`) — set `true` to create a global article not scoped to any company; strips `company_id` from the API call and skips resolution
- `hudu_articles` (`create`): auto-resolve `company_id` from `folder_id` — if `folder_id` provided and `company_id` absent, executor fetches `GET /folders/{id}` and injects `company_id` (eliminates separate company lookup)
- `hudu_articles` (`create`): structured error when neither `company_id`, `folder_id`, nor `global=true` provided — guides LLM to correct scope pattern

### Changed
- `hudu_articles` (`create`): `company_id` and `folder_id` descriptions updated to reflect auto-resolve and `global` precedence
- `hudu_articles` (`create`): tool description updated with explicit SCOPE guidance (three paths: `company_id` / `folder_id` / `global=true`)

## [2.1.3] - 2026-04-19

### Added
- `hudu_public_photos` AI tool: new resource — `get` only using `numeric_id` (integer); `getAll` excluded (full-corpus client-side fetch causes MCP timeout `-32001`). `hudu_articles` `get` description mandates proactive photo fetching: when `include_content=true`, agent MUST call `hudu_public_photos get` with each photo's `numeric_id` from the response `public_photos` array.
- `hudu_articles` (`getAll`): new `enable_sharing` filter — restricts results to publicly shareable articles
- `hudu_articles` (`getAll`): new `updated_at_start` / `updated_at_end` filters — ISO 8601 UTC range filter for last-modified date
- `hudu_articles` (`getAll`, `get`): new `include_content` flag — opt-in to include full HTML content field (default false; article bodies average ~9k chars each)
- `result-processor.ts`: new pure utility module — `sortByTitleMatch` (word-overlap title ranking) and `stripContentField` (opt-in content stripping); designed for reuse by other resources

### Changed
- `hudu_articles` (`getAll`) `name` param: semantics changed from exact-match to fuzzy title resolution — sends value as `search`, fetches up to 100 candidates, re-ranks by title word overlap, returns top `limit` results
- `hudu_articles` (`getAll`) `search` description updated: clarifies it is for topic/content exploration, and that `name` is preferred for title-based ID resolution
- `hudu_articles` (`get`, `getAll`): `content` field excluded from responses by default — add `include_content: true` to any workflow that needs article bodies
- `HuduResourceConfig`: three new optional flags (`supportsContentField`, `contentField`, `nameResolutionBaked`) — foundational for applying these patterns to other resources

### Removed
- `hudu_articles` (`getAll`): `archived` filter removed — this parameter was silently ignored by the Hudu API (not a supported query param on `GET /articles`); schema validation will now reject it
- `hudu_articles_get_id_by_name` enrichment tool: removed — name-to-ID resolution is now baked into `hudu_articles` with `operation: 'getAll'` and `name` param; users who had "Resolve Name to ID" enabled for articles will no longer see this tool registered (degrades silently via existing guard)

### Fixed
- `public_photos` (`get`, `update`): Photo ID field: API path parameter is integer-only (`numeric_id`); response returns slug-based `id` field for display but requests must use `numeric_id`
- `public_photos` (`getAll`): Record Type / Record ID filters were silently ignored — `fixedCollection` returns criteria as plain object, not array; `Array.isArray` check always failed
- `HuduAiTools`: removed `usableAsTool: true` — conflicts with `supplyData()`; caused runtime `UnexpectedError` (n8n PR #13075)
- `runtime.ts`: zod now resolved from `require.main` first (top-level n8n copy), preventing silent `instanceof ZodType` failures in `normalizeToolSchema`
- `runtime.ts`: `getRuntimeRequire()` tries `require.main` before `ANCHOR_CANDIDATES` to prevent devDep shadowing during `npm link`
- `runtime.ts`: added `getLazyLogWrapper()` export for optional tool visibility in n8n execution view
- `runtime.ts`: `RuntimeRequire` type now includes `.resolve()` method — fixed pre-existing TypeScript compile error (`Property 'resolve' does not exist on type 'RuntimeRequire'`)
- `description-builders.ts`: delete description now includes "ONLY on explicit user intent. Do not infer from context." (write safety Layer 3)
- `description-builders.ts`: create/update descriptions now include "Confirm field values with user before executing when acting autonomously." (write safety Layer 3)

### Breaking Changes
| Change | Severity | Migration |
|--------|----------|-----------|
| `name` param semantics: exact → fuzzy title lookup | HIGH | Agents using `name` for exact match now get ranked fuzzy results — intended behaviour |
| `content` excluded from `getAll`/`get` by default | HIGH | Add `include_content: true` to any workflow that reads article bodies |
| `archived` filter removed from `getAll` | MEDIUM | Was silently ignored — no functional regression, but schema validation now rejects it |
| `hudu_articles_get_id_by_name` tool removed | MEDIUM | Use `hudu_articles` with `operation: 'getAll'` and `name` instead |

## [2.1.2] - 2026-04-18

### Changed
- **AI Tools enrichment tool names**: All enrichment tool names are now resource-scoped to prevent MCP name collisions when multiple `HuduAiTools` nodes are connected to the same agent:
  - `hudu_get_id_by_name` → `hudu_{resource}_get_id_by_name` (e.g. `hudu_companies_get_id_by_name`)
  - `hudu_move_asset` → `hudu_{resource}_move` (e.g. `hudu_assets_move`)
  - `hudu_company_assets_by_layout` → `hudu_{resource}_by_layout` (e.g. `hudu_assets_by_layout`)
- **AI Tools node UI**: Replaced three separate boolean toggles (`Enable: Resolve Name to ID`, `Enable: Move Asset`, `Enable: Assets by Layout`) with a single `Extra Tools` multiOptions field. Available options are dynamically filtered based on the selected resource — only valid enrichment tools for that resource are shown.
- **`hudu_{resource}_get_id_by_name` schema**: Removed redundant `resource_type` parameter — each tool is already scoped to its resource by name. Schema now only contains `name` and `limit`.
- **`hudu_{resource}_get_id_by_name` coverage**: Extended from 8 to 13 resources — added `asset_passwords` (search), `networks` (exact), `groups` (search), `vlans` (exact), `vlan_zones` (exact).

## [2.0.5] - 2026-04-10

### Changed
- **Procedures / Hudu API 2.41.0**: Procedure **update** no longer accepts `company_id` (matches final spec); use **Create from template** or **Duplicate** to place under a company. UI copy and **Hudu AI Tools** `procedures` update schema updated (`archived` exposed; `company_id` removed).
- **AI Tools `runtime.ts`**: Removed `console.warn` on module load; anchor and LangChain/zod resolution failures are reported only via thrown errors (including optional `Load error:` detail).

## [2.0.4] - 2026-04-02

### Fixed
- **AI Tools execute()**: Strip `Prompt__*` framework keys injected by Agent Tool Node v3 (`$fromAI()`-generated fields) from `item.json` before routing to the API — prevents `INVALID_WRITE_FIELDS` errors on create/update operations when using the v3 Agent node (default since n8n ~1.116.0)

## [2.0.3] - 2026-04-02

### Added
- **AI Tools: Enrichment tools** — three composite tools that aggregate multiple API calls behind a single tool invocation, reducing LLM multi-step chaining:
  - `hudu_get_id_by_name` — resolves a resource name to its numeric Hudu ID across 8 resource types (company, asset, article, asset_layout, folder, procedure, website, user); partial search for most, EXACT match for asset_layout/folder/procedure
  - `hudu_move_asset` — moves an asset between companies (recreates under target company, deletes original); partial-failure-safe: if delete fails after successful create, returns `wrapSuccess` with `delete_failed + warning` rather than masking the created asset
  - `hudu_company_assets_by_layout` — lists assets of a specific layout for a company with custom field values labelled by field name (e.g., `{"Hostname": "SRV01"}`) instead of raw `asset_layout_field_id` integers; resolves company and layout names automatically
- **AI Tools node**: Three new boolean parameters (`enableGetIdByName`, `enableMoveAsset`, `enableCompanyAssetsByLayout`) to opt-in to each enrichment tool; `supplyData()` now returns `Tool[]` when any enrichment tools are enabled alongside the resource tool

## [2.0.2] - 2026-04-02

### Fixed
- **AI Tools execute()**: Proper n8n 2.14.x tool-call detection — checks `item.json.operation` (2.14+) OR `item.json.tool` (older n8n); returns informational stub on editor "Test step" instead of silently defaulting to getAll
- **AI Tools execute()**: Invalid operations now return `INVALID_OPERATION` error instead of falling through to default op

### Added
- **AI Tools**: MCP tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) on all unified tools — conservative flags based on enabled operations

## [2.0.1] - 2026-04-02

### Fixed
- **AI Tools runtime.ts**: Replaced direct class export with Proxy-based deferred error pattern — anchor resolution failure no longer crashes module load, allowing the node to register in n8n even when `@langchain/core` is unavailable. Proxy target uses `function () {}` (not `{}`) to provide `[[Construct]]` per ECMAScript spec §10.5.13.

## [2.0.0] - 2026-03-30

### BREAKING CHANGES
- **Procedures getAll**: Removed deprecated filters `company_template`, `global_template`, `parent_procedure_id`. Use `type`, `process_scope`, `parent_process_id` instead.
- **Procedures create/update**: Removed deprecated `company_template` field.
- **Procedure Tasks create**: Removed `assigned_users`, `due_date`, `priority`, `user_id` from create fields — the API now rejects these on process task creation with 422. Set via update on run tasks instead.
- **Procedure Tasks update**: Removed `completed` and `user_id` fields. Task completion is now managed via the Hudu UI. `user_id` is now read-only ("who completed").
- **Procedure Tasks type**: `completed_at` field renamed to `completed_date` in response to match API v2.41.0.
- **Uploads getAll**: Now uses server-side pagination. Users not setting Return All will receive 25 results instead of all.

### Added
- **Photos resource**: Full CRUD for the new `/photos` endpoint — create with multipart upload, get with optional file download (fetches metadata then downloads from the photo's cloud storage URL), getAll with filters (company, photoable, folder, archived, date ranges), update metadata, delete
- **Procedures**: New getAll filters — `type` (process/run/all), `process_scope` (global/company), `parent_process_id`, `created_at` date range, `archived`. New response fields — `run`, `parent_process_id`, `process_type`, `status`
- **Procedure Tasks**: New create fields — `description`, `optional`, `parent_task_id`. Update fields annotated with process/run restrictions. New response fields — `has_subtasks`, `subtask_count`, `subtask_ids`, `completion_notes`, `first_assigned_user_*`, `formatted_due_date`, `url`, `user_name`
- **Folders**: `folder_type` field (article/photo) on create and getAll filter
- **Public Photos**: Direct GET by ID endpoint replacing inefficient page scan, `download` support, `file_name`/`file_size` response fields. Returns `NodeOperationError` when photo ID is not found
- **Uploads**: `download` parameter on get operation, server-side pagination on getAll
- **Binary download utility**: Shared `handleBinaryDownload()` in `requestUtils.ts` used by public photos and uploads — validates HTTP status codes (rejects non-2xx), empty response bodies, and error page content types (`text/html`, `text/xml`). Uses explicit `__isBinaryDownload` marker for reliable binary detection in `execute()` instead of duck-typing
- **AI Tools**: Added read-only `photos` and `procedure_tasks` tools (get/getAll)
- **AI Tools**: Updated procedures schemas with new filters (`type`, `process_scope`, `parent_process_id`, `created_at`, `archived`)
- **AI Tools**: Updated folders schemas with `folder_type` filter and create field

### Fixed
- **Binary download passthrough**: `execute()` uses explicit `__isBinaryDownload` marker to route binary results directly to output, preventing `returnJsonArray` from stripping downloaded files
- **Exports create**: `company_id` default value of `0` no longer leaks to API as an invalid filter — zero values are now excluded alongside null/undefined/empty
- **Procedures update**: Removed non-writable `status` field from update operation and AI Tools schema (not accepted by API on PUT)
- **Date range filters**: Fixed raw fixedCollection objects leaking into query params when `created_at`/`updated_at` filters added but not fully configured — now deleted from `qs` before processing
- **Numeric ID filter defaults**: Fixed `parent_process_id`, `procedure_id`, `folder_id`, `photoable_id`, `parent_task_id` zero defaults leaking to API as invalid filter/body values — zero values now stripped in handlers
- **AI Tools schemas**: Replaced inline enum duplication with shared constants (`PROCEDURE_TYPES`, `PROCEDURE_SCOPES`, `FOLDER_TYPES`) per CLAUDE.md single-source-of-truth guideline
- **Photos AI Tools config**: Corrected `bodyKey` from `null` to `'photo'` to match API's `{ photo: {...} }` body wrapper

### Changed
- Targets Hudu API v2.41.0

## [1.11.0] - 2026-03-29

### Fixed
- **Exports / S3 Exports unreachable in UI**: Wired both resources into the resource dropdown and node properties — previously implemented but never selectable
- **Silent try/catch in articles handler**: Replaced empty `catch {}` blocks around optional `getNodeParameter` calls with default-value pattern to surface parameter name typos
- **HTTP auth pattern**: Switched from manual `getCredentials()` + `helpers.request()` to `helpers.httpRequestWithAuthentication('huduApi', ...)`, letting n8n handle API key injection via the credential's `authenticate` property

### Removed
- Dead `requestDefaults` block in `Hudu.node.ts` (unused by programmatic `execute()` nodes)
- Commented-out `debugLog` calls in `requestUtils.ts` pagination logic

### Changed
- Replaced `inputs: ['main'] as any` / `outputs: ['main'] as any` with `NodeConnectionTypes.Main` for type safety

## [1.10.0] - 2026-03-16

### Changed
- Migrated build system from Gulp to @n8n/node-cli
- Moved source from `src/nodes/` to `nodes/` (n8n standard layout)
- Updated ESLint to v9 flat config, Prettier to v3
- Added `n8n.strict: true` for cloud verification readiness

### Added
- `HuduAiTools.node.json` codex file
- `credentials/hudu.svg` icon for credential type
- `n8n-node dev` hot-reload support
- `n8n-node release` publishing workflow

### Improved
- **AI Tools — envelope standard**: All tool responses now use a unified envelope with `schemaVersion: "1"`, `success`, `operation`, and `resource` fields. Replaces flat `StructuredToolError` interface with `wrapSuccess()`/`wrapError()` factories and typed `SuccessEnvelope`/`ErrorEnvelope` interfaces
- **AI Tools — runtime anchor resolution**: `runtime.ts` now uses an `ANCHOR_CANDIDATES` loop with fail-fast diagnostics instead of a silent fallback to bundled packages
- **AI Tools — three-layer write safety**: `func()` and `execute()` now return structured `WRITE_OPERATION_BLOCKED` errors via `wrapError()` instead of inline objects
- **AI Tools — getAll response key**: Renamed `results` to `items` in getAll success envelopes for consistency with the envelope standard
- **AI Tools — archive confirmation**: Archive/unarchive responses now include `archived: true/false` confirmation field (matching delete's `deleted: true`)

### Fixed
- **AI Tools — `root` field leakage in execute() path**: Added missing `root` to `EXECUTE_METADATA_FIELDS` in the node file — previously the n8n canvas UUID could leak into API parameters on the Test Step path
- **Exports / S3 Exports**: Added missing `execute()` routing — selecting these resources previously threw "resource not known"
- **Procedures — kickoff**: Fixed `type: 'number'` field with invalid `default: ''` that could prevent node loading
- **Procedures — create**: Removed duplicate `company_id` top-level field whose value was silently ignored by the handler
- **Procedures — date filters**: Fixed `/mode` absolute path in `displayOptions` preventing sub-fields from showing/hiding
- **Websites — created_at filter**: Added missing `displayOptions` and `multipleValues: false` so date sub-fields toggle by mode
- **Articles — getAll filters**: Fixed incorrect `displayName` and `description` on the filters collection
- **Asset Layouts option loader**: Fixed wrong `parameters.includeBlank` parameter path — blank option now appears correctly
- **Main node — continueOnFail**: Added `error instanceof Error` type guard preventing `TypeError` on non-Error throws
- **Credential**: Updated `documentationUrl` to point to Hudu REST API docs
- **AI Tools — old tool name format**: Replaced 9 `hudu_X_getAll`/`hudu_X_get` references with unified `hudu_X with operation getAll` format
- **AI Tools — error guidance for no-search resources**: Error formatters now accept `supportsSearch` flag; 11 no-search resources no longer reference a nonexistent `search` parameter
- **AI Tools — relations getAll**: Filters now correctly use client-side post-processing with `relationFilterMapping` instead of being silently dropped as query params
- **AI Tools — NUMERIC_FIELDS**: Added 6 missing `*_id` fields (`passwordable_id`, `password_folder_id`, `potential_company_id`, `status_list_item_id`, `role_list_item_id`, `vlan_id`)
- **AI Tools — assets custom_fields**: Updated schema description to specify `asset_layout_field_id` format required by the API

### Removed
- Gulp build pipeline (`gulpfile.js`)
- Root `index.ts` (not needed with n8n-cli)

## [1.9.11] - 2026-03-13

### Fixed
- **Public Photos — update uses wrong content type**: The `update` operation was sending `record_type` and `record_id` wrapped in a `{ public_photo: ... }` JSON body. The Hudu API expects `multipart/form-data` with direct fields (matching the `create` operation). Fixed to send as multipart form-data.

## [1.9.10] - 2026-03-12

### Changed
- **AI Tools — unified tool model for MCP + AI Agent reliability**: Replaced per-operation toolkit wrapping with a single `DynamicStructuredTool` per resource (`hudu_{resource}`) and added a required `operation` parameter in the tool schema. This removes dependence on toolkit dispatch metadata and makes multi-operation configurations work consistently in AI Agent, MCP Trigger direct mode, and MCP Trigger queue-mode worker execution.
- **AI Tools — runtime schema generation simplified**: Added a unified schema builder that merges enabled operation schemas into one runtime-compatible schema and removed the large runtime schema builder surface that was only used by the old toolkit model.
- **AI Tools — unified tool descriptions**: Added a unified description builder that documents operation-specific usage in one tool contract, while preserving per-operation guidance.

### Fixed
- **AI Tools — metadata hardening**: Added `operation` to metadata stripping in the executor so routing metadata is never forwarded to Hudu API payloads in non-getAll paths.
- **AI Tools — not found and empty-result hardening**: Added explicit not-found handling for empty/null `get` responses and `NO_RESULTS_FOUND` errors for filtered `getAll` queries with zero matches to reduce hallucination risk.
- **AI Tools — guidance contract alignment**: Updated tool guidance text and recovery hints to the unified tool contract (`hudu_<resource>` with `operation`) and removed legacy `hudu_<resource>_getAll` references.



## [1.9.9] - 2026-03-11

### Fixed
- **AI Tools — Runtime class identity mismatch (n8n 2.8.4+)**: Fixed "multiple tools with the same name: 'undefined'" and silent tool discovery failures after upgrading to n8n 2.8.4+. n8n uses `instanceof` checks against its own runtime copies of `StructuredToolkit`, `DynamicStructuredTool`, and `ZodType`. Community nodes ship separate copies of `zod`, `@langchain/core`, and `n8n-core` in their own `node_modules`, so all three `instanceof` checks silently failed. The node now resolves all three dependencies from n8n's runtime module tree via `createRequire()`, ensuring class identity matches at every checkpoint.
- **AI Tools — Strict schema restoration**: The interim fix (1.9.8) replaced real Zod schemas with a permissive `z.object({}).passthrough()` to pass discovery, but this threw away the entire parameter contract — the LLM received no field definitions. Schemas are now rebuilt into the runtime Zod class tree while preserving all field types, constraints, defaults, and descriptions. A new `toRuntimeZodSchema` converter walks the local schema tree and reconstructs it using the runtime `zod` instance.


### Changed
- **AI Tools — Runtime resolver isolation**: Extracted all runtime module resolution (`StructuredToolkit`, `DynamicStructuredTool`, `zod`) into a dedicated `ai-tools/runtime.ts` utility. If n8n changes its internal module layout again, only this single file needs updating.

## [1.9.8] - 2026-03-11

### Fixed
- **AI Tools — dual AI Agent + MCP Trigger compatibility**: `HuduAiTools` now correctly works with both the AI Agent node and the MCP Server Trigger simultaneously when using multi-operation node instances. Previous versions (1.9.6–1.9.7) used a plain array return which satisfied MCP Trigger but not AI Agent; the earlier toolkit approach (pre-1.9.6) extended the wrong base class so `instanceof` checks always failed. Fix: adopt the runtime toolkit probe pattern (identical to `SearxngAiTools`) that detects whether n8n loaded `StructuredToolkit` from `n8n-core` (n8n ≥ 2.9) or `Toolkit` from `@langchain/classic/agents`, then extends the correct one. Both AI Agent and MCP Trigger use the same `instanceof` check in `getConnectedTools()` — this fix satisfies both.

## [1.9.7] - 2026-03-11

### Fixed
- **AI Tools — Dual AI Agent + MCP Trigger compatibility**: Returning a plain `tools[]` array (1.9.6) fixed the MCP Trigger but broke the AI Agent (agent looped without invoking tools). The AI Agent requires a `getTools()` method to detect and invoke tools; the MCP Trigger requires an iterable array. Fix: `supplyData()` now returns an array with `getTools()` attached — the AI Agent calls `getTools()` to get invokable tools, while the MCP Trigger iterates the array directly.

## [1.9.6] - 2026-03-11

### Fixed
- **AI Tools — MCP Trigger compatibility (Toolkit pattern)**: The `HuduAiTools` node returned tools wrapped in a `HuduToolkit` class. n8n's AI Agent handles Toolkits natively (calls `getTools()`), but the MCP Server Trigger only accepts individual `DynamicStructuredTool` instances and threw `Tool node "X" did not return a valid Tool` for all resources. Fix: `supplyData()` now returns `{ response: tools }` (a plain array of `DynamicStructuredTool` objects) instead of `{ response: toolkit }`. The `HuduToolkit` class and the toolkit compatibility probe have been removed.

## [1.9.5] - 2026-03-11

### Fixed
- **AI Tools — MCP Trigger compatibility**: `DynamicStructuredTool` instances were constructed with a plain JSON schema object (converted via `toJsonSchema`) instead of the required raw Zod schema. The n8n MCP Trigger failed with `Tool node "X" did not return a valid Tool` for all resources. Fix: pass raw Zod schema directly (`schema as any`), removing the `normaliseToolInputSchema` conversion step. The `schema-normalizer.ts` file has been removed.

## [1.9.4] - 2026-03-09

### Improved
- **AI Tools — No-search resource descriptions**: All five description builders (`getById`, `update`, `delete`, `archive`, `create`) now accept a `supportsSearch` flag. For the 11 resources with no `search` filter (Procedures, Activity Logs, Folders, Networks, IP Addresses, Asset Layouts, Relations, Expirations, VLANs, VLAN Zones, Matchers), descriptions say "use available filters" instead of referencing a non-existent `search` parameter.
- **AI Tools — No-search `getAll` descriptions**: The no-search `getAll` description now explicitly states "This resource has no partial-text search — to find a record by name use the 'name' filter (EXACT full-name match, case-sensitive)" to prevent LLM confusion when search is unavailable.
- **AI Tools — Schema: `optionalNameSchemaNoSearch`**: No-search `getAll` schemas (Procedures, Folders, Networks, Asset Layouts, VLANs, VLAN Zones) now use a dedicated `optionalNameSchemaNoSearch` description that clearly states name is the only text filter, rather than misleadingly suggesting search as an alternative.
- **AI Tools — Schema field descriptions**: Several field descriptions improved for LLM clarity:
  - `asset_id` in asset passwords create/update: added "If unknown, call hudu_assets_getAll with search to find it."
  - `passwordable_type` in asset passwords create/update: full value list with descriptions (e.g. `Company (organisation/client)`).
  - `parent_folder_id` in folders create/update: added lookup guidance.
  - `location_id` in networks create/update: added "Check your Hudu settings or existing networks for valid location IDs."
  - `integration_id` in matchers getAll: changed from required to optional; added "Check your Hudu integrations settings for the numeric integration ID."
  - `status` in IP Addresses (getAll/create/update): documents all six states with meanings (unassigned, assigned, reserved, deprecated, dhcp, slaac).
  - `resource_type` in Activity Logs: each value explained (e.g. `Asset (hardware/device record)`).
  - `fromable_type` / `toable_type` in Relations (getAll/create): each record type described.
  - `resource_type` in Expirations (getAll): all resource types listed with descriptions.
- **Bug: froable_type → fromable_type**: Relations schema used wrong field names (`froable_type`/`froable_id`); corrected to `fromable_type`/`fromable_id` matching the Hudu API and main node handler. Also fixed in `NUMERIC_FIELDS` coercion set in `tool-executor.ts` and required-fields list in `HuduAiTools.node.ts`.
- **Bug: RESOURCE_TYPES incomplete**: `Folder`, `Vlan`, and `VlanZone` were missing from `RESOURCE_TYPES` despite being valid Hudu resource types (confirmed via Swagger `flagable_type` enum). All three added with descriptions in `RESOURCE_TYPE_DESCRIPTIONS`. Affects relation `fromable_type`/`toable_type`, asset password `passwordable_type`, activity log `resource_type`, and expiration `resource_type` — in both the main node UI dropdowns and AI tool schemas.
- **AI Tools — Centralized enum definitions**: IP address status values/descriptions now defined once in `constants.ts` (`IP_ADDRESS_STATUSES`, `IP_ADDRESS_STATUS_OPTIONS`, `IP_ADDRESS_STATUS_DESCRIPTIONS`) and referenced by all three schemas (getAll/create/update) and the main description file. Resource-type fields (`resource_type`, `*able_type`) now use `RESOURCE_TYPES` from constants consistently across activity logs, expirations, relations, and asset passwords.
- **AI Tools — Metadata stripping**: Added `root` (n8n canvas root node UUID) to `N8N_METADATA_FIELDS` to prevent it contaminating API requests.
- **AI Tools — Numeric string coercion**: `tool-executor.ts` now coerces known integer fields (`id`, `limit`, `page`, all `*_id` fields) from string to number when an LLM passes `"10"` instead of `10`. Prevents `VALIDATION_ERROR` failures on strictly-typed API endpoints.

## [1.9.3] - 2026-02-28

### Improved
- **AI Tools — Tool descriptions (all resources)**: Comprehensive improvements to tool descriptions and schema field descriptions to improve first-time tool selection accuracy and correct parameter supply by the LLM:
  - `getById` descriptions now explicitly state "ONLY call when you already have a numeric ID" and name the exact `getAll` tool to call first, with instruction to extract `'id'` from results.
  - `getAll` descriptions now state "Results contain a numeric 'id' field — capture this for subsequent getById, update, delete, or archive calls", and use "ALWAYS use 'search' first" wording.
  - `update` descriptions now include an explicit prerequisite: "If you only have a name or text, call `hudu_{resource}_getAll` with 'search' first to get the 'id'".
  - `delete` descriptions now mention `archive` as a safer alternative and include a prerequisite to confirm the correct ID first.
  - `archive` descriptions now explain the distinction from `delete` ("data is preserved, restorable via unarchive") and include a prerequisite.
  - `create` descriptions now include a foreign key hint: for any required `*_id` fields, instructs the LLM to call the relevant resource's `getAll` to find the numeric ID first.
- **AI Tools — Schema field descriptions (all resources)**: More precise field-level guidance:
  - All `search` fields now state exactly which fields they match across and include "ALWAYS use this first for any name or text lookup".
  - All `name` filter fields now read "EXACT full-name match (case-sensitive). Rarely useful — use search instead."
  - `id` fields now include "(from a prior getAll result)" to clarify the source.
  - `company_id` fields now include "If unknown, call hudu_companies_getAll with search to find it."
  - `asset_layout_id` in assets create now includes "If unknown, call hudu_asset_layouts_getAll to find available layouts."
  - `limit` now includes "Increase to 100 if you expect many matching records."
  - Relations `froable_type`/`toable_type` now list all valid type values explicitly.
  - Activity logs `resource_type` now lists all valid type values explicitly.

## [1.9.2] - 2026-02-27

### Fixed
- **Websites (AI Tools)**: Fixed create/update failing with VALIDATION_ERROR. The `name` field for websites is a monitored URL and must include the protocol — e.g. `https://example.com`, not a display name. The schema description now makes this explicit so the LLM sends the correct value. Also added the missing `paused` field to the create schema.

## [1.9.1] - 2026-02-27

### Fixed
- **AI Tools — Toolkit compatibility (n8n 2.9+)**: Fixed "multiple tools with the same name: 'undefined'" error when deploying to n8n 2.9.2+. n8n 2.9 moved from `@langchain/classic/agents` Toolkit to `StructuredToolkit` from `n8n-core` for its toolkit `instanceof` check — causing the toolkit to be treated as an unnamed tool when deployed. The node now probes `n8n-core` for `StructuredToolkit` at startup and falls back to `@langchain/classic/agents` for older n8n versions, so both versions work correctly.
- **AI Tools — LLM tool selection**: Three fixes to reduce wasted round-trips when an agent looks up a record by name and then updates it:
  - `get` operation tools are now named `hudu_{resource}_getById` (was `hudu_{resource}_get`) so the LLM unambiguously understands the tool requires a numeric ID.
  - `formatMissingIdError` and `ENTITY_NOT_FOUND` error `nextAction` messages now explicitly name the `search` parameter so the LLM calls `getAll` with `search` immediately rather than falling back to `name`.
  - In every `getAll` schema that has both `name` and `search`, `search` is now listed first in the JSON schema properties so the LLM reaches for it before `name` (companies, articles, assets, websites, asset_passwords, groups).

## [1.9.0] - 2026-02-27

### Fixed
- **Matchers (AI Tools)**: Fixed `getAll` sending `integration_id` as a URL path segment (`/matchers/{id}`) instead of a query parameter. The AI tools node now matches the standard node behaviour: `GET /matchers?integration_id={id}`.
- **AI Tools (all resources)**: Corrected `name` filter descriptions from "partial match" to "exact match" — the Hudu API requires an exact name to match on the `name` parameter. AI agents are now guided to use the `search` parameter for partial/substring name lookups.
- **Groups (AI Tools)**: Added missing `search` filter to `getAll` schema. The Hudu API supports `search` for partial group name matching; it was exposed in the standard node but absent from the AI schema.
- **Users (AI Tools)**: Replaced incorrect `name` filter (not a real Hudu API param) with `search`, `first_name`, and `last_name` — matching the actual Hudu users API query parameters.
- **AI Tools (search-supporting resources)**: The `getAll` tool description now instructs the LLM to always use `search` first (partial matching across multiple fields) and only fall back to specific fields if `search` returns no results. Applies to all resources that expose a `search` parameter (companies, articles, assets, websites, asset_passwords, groups, users).
- **Rack Storages**: Fixed `getAll` returning a wrapped object `[{ rack_storages: [...] }]` instead of a flat list of records. An empty string was passed as the response key, causing `parseHuduResponse` to skip unwrapping.

### Added
- **Hudu AI Tools node** (`Hudu AI Tools`): New companion node that exposes Hudu operations as individual LangChain tools for n8n AI Agent workflows.
  - Supports 18 resources: Activity Logs, Articles, Asset Layouts, Asset Passwords, Assets, Companies, Expirations, Folders, Groups, IP Addresses, Matchers, Networks, Procedures, Relations, Users, VLANs, VLAN Zones, Websites
  - Each resource exposes the operations it supports: `get`, `getAll`, `create`, `update`, `delete`, `archive`, `unarchive`
  - `Allow Write Operations` toggle (default off) keeps the node read-only unless explicitly enabled
  - Zero duplication: all HTTP logic reuses the existing `handleGetOperation`, `handleGetAllOperation`, `handleCreateOperation`, `handleUpdateOperation`, `handleDeleteOperation`, `handleArchiveOperation` utilities
  - Structured JSON error responses (never throws) with actionable `nextAction` guidance for the LLM
  - UTC reference timestamp injected into time-sensitive tool descriptions so the AI uses actual current time
  - Compatible with Anthropic, OpenAI, and other providers via normalised JSON Schema (`type: "object"` guaranteed at root)

## [1.8.0] - 2026-02-13

### Fixed
- **All resources**: Fix number fields in Add Filter/Add Field collections that could not be added in the UI due to `default: undefined` or `default: ''`. Changed to `default: 0` across articles, rack storage items, procedure tasks, networks, matchers, lists, expirations, asset passwords, asset layout fields, activity logs, list options, and procedures. Post-process filters (articles folder_id) treat 0 as "no filter".

## [1.7.9] - 2026-02-13

### Fixed
- **Folders**: Fix folders getMany Parent Folder ID filter so it can be added and used reliably in the UI

## [1.7.8] - 2026-02-07
### Changed
- Added `peerDependencies` and `dependencies` to package.json for n8n Creator Portal compliance.

## [1.7.7] - 2026-02-07
### Changed
- Switched Hudu debug logging to use n8n's built-in logger instead of commented-out console statements.

## [1.7.6] - 2026-01-31

### Improved
- **Magic Dash**: Company field now uses picker dropdown; resolves ID to name for API compatibility

### Fixed
- **Magic Dash**: Removed invalid `company_id` from Additional Fields (API only accepts `company_name`)

## [1.7.5] - 2026-01-31

### Fixed
- **Magic Dash**: Fixed 500 error on Create or Update by removing incorrect `magic_dash_item` wrapper from request body

## [1.7.4] - 2026-01-16

### Fixed
- **Websites**: Fixed "Name must be a valid HTTP or HTTPS URL" error by clarifying that the name field requires a URL. Renamed field to "Website URL", added placeholder, and included client-side validation with clear error messaging.

## [1.7.3] - 2026-01-16

### Fixed
- **Websites**: Fixed "Could not get parameter" error in Create operation caused by parameter name mismatch. The handler was trying to retrieve `companyId` but the parameter is actually named `company_id`, matching the description file and other resources.

## [1.7.2] - 2026-01-16

### Changed
- Enhanced HTML to Markdown converter with improved date handling and parsing

### Removed
- Removed `luxon` dependency (replaced with native JavaScript Date API) to pass n8n Creator Portal validation

## [1.7.1] - 2026-01-16

### Changed
- **Articles - Markdown Conversion**: Replaced external `turndown` dependency with comprehensive internal HTML-to-Markdown converter. This change enables n8n community node verification while maintaining full feature parity for the "Include Markdown Content" feature.
- **n8n Cloud Compliance**: Refactored to comply with n8n community node scanner requirements:
  - **Debug Logging**: Removed all `console.log` statements. Debug output is now opt-in via a commented console.log line that developers can enable locally. See DEBUG.md for instructions.
  - **Rate Limiting**: Removed `setTimeout` and delay functions to comply with restricted globals policy. Rate limiting now relies entirely on existing retry handling for 429 responses.

### Added (Internal Converter Features)
The new internal converter is extensively tested and supports:
- **Tables** - Full GFM (GitHub Flavored Markdown) table support with alignment (left, center, right)
- **Nested Lists** - Proper handling of deeply nested ordered and unordered lists
- **Task Lists** - Checkbox conversion (`- [ ]` unchecked, `- [x]` checked)
- **Code Blocks** - Language extraction from `class="language-xxx"` attributes
- **Extended HTML Entities** - 100+ named entities plus numeric entities (`&#123;`, `&#x7B;`)
- **Nested Formatting** - Preserves formatting like `**bold**` inside links
- **Subscript/Superscript** - Converts `<sub>` and `<sup>` to `~text~` and `^text^`
- **Definition Lists** - Converts `<dl>/<dt>/<dd>` to term/definition format
- **Figures** - Extracts images from `<figure>` with `<figcaption>` support
- **Abbreviations** - Converts `<abbr title="...">` with title expansion
- **Highlight/Mark** - Converts `<mark>` to `==highlighted==`
- **Semantic Elements** - Handles `<article>`, `<section>`, `<aside>`, etc.

### ⚠️ Breaking Change - Action Required
- **Markdown Conversion Quality**: The internal converter uses regex-based parsing instead of DOM parsing. While it handles well-structured HTML (like Hudu CMS content) reliably, the output may differ slightly from previous versions for:
  - Deeply nested HTML structures (5+ levels of mixed elements)
  - Malformed or unusual HTML markup
  - Complex edge cases with unusual tag combinations
  
  **Users relying on the "Include Markdown Content" feature should:**
  1. Test their workflows after upgrading
  2. Verify that converted markdown meets their requirements
  3. Report any significant conversion issues via GitHub issues
  
  The HTML content is still returned unchanged - only the `markdown_content` field may differ.

### Removed
- Removed `turndown` dependency (replaced with internal converter)
- Removed `@types/turndown` dev dependency
- Removed "Enable Debug Logging" credential toggle (debug is now controlled only via local code changes)

## [1.6.8] - 2026-01-15
- **Credentials**: Added "Enable Debug Logging" toggle to Hudu API credentials. When enabled, all debug categories are logged regardless of individual settings, providing comprehensive debugging output for troubleshooting. The toggle is off by default and can be enabled per credential instance.


## [1.6.7] - 2026-01-10

### Added
- **All Resources**: Added "Wrap Results in Single Item" option to all Get Many operations. When enabled, returns all results as a single item with an "items" array and "count" field instead of multiple separate items. This prevents downstream nodes from executing once per result item, which can cause rate limiting issues when processing large result sets. For example, if "Get Many Companies" returns 150 companies, enabling this option will output 1 item containing `{ items: [...], count: 150 }` instead of 150 separate items, preventing the next node from executing 150 times.

## [1.6.6] - 2026-01-10

### Fixed
- **Rate Limiting**: Added proactive throttling to all paginated list operations to prevent 429 (rate limit) errors. The `handleListing` function now adds a 200ms delay between pagination requests, ensuring we stay under the Hudu API limit of 300 requests per minute (5 requests/second). If a 429 error is encountered, the delay increases exponentially (1s, 2s, 4s, 8s...) up to a maximum of 10 seconds. This fix applies to all resources using `getAll` operations, including Companies, Assets, Articles, and others.
- **Assets**: Optimised Get Many endpoint selection for better efficiency. When a company filter is specified without other complex filters (name, slug, search, etc.), the node now uses the more targeted `/companies/{company_id}/assets` endpoint instead of `/assets` with company_id as a query parameter. This reduces API load and helps prevent rate limiting. When other filters are required, the `/assets` endpoint is still used to ensure all filter capabilities remain available.

## [1.6.5] - 2025-12-24

### Fixed
- **Activity Logs**: Added adaptive throttling to multi-action queries to prevent rate limiting (429 errors). Adds 100ms delay between sequential action queries and pagination requests; delay increases to 500ms if a rate limit is encountered.

## [1.6.4] - 2025-12-24

### Improved
- **Activity Logs**: Enhanced Get Many operation to support multi-select Action Message filter. When multiple actions are selected, separate API queries are made for each action and the results are merged client-side with automatic deduplication. Note: The Hudu API doesn't support multi-select filtering natively, so multiple queries are executed and merged.
- **Activity Logs**: Added field selection to Get Many operation. Users can now choose which fields to return via multi-select. If no fields are selected, all fields are returned by default.
- **Activity Logs**: Resource Type filter can now be used independently (without Resource ID). When used alone, pages are fetched incrementally and filtered client-side. When used with Resource ID, efficient API-level filtering is applied.

## [1.6.3] - 2025-12-23

### Added
- **Articles**: Added optional company enrichment for Get and Get Many operations. When enabled via \"Include Company Details\", resolves `company_id` to `company_id_label` using the Companies resource with per-company caching for efficient lookups.

### Improved
- **Articles**: Enriched Article outputs (including folder and company enrichment fields) now have keys emitted in alphabetical order, providing a more consistent and predictable JSON structure in n8n.


## [1.6.2] - 2025-12-23

### Added
- **Articles**: Added optional folder enrichment for Get and Get Many operations. When enabled via "Include Folder Details", adds `folder_id_label` (folder name), `folder_description` (folder description), and `folder_path` (full hierarchical path) to article outputs. Supports the same separator options as Folders Get Path (`/`, `\`, ` > `, or custom).
- **Articles**: Added "Prepend Company to Folder Path" option (when Include Folder Details is enabled) to prepend company name or "Central KB" for global articles to the `folder_path` value, providing full context from company → folders → article.
- **Folders**: Added "Prepend Company to Folder Path" option to Get Path operation to prepend company name or "Central KB" for global folders to the path output, providing full context from company → folders.

### Fixed
- **Folders**: Fixed Get Path operation error `Cannot read properties of undefined (reading 'parent_folder_id')` caused by incorrect response unwrapping. The operation now correctly traverses parent folders via `parent_folder_id` until the root folder.

### Improved
- **Folders**: Added separator options to Get Path operation — choose from `/` (Unix-style), `\` (Windows-style), ` > ` (breadcrumb-style), or a custom separator for flexible path formatting.
- **Folders**: Simplified Get Path output to return only `path` (string) instead of `{ path, folders }` for cleaner downstream consumption.

## [1.6.1] - 2025-11-14

### Fixed
- **Assets**: Fixed Get Many operation to always use `/assets` endpoint with `company_id` as query parameter, ensuring all filters remain available regardless of company selection. Previously, selecting a company switched to `/companies/{company_id}/assets` which only supports limited filters, causing unsupported filters to be incorrectly displayed when using expressions.

### Breaking Changes
- **Assets**: Removed top-level "Company Name or ID" field from Get Many operation. Company filtering is now only available through the Filters collection. Existing workflows using the top-level `company_id` field will automatically migrate to use the filter field - no manual action required, but workflows should be reviewed and updated to use the Filters collection going forward.


## [1.6.0] - 2025-11-09

### Added

### Improved
- **Articles**, **Asset Layouts**, **Asset Passwords**, **Assets**, **Companies**, **Groups**, **Networks**, **Password Folders**, **Procedures**, **Users**, **VLAN zones**, **VLANs**, **Websites**: Get operation supports numeric ID or slug selection via Identifier Type toggle

## [1.5.1] - 2025-11-06

### Fixed
- **Articles**: Fixed `folder_id` filter incorrectly being sent as API query parameter. The Hudu API doesn't support `folder_id` as a query parameter for GET /articles, so filtering is now correctly applied client-side as a post-processing filter, matching the pattern used in Folders resource. This ensures only articles matching the specified `folder_id` are returned.

## [1.5.0] - 2025-11-04

### Added
- **Exports**: New resource to initiate company exports (POST /exports). Supports `format` (pdf, csv, s3), `company_id`, `include_websites`, `include_passwords`, and `asset_layout_ids`.
- **S3 Exports**: New resource to initiate S3 exports (POST /s3_exports). Uses account-configured S3 credentials; no parameters required.
- **Magic Dash**: Added Delete by Title operation (DELETE /magic_dash) allowing deletion without an ID using `title` and `company_name`.

### Improved
- **Articles**: Removed unsupported `created_at` filter processing to align with API v2.39.6 specification (only `updated_at` filter is supported for GET /articles)
- **Asset Layout Fields**: Added missing `multiple_options` field support for ListSelect field types in create and update operations. Updated type definitions to align with API v2.39.6 schema (made `linkable_id` required, added `list_id` and `multiple_options` optional fields)
- **Asset Layouts**: Added missing `slug` filter parameter to Get Many operation to align with API v2.39.6 specification
- **Asset Layouts**: Added support for `list_id` and `multiple_options` fields when creating Asset Layout Fields with ListSelect field type (aligns with API v2.39.6 specification)
- **Companies**: Aligned jump operation with API v2.39.6 specification by removing undocumented `integration_id` and `integration_identifier` parameters (only `integration_slug` is documented)
- **IP Addresses**: Removed duplicate address and status fields from Additional Fields collection to improve UI consistency
- **Lists**: Added support for `list_items_attributes` in Create and Update operations to manage list items when creating or updating lists (aligns with API v2.39.6 specification)
 - **Procedures**: Added `Updated At` filter to Get Many to support date range queries per API v2.39.6
- **Public Photos**: Aligned with API v2.39.6 — `id` is now a slug (string), added `numeric_id`; Update now requires both `record_type` and `record_id`.
 - **Uploads**: Added Create operation for file upload (POST /uploads) to align with API v2.39.6.
 - **VLANs**: Added `vlan_zone_id` and `archived` filters to Get Many; added `archived` to Create; added `company_id` to Update (API v2.39.6 alignment)

### Fixed
- **Activity Logs**: Implemented missing DELETE operation handler to support deleting logs by datetime with optional unassigned logs filter
- **Activity Logs**: Fixed resource_id filter sending 0 value when not provided - now properly omits the parameter to avoid invalid API queries
- **Assets**: Fixed moveLayout operation to use correct HTTP method (PUT) and endpoint path (`/companies/{company_id}/assets/{id}/move_layout`) per API v2.39.6 specification. Removed invalid `preserve_fields` parameter (field preservation is automatic)
- **Cards**: Removed non-existent `jumpByIdentifier` operation and aligned jump operation with API v2.39.6 specification. Both `integration_id` and `integration_identifier` are now optional in additional fields, with validation ensuring at least one is provided
- **Expirations**: Fixed response parsing to handle direct array response per API v2.39.6 specification (API returns array directly, not wrapped in object)
- **Groups**: Fixed response parsing to handle direct array response per API v2.39.6 specification (API returns array directly, not wrapped in object)
- **List Options**: Fixed item ID type handling to ensure numeric IDs are sent to API (coerce to integer for update/delete operations)
- **Magic Dash**: Fixed POST request body structure to wrap payload in `magic_dash_item` key per API v2.39.6 specification (previously sent flat body)
- **Matchers**: Fixed sync_id type in update operation to send string value per API v2.39.6 specification (previously sent as number)
- **Networks**: Fixed create operation to require company_id and make network_type optional per API v2.39.6. Renamed is_discovery field to is_radar to match API schema
- **Procedure Tasks**: Fixed `due_date` field format conversion to send date-only values (YYYY-MM-DD) instead of ISO datetime strings per API v2.39.6 specification
- **Procedures**: Fixed createFromTemplate operation to use query parameters instead of request body per API v2.39.6 specification (`company_id`, `name`, `description` are now sent as query parameters)
- **Procedures**: Fixed duplicate operation to use query parameters instead of request body per API v2.39.6 specification. Updated handler to read `company_id` from top-level required parameter instead of additionalFields
 - **Procedures**: Removed unsupported Archive/Unarchive operations; use Update with `archived` boolean per API v2.39.6
 - **Procedures**: Fixed create operation to send flat JSON body (no `procedure` wrapper) per API v2.39.6
 - **Procedures**: Renamed Create From Template parameter to `template_id` to match handler and API naming
 - **Relations**: Made `description` optional in Create to align with API v2.39.6


## [1.4.7] - 2025-10-01

### Improved
- **AddressData Fields**: Enhanced address field input to accept CSV format for easier data entry. You can now input addresses as comma-separated values (e.g., "123 Main St, Suite 100, Sydney, NSW, 2000, AU") in addition to JSON objects. The order is: address_line_1, address_line_2, city, state, zip, country_name. Changed field type from 'object' to 'string' to allow direct CSV string input. **Note:** country_name must use ISO 3166-1 alpha-2 codes (2-letter codes like AU, US, GB), and state should use ISO 3166-2 subdivision codes (e.g., NSW, CO, CA)

### Fixed
- **Asset Layout Fields**: Fixed "Cannot read properties of undefined (reading 'fields')" error in "Get Many" operation caused by incorrect response unwrapping when calling `handleGetOperation` with the `resourceName` parameter. This affected three files:
  - `asset_layout_fields.handler.ts` - Main handler for all Asset Layout Field operations (Get, Get Many, Create, Update, Delete)
  - `getAssetLayoutFieldValues.ts` - Option loader for field value dropdowns
  - `getCustomFieldsLayoutFields.ts` - Option loader for custom asset tag fields


## [1.4.6] - 2025-09-12

### Improved
- **Dependencies**: Removed 5 unused production dependencies (`cheerio`, `diff`, `html-entities`, `lodash`, `parse5`) and 7 corresponding dev dependencies
- **API Compliance**: Updated schema definitions to fully align with Hudu API v2.38.0:
  - **Groups**: Enhanced `Group` interface with new fields (`slug`, `url`, `created_at`, `updated_at`, `member_count`) and made `default` and `members` required
  - **Groups**: Updated `GroupMember` interface with proper v2.38.0 structure (`first_name`, `last_name`, `security_level`, `slug`), removed deprecated `name` field, and made `email` required
  - **Password Folders**: Updated `IPasswordFolder` interface to make `security` and `allowed_groups` fields required (matching API v2.39.0 response structure)

### Fixed
- **Assets**: Fixed "Asset layout with ID 'X' not found or has no fields" error during asset update operations caused by incorrect resource name parameter in layout validation requests
- **Groups**: Fixed "Get Many" operation response wrapping issue where results were double-wrapped instead of returning the groups array directly


## [1.4.5] - 2025-08-31

### Enhanced
- **Articles**: Added optional markdown content conversion for `Get` and `Get Many` operations with a user-controlled boolean toggle (default: off). When enabled, returns both original HTML content and a new `markdown_content` field, perfect for AI tooling workflows.

### Fixed
- **All Resources**: Fixed `Get` operation response unwrapping issue across all 20+ resources (Articles, Companies, Assets, Procedures, Websites, Users, Networks, Folders, Groups, Asset Passwords, Asset Layouts, Password Folders, Procedure Tasks, Rack Storages, Rack Storage Items, VLANs, VLAN Zones, Lists, List Options, Asset Layout Fields) where individual item responses were wrapped in resource-specific containers (e.g., `{ articles: [...] }`, `{ companies: [...] }`) instead of returning the data directly. Updated 32 files total including core operations and option loaders to ensure consistency with `Get Many` operations and provide uniform response handling across the entire node. Additionally fixed single-item GET operations to return the object directly instead of wrapping it in an array. 
- **Pagination**: Correctly detect and paginate nested endpoint `companies/{id}/assets` so `Return All` and `Limit` behave as expected for company-scoped assets.
- **UI Text**: Cleaned up minor UI strings for consistency: normalized Articles filter label to "Folder ID" and removed emoji from IP Addresses "Get Many" description.
- **Metadata**: Corrected Codex JSON node identifier to `n8n-nodes-hudu.hudu`.


## [1.4.4] - 2025-08-14

### Enhanced
- Added support for Password Folders and Groups from Hudu API v2.38.0
- Standardised concise operation descriptions across resources for a consistent UX
- Centralised request sanitisation to omit empty optional fields and reduce API 500s
- Adopted resource-specific update collections across all resources (e.g. `companyUpdateFields`)
- Added option loaders and integrated them in UIs:
  - Groups (for Password Folders allowed groups)
  - Networks, VLANs, VLAN Zones (used by IP Addresses, Networks, VLANs)
- Unified pagination UX (Return All/Limit) and removed manual page/page_size fields where present
- Aligned handlers to correct response wrappers and direct arrays per endpoint
- Enforced Magic Dash mutual exclusivity constraints (content vs content_link, icon vs image_url)
- Improved filter UIs (date ranges, booleans) for safer defaults

### Fixed
- Assets: Corrected AddressData custom field updates by sending snake_case field label keys and wrapping update payloads under `asset`.


## [1.4.3] - 2025-08-03

### Fixed
- Matchers > Get Many with Return All operation was returning only a single page (not paginating)


## [1.4.2] - 2025-06-23

### Fixed
- **Magic Dash**:
  - Corrected Creating or Updating operations by merging them into a single operation, aligning to the API
  - Fixed an issue where the `Get` operation failed to retrieve an item if it was not on the first page of results.

## [1.4.1] - 2025-06-12

### Enhanced
- **Assets**:
  - The `Get Many` operation now supports fetching assets across all companies by making the `Company ID` field optional. When the `Company ID` is omitted, a wider range of filters becomes available.
- **Asset Layouts**:
  - Aligned the `update` operation with the Hudu API, which now correctly accepts an array of field names for reordering.
- **Asset Layout Fields**:
  - The `linkable_id` field now uses a dynamic asset layout picker, improving UX for `Asset Link` and `Asset Tag` fields.

### Fixed
- **Asset Layouts**:
  - Removed the `active` field from the `create` operation, as it is only supported for updates.
  - Corrected the `update` operation to no longer show a UI for creating new fields, which was misaligned with the API's reordering functionality.
- **Asset Layout Fields**:
  - Fixed a parameter dependency loop that caused the UI to crash.
  - Refactored handler logic to use dedicated API endpoints for `create`, `update`, and `delete` operations, improving efficiency and reliability.

## [1.4.0] - 2025-06-11

### Enhanced
- The `Assets` and `Asset Layouts` resources are now fully supported for all API operations, improving functionality and resolving previous inconsistencies.

### Changed
- Reverted the separation of asset field management. Operations for standard, custom, and link fields are now handled directly within the `Asset` resource's `update` or `create` operations via the unified resource mapper, removing the dedicated `Asset Standard Field`, `Asset Custom Field`, and `Asset Link Field` resources.

### Fixed
- Corrected an issue with the Asset Layout update operation that caused a 500 Internal Server Error due to an API expectation mismatch.

## [1.3.5] - 2025-05-27

### Enhanced
- The `Lists` and `List Options` resources are now managed as separate, distinct resources, each with their own full set of CRUD operations for improved clarity and flexibility. This change allows you to manage lists themselves and the items within those lists independently.
- Management of asset fields is now performed via three new dedicated resources: `Asset Standard Field`, `Asset Custom Field`, and `Asset Link Field`. Field-level operations (get/update) are no longer handled via the main Asset resource, but through these new resources for improved clarity and modularity.
- **Public Photos resource improvements:**
  - Filter fields (`Record Type Filter` and `Record ID Filter`) are now grouped in a single optional "Filter" fixed collection for the Get Many operation, improving UI consistency and usability.
  - The Get by ID operation now fetches public photos page by page, checking each page for the requested ID and returning as soon as it is found. This is much more efficient for large datasets.
  - Documentation and type definitions for Public Photos have been updated for clarity and alignment with the API.

## [1.3.4] - 2025-05-17

### Enhanced
- Website operations now support all available fields for create and update, including new email security fields: `enable_dmarc_tracking`, `enable_dkim_tracking`, `enable_spf_tracking`, and more. This ensures complete alignment with the latest Hudu API (v2.37).

### Added
- Full CRUD support for VLAN Zones, including all fields, filters, archive status, and robust debug logging. Company picklist loader added for easier selection.
- Full CRUD support for VLANs (new in Hudu API v2.37), including all required and optional fields for create and update operations.
- List picklist loader introduced for improved usability across resources that reference lists.

### Fixed
- Asset Link Field Selector now loads correctly in update operations by pre-loading asset layout information and displaying proper layout names.

> **Note:** Some features in this version require Hudu API v2.37.0 to function properly.

## [1.3.3] - 2025-04-24

### Enhanced
- Simplified the process for creating assets specifically for use as asset links, making it more intuitive and reliable.
- The 'Return As Asset Links' feature is now available for both single asset (Get) and multiple assets (Get Many) operations, providing consistent output formatting for asset link custom fields.
- Added support for advanced properties when creating asset layout custom fields:
  - You can now set `hint`, `min`, `max`, `linkable_id`, `expiration`, `options`, `multiple_options`, `list_id`, and other advanced field data.
  - An "Other Data" input is available for all field types, allowing you to specify additional properties as required by the Hudu API (e.g., `linkable_id` for AssetLink fields, `expiration` for date fields, etc).

## [1.3.2] - 2025-04-24

#### Added
- Full support for the new Lists resource

#### Fixed
- Resolved issue with Procedures kickoff operation

## [1.3.1] - 2025-04-21

### Changed
- Aligned package general content such as README and documentation

## [1.3.0] - 2025-03-20

### Fixed
- Added missing company_id field to asset delete, archive, and unarchive operations:
  - Fixed error when deleting assets that was showing "parameterName: company_id" error
  - Added required Company Name/ID dropdown field to the delete, archive, and unarchive operations
  - Ensures proper API path construction for these operations that require company_id in the URL path

## [1.2.9] - 2025-01-25

### Enhanced
- Improved Asset operations with comprehensive updates:
  - Added support for custom asset tags via new "Return As Asset Links" toggle in Get Many Assets operation
  - Optimised asset creation and update operations to handle both standard and custom fields
  - Enhanced UI with dynamic field validation and intuitive field descriptions
  - Streamlined workflow for using asset data between operations

### Notes
- Asset custom field limitations:
  - Legacy list fields require manual value entry (picklist conversion not implemented due to Hudu deprecating this feature)
  - New list field sources not yet available via Hudu API - requires manual ID configuration
- Restart of n8n is required after upgrading to this version for changes to take effect

## [1.2.8] - 2025-01-21

### Fixed
- Fixed asset passwords create operation:
  - Made 'name' and 'company_id' required fields
  - Enhanced the `passwordable_type` field to use a picklist for improved user experience
- Fixed asset passwords update operation to properly handle all fields
- Improved field validation and error handling for asset password operations

## [1.2.7] - 2025-01-20

### Changed
- Enhanced validation for company ID fields across all resources:
  - Added strict validation to ensure company IDs are positive integers
  - Improved error messages for invalid company ID inputs
  - Standardised company ID validation across all handlers
  - Updated handlers: articles, websites, networks, rack_storages, ip_addresses
  - Added clear error messages indicating when input is not a number

### Fixed
- Fixed company ID validation in dynamic picklists to prevent server errors
- Standardised error handling for company ID fields across all resources
- Ensured consistent validation behavior for company ID fields in filters and parameters

## [1.2.5] - 2025-01-17

### Added
- Expanded API resource coverage to near 100% alignment with Hudu API specification
- Added Activity Version History operation with comprehensive revision tracking:
  - Support for retrieving complete version history
  - Detailed change tracking including content modifications
  - User attribution for each revision
  - Timestamp tracking for all changes

### Changed
- Enhanced procedure operations with improved reliability and functionality
- Updated resource handlers to better align with API specifications
- Improved error handling and response formatting across all resources

### Fixed
- Fixed various procedure operation issues:
  - Corrected parameter handling in procedure creation
  - Fixed template-based procedure generation
  - Resolved procedure update operation inconsistencies
- Addressed pagination issues in multiple resource handlers
- Fixed response formatting for nested resource structures


## [1.2.1] - 2025-01-15

### Added
- Added comprehensive debugging capabilities controlled via debugConfig

### Fixed
- Fixed asset creation operation to properly format and populate custom fields from asset layout fields
- Fixed Asset delete, archive and unarchive operations to properly include company_id in the API path as per API specification
- Fixed null response handling in get operations to return empty array instead of empty object
- Fixed Article operations to use correct parameter name 'articleId' instead of 'id'
- Fixed Article update operation to make name and content fields optional as per API specification
- Fixed Article update operation by removing unsupported fields (draft, slug) and aligning descriptions with API specification
- Fixed Article create operation by enforcing name requirement and making other fields optional

## [1.2.0] - 2025-01-08

### Added
- Aligned the node better with n8n node best practices and naming conventions
- Added post-processing filters for enhanced filtering capabilities:
  - Articles: Filter by folder_id
  - Folders: Filter by parent_folder_id and child folder status
  - Relations: Filter by fromable_type, fromable_id, toable_type, toable_id, and is_inverse
- Enhanced dynamic picklists with contextual secondary options:
  - Asset Layout Field updates now show relevant field names based on selected Asset Layout
- Added Articles Version History operation to retrieve the complete revision history of an article

### Fixed
- Fixed incomplete Assets resource operations by adding missing fields

## [1.1.1] - 2025-01-07

### Added
- Added dynamic asset layout selection with searchable dropdown for asset_layout_id fields
- Added option loader for asset layouts
- Added enhanced folder filtering capabilities:
  - Filter by parent folder ID
  - Filter by child folder status (yes/no)
  - Improved pagination handling for filtered results
- Added post-processing filter for folder_id in Articles resource to enable filtering by folder

### Changed
- Fixed inconsistent naming of asset_layout_id field in companies resource to match API specs
- Moved asset creation from companies resource to assets resource for better organisation and consistency
- Removed redundant get assets operation from companies resource as it's available in assets resource
- Updated remaining company_id fields to use dynamic company selection in ip_addresses, asset_passwords (including filter field), magic_dash, procedures resources (including createFromTemplate and duplicate operations), parent_company_id in companies update fields, and matchers fields (company_id filter and potential_company_id)

### Fixed
- Fixed missing asset operations implementation (get single, update, delete, archive/unarchive)
- Fixed magic dash company_id filter by properly converting the dynamic selection value to a number
- Fixed all dynamic company_id fields to properly convert from string to number when sending to API
- Added proper company_id string-to-number conversion in rack_storages resource for filters, create and update operations
- Fixed relation filtering to properly handle case-insensitive type comparisons
- Improved pagination handling with post-processing filters
- Fixed pagination to continue fetching when using post-processing filters until the requested limit is reached

## [1.1.0] - 2025-01-06

### Added
- Implemented comprehensive date range filtering across all supported resources:
  - Articles
  - Asset Layouts
  - Asset Passwords
  - Assets
  - Companies
  - IP Addresses
  - Networks
  - Rack Storages
  - Rack Storage Items
  - Websites

  Each implementation includes:
  - Exact date matching with ISO 8601 format
  - Flexible date range filtering with start and end dates
  - Quick select presets (Today, Yesterday, Last 7 Days, etc.)
  - Support for both created_at and updated_at fields where applicable
- Added full list of integration slugs as `INTEGRATION_SLUGS` constant
- Converted integration_slug fields to use picklist with predefined values from `INTEGRATION_SLUGS`
- Added dynamic user selection with searchable dropdown for user_id fields
- Added dynamic company selection with searchable dropdown for company_id fields
- Added option loaders infrastructure with initial support for user and company loading
- Converted assigned_users field from comma-separated string to proper multi-select user dropdown
- Added comprehensive list of activity log actions as `ACTIVITY_LOG_ACTIONS` constant
- Added comprehensive list of resource types as `RESOURCE_TYPES` constant

### Changed
- Enhanced code quality by removing console logging statements from:
  - GenericFunctions.ts
  - articles.handler.ts
  - asset_layouts.handler.ts
- Standardised date range filter structure across all resources for consistent behaviour
- Unified date filtering implementation to match the Articles resource pattern
- Updated cards description and types to use the new integration_slug picklist
- Updated companies description to use the new integration_slug picklist for jump operation
- Updated activity logs description to use dynamic user selection for user_id field
- Updated procedure tasks description to use dynamic company selection for company_id field
- Improved field descriptions and documentation for integration-related parameters
- Improved user and company selection UI with proper default values and configurable blank option
- Fixed value type warnings in user selection fields
- Enhanced company selection across all resources to use dynamic company picker
- Updated activity logs and related resources to use standardised constants
- Fixed pagination behavior for resources that support pagination
- Removed pagination options from resources that don't support it
- Fixed various resource-specific operations and response handling

### Fixed
- Fixed activity logs resource type filter
- Fixed magic dash pagination and returnAll functionality
- Fixed procedures "get" operation
- Fixed pagination and filter handling in multiple handlers
- Fixed response handling for rack storages and rack storage items
- Fixed users and websites "get all" operations

## [1.0.4] - 2025-01-06

### Added
- Implemented comprehensive date range filtering across all supported resources:
  - Articles
  - Asset Layouts
  - Asset Passwords
  - Assets
  - Companies
  - IP Addresses
  - Networks
  - Rack Storages
  - Rack Storage Items
  - Websites

  Each implementation includes:
  - Exact date matching with ISO 8601 format
  - Flexible date range filtering with start and end dates
  - Quick select presets (Today, Yesterday, Last 7 Days, etc.)
  - Support for both created_at and updated_at fields where applicable

### Changed
- Enhanced code quality by removing console logging statements from:
  - GenericFunctions.ts
  - articles.handler.ts
  - asset_layouts.handler.ts
- Standardised date range filter structure across all resources for consistent behaviour
- Unified date filtering implementation to match the Articles resource pattern

## [1.0.3] - 2025-01-05

### Added
- Added full list of integration slugs as `INTEGRATION_SLUGS` constant
- Converted integration_slug fields to use picklist with predefined values from `INTEGRATION_SLUGS`
- Added dynamic user selection with searchable dropdown for user_id fields
- Added dynamic company selection with searchable dropdown for company_id fields
- Added option loaders infrastructure with initial support for user and company loading
- Converted assigned_users field from comma-separated string to proper multi-select user dropdown

### Changed
- Updated cards description and types to use the new integration_slug picklist
- Updated companies description to use the new integration_slug picklist for jump operation
- Updated activity logs description to use dynamic user selection for user_id field
- Updated procedure tasks description to use dynamic company selection for company_id field
- Improved field descriptions and documentation for integration-related parameters
- Improved user and company selection UI with proper default values and configurable blank option
- Fixed value type warnings in user selection fields
- Enhanced company selection across all resources to use dynamic company picker while preserving existing display options and filters:
  - Updated company_id fields in articles, ip_addresses, magic_dash, networks, procedures, rack_storages, users, and websites descriptions
  - Maintained existing filter options and display conditions while adding dynamic company selection
  - Standardized company selection behavior across create, update, and filter operations

## [1.0.2] - 2025-01-04

### Added
- Added comprehensive list of activity log actions as `ACTIVITY_LOG_ACTIONS` constant
- Added comprehensive list of resource types as `RESOURCE_TYPES` constant

### Changed
- Updated `activity_logs.description.ts` to use `ACTIVITY_LOG_ACTIONS` constant for action_message field
- Updated `activity_logs.description.ts` to use `RESOURCE_TYPES` constant for resource_type field
- Updated `expirations.description.ts` to use `RESOURCE_TYPES` constant for resource_type field
- Updated `relations.description.ts` to use `RESOURCE_TYPES` constant for toable_type and fromable_type fields
- Updated `asset_passwords.description.ts` to use `RESOURCE_TYPES` constant for passwordable_type field

### Fixed
- Fixed activity logs resource type filter by grouping resource_id and resource_type parameters together to ensure they are used as a pair
- Fixed pagination behavior for resources that support pagination:
  - When "Return All" is enabled, properly paginates in lots of 25 records until all records are retrieved
  - When "Return All" is disabled but limit > 25, paginates in lots of 25 until reaching the limit
  - For the final batch when limit > 25, only fetches the remaining records needed
  - For limit <= 25, makes a single request with the exact limit
- Removed pagination options from resources that don't support it (cards, ip_addresses, api_info)
- Fixed magic dash pagination and returnAll functionality
- Fixed procedures "get" operation by properly handling numeric IDs and response data
- Fixed pagination and filter handling in multiple handlers (procedure_tasks, rack_storage_items, rack_storages, networks)
- Fixed response handling for rack storages and rack storage items to properly process direct array responses
- Added missing pagination parameters to rack storage items "get all" operation
- Fixed rack storage items "get all" operation by removing pagination parameters since they are not supported by the API
- Fixed users "get all" operation to correctly handle the nested "users" array in the API response
- Fixed websites "get all" operation to correctly handle the nested "websites" array in the API response

## [1.0.1] - 2025-01-04

### Changed

- Restructured project to follow n8n node development best practices:
  - Moved node files into `src/nodes/Hudu` directory
  - Organized supporting modules (descriptions, resources, utils) into subdirectories
  - Updated build process to maintain correct file structure
  - Changed icon from `hudu.png` to `hudu.svg`

## [1.0.0] - 2024-12-01

### Added

- Initial release of the n8n Hudu integration node
- Full support for Hudu API V2.34.4
- Comprehensive implementation of Hudu API endpoints including:
  - Companies
  - Activity Logs
  - Articles
  - Asset Layouts
  - Assets
  - Cards
  - Folders
  - Procedures
  - Relations
  - And more core Hudu functionalities
- Authentication handling via API key
- Resources with binary file functionality are currently not supported (uploads of photos, etc)

## [0.1.0] - 2024-01-17

### Added
- Initial release
- Basic CRUD operations for all Hudu API resources
- Pagination support for resources that allow it
- Proper error handling and response formatting
