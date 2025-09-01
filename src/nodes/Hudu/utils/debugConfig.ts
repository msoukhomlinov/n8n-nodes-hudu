/**
 * Debug configuration for Hudu node
 * Controls various debug output levels throughout the node
 */

export const DEBUG_CONFIG = {
  // API Communication
  API_REQUEST: false,     // Debug API request details
  API_RESPONSE: false,    // Debug API response details
  API_ERROR: false,       // Debug API error handling and parsing

  // Core Operations
  OPERATION_CREATE: false,   // Debug create operations
  OPERATION_UPDATE: false,   // Debug update operations
  OPERATION_DELETE: false,   // Debug delete operations
  OPERATION_GET: false,      // Debug get operations
  OPERATION_GET_ALL: false,  // Debug getAll operations
  OPERATION_ARCHIVE: false,  // Debug archive operations

  // Resource Handlers
  RESOURCE_PROCESSING: false,  // Debug resource handler processing
  RESOURCE_PARAMS: false,      // Debug parameter extraction in handlers
  RESOURCE_TRANSFORM: false,   // Debug data transformations in handlers
  RESOURCE_MAPPING: false,    // Debug resource mapping

  // Node Execution
  NODE_INPUT: false,    // Debug input items to node
  NODE_OUTPUT: false,   // Debug output from node

  // Utility Functions
  UTIL_DATE_PROCESSING: false,  // Debug date range processing
  UTIL_FILTERS: false,          // Debug filter processing
  UTIL_TYPE_CONVERSION: false,   // Debug type conversions

  // Asset Related
  ASSET_OPTIONS: false,        // Debug asset options loading and processing
  FIELD_TYPE_MAPPING: false,   // Debug field type mapping operations

  // Additional options
  OPTION_LOADING: false,       // Debug option loading

  // Diagnostic flags
  DIAGNOSTIC_LOGGING: false,
} as const;

// Mapping for various debug message formats to standardized uppercase config keys
const DEBUG_CATEGORY_MAP: Record<string, keyof typeof DEBUG_CONFIG> = {
  // Resource mapping variations
  'RESOURCE_MAPPING': 'RESOURCE_MAPPING',
  'ResourceMapping': 'RESOURCE_MAPPING',
  'Resource_Mapping': 'RESOURCE_MAPPING',
  
  // Option loading variations
  'OPTION_LOADING': 'OPTION_LOADING',
  'OptionLoading': 'OPTION_LOADING',
  
  // Asset options variations
  'ASSET_OPTIONS': 'ASSET_OPTIONS',
  'AssetOptions': 'ASSET_OPTIONS',
  
  // Field type mapping variations
  'FIELD_TYPE_MAPPING': 'FIELD_TYPE_MAPPING',
  'FieldTypeMapping': 'FIELD_TYPE_MAPPING',
  
  // Additional mappings for other categories
  'API_REQUEST': 'API_REQUEST',
  'API_RESPONSE': 'API_RESPONSE',
  'API_ERROR': 'API_ERROR',
  'OPERATION_CREATE': 'OPERATION_CREATE',
  'OPERATION_UPDATE': 'OPERATION_UPDATE',
  'OPERATION_DELETE': 'OPERATION_DELETE',
  'OPERATION_GET': 'OPERATION_GET',
  'OPERATION_GET_ALL': 'OPERATION_GET_ALL',
  'OPERATION_ARCHIVE': 'OPERATION_ARCHIVE',
  'RESOURCE_PROCESSING': 'RESOURCE_PROCESSING',
  'ResourceProcessing': 'RESOURCE_PROCESSING',
  'RESOURCE_PARAMS': 'RESOURCE_PARAMS',
  'ResourceParams': 'RESOURCE_PARAMS',
  'RESOURCE_TRANSFORM': 'RESOURCE_TRANSFORM',
  'ResourceTransform': 'RESOURCE_TRANSFORM',
  'NODE_INPUT': 'NODE_INPUT',
  'NODE_OUTPUT': 'NODE_OUTPUT',
  'UTIL_DATE_PROCESSING': 'UTIL_DATE_PROCESSING',
  'DateProcessing': 'UTIL_DATE_PROCESSING',
  'UTIL_FILTERS': 'UTIL_FILTERS',
  'Filters': 'UTIL_FILTERS',
  'UTIL_TYPE_CONVERSION': 'UTIL_TYPE_CONVERSION',
  'CustomFields': 'ASSET_OPTIONS',
};

