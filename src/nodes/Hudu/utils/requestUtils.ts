/**
 * HTTP request utilities for Hudu API integration
 * 
 * Provides functionality for:
 * - Creating and executing HTTP requests to Hudu API
 * - Request configuration and credential handling
 * - Response parsing and error handling
 * - Type-safe data conversion between n8n and API formats
 */

// Debug flags - set to true to enable debug logging
const DEBUG = false;
const DEBUG_RESPONSE = false;

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

export interface IHuduRequestOptions {
  method: IHttpRequestMethods;
  endpoint: string;
  body?: IDataObject;
  qs?: IDataObject;
  paginate?: boolean;
  contentType?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';
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

  try {
    if (DEBUG) {
      console.log('Making request to Hudu API:', {
        method: requestOptions.method,
        url: requestOptions.url,
        headers: requestOptions.headers,
        qs: requestOptions.qs,
        body: requestOptions.body,
      });
    }

    // Get the raw response
    const rawResponse = await helpers.request(requestOptions);
    
    // Parse the response if it's a string
    const response = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    // Log response for GET requests
    if (DEBUG_RESPONSE) {
      console.log('DEBUG - Response:', {
        type: typeof response,
        isArray: Array.isArray(response),
        keys: typeof response === 'object' ? Object.keys(response || {}) : [],
        requestedFilters: requestOptions.qs,
        rawResponse: response,
      });
    }

    return response || {};
  } catch (error) {
    if (DEBUG) {
      console.error('Hudu API Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    const jsonError: JsonObject = {};
    if (error instanceof Error) {
      jsonError.message = error.message;
      jsonError.name = error.name;
      if (error.stack) {
        jsonError.stack = error.stack;
      }
    } else if (typeof error === 'object' && error !== null) {
      Object.assign(jsonError, toJsonObject(error as IDataObject));
    } else {
      jsonError.error = String(error);
    }
    throw new NodeApiError(this.getNode(), jsonError);
  }
}

/**
 * Parse Hudu API response based on expected format
 */
export function parseHuduResponse(
  response: IDataObject | IDataObject[],
  resourceName?: string,
): IDataObject[] {
  // If response is already an array, return it
  if (Array.isArray(response)) {
    return response as IDataObject[];
  }

  // If we have a resource name, the response should be an object with that key
  if (resourceName) {
    // Handle case where response is an object containing the array
    const data = response as IDataObject;
    if (data[resourceName] !== undefined) {
      const resourceData = data[resourceName];
      if (Array.isArray(resourceData)) {
        return resourceData as IDataObject[];
      }
      // If it's a single item, wrap it in an array
      if (resourceData !== null && typeof resourceData === 'object') {
        return [resourceData as IDataObject];
      }
    }
    
    // If we can't find the data in the expected format, return empty array
    return [];
  }

  // If no resource name and response is an object, wrap it in an array
  return [response as IDataObject];
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