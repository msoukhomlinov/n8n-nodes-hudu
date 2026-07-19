import { z } from 'zod';
import type { RuntimeZod } from './runtime';
import type { HuduOperation } from './resource-config';
import {
  IP_ADDRESS_STATUSES,
  IP_ADDRESS_STATUS_DESCRIPTIONS,
  RESOURCE_TYPES,
  RESOURCE_TYPE_DESCRIPTIONS,
  PROCEDURE_TYPES,
  PROCEDURE_SCOPES,
  FOLDER_TYPES,
  LABEL_RECORD_TYPES,
  LABEL_RECORD_TYPE_DESCRIPTIONS,
} from '../utils/constants';

// ---------------------------------------------------------------------------
// Module-level schema cache — credential-independent (API schema is static)
// ---------------------------------------------------------------------------
const _readOnlySchemaCache = new Map<string, z.ZodObject<z.ZodRawShape>>();
const READONLY_SCHEMA_CACHE_MAX = 200;

function _readOnlyCacheKey(
  resource: string,
  operations: string[],
  config: {
    requiresCompanyEndpoint?: boolean;
    supportsContentField?: boolean;
    supportsPhotosField?: boolean;
  },
): string {
  return [
    resource,
    [...operations].sort().join(','),
    config.supportsContentField ? '1' : '0',
    config.supportsPhotosField ? '1' : '0',
    config.requiresCompanyEndpoint ? '1' : '0',
  ].join('|');
}

// ---------------------------------------------------------------------------
// Common base schemas
// ---------------------------------------------------------------------------

/** Build the "Values: x (desc), y (desc)." suffix for LLM field descriptions. */
function buildTypeDesc(types: readonly string[], descriptions: Record<string, string>): string {
  return 'Values: ' + types.map((t) => `${t} (${descriptions[t] ?? t})`).join(', ') + '.';
}

// Shared IP address status schemas — reused across getAll / create / update
const IP_STATUS_DESC = `IP address status. ${buildTypeDesc(IP_ADDRESS_STATUSES, IP_ADDRESS_STATUS_DESCRIPTIONS)}`;
const ipAddressStatusSchema = z.enum(IP_ADDRESS_STATUSES).describe(IP_STATUS_DESC);
const ipAddressStatusOptionalSchema = z
  .enum(IP_ADDRESS_STATUSES)
  .optional()
  .describe(IP_STATUS_DESC);

// Shared resource-type description string — reused wherever resource_type / *able_type appears
// Uses RESOURCE_TYPES from constants (same list the main Hudu node uses for all dropdowns)
const RESOURCE_TYPES_DESC = buildTypeDesc(RESOURCE_TYPES, RESOURCE_TYPE_DESCRIPTIONS);

// Label / Label Type record-type enum (API casing: IpAddress, not IPAddress)
const LABEL_RECORD_TYPES_DESC = buildTypeDesc(
  LABEL_RECORD_TYPES,
  LABEL_RECORD_TYPE_DESCRIPTIONS,
);
const labelRecordTypeSchema = z
  .enum(LABEL_RECORD_TYPES)
  .describe(`Record type this label applies to. ${LABEL_RECORD_TYPES_DESC}`);
const labelRecordTypeOptionalSchema = z
  .enum(LABEL_RECORD_TYPES)
  .optional()
  .describe(`Record type this label applies to. ${LABEL_RECORD_TYPES_DESC}`);
const labelRecordTypesArraySchema = z
  .array(z.enum(LABEL_RECORD_TYPES))
  .min(1)
  .describe(
    `One or more record types this label type may be applied to. ${LABEL_RECORD_TYPES_DESC}`,
  );
const labelRecordTypesArrayOptionalSchema = z
  .array(z.enum(LABEL_RECORD_TYPES))
  .min(1)
  .optional()
  .describe(
    `One or more record types this label type may be applied to. ${LABEL_RECORD_TYPES_DESC}`,
  );

const idSchema = z
  .number()
  .int()
  .min(1)
  .describe('Numeric record ID (from a prior getAll result). Must be an integer.');
const optionalIdSchema = z
  .number()
  .int()
  .min(1)
  .optional()
  .describe('Numeric record ID (from a prior getAll result)');
const limitSchema = z
  .number()
  .int()
  .min(1)
  .max(100)
  .optional()
  .default(25)
  .describe(
    'Maximum records to return (default 25, max 100). Increase to 100 if you expect many matching records.',
  );
const companyIdSchema = z
  .number()
  .int()
  .min(1)
  .describe(
    'Numeric company ID. If unknown, call hudu_companies with operation getAll with search to find the company and get its id.',
  );
const optionalCompanyIdSchema = z
  .number()
  .int()
  .min(1)
  .optional()
  .describe(
    'Filter by numeric company ID. If unknown, call hudu_companies with operation getAll with search to find it.',
  );
const archivedSchema = z
  .boolean()
  .optional()
  .describe('Filter by archived status (true = archived only, false = active only, omit = all)');
const nameSchema = z.string().min(1).describe('Name');
const optionalNameSchema = z
  .string()
  .optional()
  .describe(
    'EXACT full-name match (case-sensitive). Rarely useful — use search for partial or fuzzy name lookups instead.',
  );

// Use when the resource has NO search field — name IS the only text filter, warn clearly
const optionalNameSchemaNoSearch = z
  .string()
  .optional()
  .describe(
    'EXACT full-name match (case-sensitive) — this is the only text-based filter for this resource. Must match the record name exactly including case.',
  );

// ---------------------------------------------------------------------------
// Get by ID
// ---------------------------------------------------------------------------

export function getGetSchema() {
  return z.object({
    id: idSchema,
  });
}

export function getPublicPhotosGetSchema() {
  return z.object({
    id: z
      .number()
      .int()
      .min(1)
      .describe(
        "Public photo numeric ID — the integer 'numeric_id' from a prior article or company response's 'public_photos' array. Returns slim METADATA (numeric_id, url, file_name, size) — NEVER binary image content. Slug display id, record_type, and record_id are stripped (caller already has the parent's context). Do NOT pass the slug string from '/public_photo/<slug>' HTML links — the API only accepts integers and returns 404 for slugs.",
      ),
  });
}

export function getArticlesGetSchema() {
  return z.object({
    id: idSchema,
    include_content: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Include the full HTML content field. Default false — article bodies consume significant context. Set true only when you need to read or quote the article body.",
      ),
    include_photos: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Include the 'public_photos' array (slim metadata for each embedded image: numeric_id, url, file_name, size). Default false — photo arrays can run to dozens of entries per article and waste context. Set true ONLY when you need to verify embedded photos exist before editing/redacting the article, or surface photo URLs to the user. Pair with include_content=true to coordinate edits with image references.",
      ),
    output_markdown: z
      .boolean()
      .optional()
      .describe(
        'Add a markdown_content field (or per-field markdown for assets) converted from the record HTML.',
      ),
    include_frontmatter: z
      .boolean()
      .optional()
      .describe(
        'Prepend a YAML frontmatter citation block to markdown_content. Requires output_markdown.',
      ),
  });
}

