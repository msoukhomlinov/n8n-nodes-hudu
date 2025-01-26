/**
 * HTTP request utilities for Hudu API integration
 * 
 * Provides functionality for:
 * - Creating and executing HTTP requests to Hudu API
 * - Request configuration and credential handling
 * - Response parsing and error handling
 * - Type-safe data conversion between n8n and API formats
 */

import type {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  ICredentialDataDecryptedObject,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from './constants';
import type { FilterMapping } from './types';
import { applyPostFilters } from './filterUtils';
import { DEBUG_CONFIG, debugLog } from './debugConfig';

export interface IHuduRequestOptions {
  method: IHttpRequestMethods;
  endpoint: string;
  body?: IDataObject;
  qs?: IDataObject;
  paginate?: boolean;
  contentType?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';
}

// Rate limiting constants
const RATE_LIMIT_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000, // Start with 1 second delay
  MAX_DELAY_MS: 10000, // Maximum delay of 10 seconds
  JITTER_MS: 500, // Add up to 500ms of random jitter
} as const;

// HTTP Status Code Messages
const HTTP_STATUS_MESSAGES = {
  // Client Errors
  400: 'Bad Request - The request was malformed or contains invalid parameters',
  401: 'Unauthorized - Invalid or missing API credentials',
  403: 'Forbidden - You do not have permission to access this resource',
  404: 'Not Found - The requested resource does not exist',
  422: 'Unprocessable Entity - The request was well-formed but contains semantic errors',
  429: 'Rate Limited - Too many requests, please try again later',
  
  // Server Errors
  500: 'Internal Server Error - An unexpected error occurred on the Hudu server',
  502: 'Bad Gateway - Unable to reach the Hudu server',
  503: 'Service Unavailable - The Hudu service is temporarily unavailable',
  504: 'Gateway Timeout - The request timed out while waiting for Hudu server',
} as const;

/**
 * Calculate delay for exponential backoff with jitter
 */
function calculateBackoffDelay(retryCount: number, retryAfter?: number): number {
  // If we have a retry-after header, use that as the base delay
  const baseDelay = retryAfter ? retryAfter * 1000 : RATE_LIMIT_CONFIG.BASE_DELAY_MS;
  
  // Calculate exponential backoff with jitter
  const exponentialDelay = baseDelay * (2 ** retryCount);
  const jitter = Math.random() * RATE_LIMIT_CONFIG.JITTER_MS;
  
  return Math.min(exponentialDelay + jitter, RATE_LIMIT_CONFIG.MAX_DELAY_MS);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert IDataObject to JsonObject safely
 */
export function toJsonObject(obj: IDataObject): JsonObject {
  const result: JsonObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value as JsonObject[string];
    }
  }
  return result;
}

/**
 * Create an HTTP request configuration for Hudu API
 */
export function createHuduRequest(
  credentials: ICredentialDataDecryptedObject,
  options: IHuduRequestOptions,
): IHttpRequestOptions {
  const { method, endpoint, body = {}, qs = {} } = options;
  // Use application/x-www-form-urlencoded for GET requests, default to application/json for others
  const contentType = method === 'GET' ? 'application/x-www-form-urlencoded' : 'application/json';

  if (!credentials?.apiKey || !credentials?.baseUrl) {
    throw new Error('Missing API credentials. Please provide both the API key and base URL.');
  }

  const requestOptions: IHttpRequestOptions = {
    method,
    url: `${credentials.baseUrl}${HUDU_API_CONSTANTS.BASE_API_PATH}${endpoint}`,
    qs: toJsonObject(qs),
    headers: {
      'x-api-key': credentials.apiKey as string,
      'Content-Type': contentType,
    },
  };

  if (Object.keys(body).length > 0) {
    if (contentType === 'application/json') {
      requestOptions.json = true;
    }
    requestOptions.body = toJsonObject(body);
  }

  return requestOptions;
}

/**
 * Get a descriptive error message for an HTTP status code
 */
function getErrorMessage(statusCode: number, defaultMessage: string): string {
  return HTTP_STATUS_MESSAGES[statusCode as keyof typeof HTTP_STATUS_MESSAGES] || defaultMessage;
}

/**
 * Execute an HTTP request to Hudu API
 */
