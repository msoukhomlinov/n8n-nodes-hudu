/**
 * One-line resource-specific usage hint that fits inside the terse tool description.
 * Long-form workflow prose lives in help-registry.ts and is reachable via `operation: 'help'`
 * on resources that register the op (articles, public_photos).
 */
const RESOURCE_HINTS: Record<string, string> = {
  articles:
    "'name' = fuzzy title; 'search' = full-text (both re-rank exact-title to top). include_content/include_photos opt-in. folder_id auto-resolves company_id. operation=help topic=overview for workflow notes.",
  companies: 'Use getIdByName for fuzzy name→id resolution.',
  folders:
    'Folders carry company_id (used by hudu_articles folder_id filtering for auto-narrowing).',
  websites: "'name' IS the URL (must include https:// or http://).",
  procedures:
    "Read responses expose nested tasks under 'tasks' (each with optional 'assignee' block).",
  procedure_tasks: "Task carries 'assignee:{id,name,initials}' only when assigned.",
  relations: 'fromable_/toable_ pairs declare both ends; types from RESOURCE_TYPES.',
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
};

const ENVELOPE_PREAMBLE =
  "Envelope v2 — 'error' key = failure; default-valued fields omitted.";

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
  // Reference args reserved for future per-resource tuning (e.g. mention search/no-search
  // variants directly in the hint, or surface the company-endpoint requirement).
  void supportsSearch;
  void config;
  const enabledOps = Array.from(new Set(operations));
  const hint = RESOURCE_HINTS[resource] ?? '';
  return [
    `Manage Hudu ${resourceLabel} records.`,
    `Operations: ${enabledOps.join(', ')}.`,
    hint,
    ENVELOPE_PREAMBLE,
  ]
    .filter(Boolean)
    .join(' ');
}
