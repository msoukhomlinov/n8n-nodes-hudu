import { wrapSuccess, wrapError, ERROR_TYPES } from './error-formatter';

/**
 * Long-form workflow prose keyed by resource then topic. Returned verbatim by the
 * `help` operation — keeps the tool description proper terse while leaving rich
 * guidance reachable on demand. Default topic is 'overview'.
 */
export const HELP_TOPICS: Record<string, Record<string, string>> = {
  articles: {
    overview:
      "Hudu KB articles — full workflow.\n" +
      "ID resolution: when you only have a title, call getAll with `name` (fuzzy, two-tier re-rank — full-substring boost +1000, then word-overlap; auto-fetches 100 candidates, returns top `limit`). For topic/content exploration call getAll with `search` (same re-rank but matches across title AND body). Both surface exact-title hits at position 0.\n" +
      "Body content: stripped by default. Set include_content=true on get/getAll to include HTML.\n" +
      "Photos: stripped by default. Set include_photos=true to include the `public_photos` array (slim shape: {numeric_id, url, file_name, size}).\n" +
      "Filters on getAll: company_id, folder_id, slug (12-char short hash only — SEO suffix not queryable), draft, enable_sharing, updated_at_start/end range.\n" +
      "Folder filtering: folder_id is not a native Hudu /articles query param. The executor pre-resolves the folder→owning company_id (one /folders GET) and injects company_id natively, then post-filters by folder_id. Global folders (company_id:null) fall back to a bounded scan (≤20 pages × 100 records).\n" +
      "Truncation signal: result.truncated:true means more matches exist beyond the cap — narrow with company_id or search.\n" +
      "Envelope v2 — 'error' key = failure; default-valued fields omitted from records (treat absent field as default).\n" +
      "See also: topic=photos (verification dance), topic=search (ranking detail), topic=create (scope rules).",
    photos:
      "Article photo verification workflow.\n" +
      "Article HTML embeds images as `<a href=\"/public_photo/<slug>\">…</a>` links. The article get/getAll response with include_photos=true returns a `public_photos` array of slim metadata: {numeric_id, url, file_name, size}. The slug string is display-only — the Hudu API only accepts the integer numeric_id; it returns 404 for slug strings.\n" +
      "BEFORE editing or redacting an article (with write-back): call hudu_public_photos get with each photo's numeric_id to verify the photo still exists upstream. This prevents your edits from breaking or removing references to photos that were deleted upstream.\n" +
      "SKIP this verification when you are only reading, summarising, or quoting the article (no write-back).\n" +
      "Photo records can NEVER carry binary image bytes through n8n's tool architecture — JSON-stringification at the executor boundary strips any binary payload. Use the `url` field (public, no auth required) to surface the image to a human; never attempt visual analysis from the tool result.",
    search:
      "Search vs name on hudu_articles getAll.\n" +
      "`name`: send a known full or partial title. The executor translates to upstream search, fetches up to 100 candidates, and re-ranks with the two-tier title scorer (full-substring boost +1000, then per-word overlap). Best when the LLM has a title in hand.\n" +
      "`search`: send a topic phrase or content keyword. Same upstream call, same re-rank — but matches body text too. Use when the LLM is exploring rather than resolving a title to an ID.\n" +
      "Ranking guarantees: exact-title matches surface at position 0 when the full query appears as a substring of the title. Word-overlap is the fallback tier.\n" +
      "If you get unexpected zero results, check API key permissions or relax filters; the re-rank cannot synthesise records that the upstream did not return.",
    create:
      "Hudu article create — scope rules.\n" +
      "Provide ONE of (a) numeric company_id, (b) folder_id (company_id auto-resolved internally via /folders GET), (c) global=true for a non-company-scoped article.\n" +
      "Precedence: global=true wins over company_id. folder_id is optional when global=true (article lands in a global folder).\n" +
      "content accepts HTML or Markdown.\n" +
      "Confirm field values with the user before executing when acting autonomously.\n" +
      "Returns the created article including its numeric id (use for subsequent get/update/archive/delete).",
  },
  public_photos: {
    overview:
      "Hudu public_photos — slim metadata only, never binary.\n" +
      "Returns {numeric_id, url, file_name, size}. The slug `id` field returned by Hudu is dropped (display-only, not callable via the API). `record_type` and `record_id` are also dropped (caller already has the parent's context).\n" +
      "n8n's tool architecture forcibly JSON-stringifies every tool result, so binary image bytes can NEVER reach the LLM through this call — by design.\n" +
      "PRIMARY use: before editing or redacting an article (or company record) that contains embedded `/public_photo/<slug>` images, call hudu_public_photos get with each photo's numeric_id to verify the photo still exists upstream. This prevents your edits from breaking or removing references to photos that were already deleted.\n" +
      "SECONDARY use: surface `url` (a publicly accessible absolute URL — no Hudu auth required) and `file_name`/`size` to the user so they can open the image in their browser.\n" +
      "NOT useful for: visual analysis, OCR, image description. The tool cannot see image content. If the user asks what an image depicts, supply the URL and explain you can only link it.\n" +
      "Pass the integer numeric_id from a prior article or company response's `public_photos` array. The API returns 404 for slug strings.",
  },
  companies: {
    overview:
      "Hudu companies — full workflow.\n" +
      "ID resolution: prefer operation=getIdByName (fuzzy partial match, returns id+name+key FKs only). getAll with `search` matches across name/city/phone/website but returns full records.\n" +
      "Filters on getAll: search (partial), name (EXACT case-sensitive), slug, id_in_integration, city, state, phone_number, website, archived. `search` re-ranks within Hudu — local re-rank not applied.\n" +
      "Create requires: name. Optional: company_type (Customer/Prospect/Vendor/Partner/Reseller/Internal), parent_company_id (resolve via getIdByName first), plus address/contact fields.\n" +
      "Archive vs delete: archive preserves data and is restorable via unarchive; delete is permanent. Always prefer archive unless user explicitly requested deletion.\n" +
      "Envelope v2 — `error` key = failure; default-valued fields (parent_company_id:null, archived:false, etc.) omitted from records.",
  },
  folders: {
    overview:
      "Hudu folders — article and photo folders.\n" +
      "Filters on getAll: name (EXACT case-sensitive — folders have no search), company_id, parent_folder_id, folder_type ('article' or 'photo').\n" +
      "Folder records carry `company_id` — that's what powers hudu_articles' folder_id auto-narrowing (the executor looks up the folder once, injects its company_id as native upstream filter, drastically narrowing the bounded scan).\n" +
      "Global folders: company_id is null. Articles in a global folder can't be narrowed by company — the scan runs unnarrowed (up to 20 pages × 100 records).\n" +
      "Create requires: name. Optional: company_id (omit for global), parent_folder_id (nested), folder_type (default 'article', immutable after creation), description, icon.\n" +
      "ID resolution: operation=getIdByName (EXACT case-sensitive match).\n" +
      "Envelope v2 — `error` key = failure; default-valued fields omitted.",
  },
  websites: {
    overview:
      "Hudu websites — monitored URLs.\n" +
      "GOTCHA: the `name` field IS the URL (must include https:// or http://). It is NOT a display name. Hudu uses the URL itself as the identifier.\n" +
      "Filters on getAll: search (partial — matches URL and other fields), name (EXACT URL match), company_id, slug, archived.\n" +
      "Monitoring flags: paused, disable_dns, disable_ssl, disable_whois, enable_dmarc_tracking, enable_dkim_tracking, enable_spf_tracking. monitor_type controls the type of monitoring.\n" +
      "Create requires: name (URL with protocol), company_id. Optional: keyword (page-content monitor), notes, all the disable_*/enable_* flags.\n" +
      "ID resolution: operation=getIdByName (fuzzy partial match).\n" +
      "Envelope v2 — `error` key = failure; default-valued fields (keyword:null, headers:null, paused:false, archived:false, etc.) omitted.",
  },
  procedures: {
    overview:
      "Hudu procedures — processes (templates) AND runs (active instances).\n" +
      "Type filter: `type=process` returns templates, `type=run` returns active instances, `type=all` returns both (default).\n" +
      "Process scope: process_scope filter narrows processes by global/company.\n" +
      "Read responses expose nested tasks under `tasks` (renamed on read from Hudu's Rails-style `procedure_tasks_attributes` write-key). Each task carries an `assignee:{id,name,initials}` block ONLY when a user is assigned; legacy `*_user_*` keys are stripped.\n" +
      "Filters on getAll: name (EXACT match, case-insensitive — no fuzzy search), company_id, slug, type, process_scope, parent_process_id (filter runs by their parent process), created_at (date or range), archived.\n" +
      "Create requires: name. Optional: company_id (omit for global template), description.\n" +
      "Update of `archived` only affects company processes — global processes and runs follow their parent.\n" +
      "ID resolution: operation=getIdByName (EXACT case-sensitive match).\n" +
      "Envelope v2 — `error` key = failure; default-valued fields (parent_procedure:null, paused:false, archived:false) omitted.",
  },
  procedure_tasks: {
    overview:
      "Hudu procedure tasks — individual task records within a procedure run.\n" +
      "Filters on getAll: procedure_id (filter by parent process or run ID), name (EXACT match — no fuzzy search), company_id.\n" +
      "Each task record carries `assignee:{id,name,initials}` ONLY when a user is assigned. When unassigned, the field is absent — do NOT assume null means 'unassigned-but-acknowledged'. Legacy `*_user_*` keys and `assigned_users:[]` / `subtask_ids:[]` are stripped from the response (use the rename map: first_assigned_user_* → assignee.*).\n" +
      "Read-only at the AI Tools layer (no create/update/delete/archive operations exposed). Tasks are created and modified through their parent procedure.\n" +
      "To enumerate tasks for a procedure, call hudu_procedures get with the procedure id — the response carries `tasks` inline. hudu_procedure_tasks getAll is for cross-procedure filtering (e.g. by name across all runs for a company).\n" +
      "Envelope v2 — `error` key = failure; default-valued fields (completed:false, description:null, due_date:null) omitted.",
  },
  relations: {
    overview:
      "Hudu relations — typed links between two records (fromable/toable pair).\n" +
      "Data model: each relation has a `from` end (`fromable_type` + `fromable_id`) and a `to` end (`toable_type` + `toable_id`). Both ends must be valid Hudu resource types from RESOURCE_TYPES (e.g. 'Article', 'Asset', 'AssetPassword', 'Company', 'Folder', 'IPAddress', 'Network', 'Procedure', 'Vlan', 'Website'). The `is_inverse` flag distinguishes the canonical direction.\n" +
      "Filters on getAll: id, fromable_id, fromable_type, toable_id, toable_type. All applied client-side via post-process filter (Hudu /relations has no native filter params) — combine specific ID+type pairs to keep the result bounded.\n" +
      "GOTCHA: type field names are `fromable_type` / `toable_type` (NOT `froable_*` — easy typo).\n" +
      "Create requires all four: fromable_id, fromable_type, toable_id, toable_type. Optional: is_inverse, description.\n" +
      "When an asset is moved between companies via hudu_assets move, relations pointing to the original asset are NOT auto-rewritten — re-establish them using hudu_relations create after the move.\n" +
      "Envelope v2 — `error` key = failure.",
  },
};

/** Resources whose unified tool description directs the LLM to the help op. */
export const HELP_ENABLED_RESOURCES = Object.keys(HELP_TOPICS);

export function runHelp(resource: string, params: Record<string, unknown>): string {
  const topics = HELP_TOPICS[resource];
  if (!topics) {
    return JSON.stringify(
      wrapError(
        resource,
        'help',
        ERROR_TYPES.UNKNOWN_RESOURCE,
        `help is not registered for resource: ${resource}.`,
        `Resources with help topics: ${HELP_ENABLED_RESOURCES.join(', ')}.`,
      ),
    );
  }
  const requestedTopic = (params.topic as string | undefined) ?? 'overview';
  const content = topics[requestedTopic];
  if (!content) {
    return JSON.stringify(
      wrapError(
        resource,
        'help',
        ERROR_TYPES.VALIDATION_ERROR,
        `Unknown help topic '${requestedTopic}' for ${resource}.`,
        `Available topics: ${Object.keys(topics).join(', ')}.`,
      ),
    );
  }
  return JSON.stringify(
    wrapSuccess(resource, 'help', {
      topic: requestedTopic,
      availableTopics: Object.keys(topics),
      content,
    }),
  );
}
