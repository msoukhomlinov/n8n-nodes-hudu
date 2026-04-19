/** Snippet injected into tool descriptions that reference date/time. */
export function dateTimeReferenceSnippet(referenceUtc: string): string {
  return `Reference: current UTC date-time when these tools were loaded is ${referenceUtc}. Use this for "today", "recent", or date-based filtering — do not assume a different date. `;
}

const REQUIRED_FIELDS_BY_RESOURCE: Record<string, string[]> = {
  companies: ['name'],
  articles: ['name'],
  assets: ['company_id', 'asset_layout_id', 'name'],
  websites: ['name', 'company_id'],
  asset_passwords: ['name', 'company_id', 'password'],
  procedures: ['name'],
  folders: ['name'],
  networks: ['name', 'company_id', 'address'],
  ip_addresses: ['address', 'status', 'company_id'],
  relations: ['fromable_id', 'fromable_type', 'toable_id', 'toable_type'],
  expirations: ['resource_id', 'resource_type', 'expiration_date'],
  vlans: ['name', 'company_id'],
  vlan_zones: ['name', 'vlan_id_ranges'],
  photos: ['caption'],
  procedure_tasks: ['name', 'procedure_id'],
};

export function getRequiredFields(resource: string): string[] {
  return REQUIRED_FIELDS_BY_RESOURCE[resource] ?? [];
}

export function buildGetDescription(
  label: string,
  resourceName: string,
  supportsSearch = true,
): string {
  if (resourceName === 'articles') {
    return (
      "Fetch a single article record by its numeric ID. " +
      "ONLY call when you already have a numeric ID — if you only have a title, call hudu_articles with operation 'getAll' and 'name' first. " +
      "By default the HTML content field is stripped — set include_content=true only when you need to read or quote the article body; leave false when you need only metadata. " +
      "When reading content (include_content=true): the response includes a 'public_photos' array — objects with 'numeric_id' (integer) for each embedded image. " +
      "Call hudu_public_photos with operation 'get' and each photo's 'numeric_id' BEFORE editing or redacting the article — this verifies each embedded photo still exists so your edits do not accidentally break or remove valid image references. " +
      "Skip this verification step when you are only reading, summarising, or quoting the article (no write-back). " +
      "Do NOT use the slug from '/public_photo/<slug>' HTML links as the id — the API returns 404 for slugs; use 'numeric_id' only."
    );
  }
  if (resourceName === 'public_photos') {
    return (
      "Fetch public photo METADATA by numeric ID — returns id (slug), numeric_id, url, record_type, record_id, file_name, file_size. " +
      "Returns METADATA ONLY — NEVER returns binary image bytes or image content. n8n's tool architecture forcibly JSON-stringifies every tool result, so binary data in AI tool responses is impossible by design. Do NOT attempt to return, decode, or analyse image content from this call. " +
      "PRIMARY use: before editing or redacting an article (or company record) that contains embedded '/public_photo/<slug>' images, call this with each photo's 'numeric_id' to verify the photo still exists — this prevents your edits from breaking or removing references to photos that were already deleted upstream. " +
      "SECONDARY use: surface the 'url' (a publicly accessible absolute URL, no Hudu auth required) or 'file_name' / 'file_size' to the user so they can open the image in their browser. " +
      "NOT useful for: visual analysis of image content, describing what a diagram or screenshot shows, or OCR — this tool cannot see images. If the user asks what an image depicts, explain you can only supply the URL for them to view. " +
      "Pass the 'numeric_id' (integer) from the article or company response's 'public_photos' array. Do NOT pass the slug string from '/public_photo/<slug>' HTML links — the API only accepts integers and returns 404 for slugs."
    );
  }
  const lookupHint = supportsSearch
    ? `call hudu_${resourceName} with operation 'getAll' and 'search' first, extract the 'id' from results, then call this.`
    : `call hudu_${resourceName} with operation 'getAll' and the available filters to find the record, extract the 'id' from results, then call this.`;
  return (
    `Fetch a single ${label} record by its numeric ID. ` +
    `ONLY call this when you already have a numeric ID — never pass a name or text. ` +
    `If you only have a name or description, ${lookupHint}`
  );
}

