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
import { HUDU_API_CONSTANTS, RATE_LIMIT_CONFIG, RESOURCES_WITH_PAGE_SIZE } from './constants';
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

/**
 * Remove empty values and coerce primitives for query strings
 */
export function sanitizeQueryParams<T extends IDataObject>(qs: T): T {
  const cleaned: IDataObject = {};
  for (const [key, value] of Object.entries(qs || {})) {
    if (value === '' || value === undefined || value === null) continue;
    cleaned[key] = value as any;
  }
  return cleaned as T;
}

/**
 * Remove empty values and coerce primitives for request bodies
 */
export function sanitizeRequestPayload<T extends IDataObject>(body: T): T {
  const cleaned: IDataObject = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (value === '' || value === undefined || value === null) continue;
    cleaned[key] = value as any;
  }
  return cleaned as T;
}


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
export function sleep(ms: number): Promise<void> {
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
  let contentType = method === 'GET' ? 'application/x-www-form-urlencoded' : 'application/json';

  if (!credentials?.apiKey || !credentials?.baseUrl) {
    throw new Error('Missing API credentials. Please provide both the API key and base URL.');
  }

  const requestOptions: IHttpRequestOptions = {
    method,
    url: `${credentials.baseUrl}${HUDU_API_CONSTANTS.BASE_API_PATH}${endpoint}`,
    qs: toJsonObject(sanitizeQueryParams(qs)),
    headers: {
      'x-api-key': credentials.apiKey as string,
    },
  };

  // Detect multipart
  if ((body as any)._isMultipart) {
    contentType = 'multipart/form-data';
    (requestOptions as any).formData = { ...body };
    delete (requestOptions as any).formData._isMultipart;
  } else if (Object.keys(body).length > 0) {
    if (contentType === 'application/json') {
      requestOptions.json = true;
    }
    requestOptions.body = toJsonObject(sanitizeRequestPayload(body));
  }

  if (requestOptions.headers) {
    requestOptions.headers['Content-Type'] = contentType;
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
        debugLog('[API_REQUEST] Hudu API Request:', {
          method: requestOptions.method,
          url: requestOptions.url,
          headers: requestOptions.headers,
          qs: requestOptions.qs,
          body: requestOptions.body,
          formData: (requestOptions as any).formData,
        });
      }

      // Get the raw response
      const rawResponse = await helpers.request(requestOptions);
      
      if (DEBUG_CONFIG.API_RESPONSE) {
        debugLog('[API_RESPONSE] Hudu API Response:', {
          statusCode: (rawResponse as any)?.statusCode,
          headers: (rawResponse as any)?.headers,
          body: rawResponse,
        });
      }

      // Parse the response if it's a string
      const response = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

      // Return empty array for null/undefined responses
      if (response === null || response === undefined) {
        return [];
      }

      return response;
    } catch (error) {
      // For DELETE requests, a 204 status code is a success, but n8n's request helper
      // may throw an error because there is no response body. We intercept this case.
      const err = error as IDataObject;
      const context = err.context as IDataObject | undefined;
      const responseContext = context?.response as IDataObject | undefined;
      const statusCode = err.statusCode ?? responseContext?.statusCode;

      if (requestOptions.method === 'DELETE' && statusCode === 204) {
        debugLog('[API_RESPONSE] Handled 204 No Content for DELETE request', {
          url: requestOptions.url,
        });
        return { success: true };
      }
      
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
      
      const axiosError = error as {
        response?: {
          body?: any;
          headers?: any;
        };
        statusCode?: number;
      };

      // Preserve the original error message which may contain JSON details
      const originalMessage = error.message || 'Unknown error';
      
      // Get status code specific message as fallback
      const fallbackMessage = axiosError.statusCode ?
        getErrorMessage(axiosError.statusCode, originalMessage) :
        originalMessage;
      
      let errorDetails = '';
      if (axiosError.response?.body) {
        try {
          const body = typeof axiosError.response.body === 'string' ? JSON.parse(axiosError.response.body) : axiosError.response.body;
          if (body.error) {
            errorDetails = body.error;
            if (body.details && Array.isArray(body.details)) {
              errorDetails += `: ${body.details.join(', ')}`;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      if (DEBUG_CONFIG.API_RESPONSE) {
        debugLog('[API_RESPONSE] Hudu API Error Response:', {
          statusCode: axiosError.statusCode,
          headers: axiosError.response?.headers,
          body: axiosError.response?.body,
        });
      }

      if (error instanceof Error) {
        // Preserve original message if it contains JSON details, otherwise use formatted message
        if (originalMessage.includes('{') && originalMessage.includes('}')) {
          jsonError.message = originalMessage;
        } else {
          jsonError.message = errorDetails ? `${fallbackMessage} - ${errorDetails}` : fallbackMessage;
        }
        jsonError.name = error.name;
        if (error.stack) {
          jsonError.stack = error.stack;
        }
        // Include any additional error details from the response
        if (axiosError.response?.body) {
          try {
            const errorBody = typeof axiosError.response.body === 'string' ?
              JSON.parse(axiosError.response.body) :
              axiosError.response.body;
            jsonError.details = errorBody;
          } catch {
            // If parsing fails, include raw error body
            jsonError.details = axiosError.response.body;
          }
        }
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = toJsonObject(error as IDataObject);
        jsonError.message = errorDetails ? `${fallbackMessage} - ${errorDetails}` : fallbackMessage;
        // Include any additional error details from the response
        if (axiosError.response?.body) {
          try {
            const errorBody = typeof axiosError.response.body === 'string' ?
              JSON.parse(axiosError.response.body) :
              axiosError.response.body;
            jsonError.details = errorBody;
          } catch {
            // If parsing fails, include raw error body
            jsonError.details = axiosError.response.body;
          }
        }
        Object.assign(jsonError, errorObj);
      } else {
        jsonError.message = errorDetails ? `${fallbackMessage} - ${errorDetails}` : fallbackMessage;
        jsonError.error = String(error);
      }

      // Add status code to error object
      if (axiosError.statusCode) {
        jsonError.statusCode = axiosError.statusCode;
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

  // When post-processing filters are present, always use maximum page size to minimize API calls
  // since filtering happens client-side and we may need to fetch more items to meet the limit
  // Otherwise, optimise page size if we have a specific limit less than default page size
  const hasPostProcessFilters = !!(postProcessFilters && filterMapping);
  const pageSize = hasPostProcessFilters
    ? HUDU_API_CONSTANTS.PAGE_SIZE
    : !returnAll && limit > 0 && limit < HUDU_API_CONSTANTS.PAGE_SIZE 
      ? limit 
      : HUDU_API_CONSTANTS.PAGE_SIZE;

  //debugLog('[handleListing] Start', { endpoint, resourceName, returnAll, limit, pageSize });

  // Check if this resource supports pagination
  const resourcePath = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  // Handle dynamic nested endpoints like companies/{id}/assets where pagination is supported
  const supportsPagination =
    RESOURCES_WITH_PAGE_SIZE.includes(resourcePath as any) ||
    (resourcePath.startsWith('companies/') && resourcePath.endsWith('/assets'));

  // Rate limiting: track delay and consecutive rate limit errors
  let currentDelay: number = RATE_LIMIT_CONFIG.DELAY_MS;
  let consecutiveRateLimits = 0;

  // Keep fetching until we have enough filtered results or no more data
  while (hasMore) {
    // Add delay between pagination requests (skip first page)
    if (page > 1) {
      await sleep(currentDelay);
    }

    // Only include pagination parameters if the resource supports them
    const queryParams = { ...query };
    
    if (supportsPagination) {
      queryParams.page = page;
      queryParams.page_size = pageSize;
    }
    
    try {
      const response = await huduApiRequest.call(this, method, endpoint, body, queryParams, resourceName);
      const batchResults = parseHuduResponse(response, resourceName);

      // Reset consecutive rate limit counter on success
      consecutiveRateLimits = 0;

      //debugLog('[handleListing] Page fetched', { 
      //  endpoint, 
      //  resourceName, 
      //  page, 
      //  supportsPagination,
      //  batchCount: batchResults.length, 
      //  cumulativeCount: results.length + batchResults.length 
      //});

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

      // If resource doesn't support pagination, we get all data in one request
      if (!supportsPagination) {
        hasMore = false;
      } else {
        // Determine if we should continue fetching for resources with pagination
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
    } catch (error) {
      // If rate limited, apply exponential backoff for remaining requests
      const err = error as IDataObject;
      const context = err.context as IDataObject | undefined;
      const responseContext = context?.response as IDataObject | undefined;
      const statusCode = err.statusCode ?? responseContext?.statusCode;

      if (statusCode === 429) {
        consecutiveRateLimits++;
        // Exponential backoff: 1s, 2s, 4s, 8s... capped at MAX_DELAY_MS
        currentDelay = Math.min(
          RATE_LIMIT_CONFIG.BACKOFF_DELAY_MS * (2 ** (consecutiveRateLimits - 1)),
          RATE_LIMIT_CONFIG.MAX_DELAY_MS
        );
      }
      // Re-throw error to let existing retry logic in executeHuduRequest handle it
      throw error;
    }
  }

  // Slice to exact limit if we're not returning all
  if (!returnAll && limit && filteredResults.length > limit) {
    filteredResults = filteredResults.slice(0, limit);
  }

  return filteredResults;
}