export function getAssetsGetSchema() {
  return z.object({
    id: idSchema,
    output_markdown: z
      .boolean()
      .optional()
      .describe(
        'Add a markdown_content field (or per-field markdown for assets) converted from the record HTML.',
      ),
    include_frontmatter: z
      .boolean()
      .optional()
      .describe(
        'Prepend a YAML frontmatter citation block to markdown_content. Requires output_markdown.',
      ),
  });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export function getDeleteSchema() {
  return z.object({
    id: idSchema,
  });
}

export function getDeleteWithCompanySchema() {
  return z.object({
    id: idSchema,
    company_id: companyIdSchema.describe('Company ID that owns this asset'),
  });
}

// ---------------------------------------------------------------------------
// Archive / Unarchive
// ---------------------------------------------------------------------------

export function getArchiveSchema() {
  return z.object({
    id: idSchema,
  });
}

export function getArchiveWithCompanySchema() {
  return z.object({
    id: idSchema,
    company_id: companyIdSchema.describe('Company ID that owns this asset'),
  });
}

// ---------------------------------------------------------------------------
// Resource-specific getAll schemas
// ---------------------------------------------------------------------------

export function getCompaniesGetAllSchema() {
  return z.object({
    search: z
      .string()
      .optional()
      .describe(
        'Partial text match across company name, city, phone, website, and other fields. ALWAYS use this first for any name or text lookup.',
      ),
    name: optionalNameSchema,
    slug: z.string().optional().describe('Filter by URL slug'),
    id_in_integration: z.string().optional().describe('Filter by integration ID'),
    city: z.string().optional().describe('Filter by city'),
    state: z.string().optional().describe('Filter by state/region'),
    phone_number: z.string().optional().describe('Filter by phone number'),
    website: z.string().optional().describe('Filter by website URL'),
    archived: archivedSchema,
    limit: limitSchema,
  });
}

export function getArticlesGetAllSchema() {
  return z.object({
    search: z
      .string()
      .optional()
      .describe(
        "Partial text match across article title AND body content. Results are re-ranked locally so any record whose title contains the full query as a substring is promoted ahead of body-only matches — exact-title lookups bubble to position 0. For known full titles prefer 'name' (same two-tier ranking, but skips body-only hits entirely).",
      ),
    name: z
      .string()
      .optional()
      .describe(
        "Article title to fuzzy-resolve to an ID. Sends your text as a search, fetches up to 100 candidates, and ranks results by how many title words match. Use this when you know the article title. Prefer over 'search' for title-based lookups.",
      ),
    company_id: optionalCompanyIdSchema,
    slug: z
      .string()
      .optional()
      .describe(
        "Filter by article slug — the 12-character short-hash that Hudu stores in the record's `slug` field (e.g. `22a0a2941fb1`). This is the FIRST path segment after `/kba/` in a Hudu URL: `/kba/{slug}/{seo-suffix}`. The trailing `{seo-suffix}` portion of the URL (derived from the article title) is NOT queryable — use `search` or `name` for title-based lookup instead. Get the short hash from a prior getAll result's `slug` field or from the URL.",
      ),
    draft: z.boolean().optional().describe('Filter by draft status'),
    folder_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        "Filter by folder ID. Hudu /articles does not accept folder_id as a native query param — applied as a bounded post-filter. When you do not also pass company_id, the folder is auto-resolved to its owning company_id (one extra API call) and that company is injected as a native upstream filter, which keeps the scan window tight even for sparse folders. For global folders (company_id null on the folder record) the bounded scan runs unnarrowed (up to 20 pages × 100 records). Result warnings document the auto-resolve and scan stats.",
      ),
    enable_sharing: z.boolean().optional().describe('Filter to publicly shareable articles only.'),
    updated_at_start: z
      .string()
      .optional()
      .describe(
        "ISO 8601 UTC datetime lower bound for updated_at filter, e.g. '2024-03-01T00:00:00Z'. Combine with updated_at_end for a range; omit for no lower bound. Use the reference UTC at the top of this description for relative dates.",
      ),
    updated_at_end: z
      .string()
      .optional()
      .describe(
        "ISO 8601 UTC datetime upper bound for updated_at filter, e.g. '2024-03-07T23:59:59Z'. Omit to mean up to now.",
      ),
    include_content: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Include the full HTML content field in each result. Default false — article bodies are large HTML that fills context quickly. Set true only when you need to read or quote the article body; otherwise leave false and call get with include_content=true for a specific article.",
      ),
    include_photos: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Include the 'public_photos' array on each result (slim metadata: numeric_id, url, file_name, size). Default false — photo arrays alone can run to dozens of objects per article and blow context budgets. Set true ONLY when you need to verify or surface embedded photo URLs. Use the dedicated hudu_public_photos tool for direct photo metadata when you have a numeric_id.",
      ),
    output_markdown: z
      .boolean()
      .optional()
      .describe(
        'Add a markdown_content field (or per-field markdown for assets) converted from the record HTML.',
      ),
    include_frontmatter: z
      .boolean()
      .optional()
      .describe(
        'Prepend a YAML frontmatter citation block to markdown_content. Requires output_markdown.',
      ),
    limit: limitSchema,
  });
}

export function getAssetsGetAllSchema() {
  return z.object({
    search: z
      .string()
      .optional()
      .describe(
        'Partial text match across asset name, serial number, model, and manufacturer. ALWAYS use this first for any name or text lookup.',
      ),
    name: optionalNameSchema,
    company_id: optionalCompanyIdSchema,
    asset_layout_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Filter by asset layout ID (asset type/category). Call hudu_asset_layouts with operation getAll to find available layouts.',
      ),
    primary_serial: z.string().optional().describe('Filter by primary serial number'),
    slug: z.string().optional().describe('Filter by URL slug'),
    archived: archivedSchema,
    output_markdown: z
      .boolean()
      .optional()
      .describe(
        'Add a markdown_content field (or per-field markdown for assets) converted from the record HTML.',
      ),
    include_frontmatter: z
      .boolean()
      .optional()
      .describe(
        'Prepend a YAML frontmatter citation block to markdown_content. Requires output_markdown.',
      ),
    limit: limitSchema,
  });
}

export function getWebsitesGetAllSchema() {
  return z.object({
    search: z
      .string()
      .optional()
      .describe(
        'Partial text match across website URL and other fields. ALWAYS use this first for any URL or text lookup.',
      ),
    name: optionalNameSchema,
    company_id: optionalCompanyIdSchema,
    slug: z.string().optional().describe('Filter by URL slug'),
    archived: archivedSchema,
    limit: limitSchema,
  });
}

export function getUsersGetAllSchema() {
  return z.object({
    search: z
      .string()
      .optional()
      .describe(
        'Partial text match across first name, last name, email, and other user fields. ALWAYS use this first for any name or email lookup.',
      ),
    first_name: z.string().optional().describe('Filter by exact first name'),
    last_name: z.string().optional().describe('Filter by exact last name'),
    email: z.string().email().optional().describe('Filter by email address'),
    limit: limitSchema,
  });
}

export function getAssetPasswordsGetAllSchema() {
  return z.object({
    search: z
      .string()
      .optional()
      .describe(
        'Partial text match across password entry name and other fields. ALWAYS use this first for any name or text lookup.',
      ),
    name: optionalNameSchema,
    company_id: optionalCompanyIdSchema,
    slug: z.string().optional().describe('Filter by URL slug'),
    archived: archivedSchema,
    limit: limitSchema,
  });
}

export function getProceduresGetAllSchema() {
  return z.object({
    name: optionalNameSchemaNoSearch,
    company_id: optionalCompanyIdSchema,
    slug: z.string().optional().describe('Filter by URL slug'),
    type: z
      .enum(PROCEDURE_TYPES)
      .optional()
      .describe('Filter by type: process (templates), run (active instances), or all (default)'),
    process_scope: z
      .enum(PROCEDURE_SCOPES)
      .optional()
      .describe('Filter processes by scope'),
    parent_process_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter runs by parent process ID'),
    created_at: z
      .string()
      .optional()
      .describe('Filter by creation date (YYYY-MM-DD or start,end range)'),
    archived: z
      .boolean()
      .optional()
      .describe('true = only archived, false = only non-archived (default)'),
    limit: limitSchema,
  });
}

