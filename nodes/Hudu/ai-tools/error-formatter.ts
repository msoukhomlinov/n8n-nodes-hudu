// ---------------------------------------------------------------------------
// Result envelope v3 — flat shape, no schemaVersion, no success/result wrapper.
// Success/failure signalled solely by presence of `error: true`.
// ---------------------------------------------------------------------------

export const ERROR_TYPES = {
  // Existing (retained — do not remove or rename)
  INVALID_OPERATION: 'INVALID_OPERATION',
  WRITE_OPERATION_BLOCKED: 'WRITE_OPERATION_BLOCKED',
  UNKNOWN_RESOURCE: 'UNKNOWN_RESOURCE',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NO_RESULTS_FOUND: 'NO_RESULTS_FOUND',
  MISSING_ENTITY_ID: 'MISSING_ENTITY_ID',
  API_ERROR: 'API_ERROR',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  // New in v3
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_PICKLIST_VALUE: 'INVALID_PICKLIST_VALUE',
  INVALID_FIELDS: 'INVALID_FIELDS',
  INVALID_WRITE_FIELDS: 'INVALID_WRITE_FIELDS',
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_FILTER_CONSTRAINT: 'INVALID_FILTER_CONSTRAINT',
  WRITE_RESOLUTION_INCOMPLETE: 'WRITE_RESOLUTION_INCOMPLETE',
  CONCURRENCY_CONFLICT: 'CONCURRENCY_CONFLICT',
} as const;

export type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];

const ACTIONABLE_TYPES = new Set<ErrorType>([
  ERROR_TYPES.INVALID_PICKLIST_VALUE,
  ERROR_TYPES.INVALID_FIELDS,
  ERROR_TYPES.INVALID_WRITE_FIELDS,
  ERROR_TYPES.MISSING_REQUIRED_FIELDS,
  ERROR_TYPES.ENTITY_NOT_FOUND,
  ERROR_TYPES.INVALID_FILTER_CONSTRAINT,
  ERROR_TYPES.WRITE_RESOLUTION_INCOMPLETE,
]);

export interface FlatErrorResponse {
  error: true;
  errorType: ErrorType;
  summary: string;
  nextAction?: string;
  actionRequired?: true;
  mustRetryAfter?: string[];
  resource: string;
  operation: string;
  [key: string]: unknown;
}

/**
 * Wrap an error in the v3 flat envelope.
 * Backward-compatible: existing 5-arg calls (resource, operation, type, message, nextAction)
 * continue to work — params 4+5 are renamed but positionally identical.
 * actionRequired + summary prefix are auto-applied for ACTIONABLE_TYPES.
 */
export function wrapError(
  resource: string,
  operation: string,
  errorType: ErrorType,
  summary: string,
  nextAction?: string,
  context?: Record<string, unknown>,
  mustRetryAfter?: string[],
): FlatErrorResponse {
  const actionRequired = ACTIONABLE_TYPES.has(errorType);
  const summaryText =
    actionRequired && nextAction ? `REQUIRED NEXT STEP: ${nextAction} — ${summary}` : summary;
  return {
    error: true,
    errorType,
    summary: summaryText,
    ...(nextAction ? { nextAction } : {}),
    ...(actionRequired ? { actionRequired: true } : {}),
    ...(mustRetryAfter?.length ? { mustRetryAfter } : {}),
    resource,
    operation,
    ...(context ?? {}),
  };
}

// ---------------------------------------------------------------------------
// v3 success builders
// ---------------------------------------------------------------------------

export function buildListResponse(
  records: unknown[],
  matchCount: number,
  truncated: boolean,
  warnings?: string[],
): object {
  return { records, matchCount, truncated, ...(warnings?.length ? { warnings } : {}) };
}

export function buildItemResponse(record: unknown): object {
  return { record };
}

export function buildMutationResponse(
  outcome: 'created' | 'updated' | 'upserted' | 'archived' | 'unarchived',
  record: unknown,
): object {
  return { outcome, record };
}

export function buildDeleteResponse(id: number | string): object {
  return { outcome: 'deleted', id };
}

export function buildCountResponse(matchCount: number): object {
  return { matchCount };
}