export function buildGetAllDescription(
  label: string,
  referenceUtc?: string,
  supportsSearch?: boolean,
  resource?: string,
): string {
  const ref = referenceUtc ? dateTimeReferenceSnippet(referenceUtc) : '';
  if (resource === 'articles') {
    return (
      ref +
      "Search and list articles in Hudu. " +
      "For title-based lookup (resolving a known title to an ID) use 'name' — fuzzy-matches titles with title-overlap ranking and auto-fetches up to 100 candidates. " +
      "For topic or content-phrase exploration use 'search' — partial text match across title AND body. " +
      "Content is stripped from results by default (set include_content=true to include). " +
      "Narrow with company_id, folder_id, draft, enable_sharing, or updated_at_start/end date range. " +
      "Results contain numeric 'id' on each record — capture for get, update, delete, or archive. " +
      "Article HTML (fetched via 'get' with include_content=true) contains embedded images; the response includes a 'public_photos' array with 'numeric_id' per image — when editing or redacting the article, call hudu_public_photos 'get' with that integer FIRST to verify each embedded photo still exists (prevents breaking image references). Skip this step when just reading or summarising. Use 'numeric_id', NOT the slug from HTML links. " +
      "If results are unexpectedly empty, verify API key permissions."
    );
  }
  if (resource === 'public_photos') {
    return (
      ref +
      "List public photo records in Hudu. Public photos are images embedded in article or company HTML content as '/public_photo/<slug>' links. " +
      "WARNING: Hudu has no server-side filters on this endpoint — record_type and record_id are applied client-side after paging the full photo corpus. ALWAYS provide both record_type ('Article' or 'Company') AND record_id to keep the fetch bounded. " +
      "Each result's 'id' is a string slug (display only); 'numeric_id' is the integer required for operation 'get' — do NOT pass the slug string; 'url' is the direct image URL for display or download. " +
      "Increase 'limit' toward 100 only if you expect a record to have many embedded photos. " +
      "If results are empty, verify record_type and record_id match a record that actually has embedded photos."
    );
  }
  if (supportsSearch) {
    return (
      ref +
      `Search and list ${label} records in Hudu. ` +
      `ALWAYS use 'search' for any text or name lookup (partial match across multiple fields) — do not use 'name' for text lookups. ` +
      `Results contain a numeric 'id' field on each record — capture this ID for subsequent getById, update, delete, or archive calls. ` +
      `Increase 'limit' (max 100) if you expect many results. ` +
      `If results are unexpectedly empty, verify API key permissions.`
    );
  }
  return (
    ref +
    `List ${label} records in Hudu using the available filters. ` +
    `This resource has no partial-text search — to find a record by name use the 'name' filter (EXACT full-name match, case-sensitive). ` +
    `Results contain a numeric 'id' field on each record — capture this ID for subsequent getById, update, delete, or archive calls. ` +
    `Increase 'limit' (max 100) if you expect many results. ` +
    `If results are unexpectedly empty, verify API key permissions.`
  );
}

export function buildCreateDescription(
  label: string,
  requiredFields: string[],
  referenceUtc?: string,
  supportsSearch = true,
): string {
  const ref = referenceUtc ? dateTimeReferenceSnippet(referenceUtc) : '';
  const reqList =
    requiredFields.length > 0 ? `Required fields: ${requiredFields.join(', ')}. ` : '';
  const idFields = requiredFields.filter((f) => f.endsWith('_id') && f !== 'id');
  const foreignKeyHint =
    idFields.length > 0
      ? supportsSearch
        ? `For unknown IDs (${idFields.join(', ')}): call the relevant resource's getAll with 'search' to find the numeric ID first. `
        : `For unknown IDs (${idFields.join(', ')}): call the relevant resource's getAll with available filters to find the numeric ID first. `
      : '';
  return (
    ref +
    `Create a new ${label} record in Hudu. ` +
    reqList +
    foreignKeyHint +
    `Confirm field values with user before executing when acting autonomously. ` +
    `On success returns the created record including its assigned numeric 'id' (use for subsequent operations). ` +
    `If you receive a validation error, check that all required fields are provided with valid values.`
  );
}

