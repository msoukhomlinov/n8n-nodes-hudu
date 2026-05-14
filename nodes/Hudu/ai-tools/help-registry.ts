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
