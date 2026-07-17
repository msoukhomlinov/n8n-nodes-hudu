/**
 * One-line resource-specific usage hint that fits inside the terse tool description.
 * Long-form workflow prose lives in help-registry.ts and is reachable via `operation: 'help'`
 * on resources that register the op (articles, public_photos).
 */
const RESOURCE_HINTS: Record<string, string> = {
  articles:
    "'name' = fuzzy title; 'search' = full-text (both re-rank exact-title to top). include_content/include_photos opt-in. folder_id auto-resolves company_id. operation=help topic=overview for workflow notes.",
  companies:
    'Use getIdByName for fuzzy name→id resolution. operation=help topic=overview for filters and archive rules.',
  folders:
    'Folders carry company_id (powers hudu_articles folder_id auto-narrowing). operation=help topic=overview.',
  websites:
    "'name' IS the URL (must include https:// or http://). operation=help topic=overview.",
  procedures:
    "Nested 'tasks' on reads (each with optional 'assignee'). operation=help topic=overview.",
  procedure_tasks:
    "Task carries 'assignee:{id,name,initials}' only when assigned. operation=help topic=overview for cross-procedure filtering.",
  relations:
    'fromable_/toable_ pairs declare both ends; types from RESOURCE_TYPES. operation=help topic=overview for data model.',
  assets:
    'Use getIdByName for name→id. move recreates+deletes via /companies/{id}/assets. getByLayout labels custom fields.',
  asset_passwords: 'Use getIdByName for fuzzy name→id resolution.',
  asset_layouts: 'Use getIdByName for EXACT name→id resolution.',
  activity_logs: 'Filter by user, resource_type+resource_id, action_message, or date range.',
  ip_addresses: 'Filter by address, network_id, fqdn, status, or asset_id.',
  networks: 'Use getIdByName for EXACT name→id resolution.',
  vlans: 'Use getIdByName for EXACT name→id resolution.',
  vlan_zones: 'Use getIdByName for EXACT name→id resolution.',
  matchers: 'Filter by integration_id.',
  groups: 'Use getIdByName for fuzzy name→id resolution.',
  users: 'Use getIdByName for fuzzy name→id resolution.',
  expirations: 'Filter by company_id or resource_type.',
  photos: 'Internal photo records (not the embedded public_photos / numeric_id flow).',
  public_photos:
    'Slim shape: {numeric_id, url, file_name, size}. operation=help topic=overview for the verification workflow.',
  label_types:
    'No search — filter getAll by exact name/color/slug. Create requires name, color, applicable_record_types.',
  labels:
    'Apply a label type to a record. Create requires label_type_id, labelable_type, labelable_id. No search filter.',
};

const ENVELOPE_PREAMBLE =
  "Envelope v3 — 'error:true' = failure; absent 'error' = success.";

// ---------------------------------------------------------------------------
// Module-level description template cache — credential-independent
// Same API schema → same description for all credentials. Module lifetime.
// ---------------------------------------------------------------------------
const _descriptionTemplateCache = new Map<string, string>();
const DESCRIPTION_CACHE_MAX = 600;

function _descCacheKey(
  resourceLabel: string,
  resource: string,
  operations: string[],
  supportsSearch: boolean,
): string {
  return `${resource}|${[...operations].sort().join(',')}|${supportsSearch ? '1' : '0'}`;
}

/**
 * Build the unified tool description string passed to the LLM as the
 * DynamicStructuredTool description. Kept deliberately terse — operation list +
 * one-line usage hint + envelope rule. Long-form workflow prose lives in
 * help-registry.ts and is fetched on demand via operation='help'.
 *
 * Per-parameter detail belongs in the inputSchema's field descriptions
 * (schema-generator.ts) — schemas already ship with the tool, so reorganising
 * prose into them is reorganisation, not reduction.
 */
export function buildUnifiedDescription(
  resourceLabel: string,
  resource: string,
  operations: string[],
  supportsSearch: boolean,
  config: { requiresCompanyEndpoint?: boolean },
): string {
  const cacheKey = _descCacheKey(resourceLabel, resource, operations, supportsSearch);
  const cached = _descriptionTemplateCache.get(cacheKey);
  if (cached) return cached;

  // Reference args reserved for future per-resource tuning.
  void config;
  const enabledOps = Array.from(new Set(operations));
  const hint = RESOURCE_HINTS[resource] ?? '';
  const result = [
    `Manage Hudu ${resourceLabel} records.`,
    `Operations: ${enabledOps.join(', ')}.`,
    hint,
    ENVELOPE_PREAMBLE,
  ]
    .filter(Boolean)
    .join(' ');

  if (_descriptionTemplateCache.size >= DESCRIPTION_CACHE_MAX) {
    const firstKey = _descriptionTemplateCache.keys().next().value;
    if (firstKey !== undefined) _descriptionTemplateCache.delete(firstKey);
  }
  _descriptionTemplateCache.set(cacheKey, result);
  return result;
}