export function getActivityLogsGetAllSchema() {
  return z.object({
    user_id: z.number().int().min(1).optional().describe('Filter by user ID'),
    user_email: z.string().optional().describe('Filter by user email'),
    resource_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter by resource numeric ID (use together with resource_type)'),
    resource_type: z
      .string()
      .optional()
      .describe(
        `Filter by resource type (pair with resource_id for a specific record). ${RESOURCE_TYPES_DESC}`,
      ),
    action_message: z
      .string()
      .optional()
      .describe('Filter by specific action performed (e.g. "created", "updated", "deleted")'),
    start_date: z
      .string()
      .optional()
      .describe('Filter logs from this date (ISO 8601, e.g. 2024-01-01)'),
    end_date: z
      .string()
      .optional()
      .describe('Filter logs until this date (ISO 8601, e.g. 2024-12-31)'),
    limit: limitSchema,
  });
}

export function getFoldersGetAllSchema() {
  return z.object({
    name: optionalNameSchemaNoSearch,
    company_id: optionalCompanyIdSchema,
    parent_folder_id: z.number().int().min(1).optional().describe('Filter by parent folder ID'),
    folder_type: z
      .enum(FOLDER_TYPES)
      .optional()
      .describe('Filter by folder type'),
    limit: limitSchema,
  });
}

export function getNetworksGetAllSchema() {
  return z.object({
    name: optionalNameSchemaNoSearch,
    company_id: optionalCompanyIdSchema,
    archived: archivedSchema,
    location_id: z.number().int().min(1).optional().describe('Filter by location ID'),
    network_type: z.number().int().optional().describe('Filter by network type'),
    limit: limitSchema,
  });
}

export function getIpAddressesGetAllSchema() {
  return z.object({
    address: z.string().optional().describe('Filter by IP address'),
    company_id: optionalCompanyIdSchema,
    network_id: z.number().int().min(1).optional().describe('Filter by network ID'),
    status: ipAddressStatusOptionalSchema,
    fqdn: z.string().optional().describe('Filter by FQDN (exact match)'),
    asset_id: z.number().int().min(1).optional().describe('Filter by asset ID'),
    limit: limitSchema,
  });
}

export function getAssetLayoutsGetAllSchema() {
  return z.object({
    name: optionalNameSchemaNoSearch,
    limit: limitSchema,
  });
}

export function getRelationsGetAllSchema() {
  return z.object({
    id: optionalIdSchema.describe('Filter by relation ID'),
    fromable_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter by source record numeric ID'),
    fromable_type: z
      .string()
      .optional()
      .describe(`Type of the source (from) record in this relation. ${RESOURCE_TYPES_DESC}`),
    toable_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter by target record numeric ID'),
    toable_type: z
      .string()
      .optional()
      .describe(`Type of the target (to) record in this relation. ${RESOURCE_TYPES_DESC}`),
    limit: limitSchema,
  });
}

export function getExpirationsGetAllSchema() {
  return z.object({
    company_id: optionalCompanyIdSchema,
    resource_type: z
      .string()
      .optional()
      .describe(`Filter by resource type. ${RESOURCE_TYPES_DESC}`),
    limit: limitSchema,
  });
}

export function getGroupsGetAllSchema() {
  return z.object({
    search: z
      .string()
      .optional()
      .describe(
        'Partial text match across group name and other fields. ALWAYS use this first for any name or text lookup.',
      ),
    name: optionalNameSchema,
    limit: limitSchema,
  });
}

export function getVlansGetAllSchema() {
  return z.object({
    name: optionalNameSchemaNoSearch,
    company_id: optionalCompanyIdSchema,
    vlan_zone_id: z.number().int().min(1).optional().describe('Filter by VLAN zone ID'),
    limit: limitSchema,
  });
}

export function getVlanZonesGetAllSchema() {
  return z.object({
    name: optionalNameSchemaNoSearch,
    company_id: optionalCompanyIdSchema,
    limit: limitSchema,
  });
}

export function getMatchersGetAllSchema() {
  return z.object({
    integration_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Filter matchers by integration. Check your Hudu integrations settings for the numeric integration ID.',
      ),
    limit: limitSchema,
  });
}

export function getPhotosGetAllSchema() {
  return z.object({
    company_id: optionalCompanyIdSchema,
    photoable_type: z
      .string()
      .optional()
      .describe(`Filter by parent record type. ${RESOURCE_TYPES_DESC}`),
    photoable_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter by parent record ID (use together with photoable_type)'),
    folder_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter by photo folder ID'),
    archived: archivedSchema,
    limit: limitSchema,
  });
}

export function getPublicPhotosGetAllSchema() {
  return z.object({
    record_type: z
      .string()
      .optional()
      .describe(
        "Filter by associated record type. Valid values: 'Article' (knowledge-base article), 'Company' (client company record). Case-sensitive exact match.",
      ),
    record_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        "Filter by the numeric ID of the associated record. Use together with record_type. Obtain from a prior getAll call on the relevant resource (e.g., hudu_articles or hudu_companies with operation 'getAll').",
      ),
    limit: limitSchema,
  });
}

export function getProcedureTasksGetAllSchema() {
  return z.object({
    procedure_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter by process/run ID. If unknown, call hudu_procedures with operation getAll to find it.'),
    name: optionalNameSchemaNoSearch,
    company_id: optionalCompanyIdSchema,
    limit: limitSchema,
  });
}

// ---------------------------------------------------------------------------
// Resource-specific create schemas
// ---------------------------------------------------------------------------

export function getCompaniesCreateSchema() {
  return z.object({
    name: nameSchema.describe('Company name'),
    company_type: z
      .string()
      .optional()
      .describe('Company type (e.g. Customer, Prospect, Vendor, Partner, Reseller, Internal)'),
    nickname: z.string().optional().describe('Short name or nickname'),
    phone_number: z.string().optional().describe('Phone number'),
    address_line_1: z.string().optional().describe('Address line 1'),
    address_line_2: z.string().optional().describe('Address line 2'),
    city: z.string().optional().describe('City'),
    state: z.string().optional().describe('State or region'),
    zip: z.string().optional().describe('ZIP / postal code'),
    country_name: z.string().optional().describe('Country name'),
    website: z.string().url().optional().describe('Company website URL'),
    notes: z.string().optional().describe('Notes'),
    fax_number: z.string().optional().describe('Fax number'),
    parent_company_id: z.number().int().min(1).optional().describe('Parent company ID'),
  });
}

export function getArticlesCreateSchema() {
  return z.object({
    name: nameSchema.describe('Article title'),
    content: z
      .string()
      .optional()
      .describe(
        "Article content. HTML by default; set content_format='markdown' to write Markdown instead — it is converted to HTML before saving.",
      ),
    content_format: z
      .enum(['html', 'markdown'])
      .optional()
      .describe("Format of the content field. 'markdown' is converted to HTML before saving. Default html."),
    global: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Set true to create a global (non-company) article accessible across all companies. ' +
        'When false (default), company_id or folder_id is required. ' +
        'This field is not sent to Hudu — it only controls how the executor resolves company context. ' +
        'global=true takes precedence over any provided company_id.',
      ),
    company_id: optionalCompanyIdSchema.describe(
      'Numeric company ID. Omit if folder_id is provided — auto-resolved from folder. ' +
      'If unknown, call hudu_companies_get_id_by_name to resolve company name to ID. ' +
      'Ignored when global=true.',
    ),
    folder_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Folder ID to place the article in. ' +
        'If provided without company_id, company_id is auto-resolved from the folder record (one internal API call). ' +
        'Always sent to Hudu regardless of how company_id was resolved.',
      ),
    enable_sharing: z.boolean().optional().describe('Whether to enable public sharing'),
  });
}

