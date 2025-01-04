import {
  type IDataObject,
  type IExecuteFunctions,
  type IHookFunctions,
  type ILoadOptionsFunctions,
  type IHttpRequestMethods,
  type IHttpRequestOptions,
  NodeApiError,
} from 'n8n-workflow';
import { HUDU_API_CONSTANTS, RESOURCES_WITH_PAGE_SIZE } from './constants';

/**
 * Extract error message from API response
 */
function extractErrorMessage(error: any): string {
  if (!error.response?.data) {
    return error.message || 'Unknown error occurred';
  }

  const data = error.response.data;

  // Handle case where the message includes status code and JSON
  if (typeof data === 'string' && data.includes(' - {')) {
    try {
      const jsonPart = data.substring(data.indexOf('{'));
      const parsedData = JSON.parse(jsonPart);
      if (parsedData.error) return parsedData.error;
      if (parsedData.message) return parsedData.message;
    } catch {
      // If parsing fails, continue with normal processing
    }
  }

  // Handle regular string response
  if (typeof data === 'string') {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.error) return parsedData.error;
      if (parsedData.message) return parsedData.message;
      return JSON.stringify(parsedData, null, 2);
    } catch {
      return data;
    }
  }

  // Handle JSON response
  if (typeof data === 'object') {
    if (data.error) return data.error;
    if (data.message) return data.message;

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Invalid response format';
    }
  }

  return error.message || 'Unknown error occurred';
}

/**
 * Create a standardized error object for API errors
 */
function createApiError(
  node: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
  error: any,
): NodeApiError {
  // If it's already a NodeApiError, return it as is
  if (error.name === 'NodeApiError') {
    return error;
  }

  // Handle Axios errors
  if (error.isAxiosError) {
    const status = error.response?.status;
    const message = extractErrorMessage(error);

    switch (status) {
      case 401:
        return new NodeApiError(node.getNode(), error, {
          message: message || 'Bad credentials',
          description:
            message || 'The API credentials are invalid. Please check your API key and base URL.',
          httpCode: '401',
        });

      case 404:
        return new NodeApiError(node.getNode(), error, {
          message: message || 'Resource not found',
          description:
            message ||
            'The requested resource could not be found. Please verify the ID or endpoint.',
          httpCode: '404',
        });

      case 422:
        return new NodeApiError(node.getNode(), error, {
          message: message || `Validation error: ${message}`,
          description:
            message || 'The request could not be processed. Please check the provided data.',
          httpCode: '422',
        });

      default:
        return new NodeApiError(node.getNode(), error, {
          message: message || `Request failed: ${message}`,
          description:
            message ||
            'An unexpected error occurred. Please check the error details and try again.',
          httpCode: status?.toString() || 'unknown',
        });
    }
  }

  // Handle non-Axios errors
  return new NodeApiError(node.getNode(), error, {
    message: error.message || 'An unexpected error occurred',
    description: error.message || 'An internal error occurred while processing the request',
  });
}

/**
 * Make an API request to Hudu
 */
export async function huduApiRequest(
  this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject | IDataObject[] = {},
  qs: IDataObject = {},
): Promise<any> {
  const credentials = await this.getCredentials('huduApi');

  if (!credentials?.apiKey || !credentials?.baseUrl) {
    throw new NodeApiError(this.getNode(), {
      message: 'Missing API credentials',
      description: 'Please provide both the API key and base URL in the credentials configuration.',
    });
  }

  const options: IHttpRequestOptions = {
    method,
    body,
    qs,
    url: `${credentials.baseUrl}${HUDU_API_CONSTANTS.BASE_API_PATH}${endpoint}`,

    json: true,
    headers: {
      'x-api-key': credentials.apiKey as string,
      'Content-Type': 'application/json',
    },
  };

  if (Object.keys(body).length === 0) {
    delete options.body;
  }

  try {
    if (!this.helpers?.request) {
      throw new Error('Request helper not available');
    }
    return await this.helpers.request(options);
  } catch (error) {
    throw createApiError(this, error);
  }
}

/**
 * Type for resources that support page_size parameter
 */
export type ResourceWithPageSize = typeof RESOURCES_WITH_PAGE_SIZE[number];

/**
 * Configuration for paginated requests
 */
interface PaginationConfig {
  page: number;
  page_size?: number;
  resourcePath: string;
  supportsPageSize: boolean;
}

/**
 * Type for pagination query parameters
 */
interface PaginationQueryParams extends IDataObject {
  page: number;
  page_size?: number;
}

