/**
 * Debug configuration for Hudu node
 * Controls various debug output levels throughout the node
 */

export const DEBUG_CONFIG = {
  // API Communication
  API_REQUEST: true,     // Debug API request details
  API_RESPONSE: false,    // Debug API response details

  // Core Operations
  OPERATION_CREATE: false,   // Debug create operations
  OPERATION_UPDATE: false,   // Debug update operations
  OPERATION_DELETE: false,   // Debug delete operations
  OPERATION_GET: true,      // Debug get operations
  OPERATION_GET_ALL: false,  // Debug getAll operations
  OPERATION_ARCHIVE: false,  // Debug archive operations

  // Resource Handlers
  RESOURCE_PROCESSING: false,  // Debug resource handler processing
  RESOURCE_PARAMS: false,      // Debug parameter extraction in handlers
  RESOURCE_TRANSFORM: false,   // Debug data transformations in handlers

  // Node Execution
  NODE_INPUT: false,    // Debug input items to node
  NODE_OUTPUT: false,   // Debug output from node

  // Utility Functions
  UTIL_DATE_PROCESSING: false,  // Debug date range processing
  UTIL_FILTERS: false,          // Debug filter processing
  UTIL_TYPE_CONVERSION: false   // Debug type conversions
} as const;

/**
 * Debug logging utility
 */
export function debugLog(title: string, obj: unknown, type: 'log' | 'error' = 'log'): void {
  // Print the title
  console[type](`*** ${title} ***`);
  
  // If object is present, print it
  if (obj !== undefined) {
    console[type](debugStringify(obj));
  }
  
  // Add a newline for better readability
  console[type]('');
}

/**
 * Type guard to check if a value is a Record (object)
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Redact sensitive information from objects
 * @param obj Object to redact
 * @returns Redacted copy of the object
 */
export function redactSensitiveData(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sensitiveKeys = ['x-api-key', 'apiKey', 'api_key', 'password', 'token', 'secret'];
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  if (isRecord(obj)) {
    const redactedObj: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        redactedObj[key] = '[REDACTED]';
      } else {
        redactedObj[key] = typeof value === 'object' ? redactSensitiveData(value) : value;
      }
    }
    
    return redactedObj;
  }

  return obj;
}

/**
 * Debug utility function for better object logging
 */
export function debugStringify(obj: unknown, space = 2): string {
  // Redact sensitive data before stringifying
  const redactedObj = redactSensitiveData(obj);

  return JSON.stringify(redactedObj, (key, value) => {
    // Handle special cases like functions, undefined, etc.
    if (typeof value === 'function') {
      return '[Function]';
    }
    if (value === undefined) {
      return 'undefined';
    }
    if (value === null) {
      return null;
    }
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    return value;
  }, space);
} 