export function getAssetsCreateSchema() {
  return z.object({
    company_id: companyIdSchema,
    asset_layout_id: z
      .number()
      .int()
      .min(1)
      .describe(
        'Asset layout ID that defines the type and custom fields of this asset. If unknown, call hudu_asset_layouts with operation getAll to find available layouts and their IDs.',
      ),
    name: nameSchema.describe('Asset name'),
    primary_serial: z.string().optional().describe('Primary serial number'),
    primary_mail: z.string().optional().describe('Primary email address'),
    primary_model: z.string().optional().describe('Primary model'),
    primary_manufacturer: z.string().optional().describe('Primary manufacturer'),
    custom_fields: z
      .array(z.record(z.string(), z.unknown()))
      .optional()
      .describe('Custom field values as array of objects with asset_layout_field_id (numeric) and value. Each object: { "asset_layout_field_id": <number>, "value": <value> }. Call hudu_asset_layouts with operation get and the layout ID to discover available field IDs.'),
  });
}

export function getWebsitesCreateSchema() {
  return z.object({
    name: z
      .string()
      .min(1)
      .describe(
        'Full URL of the website including protocol — MUST start with https:// or http:// (e.g. https://example.com). This is NOT a display name; it is the URL Hudu will monitor.',
      ),
    company_id: companyIdSchema,
    notes: z.string().optional().describe('Notes'),
    keyword: z.string().optional().describe('Keyword to monitor on the page'),
    monitor_type: z.number().int().optional().describe('Monitor type'),
    paused: z.boolean().optional().describe('Whether to pause monitoring'),
    archived: z.boolean().optional().describe('When true, the website is archived'),
    disable_dns: z.boolean().optional().describe('Whether to disable DNS checks'),
    disable_ssl: z.boolean().optional().describe('Whether to disable SSL checks'),
    disable_whois: z.boolean().optional().describe('Whether to disable WHOIS checks'),
    enable_dmarc_tracking: z.boolean().optional().describe('Whether to enable DMARC tracking'),
    enable_dkim_tracking: z.boolean().optional().describe('Whether to enable DKIM tracking'),
    enable_spf_tracking: z.boolean().optional().describe('Whether to enable SPF tracking'),
  });
}

export function getAssetPasswordsCreateSchema() {
  return z.object({
    name: nameSchema.describe('Password entry name'),
    company_id: companyIdSchema,
    password: z.string().describe('The password value'),
    username: z.string().optional().describe('Username'),
    url: z.string().optional().describe('Related URL'),
    description: z.string().optional().describe('Description'),
    asset_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Asset ID to associate with. If unknown, call hudu_assets with operation getAll with search to find it.',
      ),
    passwordable_type: z
      .string()
      .optional()
      .describe(`Type of record this password is attached to. ${RESOURCE_TYPES_DESC}`),
    passwordable_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Resource ID this password belongs to'),
    password_type: z.string().optional().describe('Password type'),
    password_folder_id: z.number().int().min(1).optional().describe('Password folder ID'),
    login_url: z.string().optional().describe('Login URL'),
    in_portal: z.boolean().optional().describe('Whether visible in portal'),
    otp_secret: z.string().optional().describe('OTP secret for 2FA'),
  });
}

export function getProceduresCreateSchema() {
  return z.object({
    name: nameSchema.describe('Procedure name'),
    company_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Company ID to scope this procedure to. Omit or null = global template. If unknown, call hudu_companies with operation getAll with search to find it.',
      ),
    description: z.string().optional().describe('Procedure description'),
  });
}

export function getFoldersCreateSchema() {
  return z.object({
    name: nameSchema.describe('Folder name'),
    company_id: optionalCompanyIdSchema,
    description: z.string().optional().describe('Folder description'),
    parent_folder_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Parent folder ID. If unknown, call hudu_folders with operation getAll with the name filter to find it.',
      ),
    folder_type: z
      .enum(FOLDER_TYPES)
      .optional()
      .describe('Type of folder (immutable after creation, defaults to article)'),
    icon: z.string().optional().describe('Icon name'),
  });
}

export function getNetworksCreateSchema() {
  return z.object({
    name: nameSchema.describe('Network name'),
    company_id: companyIdSchema,
    network_type: z.number().int().optional().describe('Network type'),
    address: z.string().describe('Network address (CIDR notation, e.g. 192.168.1.0/24)'),
    description: z.string().optional().describe('Description'),
    location_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Location ID. Check your Hudu settings or existing networks for valid location IDs.',
      ),
    notes: z.string().optional().describe('Notes (rich text)'),
    status_list_item_id: z.number().int().min(1).optional().describe('Status list item ID'),
    role_list_item_id: z.number().int().min(1).optional().describe('Role list item ID'),
  });
}

export function getIpAddressesCreateSchema() {
  return z.object({
    address: z.string().describe('IP address'),
    company_id: companyIdSchema,
    status: ipAddressStatusSchema,
    network_id: z.number().int().min(1).optional().describe('Network ID this IP belongs to'),
    description: z.string().optional().describe('Description'),
    fqdn: z.string().optional().describe('Fully qualified domain name'),
    asset_id: z.number().int().min(1).optional().describe('Asset ID to associate with'),
    skip_dns_validation: z.boolean().optional().describe('Whether to skip DNS validation'),
  });
}

export function getRelationsCreateSchema() {
  return z.object({
    fromable_id: z.number().int().min(1).describe('Numeric ID of the source record'),
    fromable_type: z
      .string()
      .describe(`Type of the source (from) record in this relation. ${RESOURCE_TYPES_DESC}`),
    toable_id: z.number().int().min(1).describe('Numeric ID of the target record'),
    toable_type: z
      .string()
      .describe(`Type of the target (to) record in this relation. ${RESOURCE_TYPES_DESC}`),
    is_inverse: z.boolean().optional().describe('Whether this is an inverse relation'),
    description: z.string().optional().describe('Relation description'),
  });
}

export function getVlansCreateSchema() {
  return z.object({
    name: nameSchema.describe('VLAN name'),
    company_id: companyIdSchema,
    vlan_id: z.number().int().min(1).max(4094).optional().describe('VLAN ID (1–4094)'),
    vlan_zone_id: z.number().int().min(1).optional().describe('VLAN zone ID'),
    description: z.string().optional().describe('Description'),
    notes: z.string().optional().describe('Notes (rich text)'),
    status_list_item_id: z.number().int().min(1).optional().describe('Status list item ID'),
    role_list_item_id: z.number().int().min(1).optional().describe('Role list item ID'),
  });
}

export function getVlanZonesCreateSchema() {
  return z.object({
    name: nameSchema.describe('VLAN zone name'),
    company_id: optionalCompanyIdSchema,
    vlan_id_ranges: z
      .string()
      .describe('Comma-separated VLAN ID ranges (e.g. "100-500,1000-1500")'),
    description: z.string().optional().describe('Description'),
  });
}

// ---------------------------------------------------------------------------
// Resource-specific update schemas (same fields as create, all optional except id)
// ---------------------------------------------------------------------------

export function getCompaniesUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('Company name'),
    company_type: z
      .string()
      .optional()
      .describe('Company type (e.g. Customer, Prospect, Vendor, Partner, Reseller, Internal)'),
    nickname: z.string().optional().describe('Short name or nickname'),
    phone_number: z.string().optional().describe('Phone number'),
    address_line_1: z.string().optional().describe('Address line 1'),
    address_line_2: z.string().optional().describe('Address line 2'),
    city: z.string().optional().describe('City'),
    state: z.string().optional().describe('State or region'),
    zip: z.string().optional().describe('ZIP / postal code'),
    country_name: z.string().optional().describe('Country name'),
    website: z.string().url().optional().describe('Company website URL'),
    notes: z.string().optional().describe('Notes'),
    fax_number: z.string().optional().describe('Fax number'),
    parent_company_id: z.number().int().min(1).optional().describe('Parent company ID'),
  });
}

