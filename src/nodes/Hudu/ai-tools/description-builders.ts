/** Snippet injected into tool descriptions that reference date/time. */
export function dateTimeReferenceSnippet(referenceUtc: string): string {
    return `Reference: current UTC date-time when these tools were loaded is ${referenceUtc}. Use this for "today", "recent", or date-based filtering — do not assume a different date. `;
}

export function buildGetDescription(label: string, resourceName: string): string {
    return (
        `Fetch a single ${label} record by its numeric ID. ` +
        `Only call this when you already have the numeric ID — never pass a name or text here. ` +
        `To find a record by name or text, use getAll with 'search' instead.`
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
            `Use 'search' to find records by text (partial match across fields) — only fall back to exact field filters if 'search' returns no results. ` +
            `Use other filters (e.g. company_id, archived) to narrow results further. ` +
            `Set 'limit' to control result count (default 25, max 100). ` +
            `Results are returned newest-first by default when the API supports it. ` +
            `If results are unexpectedly empty, verify the API key permissions.`
        );
    }
    return (
        ref +
        `Search and list ${label} records in Hudu. ` +
        `Use filter parameters to narrow results (e.g. name, company_id, archived). ` +
        `Set 'limit' to control result count (default 25, max 100). ` +
        `Results are returned newest-first by default when the API supports it. ` +
        `If results are unexpectedly empty, verify the API key permissions.`
    );
}

export function buildCreateDescription(label: string, resourceName: string, requiredFields: string[], referenceUtc?: string): string {
    const ref = referenceUtc ? dateTimeReferenceSnippet(referenceUtc) : '';
    const reqList = requiredFields.length > 0 ? `Required fields: ${requiredFields.join(', ')}. ` : '';
    return (
        ref +
        `Create a new ${label} record in Hudu. ` +
        reqList +
        `Returns the created record including its assigned numeric ID. ` +
        `If you receive a validation error, check that all required fields are provided with valid values.`
    );
}

export function buildUpdateDescription(label: string, resourceName: string): string {
    return (
        `Update an existing ${label} record in Hudu by numeric ID. ` +
        `Provide only the fields you want to change — unchanged fields can be omitted. ` +
        `Returns the updated record. ` +
        `If the record is not found, use getAll to locate it first.`
    );
}

export function buildDeleteDescription(label: string): string {
    return (
        `Permanently delete a ${label} record from Hudu by numeric ID. ` +
        `This action cannot be undone. ` +
        `Verify the correct ID before proceeding. ` +
        `Returns confirmation of deletion.`
    );
}

export function buildArchiveDescription(label: string, operation: 'archive' | 'unarchive'): string {
    if (operation === 'archive') {
        return (
            `Archive a ${label} record in Hudu by numeric ID. ` +
            `Archived records are hidden from active views but not deleted. ` +
            `Use 'unarchive' to restore. Returns confirmation.`
        );
    }
    return (
        `Unarchive (restore) a previously archived ${label} record in Hudu by numeric ID. ` +
        `The record will become visible in active views again. Returns confirmation.`
    );
}
