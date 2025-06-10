import type { NodeApiError } from 'n8n-workflow';

/**
 * Parses a Hudu API error message to extract meaningful details
 * @param error The NodeApiError from the API
 * @returns A user-friendly error message with specific details
 */
export function parseHuduApiError(error: NodeApiError): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // NodeApiError stores detailed messages in the description field, not message
  const message = error.description || error.message || 'An unknown error occurred';
  
  // Try to extract JSON from the error message
  // Format is typically: "422 - {"error":"Invalid custom fields","details":["Invalid field names: 361, 363"]}"
  const jsonMatch = message.match(/\{.*\}$/);
  
  if (jsonMatch) {
    try {
      const errorData = JSON.parse(jsonMatch[0]);
      
      if (errorData.error) {
        let parsedMessage = errorData.error;
        
        if (errorData.details && Array.isArray(errorData.details)) {
          const detailsString = errorData.details.join(', ');
          parsedMessage += `. Details: ${detailsString}`;
        }
        
        return parsedMessage;
      }
    } catch (parseError) {
      // If JSON parsing fails, fall through to default handling
    }
  }
  
  // If we can't parse the JSON, try to extract just the status code and return a cleaner message
  const statusMatch = message.match(/^(\d{3})\s*-\s*/);
  if (statusMatch) {
    const statusCode = statusMatch[1];
    const remainingMessage = message.replace(statusMatch[0], '').trim();
    
    // If there's a meaningful message after the status code, use it
    if (remainingMessage && remainingMessage !== '{}') {
      return `HTTP ${statusCode}: ${remainingMessage}`;
    }
    
    // Otherwise, provide a generic message based on status code
    switch (statusCode) {
      case '422':
        return 'Unprocessable Entity: The request was well-formed but contains semantic errors';
      case '400':
        return 'Bad Request: The request was malformed or contains invalid parameters';
      case '404':
        return 'Not Found: The requested resource does not exist';
      case '401':
        return 'Unauthorized: Invalid or missing API credentials';
      case '403':
        return 'Forbidden: You do not have permission to access this resource';
      default:
        return `HTTP ${statusCode}: ${remainingMessage || 'An error occurred'}`;
    }
  }
  
  // If all else fails, return the original message
  return message;
}

/**
 * Parses a Hudu API error with additional context for specific operations
 * @param error The NodeApiError from the API
 * @param operation The operation that was being performed (e.g., 'create', 'update')
 * @param context Additional context about what was being processed
 * @returns A user-friendly error message with operation context
 */
export function parseHuduApiErrorWithContext(
  error: NodeApiError, 
  operation: string, 
  context?: string
): string {
  const baseMessage = parseHuduApiError(error);
  
  // Add operation context
  const operationText = operation ? ` during ${operation} operation` : '';
  const contextText = context ? ` (${context})` : '';
  
  return `${baseMessage}${operationText}${contextText}`;
} 