export function getArticlesUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('Article title'),
    content: z
      .string()
      .optional()
      .describe(
        "Article content. HTML by default; set content_format='markdown' to write Markdown instead — it is converted to HTML before saving.",
      ),
    content_format: z
      .enum(['html', 'markdown'])
      .optional()
      .describe("Format of the content field. 'markdown' is converted to HTML before saving. Default html."),
    company_id: optionalCompanyIdSchema,
    folder_id: z.number().int().min(1).optional().describe('Folder ID'),
    enable_sharing: z.boolean().optional().describe('Whether to enable public sharing'),
    draft: z.boolean().optional().describe('Whether the article is a draft'),
  });
}

export function getAssetsUpdateSchema() {
  return z.object({
    id: idSchema,
    company_id: companyIdSchema.describe('Company ID that owns this asset (required for routing)'),
    name: z.string().optional().describe('Asset name'),
    primary_serial: z.string().optional().describe('Primary serial number'),
    primary_mail: z.string().optional().describe('Primary email address'),
    primary_model: z.string().optional().describe('Primary model'),
    primary_manufacturer: z.string().optional().describe('Primary manufacturer'),
    custom_fields: z
      .array(z.record(z.string(), z.unknown()))
      .optional()
      .describe('Custom field values as array of objects with asset_layout_field_id (numeric) and value. Each object: { "asset_layout_field_id": <number>, "value": <value> }. Call hudu_asset_layouts with operation get and the layout ID to discover available field IDs.'),
  });
}

export function getWebsitesUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z
      .string()
      .optional()
      .describe(
        'Full URL of the website including protocol — MUST start with https:// or http:// if provided (e.g. https://example.com)',
      ),
    notes: z.string().optional().describe('Notes'),
    paused: z.boolean().optional().describe('Whether monitoring is paused'),
    archived: z.boolean().optional().describe('When true, the website is archived'),
    keyword: z.string().optional().describe('Keyword to monitor on the page'),
    monitor_type: z.number().int().optional().describe('Monitor type'),
    disable_dns: z.boolean().optional().describe('Whether to disable DNS checks'),
    disable_ssl: z.boolean().optional().describe('Whether to disable SSL checks'),
    disable_whois: z.boolean().optional().describe('Whether to disable WHOIS checks'),
    enable_dmarc_tracking: z.boolean().optional().describe('Whether to enable DMARC tracking'),
    enable_dkim_tracking: z.boolean().optional().describe('Whether to enable DKIM tracking'),
    enable_spf_tracking: z.boolean().optional().describe('Whether to enable SPF tracking'),
  });
}

export function getAssetPasswordsUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('Password entry name'),
    password: z.string().optional().describe('The password value'),
    username: z.string().optional().describe('Username'),
    url: z.string().optional().describe('Related URL'),
    description: z.string().optional().describe('Description'),
    passwordable_type: z
      .string()
      .optional()
      .describe(`Type of record this password is attached to. ${RESOURCE_TYPES_DESC}`),
    passwordable_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Resource ID this password belongs to'),
    password_type: z.string().optional().describe('Password type'),
    password_folder_id: z.number().int().min(1).optional().describe('Password folder ID'),
    login_url: z.string().optional().describe('Login URL'),
    in_portal: z.boolean().optional().describe('Whether visible in portal'),
    otp_secret: z.string().optional().describe('OTP secret for 2FA'),
  });
}

export function getProceduresUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('The new name for the process or run.'),
    description: z
      .string()
      .optional()
      .describe(
        'For processes: the process description. Runs snapshot the parent process description at kickoff; that text is not editable in the product UI — avoid relying on changing this field for runs.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'When true, archives the company process; when false, unarchives it. Only company processes are affected — global processes and runs cannot be archived via this parameter (runs follow the parent process). To place a process under a company, use create_from_template or duplicate — company_id is not accepted on update.',
      ),
  });
}

export function getFoldersUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('Folder name'),
    company_id: z.number().int().min(1).optional().describe('Company ID'),
    description: z.string().optional().describe('Folder description'),
    parent_folder_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Parent folder ID. If unknown, call hudu_folders with operation getAll with the name filter to find it.',
      ),
    icon: z.string().optional().describe('Icon name'),
  });
}

export function getNetworksUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('Network name'),
    company_id: z.number().int().min(1).optional().describe('Company ID'),
    network_type: z.number().int().optional().describe('Network type'),
    address: z.string().optional().describe('Network address (CIDR)'),
    description: z.string().optional().describe('Description'),
    location_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Location ID. Check your Hudu settings or existing networks for valid location IDs.',
      ),
    notes: z.string().optional().describe('Notes (rich text)'),
    archived: z.boolean().optional().describe('Whether the network is archived'),
    status_list_item_id: z.number().int().min(1).optional().describe('Status list item ID'),
    role_list_item_id: z.number().int().min(1).optional().describe('Role list item ID'),
  });
}

export function getIpAddressesUpdateSchema() {
  return z.object({
    id: idSchema,
    address: z.string().optional().describe('IP address'),
    company_id: z.number().int().min(1).optional().describe('Company ID'),
    network_id: z.number().int().min(1).optional().describe('Network ID this IP belongs to'),
    status: ipAddressStatusOptionalSchema,
    description: z.string().optional().describe('Description'),
    fqdn: z.string().optional().describe('Fully qualified domain name'),
    asset_id: z.number().int().min(1).optional().describe('Asset ID to associate with'),
    skip_dns_validation: z.boolean().optional().describe('Whether to skip DNS validation'),
  });
}

export function getExpirationsUpdateSchema() {
  return z.object({
    id: idSchema,
    expiration_date: z.string().optional().describe('Expiration date (ISO 8601)'),
    expiration_type: z.string().optional().describe('Type of expiration'),
    notes: z.string().optional().describe('Notes'),
  });
}

export function getVlansUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('VLAN name'),
    company_id: z.number().int().min(1).optional().describe('Company ID'),
    vlan_id: z.number().int().min(1).max(4094).optional().describe('VLAN ID (1–4094)'),
    vlan_zone_id: z.number().int().min(1).optional().describe('VLAN zone ID'),
    description: z.string().optional().describe('Description'),
    notes: z.string().optional().describe('Notes (rich text)'),
    status_list_item_id: z.number().int().min(1).optional().describe('Status list item ID'),
    role_list_item_id: z.number().int().min(1).optional().describe('Role list item ID'),
  });
}

export function getVlanZonesUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('VLAN zone name'),
    description: z.string().optional().describe('Description'),
    vlan_id_ranges: z.string().optional().describe('Comma-separated VLAN ID ranges'),
    archived: z.boolean().optional().describe('Whether this zone is archived'),
  });
}

export function getMatchersUpdateSchema() {
  return z.object({
    id: idSchema,
    company_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Company ID to map this matcher to'),
    potential_company_id: z.number().int().min(1).optional().describe('Potential company ID'),
    sync_id: z.number().int().min(1).optional().describe('Sync ID'),
    identifier: z.string().optional().describe('Identifier string'),
  });
}

export function getLabelTypesGetAllSchema() {
  return z.object({
    name: optionalNameSchemaNoSearch,
    color: z
      .string()
      .optional()
      .describe('Filter by exact color value (e.g. #0000ff)'),
    slug: z.string().optional().describe('Filter by exact slug value'),
    created_at: z
      .string()
      .optional()
      .describe('Filter by creation date (YYYY-MM-DD or ISO datetime)'),
    updated_at: z
      .string()
      .optional()
      .describe('Filter by update date (YYYY-MM-DD or ISO datetime)'),
    limit: limitSchema,
  });
}

export function getLabelsGetAllSchema() {
  return z.object({
    label_type_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Filter by label type ID. If unknown, call hudu_label_types with operation getAll first.',
      ),
    labelable_type: labelRecordTypeOptionalSchema,
    labelable_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter by the ID of the labeled record'),
    user_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Filter by the ID of the user who applied the label'),
    created_at: z
      .string()
      .optional()
      .describe('Filter by creation date (YYYY-MM-DD or ISO datetime)'),
    updated_at: z
      .string()
      .optional()
      .describe('Filter by update date (YYYY-MM-DD or ISO datetime)'),
    limit: limitSchema,
  });
}