export function buildUpdateDescription(
  label: string,
  resourceName: string,
  supportsSearch = true,
): string {
  const lookupHint = supportsSearch
    ? `call hudu_${resourceName} with operation 'getAll' and 'search' first to get the 'id'.`
    : `call hudu_${resourceName} with operation 'getAll' and available filters to find the record and get the 'id'.`;
  return (
    `Update an existing ${label} record in Hudu by numeric ID. ` +
    `PREREQUISITE: you need the numeric ID. If you only have a name or text, ${lookupHint} ` +
    `Provide only the fields you want to change — unchanged fields can be omitted (PATCH semantics). ` +
    `Confirm field values with user before executing when acting autonomously. ` +
    `Returns the updated record.`
  );
}

export function buildDeleteDescription(
  label: string,
  resourceName: string,
  supportsSearch = true,
): string {
  const confirmHint = supportsSearch
    ? `call hudu_${resourceName} with operation 'getAll' and 'search' if unsure.`
    : `call hudu_${resourceName} with operation 'getAll' and available filters if unsure.`;
  return (
    `Permanently and irreversibly delete a ${label} record from Hudu by numeric ID. ` +
    `Consider using 'archive' instead — it hides the record while preserving data for later restoration. ` +
    `PREREQUISITE: confirm the correct ID — ${confirmHint} ` +
    `ONLY on explicit user intent. Do not infer from context. Confirm ID is correct before proceeding. ` +
    `Returns deletion confirmation.`
  );
}

export function buildArchiveDescription(
  label: string,
  operation: 'archive' | 'unarchive',
  resourceName?: string,
  supportsSearch = true,
): string {
  if (operation === 'archive') {
    const prereq = resourceName
      ? supportsSearch
        ? `If unsure of the ID, call hudu_${resourceName} with operation 'getAll' and 'search' first. `
        : `If unsure of the ID, call hudu_${resourceName} with operation 'getAll' and available filters to find the record first. `
      : '';
    return (
      `Archive a ${label} record in Hudu by numeric ID. ` +
      `Archived records are hidden from active views but NOT deleted — data is preserved and can be restored with 'unarchive'. ` +
      `Prefer this over 'delete' when you want to deactivate rather than permanently remove a record. ` +
      prereq
    );
  }
  return (
    `Restore a previously archived ${label} record in Hudu by numeric ID. ` +
    `The record becomes visible in active views again. Returns confirmation.`
  );
}

export function buildUnifiedDescription(
  resourceLabel: string,
  resource: string,
  operations: string[],
  referenceUtc: string,
  supportsSearch: boolean,
  config: { requiresCompanyEndpoint?: boolean },
): string {
  const enabledOps = Array.from(new Set(operations));
  const requiredFields = getRequiredFields(resource);
  const operationLines = enabledOps.map((operation) => {
    switch (operation) {
      case 'get':
        return `- get: ${buildGetDescription(resourceLabel, resource, supportsSearch)}`;
      case 'getAll':
        return `- getAll: ${buildGetAllDescription(resourceLabel, undefined, supportsSearch, resource)}`;
      case 'create':
        return `- create: ${buildCreateDescription(resourceLabel, requiredFields, undefined, supportsSearch)}`;
      case 'update':
        return `- update: ${buildUpdateDescription(resourceLabel, resource, supportsSearch)}`;
      case 'delete':
        return `- delete: ${buildDeleteDescription(resourceLabel, resource, supportsSearch)}`;
      case 'archive':
      case 'unarchive':
        return `- ${operation}: ${buildArchiveDescription(resourceLabel, operation, resource, supportsSearch)}`;
      default:
        return `- ${operation}: Operation available for this resource.`;
    }
  });

  const companyEndpointHint = config.requiresCompanyEndpoint
    ? 'This resource can require company-scoped endpoints for write operations. Provide company_id when required.'
    : '';

  return [
    `${dateTimeReferenceSnippet(referenceUtc)}Manage ${resourceLabel} records in Hudu.`,
    'Pass one of the following values in the required "operation" field:',
    ...operationLines,
    'Prefer running getAll first to discover numeric IDs before get, update, delete, archive, or unarchive.',
    companyEndpointHint,
  ]
    .filter(Boolean)
    .join('\n');
}