export function buildCompoundResponse(
  outcome: string,
  records: unknown[],
  matchCount: number,
): object {
  return { outcome, records, matchCount };
}

export function buildMetadataResponse(data: {
  fields?: unknown[];
  picklistValues?: unknown[];
  operationDoc?: unknown;
}): object {
  return { ...data };
}

/**
 * Add a warning string to a v3 response. Non-mutating — returns a new object.
 * Replaces the v2 addResultWarning (which mutated the payload and used a nested shape).
 */
export function addWarning(response: object, warning: string): object {
  const existing = (response as Record<string, unknown>).warnings;
  const list = Array.isArray(existing) ? (existing as string[]) : [];
  return { ...response, warnings: [...list, warning] };
}

// ---------------------------------------------------------------------------
// Thin wrappers — kept for backward compat. Call sites do not change.
// ---------------------------------------------------------------------------

export function formatMissingIdError(
  resource: string,
  operation: string,
  supportsSearch = true,
): FlatErrorResponse {
  const lookupHint = supportsSearch
    ? `call hudu_${resource} with operation 'getAll' and the 'search' parameter to find the record first.`
    : `call hudu_${resource} with operation 'getAll' with available filters to find the record first.`;
  return wrapError(
    resource,
    operation,
    ERROR_TYPES.MISSING_ENTITY_ID,
    `A numeric entity ID is required for ${resource}.${operation}.`,
    `Provide a numeric 'id' parameter. If you only have a name or text, ${lookupHint}`,
  );
}

export function formatNotFoundError(
  resource: string,
  operation: string,
  id: number,
  supportsSearch = true,
): FlatErrorResponse {
  const lookupHint = supportsSearch
    ? `Call hudu_${resource} with operation 'getAll' and the 'search' parameter to find the record by text, then use the numeric ID from the results.`
    : `Call hudu_${resource} with operation 'getAll' with available filters to find the record, then use the numeric ID from the results.`;
  return wrapError(
    resource,
    operation,
    ERROR_TYPES.ENTITY_NOT_FOUND,
    `No ${resource} record found with ID ${id}.`,
    lookupHint,
  );
}

export function formatNoResultsFound(
  resource: string,
  operation: string,
  filters: Record<string, unknown>,
): FlatErrorResponse {
  return wrapError(
    resource,
    operation,
    ERROR_TYPES.NO_RESULTS_FOUND,
    `No ${resource} records matched the provided filters.`,
    'Broaden your search criteria, check for typos, or verify the record exists in Hudu.',
    { filtersUsed: filters },
  );
}

export function formatApiError(
  message: string,
  resource: string,
  operation: string,
  supportsSearch = true,
): FlatErrorResponse {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('unauthor') ||
    lowerMessage.includes('access denied')
  ) {
    return wrapError(
      resource,
      operation,
      ERROR_TYPES.PERMISSION_DENIED,
      message,
      'Verify the Hudu API key has the required permissions for this resource.',
    );
  }

  if (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('does not exist') ||
    lowerMessage.includes('404')
  ) {
    return wrapError(
      resource,
      operation,
      ERROR_TYPES.ENTITY_NOT_FOUND,
      message,
      supportsSearch
        ? `Call hudu_${resource} with operation 'getAll' and the 'search' parameter to find the record by text, then use the numeric ID from the results and retry.`
        : `Call hudu_${resource} with operation 'getAll' with available filters to find the record, then use the numeric ID from the results and retry.`,
    );
  }

  if (
    lowerMessage.includes('required') ||
    lowerMessage.includes('missing') ||
    lowerMessage.includes('blank')
  ) {
    return wrapError(
      resource,
      operation,
      ERROR_TYPES.MISSING_REQUIRED_FIELD,
      message,
      'Check required fields for this resource and retry with all required parameters.',
    );
  }

  if (
    lowerMessage.includes('validation') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('unprocessable')
  ) {
    return wrapError(
      resource,
      operation,
      ERROR_TYPES.VALIDATION_ERROR,
      message,
      'Check the field values and types, then retry with corrected parameters.',
    );
  }

  return wrapError(
    resource,
    operation,
    ERROR_TYPES.API_ERROR,
    message,
    'Verify parameter names and values, then retry.',
  );
}
