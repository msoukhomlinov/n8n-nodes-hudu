/** Snippet injected into tool descriptions that reference date/time. */
export function dateTimeReferenceSnippet(referenceUtc: string): string {
    return `Reference: current UTC date-time when these tools were loaded is ${referenceUtc}. Use this for "today", "recent", or date-based filtering — do not assume a different date. `;
}

export function buildGetDescription(label: string, resourceName: string): string {
    return (
        `Fetch a single ${label} record by its numeric ID. ` +
        `ONLY call this when you already have a numeric ID — never pass a name or text. ` +
        `If you only have a name or description, call hudu_${resourceName}_getAll with 'search' first, extract the 'id' from results, then call this.`
    );
}

export function buildGetAllDescription(
    label: string,
    resourceName: string,
    referenceUtc?: string,
    supportsSearch?: boolean,
): string {
    const ref = referenceUtc ? dateTimeReferenceSnippet(referenceUtc) : '';
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
        `Results contain a numeric 'id' field on each record — capture this ID for subsequent getById, update, delete, or archive calls. ` +
        `Increase 'limit' (max 100) if you expect many results. ` +
        `If results are unexpectedly empty, verify API key permissions.`
    );
}

export function buildCreateDescription(label: string, resourceName: string, requiredFields: string[], referenceUtc?: string): string {
    const ref = referenceUtc ? dateTimeReferenceSnippet(referenceUtc) : '';
    const reqList = requiredFields.length > 0 ? `Required fields: ${requiredFields.join(', ')}. ` : '';
    const idFields = requiredFields.filter(f => f.endsWith('_id') && f !== 'id');
    const foreignKeyHint = idFields.length > 0
        ? `For unknown IDs (${idFields.join(', ')}): call the relevant resource's getAll with 'search' to find the numeric ID first. `
        : '';
    return (
        ref +
        `Create a new ${label} record in Hudu. ` +
        reqList +
        foreignKeyHint +
        `On success returns the created record including its assigned numeric 'id' (use for subsequent operations). ` +
        `If you receive a validation error, check that all required fields are provided with valid values.`
    );
}

export function buildUpdateDescription(label: string, resourceName: string): string {
    return (
        `Update an existing ${label} record in Hudu by numeric ID. ` +
        `PREREQUISITE: you need the numeric ID. If you only have a name or text, call hudu_${resourceName}_getAll with 'search' first to get the 'id'. ` +
        `Provide only the fields you want to change — unchanged fields can be omitted (PATCH semantics). ` +
        `Returns the updated record.`
    );
}

export function buildDeleteDescription(label: string, resourceName: string): string {
    return (
        `Permanently and irreversibly delete a ${label} record from Hudu by numeric ID. ` +
        `Consider using 'archive' instead — it hides the record while preserving data for later restoration. ` +
        `PREREQUISITE: confirm the correct ID — call hudu_${resourceName}_getAll with 'search' if unsure. ` +
        `Returns deletion confirmation.`
    );
}

export function buildArchiveDescription(label: string, operation: 'archive' | 'unarchive', resourceName?: string): string {
    if (operation === 'archive') {
        const prereq = resourceName
            ? `If unsure of the ID, call hudu_${resourceName}_getAll with 'search' first. `
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
