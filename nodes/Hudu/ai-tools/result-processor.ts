import { DEFAULT_FIELD_VALUES } from './resource-config';
import { processArticleContent } from '../utils/markdownUtils';
import { convertHtmlToMarkdown } from '../utils/markdown/htmlToMarkdown';
import { buildFrontmatter } from '../utils/markdown/frontmatter';

// Function words that dilute tier-2 title-word overlap. Deliberately small — only
// high-frequency English glue words, NOT content words — so distinctive short words still score.
// 'it' is deliberately excluded even though it's a common pronoun: Hudu is an IT documentation
// tool, so 'IT' is a frequent content word in real titles (e.g. "IT Glue Import"); stripping it
// would drop a distinctive token from both ranking and isConfidentTitleMatch.
const TITLE_STOPWORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in', 'is',
  'of', 'on', 'or', 'the', 'to', 'up', 'with', 'your', 'you', 'this', 'that',
]);

export const TITLE_SUBSTRING_BOOST = 1000;

/**
 * Title-match score with two-tier scoring:
 *   tier 1 — full query as a whole-word case-insensitive match within the title (score += TITLE_SUBSTRING_BOOST)
 *   tier 2 — count of distinctive (non-stopword) query tokens present in the title (score += matched-token count)
 * Stopwords are stripped from the tier-2 token set before the overlap count so common glue words
 * ('how', 'to', 'up', ...) don't dilute the score against distinctive words; an all-stopword query
 * (e.g. "how to") keeps its raw tokens so it never zeroes out. The tier-1 check always uses the
 * full, untouched query and requires a whole-word boundary (see `hasWholeWordToken`) so a short
 * query can't spuriously match mid-word inside an unrelated title. Empty token list (all-delimiter
 * query) = score 0.
 */