export async function executeHuduRequest(
  this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
  requestOptions: IHttpRequestOptions,
): Promise<IDataObject | IDataObject[]> {
  const helpers = this.helpers;
  if (!helpers?.request) {
    throw new Error('Request helper not available');
  }

  let retryCount = 0;

  while (true) {
    try {
      if (DEBUG_CONFIG.API_REQUEST) {
        debugLog('Hudu API Request', {
          method: requestOptions.method,
          url: requestOptions.url,
          headers: requestOptions.headers,
          qs: requestOptions.qs,
          body: requestOptions.body,
          retryCount,
        });
      }

      // Get the raw response
      const rawResponse = await helpers.request(requestOptions);
      
      // Parse the response if it's a string
      const response = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

      // Log response for GET requests
      if (DEBUG_CONFIG.API_RESPONSE) {
        debugLog('Hudu API Response', {
          type: typeof response,
          isArray: Array.isArray(response),
          keys: typeof response === 'object' ? Object.keys(response || {}) : [],
          requestedFilters: requestOptions.qs,
          rawResponse: response,
        });
      }

      // Return empty array for null/undefined responses
      if (response === null || response === undefined) {
        return [];
      }

      return response;
    } catch (error) {
      if (DEBUG_CONFIG.API_REQUEST) {
        debugLog('Hudu API Error', {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          retryCount,
          statusCode: error.statusCode,
          level: 'error',
        });
      }

      // Check if it's a rate limit error and we haven't exceeded max retries
      if (error.statusCode === 429 && retryCount < RATE_LIMIT_CONFIG.MAX_RETRIES) {
        // Get retry-after header if available (in seconds)
        const retryAfter = error.response?.headers?.['retry-after'];
        const retryAfterMs = retryAfter ? Number.parseInt(retryAfter, 10) : undefined;

        // Calculate delay with exponential backoff
        const delayMs = calculateBackoffDelay(retryCount, retryAfterMs);

        if (DEBUG_CONFIG.API_REQUEST) {
          debugLog('Rate Limited - Retrying', {
            retryCount,
            retryAfter: retryAfterMs,
            delayMs,
          });
        }

        // Wait before retrying
        await sleep(delayMs);
        retryCount++;
        continue;
      }

      // Format error with specific status code message
      const jsonError: JsonObject = {};
      
      // Get status code specific message
      const statusMessage = error.statusCode ? 
        getErrorMessage(error.statusCode, error.message || 'Unknown error') :
        error.message || 'Unknown error';

      if (error instanceof Error) {
        jsonError.message = statusMessage;
        jsonError.name = error.name;
        if (error.stack) {
          jsonError.stack = error.stack;
        }
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = toJsonObject(error as IDataObject);
        jsonError.message = statusMessage;
        // Include any additional error details from the response
        if (error.response?.body) {
          try {
            const errorBody = typeof error.response.body === 'string' ? 
              JSON.parse(error.response.body) : 
              error.response.body;
            jsonError.details = errorBody;
          } catch {
            // If parsing fails, include raw error body
            jsonError.details = error.response.body;
          }
        }
        Object.assign(jsonError, errorObj);
      } else {
        jsonError.message = statusMessage;
        jsonError.error = String(error);
      }

      // Add status code to error object
      if (error.statusCode) {
        jsonError.statusCode = error.statusCode;
      }

      throw new NodeApiError(this.getNode(), jsonError);
    }
  }
}

/**
 * Parse Hudu API response based on expected format
 */
export function parseHuduResponse(
  response: IDataObject | IDataObject[],
  resourceName?: string,
): IDataObject[] {
  // If response is empty or undefined, return empty array
  if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
    return [];
  }

  // If response is already an array, return it if not empty
  if (Array.isArray(response)) {
    return response.filter(item => item && Object.keys(item).length > 0);
  }

  // If we have a resource name, the response should be an object with that key
  if (resourceName) {
    // Handle case where response is an object containing the array
    const data = response as IDataObject;
    if (data[resourceName] !== undefined) {
      const resourceData = data[resourceName];
      if (Array.isArray(resourceData)) {
        return resourceData.filter(item => item && Object.keys(item).length > 0) as IDataObject[];
      }
      // If it's a single item and not empty, wrap it in an array
      if (resourceData !== null && typeof resourceData === 'object' && Object.keys(resourceData).length > 0) {
        return [resourceData as IDataObject];
      }
    }
    
    // If we can't find the data in the expected format, return empty array
    return [];
  }

  // If no resource name and response is a non-empty object, wrap it in an array
  return Object.keys(response).length > 0 ? [response as IDataObject] : [];
}

/**
 * Make a request to Hudu API with proper error handling
 */
export async function huduApiRequest(
  this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  resourceName?: string,
): Promise<IDataObject | IDataObject[]> {
  const credentials = await this.getCredentials('huduApi');
  const requestOptions = createHuduRequest(credentials, { method, endpoint, body, qs });
  const response = await executeHuduRequest.call(this, requestOptions);
  return resourceName ? parseHuduResponse(response, resourceName) : response;
}

/**
 * Handle paginated listings from Hudu API with proper error handling
 */
export async function handleListing<T extends IDataObject>(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  resourceName?: string,
  body: IDataObject = {},
  query: IDataObject = {},
  returnAll = false,
  limit = 0,
  postProcessFilters?: T,
  filterMapping?: FilterMapping<T>,
): Promise<IDataObject[]> {
  const results: IDataObject[] = [];
  let filteredResults: IDataObject[] = [];
  let hasMore = true;
  let page = 1;

  // Optimize page size if we have a specific limit less than default page size
  const pageSize = !returnAll && limit > 0 && limit < HUDU_API_CONSTANTS.PAGE_SIZE 
    ? limit 
    : HUDU_API_CONSTANTS.PAGE_SIZE;

  // Keep fetching until we have enough filtered results or no more data
  while (hasMore) {
    const queryParams = { 
      ...query, 
      page,
      page_size: pageSize,
    };
    const response = await huduApiRequest.call(this, method, endpoint, body, queryParams, resourceName);
    const batchResults = parseHuduResponse(response, resourceName);

    if (batchResults.length === 0) {
      hasMore = false;
      continue;
    }

    results.push(...batchResults);

    // Apply filters to all results we have so far
    if (postProcessFilters && filterMapping) {
      filteredResults = applyPostFilters(
        results,
        postProcessFilters,
        filterMapping as Record<string, (item: IDataObject, value: unknown) => boolean>,
      );
    } else {
      filteredResults = results;
    }

    // Determine if we should continue fetching
    if (!returnAll) {
      if (filteredResults.length >= limit) {
        hasMore = false;
      } else {
        // Continue if there might be more results
        hasMore = batchResults.length === pageSize;
      }
    } else {
      // If returning all, continue if there might be more results
      hasMore = batchResults.length === pageSize;
    }

    page++;
  }

  // Slice to exact limit if we're not returning all
  if (!returnAll && limit && filteredResults.length > limit) {
    filteredResults = filteredResults.slice(0, limit);
  }

  return filteredResults;
} 