// Message prefix mapping to DEBUG_CONFIG categories
const MESSAGE_PREFIX_MAP: Record<string, keyof typeof DEBUG_CONFIG> = {
  'Hudu API Request': 'API_REQUEST',
  'Hudu API Response': 'API_RESPONSE',
  'Hudu API Error': 'API_ERROR',
  'Rate Limited': 'API_REQUEST',
  'Update Operation': 'OPERATION_UPDATE',
  'GetAll Operation': 'OPERATION_GET_ALL',
  'Get Operation': 'OPERATION_GET',
  'Delete Operation': 'OPERATION_DELETE',
  'Create Operation': 'OPERATION_CREATE',
  'Archive Operation': 'OPERATION_ARCHIVE',
  'Filter Processing': 'UTIL_FILTERS',
  'Date Processing': 'UTIL_DATE_PROCESSING',
  'Lists Handler': 'RESOURCE_PROCESSING',
  'List Options Handler': 'RESOURCE_PROCESSING',
  'Articles Handler': 'RESOURCE_PROCESSING',
  'Articles Version History': 'RESOURCE_PROCESSING',
  'Node Execution': 'NODE_INPUT',  // We'll refine this later in the extractDebugCategory function
  // Additional patterns found
  'VLAN Zone operation': 'RESOURCE_PROCESSING',
  'VLAN operation': 'RESOURCE_PROCESSING',
  'Websites resource': 'RESOURCE_PROCESSING',
  'IP Address operation': 'RESOURCE_PROCESSING',
  'Company operation': 'RESOURCE_PROCESSING',
  'Asset operation': 'RESOURCE_PROCESSING',
  'Asset Layout operation': 'RESOURCE_PROCESSING',
  'User operation': 'RESOURCE_PROCESSING',
  'Cards operation': 'RESOURCE_PROCESSING',
  'Article operation': 'RESOURCE_PROCESSING',
  'Activity Log operation': 'RESOURCE_PROCESSING',
  'Expiration operation': 'RESOURCE_PROCESSING',
  'Folder operation': 'RESOURCE_PROCESSING',
  'Matcher operation': 'RESOURCE_PROCESSING',
  'Network operation': 'RESOURCE_PROCESSING',
  'Procedure operation': 'RESOURCE_PROCESSING',
  'API Info operation': 'RESOURCE_PROCESSING'
};

/**
 * Extract debug category from message
 * @param message Debug message to parse
 * @returns Standardized debug category key or undefined
 */
function extractDebugCategory(message: string): keyof typeof DEBUG_CONFIG | undefined {
  // Check if message contains a category tag like [CategoryName]
  const categoryMatch = message.match(/\[([A-Za-z0-9_]+)\]/);
  if (categoryMatch && categoryMatch[1]) {
    const category = categoryMatch[1];
    // Look up the standardized category in our map
    return DEBUG_CATEGORY_MAP[category];
  }
  
  // If no bracket category, try to match based on message prefix
  for (const [prefix, category] of Object.entries(MESSAGE_PREFIX_MAP)) {
    if (message.startsWith(prefix)) {
      // Special case for Node Execution
      if (prefix === 'Node Execution' && message.includes('Output')) {
        return 'NODE_OUTPUT';
      }
      return category;
    }
  }
  
  return undefined;
}

/**
 * Debug logging utility
 */
export function debugLog(message: string, data?: unknown): void {
  // Extract the debug category from the message
  const category = extractDebugCategory(message);
  
  // Only log if the category exists and is enabled in DEBUG_CONFIG
  if (category && DEBUG_CONFIG[category]) {
    // Redact sensitive data if present
    const safeData = data ? redactSensitiveData(data) : undefined;
    
    // Use the original category name without formatting
    console.log(`[Hudu][${category}] ${message}`, safeData);
  }
  // No else branch - if category doesn't exist or is disabled, don't log anything
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

  const sensitiveKeys = ['x-api-key', 'apiKey', 'api_key', 'password', 'token', 'secret', 'authorization'];
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  if (isRecord(obj)) {
    const redactedObj: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Case-insensitive check for sensitive keys
      if (sensitiveKeys.some(sensitiveKey => key.toLowerCase() === sensitiveKey.toLowerCase())) {
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