export function getLabelTypesCreateSchema() {
  return z.object({
    name: nameSchema.describe('Label type name (must be unique)'),
    color: z
      .string()
      .min(1)
      .describe('Hex color value (e.g. #0000ff). Accepts 3- or 6-digit hex.'),
    applicable_record_types: labelRecordTypesArraySchema,
    access_level: z
      .enum(['all_companies', 'specific_companies'])
      .optional()
      .describe(
        'Values: all_companies (available to every company — default), specific_companies (restricted to allowed_company_ids).',
      ),
    allowed_company_ids: z
      .array(z.number().int().min(1))
      .optional()
      .describe(
        'Company IDs to restrict the label type to. Required when access_level is specific_companies; ignored when all_companies. If unknown, call hudu_companies with operation getAll with search.',
      ),
  });
}

export function getLabelsCreateSchema() {
  return z.object({
    label_type_id: z
      .number()
      .int()
      .min(1)
      .describe(
        'ID of the label type to apply. If unknown, call hudu_label_types with operation getAll to find it.',
      ),
    labelable_type: labelRecordTypeSchema,
    labelable_id: z
      .number()
      .int()
      .min(1)
      .describe('Numeric ID of the record being labeled (from a prior getAll on that resource)'),
    user_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Optional ID of the user applying the label'),
  });
}

export function getLabelTypesUpdateSchema() {
  return z.object({
    id: idSchema,
    name: z.string().optional().describe('Label type name'),
    color: z
      .string()
      .optional()
      .describe('Hex color value (e.g. #0000ff). Accepts 3- or 6-digit hex.'),
    applicable_record_types: labelRecordTypesArrayOptionalSchema,
    access_level: z
      .enum(['all_companies', 'specific_companies'])
      .optional()
      .describe(
        'Values: all_companies (available to every company), specific_companies (restricted to allowed_company_ids).',
      ),
    allowed_company_ids: z
      .array(z.number().int().min(1))
      .optional()
      .describe(
        'Company IDs to restrict the label type to. Required when access_level is specific_companies.',
      ),
  });
}

export function getLabelsUpdateSchema() {
  return z.object({
    id: idSchema,
    label_type_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('ID of the label type to apply'),
    labelable_type: labelRecordTypeOptionalSchema,
    labelable_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Numeric ID of the record being labeled'),
    user_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Optional ID of the user applying the label'),
  });
}

const OPERATION_LABELS: Record<HuduOperation, string> = {
  get: 'Get by ID',
  getAll: 'Get many',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  archive: 'Archive',
  unarchive: 'Unarchive',
  getIdByName: 'Resolve name to ID',
  move: 'Move asset',
  getByLayout: 'Assets by layout',
  help: 'Help / workflow notes',
  describeFields: 'Describe schema fields',
};

const SUPPORTED_OPERATIONS: ReadonlySet<HuduOperation> = new Set([
  'get',
  'getAll',
  'create',
  'update',
  'delete',
  'archive',
  'unarchive',
  'getIdByName',
  'move',
  'getByLayout',
  'help',
  'describeFields',
]);

// Resources whose getIdByName uses EXACT case-sensitive match upstream
// (mirrors enrichment-executor.ts EXACT_MATCH_RESOURCES, keyed by plural HuduResourceConfig name)
const GETIDBYNAME_EXACT_MATCH_RESOURCES: ReadonlySet<string> = new Set([
  'asset_layouts',
  'folders',
  'networks',
  'procedures',
  'vlans',
  'vlan_zones',
]);

export function getGetIdByNameSchema(resource: string): z.ZodObject<z.ZodRawShape> {
  const isExact = GETIDBYNAME_EXACT_MATCH_RESOURCES.has(resource);
  const nameDesc = isExact
    ? 'Name to resolve — EXACT case-sensitive match required (used by getIdByName operation).'
    : 'Name or partial name to resolve (fuzzy/partial match — used by getIdByName operation). Shorter terms return more results.';
  return z.object({
    name: z.string().min(1).describe(nameDesc),
    limit: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .default(5)
      .describe('Maximum number of matching records to return for getIdByName (default 5, max 20).'),
  });
}

export function getMoveAssetSchema() {
  return z.object({
    asset_id: z
      .number()
      .int()
      .min(1)
      .describe('Numeric ID of the asset to move (from a prior getAll or get result).'),
    target_company_id: z
      .number()
      .int()
      .min(1)
      .describe(
        "Numeric ID of the destination company. Use hudu_companies with operation getIdByName if you only have the company name.",
      ),
    delete_original: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'If true (default), delete the original asset after successful creation at the target company. ' +
          'Set to false to create a copy without deleting the original — useful for verifying the move before committing.',
      ),
  });
}

/**
 * Per-resource map of help topics. Mirrors `HELP_TOPICS` in help-registry.ts so the
 * schema can declare the valid enum. Kept here (not imported) to avoid coupling the
 * runtime schema converter to the help-content module.
 */
const HELP_TOPIC_ENUM: Record<string, readonly [string, ...string[]]> = {
  articles: ['overview', 'photos', 'search', 'create'],
  public_photos: ['overview'],
  companies: ['overview'],
  folders: ['overview'],
  websites: ['overview'],
  procedures: ['overview'],
  procedure_tasks: ['overview'],
  relations: ['overview'],
};

export function getHelpSchema(resource: string) {
  const topics = HELP_TOPIC_ENUM[resource];
  if (topics) {
    return z.object({
      topic: z
        .enum(topics)
        .optional()
        .default('overview')
        .describe(
          `Help topic. Default 'overview'. Available: ${topics.join(', ')}. Returns long-form workflow prose.`,
        ),
    });
  }
  return z.object({
    topic: z
      .string()
      .optional()
      .describe("Help topic. Default 'overview' if omitted."),
  });
}

export function getByLayoutSchema() {
  return z.object({
    company_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Numeric company ID. Provide this OR company_name (if both given, company_id takes precedence). Used by getByLayout.',
      ),
    company_name: z
      .string()
      .min(1)
      .optional()
      .describe('Company name (partial search) for getByLayout. Used only when company_id is not provided.'),
    layout_id: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Numeric asset layout ID. Provide this OR layout_name. Used by getByLayout.'),
    layout_name: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Asset layout name — EXACT case-sensitive match for getByLayout. Used only when layout_id is not provided. ' +
          'If unsure of the exact name, use hudu_asset_layouts with operation getIdByName first.',
      ),
    search: z
      .string()
      .optional()
      .describe(
        'Optional partial-text filter applied to the asset list within the resolved company+layout result set (used by getByLayout). Matches the upstream Hudu /assets search semantics.',
      ),
    limit: limitSchema,
    include_archived: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'If true, include archived assets in getByLayout results. Default false (active assets only).',
      ),
  });
}

function isHuduOperation(operation: string): operation is HuduOperation {
  return SUPPORTED_OPERATIONS.has(operation as HuduOperation);
}

