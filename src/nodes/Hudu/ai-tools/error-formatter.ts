export interface StructuredToolError {
    error: true;
    errorType: string;
    message: string;
    operation: string;
    nextAction: string;
    context?: Record<string, unknown>;
}

function buildOperation(resource: string, operation: string): string {
    return `${resource}.${operation}`;
}

export function formatMissingIdError(resource: string, operation: string): StructuredToolError {
    return {
        error: true,
        errorType: 'MISSING_ENTITY_ID',
        message: `A numeric entity ID is required for ${buildOperation(resource, operation)}.`,
        operation: buildOperation(resource, operation),
        nextAction: `Provide a numeric 'id' parameter. If you only have a name or text, call hudu_${resource} with operation 'getAll' and the 'search' parameter to find the record first.`,
    };
}

export function formatNotFoundError(resource: string, operation: string, id: number): StructuredToolError {
    return {
        error: true,
        errorType: 'ENTITY_NOT_FOUND',
        message: `No ${resource} record found with ID ${id}.`,
        operation: buildOperation(resource, operation),
        nextAction: `Call hudu_${resource} with operation 'getAll' and the 'search' parameter to find the record by text, then use the numeric ID from the results.`,
    };
}

export function formatNoResultsFound(
    resource: string,
    operation: string,
    filters: Record<string, unknown>,
): StructuredToolError {
    return {
        error: true,
        errorType: 'NO_RESULTS_FOUND',
        message: `No ${resource} records matched the provided filters.`,
        operation: buildOperation(resource, operation),
        nextAction: 'Broaden your search criteria, check for typos, or verify the record exists in Hudu.',
        context: { filtersUsed: filters },
    };
}

export function formatApiError(message: string, resource: string, operation: string): StructuredToolError {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('forbidden') || lowerMessage.includes('unauthor') || lowerMessage.includes('access denied')) {
        return {
            error: true,
            errorType: 'PERMISSION_DENIED',
            message,
            operation: buildOperation(resource, operation),
            nextAction: 'Verify the Hudu API key has the required permissions for this resource.',
        };
    }

    if (lowerMessage.includes('not found') || lowerMessage.includes('does not exist') || lowerMessage.includes('404')) {
        return {
            error: true,
            errorType: 'ENTITY_NOT_FOUND',
            message,
            operation: buildOperation(resource, operation),
            nextAction: `Call hudu_${resource} with operation 'getAll' and the 'search' parameter to find the record by text, then use the numeric ID from the results and retry.`,
        };
    }

    if (lowerMessage.includes('required') || lowerMessage.includes('missing') || lowerMessage.includes('blank')) {
        return {
            error: true,
            errorType: 'MISSING_REQUIRED_FIELDS',
            message,
            operation: buildOperation(resource, operation),
            nextAction: `Check required fields for this resource and retry with all required parameters.`,
        };
    }

    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('unprocessable')) {
        return {
            error: true,
            errorType: 'VALIDATION_ERROR',
            message,
            operation: buildOperation(resource, operation),
            nextAction: 'Check the field values and types, then retry with corrected parameters.',
        };
    }

    return {
        error: true,
        errorType: 'API_ERROR',
        message,
        operation: buildOperation(resource, operation),
        nextAction: 'Verify parameter names and values, then retry.',
    };
}
