// ---------------------------------------------------------------------------
// Result envelope types & factories
// ---------------------------------------------------------------------------

interface ToolEnvelope {
  schemaVersion: string;
  success: boolean;
  operation: string;
  resource: string;
}

export interface SuccessEnvelope extends ToolEnvelope {
  success: true;
  result: unknown;
}

export interface ErrorEnvelope extends ToolEnvelope {
  success: false;
  error: {
    errorType: string;
    message: string;
    nextAction: string;
    context?: Record<string, unknown>;
  };
}

export const ERROR_TYPES = {
  API_ERROR: 'API_ERROR',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  NO_RESULTS_FOUND: 'NO_RESULTS_FOUND',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  MISSING_ENTITY_ID: 'MISSING_ENTITY_ID',
  INVALID_OPERATION: 'INVALID_OPERATION',
  WRITE_OPERATION_BLOCKED: 'WRITE_OPERATION_BLOCKED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_RESOURCE: 'UNKNOWN_RESOURCE',
} as const;

export function wrapSuccess(
  resource: string,
  operation: string,
  result: unknown,
): SuccessEnvelope {
  return { schemaVersion: '1', success: true, operation, resource, result };
}

export function wrapError(
  resource: string,
  operation: string,
  errorType: string,
  message: string,
  nextAction: string,
  context?: Record<string, unknown>,
): ErrorEnvelope {
  return {
    schemaVersion: '1',
    success: false,
    operation,
    resource,
    error: { errorType, message, nextAction, ...(context ? { context } : {}) },
  };
}

// ---------------------------------------------------------------------------
// Thin wrappers — call sites in tool-executor.ts use these for convenience.
// Each delegates to wrapError() internally.
// ---------------------------------------------------------------------------

export function formatMissingIdError(
  resource: string,
  operation: string,
  supportsSearch = true,
): ErrorEnvelope {
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
): ErrorEnvelope {
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
): ErrorEnvelope {
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
): ErrorEnvelope {
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