function getGetAllSchemaForResource(resource: string): z.ZodObject<z.ZodRawShape> {
  switch (resource) {
    case 'companies':
      return getCompaniesGetAllSchema();
    case 'articles':
      return getArticlesGetAllSchema();
    case 'assets':
      return getAssetsGetAllSchema();
    case 'websites':
      return getWebsitesGetAllSchema();
    case 'users':
      return getUsersGetAllSchema();
    case 'asset_passwords':
      return getAssetPasswordsGetAllSchema();
    case 'procedures':
      return getProceduresGetAllSchema();
    case 'activity_logs':
      return getActivityLogsGetAllSchema();
    case 'folders':
      return getFoldersGetAllSchema();
    case 'networks':
      return getNetworksGetAllSchema();
    case 'ip_addresses':
      return getIpAddressesGetAllSchema();
    case 'asset_layouts':
      return getAssetLayoutsGetAllSchema();
    case 'relations':
      return getRelationsGetAllSchema();
    case 'expirations':
      return getExpirationsGetAllSchema();
    case 'groups':
      return getGroupsGetAllSchema();
    case 'vlans':
      return getVlansGetAllSchema();
    case 'vlan_zones':
      return getVlanZonesGetAllSchema();
    case 'matchers':
      return getMatchersGetAllSchema();
    case 'photos':
      return getPhotosGetAllSchema();
    case 'public_photos':
      return getPublicPhotosGetAllSchema();
    case 'procedure_tasks':
      return getProcedureTasksGetAllSchema();
    case 'label_types':
      return getLabelTypesGetAllSchema();
    case 'labels':
      return getLabelsGetAllSchema();
    default:
      return getAssetLayoutsGetAllSchema();
  }
}

function getCreateSchemaForResource(resource: string): z.ZodObject<z.ZodRawShape> {
  switch (resource) {
    case 'companies':
      return getCompaniesCreateSchema();
    case 'articles':
      return getArticlesCreateSchema();
    case 'assets':
      return getAssetsCreateSchema();
    case 'websites':
      return getWebsitesCreateSchema();
    case 'asset_passwords':
      return getAssetPasswordsCreateSchema();
    case 'procedures':
      return getProceduresCreateSchema();
    case 'folders':
      return getFoldersCreateSchema();
    case 'networks':
      return getNetworksCreateSchema();
    case 'ip_addresses':
      return getIpAddressesCreateSchema();
    case 'relations':
      return getRelationsCreateSchema();
    case 'vlans':
      return getVlansCreateSchema();
    case 'vlan_zones':
      return getVlanZonesCreateSchema();
    case 'label_types':
      return getLabelTypesCreateSchema();
    case 'labels':
      return getLabelsCreateSchema();
    default:
      return getCompaniesCreateSchema();
  }
}

function getUpdateSchemaForResource(resource: string): z.ZodObject<z.ZodRawShape> {
  switch (resource) {
    case 'companies':
      return getCompaniesUpdateSchema();
    case 'articles':
      return getArticlesUpdateSchema();
    case 'assets':
      return getAssetsUpdateSchema();
    case 'websites':
      return getWebsitesUpdateSchema();
    case 'asset_passwords':
      return getAssetPasswordsUpdateSchema();
    case 'procedures':
      return getProceduresUpdateSchema();
    case 'folders':
      return getFoldersUpdateSchema();
    case 'networks':
      return getNetworksUpdateSchema();
    case 'ip_addresses':
      return getIpAddressesUpdateSchema();
    case 'expirations':
      return getExpirationsUpdateSchema();
    case 'vlans':
      return getVlansUpdateSchema();
    case 'vlan_zones':
      return getVlanZonesUpdateSchema();
    case 'matchers':
      return getMatchersUpdateSchema();
    case 'label_types':
      return getLabelTypesUpdateSchema();
    case 'labels':
      return getLabelsUpdateSchema();
    default:
      return getCompaniesUpdateSchema();
  }
}

function getSchemaForOperation(
  resource: string,
  operation: HuduOperation,
  config: { requiresCompanyEndpoint?: boolean },
): z.ZodObject<z.ZodRawShape> {
  switch (operation) {
    case 'get':
      if (resource === 'articles') return getArticlesGetSchema();
      if (resource === 'assets') return getAssetsGetSchema();
      if (resource === 'public_photos') return getPublicPhotosGetSchema();
      return getGetSchema();
    case 'getAll':
      return getGetAllSchemaForResource(resource);
    case 'create':
      return getCreateSchemaForResource(resource);
    case 'update':
      return getUpdateSchemaForResource(resource);
    case 'delete':
      return config.requiresCompanyEndpoint ? getDeleteWithCompanySchema() : getDeleteSchema();
    case 'archive':
    case 'unarchive':
      return config.requiresCompanyEndpoint ? getArchiveWithCompanySchema() : getArchiveSchema();
    case 'getIdByName':
      return getGetIdByNameSchema(resource);
    case 'move':
      return getMoveAssetSchema();
    case 'getByLayout':
      return getByLayoutSchema();
    case 'help':
      return getHelpSchema(resource);
    case 'describeFields':
      return z.object({
        targetOperation: z
          .string()
          .optional()
          .describe('Operation whose fields to describe (e.g. getAll, create, update). Defaults to getAll.'),
      });
  }
}

export function buildUnifiedSchema(
  resource: string,
  operations: string[],
  config: {
    requiresCompanyEndpoint?: boolean;
    supportsContentField?: boolean;
    supportsPhotosField?: boolean;
  },
): z.ZodObject<z.ZodRawShape> {
  const cacheKey = _readOnlyCacheKey(resource, operations, config);
  const cached = _readOnlySchemaCache.get(cacheKey);
  if (cached) return cached;

  const enabledOps = Array.from(new Set(operations.filter(isHuduOperation)));

  if (enabledOps.length === 0) {
    return z.object({
      operation: z.string().describe('Operation to perform'),
    });
  }

  const operationEnum = z
    .enum(enabledOps as [HuduOperation, ...HuduOperation[]])
    .describe(`Operation to perform. Allowed values: ${enabledOps.join(', ')}.`);

  const fieldSources = new Map<string, z.ZodTypeAny>();
  const fieldOps = new Map<string, Set<HuduOperation>>();

  for (const operation of enabledOps) {
    const schema = getSchemaForOperation(resource, operation, config);
    for (const [field, fieldSchema] of Object.entries(schema.shape)) {
      if (!fieldSources.has(field)) {
        fieldSources.set(field, fieldSchema as z.ZodTypeAny);
      }
      if (!fieldOps.has(field)) {
        fieldOps.set(field, new Set<HuduOperation>());
      }
      fieldOps.get(field)?.add(operation);
    }
  }

  const mergedShape: Record<string, z.ZodTypeAny> = {
    operation: operationEnum,
  };

  for (const [field, fieldSchema] of fieldSources.entries()) {
    const opsForField = Array.from(fieldOps.get(field) ?? []);
    const baseDescription = fieldSchema.description ?? '';
    const opsDescription = `Used by operations: ${opsForField
      .map((op) => OPERATION_LABELS[op] ?? op)
      .join(', ')}.`;
    const description = baseDescription ? `${baseDescription} ${opsDescription}` : opsDescription;
    const mergedField = fieldSchema.optional().describe(description);
    mergedShape[field] = mergedField;
  }

  const result = z.object(mergedShape);
  if (_readOnlySchemaCache.size >= READONLY_SCHEMA_CACHE_MAX) {
    const firstKey = _readOnlySchemaCache.keys().next().value;
    if (firstKey !== undefined) _readOnlySchemaCache.delete(firstKey);
  }
  _readOnlySchemaCache.set(cacheKey, result);
  return result;
}

// ---------------------------------------------------------------------------
// Schema introspection — used by execute() describeFields operation
// ---------------------------------------------------------------------------

export interface FieldDescriptor {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object' | 'unknown';
  required: boolean;
  description?: string;
  enumValues?: string[];
}

function zodTypeToFieldType(schema: z.ZodTypeAny): FieldDescriptor['type'] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeName = (schema._def as any)?.typeName as string | undefined;
  if (typeName === 'ZodString') return 'string';
  if (typeName === 'ZodNumber') return 'number';
  if (typeName === 'ZodBoolean') return 'boolean';
  if (typeName === 'ZodEnum') return 'enum';
  if (typeName === 'ZodArray') return 'array';
  if (typeName === 'ZodObject') return 'object';
  return 'unknown';
}