/**
 * Create pagination parameters based on resource and configuration
 */
function createPaginationParams(
  endpoint: string,
  limit?: number,
): PaginationConfig {
  // Remove leading slash and split path
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const parts = cleanEndpoint.split('/');
  let resourcePath = parts[0];
  
  // Special case for /companies/{id}/assets which supports pagination
  if (parts.length > 2 && parts[0] === 'companies' && parts[2] === 'assets') {
    resourcePath = 'companies/assets';
  }

  const supportsPageSize = RESOURCES_WITH_PAGE_SIZE.includes(resourcePath as ResourceWithPageSize);
  
  const config: PaginationConfig = {
    page: 1,
    resourcePath,
    supportsPageSize,
  };

  if (supportsPageSize && limit) {
    config.page_size = limit;
  }

  return config;
}

/**
 * Make an API request to fetch all items from paginated endpoints
 */
export async function huduApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  resourceName?: string,
  body: IDataObject = {},
  query: IDataObject = {},
  limit?: number,
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  const paginationConfig = createPaginationParams(endpoint);
  const queryParams: PaginationQueryParams = { 
    ...query, 
    page: paginationConfig.page,
  };
  
  if (paginationConfig.supportsPageSize) {
    queryParams.page_size = HUDU_API_CONSTANTS.PAGE_SIZE;
  }

  try {
    let hasMorePages = true;
    while (hasMorePages) {
      // If we have a limit and we're close to it, adjust page_size for the last batch
      if (limit && paginationConfig.supportsPageSize) {
        const remaining = limit - returnData.length;
        if (remaining <= 0) {
          break;
        }
        if (remaining < HUDU_API_CONSTANTS.PAGE_SIZE) {
          queryParams.page_size = remaining;
        }
      }

      const responseData = await huduApiRequest.call(this, method, endpoint, body, queryParams);
      const items = resourceName ? responseData[resourceName] as IDataObject[] : responseData as IDataObject[];
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        hasMorePages = false;
        continue;
      }

      returnData.push(...items);
      queryParams.page++;

      // Stop if we've reached the limit
      if (limit && returnData.length >= limit) {
        hasMorePages = false;
        continue;
      }

      // Check if we've reached the end of pagination
      hasMorePages = items.length === (queryParams.page_size || HUDU_API_CONSTANTS.PAGE_SIZE);
    }

    // If we have a limit, ensure we don't return more than requested
    if (limit && returnData.length > limit) {
      return returnData.slice(0, limit);
    }

    return returnData;
  } catch (error) {
    if (error.name === 'NodeApiError') {
      throw error;
    }
    throw createApiError(this, error);
  }
}

/**
 * Validates JSON string
 */
export function validateJSON(json: string | undefined): any {
  let result;
  try {
    result = JSON.parse(json!);
  } catch (exception) {
    result = undefined;
  }
  return result;
}

/**
 * Handle paginated listings from Hudu API with proper error handling
 */
export async function handleListing(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  resourceName?: string,
  body: IDataObject = {},
  query: IDataObject = {},
  returnAll = false,
  limit = 0,
): Promise<IDataObject[]> {
  try {
    // If returnAll is true or limit > PAGE_SIZE, use pagination
    if (returnAll || (limit > HUDU_API_CONSTANTS.PAGE_SIZE)) {
      return await huduApiRequestAllItems.call(
        this,
        method,
        endpoint,
        resourceName,
        body,
        query,
        returnAll ? undefined : limit,
      );
    }

    // Handle single page request
    const paginationConfig = createPaginationParams(endpoint);
    const queryParams: PaginationQueryParams = {
      ...query,
      page: paginationConfig.page,
    };

    if (paginationConfig.supportsPageSize) {
      queryParams.page_size = limit > 0 ? Math.min(limit, HUDU_API_CONSTANTS.PAGE_SIZE) : HUDU_API_CONSTANTS.PAGE_SIZE;
    }

    const responseData = await huduApiRequest.call(this, method, endpoint, body, queryParams);
    const items = resourceName ? responseData[resourceName] as IDataObject[] : responseData as IDataObject[];
    
    if (!items || !Array.isArray(items)) {
      return [];
    }

    // If a limit is specified and we got more items than the limit,
    // manually limit the results
    if (limit > 0 && items.length > limit) {
      return items.slice(0, limit);
    }

    return items;
  } catch (error) {
    if (error.name === 'NodeApiError') {
      throw error;
    }
    throw createApiError(this, error);
  }
}