function queryTokens(query: string): { lowerQuery: string; contentTokens: string[]; tokens: string[] } {
  const lowerQuery = query.toLowerCase().trim();
  const rawTokens = lowerQuery.split(/[\s\-_/]+/).filter(Boolean);
  const contentTokens = rawTokens.filter((t) => !TITLE_STOPWORDS.has(t));
  // all-stopword guard: keep raw tokens so an "how to"-style query never zeroes out
  const tokens = contentTokens.length ? contentTokens : rawTokens;
  return { lowerQuery, contentTokens, tokens };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Whole-word containment check for a token or full-query phrase — plain substring matching would
// let a short string (e.g. 'it') falsely match inside an unrelated longer word (e.g. 'split'),
// which defeats the acronym-preserving stopword guard above. Boundaries are non-alphanumeric —
// underscore counts as a boundary here too, matching queryTokens' `_` delimiter, so a title like
// "MFA_Office365" still whole-word-matches tokens split from a space-separated query — while
// punctuation-adjacent words (e.g. "VPN:") still match.
function hasWholeWordToken(lowerName: string, token: string): boolean {
  if (!token) return false;
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(token)}(?:$|[^a-z0-9])`, 'i').test(lowerName);
}

export function titleMatchScore(name: string, query: string): number {
  const { lowerQuery, tokens } = queryTokens(query);
  if (tokens.length === 0) return 0;
  const lowerName = name.toLowerCase();
  const substringBoost = hasWholeWordToken(lowerName, lowerQuery) ? TITLE_SUBSTRING_BOOST : 0;
  const overlap = tokens.filter((t) => hasWholeWordToken(lowerName, t)).length;
  return substringBoost + overlap;
}

/**
 * Confidence verdict for a name/title lookup — distinct from the *ordering* score above.
 * True (confident) when EITHER:
 *   tier 1 — the full query is a whole-word case-insensitive match within the title, OR
 *   tier 2 — ALL distinctive (non-stopword) query tokens appear in the title as whole words AND
 *            there are at least 2 of them. The 2-token floor guards against a single common short
 *            word (e.g. "vpn", "ssl") coincidentally matching an otherwise-unrelated title.
 * A partial content-token overlap (some but not all present) is NOT confident, so a reworded
 * title that keeps every distinctive word passes while the original diluted-overlap bug does not.
 * Tier 1 requires a whole-word boundary too (not a bare substring) — otherwise a single-token
 * query like "IT" would falsely match mid-word inside an unrelated title (e.g. "Digital
 * Onboarding") before the tier-2 two-token floor ever gets a chance to block it.
 */
export function isConfidentTitleMatch(name: string, query: string): boolean {
  const { lowerQuery, contentTokens } = queryTokens(query);
  const lowerName = name.toLowerCase();
  if (hasWholeWordToken(lowerName, lowerQuery)) return true;
  return contentTokens.length >= 2 && contentTokens.every((t) => hasWholeWordToken(lowerName, t));
}

/**
 * Sorts items by titleMatchScore against `query`, highest first (stable — ES2019 / Node 12+).
 */
export function sortByTitleMatch<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  nameField = 'name',
): T[] {
  return [...items].sort(
    (a, b) =>
      titleMatchScore(String(b[nameField] ?? ''), query) -
      titleMatchScore(String(a[nameField] ?? ''), query),
  );
}

/**
 * Strip the content field from results unless explicitly requested.
 */
export function stripContentField<T extends Record<string, unknown>>(
  items: T[],
  includeContent: boolean,
  contentField = 'content',
): T[] {
  if (includeContent) return items;
  return items.map((item) => {
    const result = { ...item };
    delete result[contentField];
    return result;
  });
}

/**
 * Slim a photo record to the four fields the LLM can actually use:
 *   numeric_id (integer id for the API), url (absolute, public), file_name, size.
 * Drops slug `id` (display-only, not callable), `record_type` / `record_id`
 * (caller already has the parent's context), and renames file_size → size.
 */
export function slimPhotoRecord(p: Record<string, unknown>): Record<string, unknown> {
  return {
    numeric_id: p.numeric_id,
    url: p.url,
    file_name: p.file_name,
    size: p.file_size ?? p.size,
  };
}

/**
 * For each item: when includePhotos=false strip the photos field entirely; when true,
 * slim each photo to {numeric_id, url, file_name, size}. Article public_photos arrays
 * alone can run to dozens of entries per record and blow context budgets.
 */
export function stripPhotosField<T extends Record<string, unknown>>(
  items: T[],
  includePhotos: boolean,
  photosField = 'public_photos',
): T[] {
  return items.map((item) => {
    const result: Record<string, unknown> = { ...item };
    if (!includePhotos) {
      delete result[photosField];
      return result as T;
    }
    const photos = result[photosField];
    if (Array.isArray(photos)) {
      result[photosField] = (photos as Record<string, unknown>[]).map(slimPhotoRecord);
    }
    return result as T;
  });
}

/**
 * True when val matches one of the documented defaults. Empty-array defaults are
 * sentinel-matched: a default of `[]` matches any zero-length array on the record.
 */
function matchesDefault(val: unknown, defaults: unknown[]): boolean {
  for (const d of defaults) {
    if (val === d) return true;
    if (Array.isArray(d) && d.length === 0 && Array.isArray(val) && (val as unknown[]).length === 0) return true;
  }
  return false;
}

/**
 * Omit fields whose value matches a documented default for the resource. Uniform
 * application → identical field sets across records of the same resource. Defaults
 * are declared once in DEFAULT_FIELD_VALUES and surfaced in tool descriptions, so
 * the LLM knows what an omitted field implies.
 */
export function omitDefaults<T extends Record<string, unknown>>(item: T, resource: string): T {
  const defaults = DEFAULT_FIELD_VALUES[resource];
  if (!defaults) return item;
  const out: Record<string, unknown> = { ...item };
  for (const [field, vals] of Object.entries(defaults)) {
    if (!(field in out)) continue;
    if (matchesDefault(out[field], vals)) {
      delete out[field];
    }
  }
  return out as T;
}

const PROCEDURE_TASKS_ATTR_KEY = 'procedure_tasks_attributes';

/**
 * Reshape a single procedure task record:
 *   - When an assignee exists, emit a single `assignee` block ({id, name, initials}).
 *   - Drop all six legacy `*_user_*` keys whether assigned or not.
 *   - Apply omitDefaults('procedure_tasks').
 */
export function reshapeProcedureTaskRecord<T extends Record<string, unknown>>(record: T): T {
  const out: Record<string, unknown> = { ...record };
  const uid = out.first_assigned_user_id;
  if (uid !== null && uid !== undefined) {
    out.assignee = {
      id: uid,
      name: out.first_assigned_user_name ?? null,
      initials: out.first_assigned_user_initials ?? null,
    };
  }
  delete out.first_assigned_user_id;
  delete out.first_assigned_user_name;
  delete out.first_assigned_user_initials;
  delete out.user_id;
  delete out.user_name;
  delete out.assigned_users;
  delete out.subtask_ids;
  return omitDefaults(out, 'procedure_tasks') as T;
}

/**
 * Reshape a procedure read response: rename Rails-style `procedure_tasks_attributes`
 * write-key to `tasks`, then per-task reshape (assignee block, drop *_user_* keys).
 */
export function reshapeProcedureRecord<T extends Record<string, unknown>>(record: T): T {
  const out: Record<string, unknown> = { ...record };
  if (PROCEDURE_TASKS_ATTR_KEY in out) {
    const tasks = out[PROCEDURE_TASKS_ATTR_KEY];
    out.tasks = Array.isArray(tasks)
      ? (tasks as Record<string, unknown>[]).map(reshapeProcedureTaskRecord)
      : [];
    delete out[PROCEDURE_TASKS_ATTR_KEY];
  }
  return out as T;
}

/**
 * Add `markdown_content` (converted from the article's HTML `content` field), optionally
 * prefixed with a YAML frontmatter citation block. Delegates to the same
 * processArticleContent helper the regular Hudu node uses, so output matches exactly.
 * Must be called BEFORE stripContentField, while `content` is still present regardless
 * of the caller's include_content choice.
 */
export function addArticleMarkdown<T extends Record<string, unknown>>(
  record: T,
  includeFrontmatter: boolean,
): T {
  return processArticleContent(record, true, includeFrontmatter) as T;
}

/**
 * Add `markdown_content` (converted from the Magic Dash HTML `content` field), optionally
 * prefixed with a YAML frontmatter citation block (title, company, content link). Mirrors
 * the regular node's processMagicDashContent so AI-tools output matches exactly. Returns the
 * record unchanged when it has no `content`.
 */
export function addMagicDashMarkdown<T extends Record<string, unknown>>(
  record: T,
  includeFrontmatter: boolean,
): T {
  if (!record.content) return record;
  let md = convertHtmlToMarkdown(record.content as string);
  if (includeFrontmatter) {
    const fm = buildFrontmatter({
      title: (record.title as string) ?? null,
      company_name: (record.company_name as string) ?? null,
      content_link: (record.content_link as string) ?? null,
    });
    md = `${fm}\n${md}`;
  }
  return { ...record, markdown_content: md };
}

/**
 * Re-exported from the shared helper so this stays the single import site for
 * tool-executor.ts. Mirrors addAssetFieldMarkdown() used by the regular node's
 * assets.handler.ts so AI-tools output matches exactly. include_frontmatter has
 * no analog here (no single content field to prepend a citation block to) and is a no-op.
 */
export { addAssetFieldMarkdown } from '../utils/markdown/assetFields';