function isRequiredField(schema: z.ZodTypeAny): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeName = (schema._def as any)?.typeName as string | undefined;
  return typeName !== 'ZodOptional' && typeName !== 'ZodNullable' && typeName !== 'ZodDefault';
}

function unwrapField(schema: z.ZodTypeAny): z.ZodTypeAny {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeName = (schema._def as any)?.typeName as string | undefined;
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return unwrapField((schema._def as any).innerType as z.ZodTypeAny);
  }
  return schema;
}

/**
 * Describe the fields of a per-operation schema for a resource.
 * Walks the raw (pre-runtime-conversion) ZodObject from getSchemaForOperation.
 * Returns [] if no schema builder exists for the (resource, operation) pair.
 *
 * IMPORTANT: does NOT walk buildUnifiedSchema — that wraps all fields in .optional().
 * This walks the per-op source schema to get accurate required/optional info.
 */
export function describeSchemaFields(resource: string, operation: string): FieldDescriptor[] {
  if (!isHuduOperation(operation)) return [];
  // config with requiresCompanyEndpoint=false is sufficient for field shape introspection
  // (the flag only changes whether a company_id field is added, not existing fields)
  const config = { requiresCompanyEndpoint: false };
  let schema: z.ZodObject<z.ZodRawShape>;
  try {
    schema = getSchemaForOperation(resource, operation as HuduOperation, config);
  } catch {
    return [];
  }

  const shape =
    typeof schema._def.shape === 'function' ? schema._def.shape() : schema._def.shape;
  const fields: FieldDescriptor[] = [];

  for (const [name, rawField] of Object.entries(shape ?? {})) {
    const field = rawField as z.ZodTypeAny;
    const required = isRequiredField(field);
    const inner = unwrapField(field);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const innerDef = inner._def as any;
    const enumValues: string[] | undefined =
      innerDef?.typeName === 'ZodEnum' ? (innerDef.values as string[]) : undefined;

    fields.push({
      name,
      type: zodTypeToFieldType(inner),
      required,
      description: field.description ?? inner.description,
      enumValues,
    });
  }

  return fields;
}

// Convert local zod schemas into the runtime zod class tree that n8n loaded.
// This keeps strict field contracts while avoiding cross-install instanceof failures.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRuntimeZodSchema(schema: any, runtimeZ: RuntimeZod): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = schema?._def as any;
  // Zod v4 uses _def.type (string); v3 uses _def.typeName. Support both.
  const typeName = (def?.typeName ?? def?.type) as string | undefined;
  let converted: unknown;

  switch (typeName) {
    case 'ZodString':
    case 'string': {
      let s = runtimeZ.string();
      // v3: check.kind/check.value; v4: check._zod?.def ?? check
      for (const rawCheck of def.checks ?? []) {
        const check = rawCheck?._zod?.def ?? rawCheck;
        switch (check.kind ?? check.type) {
          case 'min':
            s = s.min(check.value ?? check.minimum);
            break;
          case 'max':
            s = s.max(check.value ?? check.maximum);
            break;
          case 'email':
            s = s.email();
            break;
          case 'url':
            s = s.url();
            break;
          case 'uuid':
            s = s.uuid();
            break;
          default:
            break;
        }
      }
      converted = s;
      break;
    }
    case 'ZodNumber':
    case 'number': {
      let n = runtimeZ.number();
      for (const rawCheck of def.checks ?? []) {
        const check = rawCheck?._zod?.def ?? rawCheck;
        switch (check.kind ?? check.type) {
          case 'int':
            n = n.int();
            break;
          case 'min':
            n =
              check.inclusive === false
                ? n.gt(check.value ?? check.minimum)
                : n.min(check.value ?? check.minimum);
            break;
          case 'max':
            n =
              check.inclusive === false
                ? n.lt(check.value ?? check.maximum)
                : n.max(check.value ?? check.maximum);
            break;
          default:
            break;
        }
      }
      converted = n;
      break;
    }
    case 'ZodBoolean':
    case 'boolean':
      converted = runtimeZ.boolean();
      break;
    case 'ZodUnknown':
    case 'unknown':
      converted = runtimeZ.unknown();
      break;
    case 'ZodArray':
    case 'array': {
      // v3: def.type; v4: def.element
      const itemSchema = def.element ?? def.type;
      converted = runtimeZ.array(toRuntimeZodSchema(itemSchema, runtimeZ));
      break;
    }
    case 'ZodEnum':
    case 'enum': {
      // v3: def.values; v4: schema.options or def.entries
      const values =
        def.values ??
        (schema.options as string[] | undefined) ??
        Object.keys(def.entries ?? {});
      converted = runtimeZ.enum(values as [string, ...string[]]);
      break;
    }
    case 'ZodRecord':
    case 'record': {
      const keySchema = def.keyType ? toRuntimeZodSchema(def.keyType, runtimeZ) : runtimeZ.string();
      converted = runtimeZ.record(keySchema, toRuntimeZodSchema(def.valueType, runtimeZ));
      break;
    }
    case 'ZodObject':
    case 'object': {
      const shape = typeof def.shape === 'function' ? def.shape() : (def.shape ?? {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runtimeShape: Record<string, any> = {};
      for (const [key, value] of Object.entries(shape)) {
        runtimeShape[key] = toRuntimeZodSchema(value, runtimeZ);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let obj: any = runtimeZ.object(runtimeShape);
      if (def.unknownKeys === 'passthrough') obj = obj.passthrough();
      if (def.unknownKeys === 'strict') obj = obj.strict();
      converted = obj;
      break;
    }
    case 'ZodOptional':
    case 'optional':
      converted = toRuntimeZodSchema(def.innerType, runtimeZ).optional();
      break;
    case 'ZodNullable':
    case 'nullable':
      converted = toRuntimeZodSchema(def.innerType, runtimeZ).nullable();
      break;
    case 'ZodDefault':
    case 'default': {
      // v3: def.defaultValue() (function); v4: def.defaultValue (raw value)
      const defaultVal =
        typeof def.defaultValue === 'function' ? def.defaultValue() : def.defaultValue;
      converted = toRuntimeZodSchema(def.innerType, runtimeZ).default(defaultVal);
      break;
    }
    case 'ZodLiteral':
    case 'literal': {
      // v3: def.value; v4: def.values[0]
      const litVal = def.value ?? (Array.isArray(def.values) ? def.values[0] : undefined);
      converted = runtimeZ.literal(litVal);
      break;
    }
    case 'ZodUnion':
    case 'union':
      converted = runtimeZ.union(
        (def.options ?? []).map((option: unknown) => toRuntimeZodSchema(option, runtimeZ)),
      );
      break;
    case 'ZodEffects':
    case 'effects':
      // Pass through refinements/transforms — use the inner schema, drop the effect
      converted = toRuntimeZodSchema(def.schema, runtimeZ);
      break;
    default:
      // Unknown Zod type — fall back to unknown() so the schema still functions
      converted = runtimeZ.unknown();
      break;
  }

  const description = typeof schema?.description === 'string' ? schema.description : undefined;
  if (
    description &&
    typeof (converted as { describe?: (value: string) => unknown }).describe === 'function'
  ) {
    return (converted as { describe: (value: string) => unknown }).describe(description);
  }
  return converted;
}

function withRuntimeZod<T>(schemaBuilder: () => T, runtimeZ: RuntimeZod): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toRuntimeZodSchema(schemaBuilder(), runtimeZ) as any;
}

export function getRuntimeSchemaBuilders(runtimeZ: RuntimeZod) {
  return {
    buildUnifiedSchema: (
      resource: string,
      operations: string[],
      config: {
        requiresCompanyEndpoint?: boolean;
        supportsContentField?: boolean;
        supportsPhotosField?: boolean;
      },
    ) => withRuntimeZod(() => buildUnifiedSchema(resource, operations, config), runtimeZ),
  };
}
