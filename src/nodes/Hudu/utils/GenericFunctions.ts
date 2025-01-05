import type {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { HUDU_API_CONSTANTS, RESOURCES_WITH_PAGE_SIZE } from './constants';

/**
 * Make an API request to Hudu
 */
export async function huduApiRequest(
  this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject | IDataObject[] = {},
  qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
  const credentials = await this.getCredentials('huduApi');

  if (!credentials?.apiKey || !credentials?.baseUrl) {
    throw new NodeApiError(this.getNode(), {
      message: 'Missing API credentials',
      description: 'Please provide both the API key and base URL in the credentials configuration.',
    });
  }

  // Debug logging for query parameters
  console.log('API Request Debug:', {
    method,
    endpoint,
    queryParams: qs,
    body: Object.keys(body).length > 0 ? body : 'empty'
  });

  // Handle updated_at parameter specifically
  if (qs.updated_at) {
    console.log('Updated At Filter:', qs.updated_at);
  }

  const options: IHttpRequestOptions = {
    method,
    qs,
    url: `${credentials.baseUrl}${HUDU_API_CONSTANTS.BASE_API_PATH}${endpoint}`,
    json: true,
    headers: {
      'x-api-key': credentials.apiKey as string,
      'Content-Type': 'application/json',
    },
  };

  if (Object.keys(body).length > 0) {
    options.body = body;
  }

  const helpers = this.helpers;
  if (!helpers?.request) {
    throw new Error('Request helper not available');
  }

  // Log the final request URL with query parameters
  const finalUrl = new URL(options.url);
  for (const [key, value] of Object.entries(qs)) {
    if (value !== undefined && value !== null) {
      finalUrl.searchParams.append(key, value.toString());
    }
  }
  console.log('Final Request URL:', finalUrl.toString());

  const response = await helpers.request(options) || {};
  return Array.isArray(response) ? response : response as IDataObject;
}

/**
 * Type for resources that support page_size parameter
 */
export type ResourceWithPageSize = (typeof RESOURCES_WITH_PAGE_SIZE)[number];

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
function createPaginationParams(endpoint: string, limit?: number): PaginationConfig {
  // Remove leading slash and split path
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const parts = cleanEndpoint.split('/');
  let resourcePath = parts[0] || '';

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
    let items: IDataObject[];
    
    if (resourceName && !Array.isArray(responseData)) {
      const data = responseData as IDataObject;
      const resourceData = data[resourceName];
      items = Array.isArray(resourceData) ? resourceData : [];
    } else {
      items = Array.isArray(responseData) ? responseData : [responseData as IDataObject];
    }

    if (items.length === 0) {
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
  // If returnAll is true or limit > PAGE_SIZE, use pagination
  if (returnAll || limit > HUDU_API_CONSTANTS.PAGE_SIZE) {
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
    page: paginationConfig.page,
  };

  // Add pagination size if supported
  if (paginationConfig.supportsPageSize) {
    queryParams.page_size = limit > 0 ? Math.min(limit, HUDU_API_CONSTANTS.PAGE_SIZE) : HUDU_API_CONSTANTS.PAGE_SIZE;
  }

  // Add other query parameters
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      queryParams[key] = value;
    }
  }

  console.log('Final query parameters:', queryParams);

  const responseData = await huduApiRequest.call(this, method, endpoint, body, queryParams);
  let items: IDataObject[];
  
  if (resourceName && !Array.isArray(responseData)) {
    const data = responseData as IDataObject;
    const resourceData = data[resourceName];
    items = Array.isArray(resourceData) ? resourceData : [];
  } else {
    items = Array.isArray(responseData) ? responseData : [responseData as IDataObject];
  }

  if (items.length === 0) {
    return [];
  }

  // If a limit is specified and we got more items than the limit,
  // manually limit the results
  if (limit > 0 && items.length > limit) {
    return items.slice(0, limit);
  }

  return items;
}

/**
 * Process date range parameters for filtering
 */
export function processDateRange(dateRange: {
  range?: {
    mode: 'exact' | 'range' | 'preset';
    exact?: string;
    start?: string;
    end?: string;
    preset?: string;
  };
}): string | undefined {
  console.log('processDateRange input:', JSON.stringify(dateRange, null, 2));
  
  if (!dateRange.range) {
    console.log('No range found in dateRange');
    return undefined;
  }

  let result: string | undefined;

  switch (dateRange.range.mode) {
    case 'exact':
      console.log('Processing exact date:', dateRange.range.exact);
      result = dateRange.range.exact;
      break;
    case 'range':
      console.log('Processing date range:', {
        start: dateRange.range.start,
        end: dateRange.range.end
      });
      // Handle partial ranges - if either start or end is provided
      if (dateRange.range.start || dateRange.range.end) {
        result = `${dateRange.range.start || ''},${dateRange.range.end || ''}`;
      }
      break;
    case 'preset': {
      console.log('Processing preset:', dateRange.range.preset);
      const now = new Date();
      const startDate = new Date();
      
      switch (dateRange.range.preset) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'yesterday': {
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          result = `${startDate.toISOString()},${endDate.toISOString()}`;
          break;
        }
        case 'last24h':
          startDate.setHours(startDate.getHours() - 24);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'last48h':
          startDate.setHours(startDate.getHours() - 48);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'last7d':
          console.log('Processing last7d preset');
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          console.log('Start date:', startDate.toISOString());
          console.log('End date:', now.toISOString());
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'last14d':
          startDate.setDate(startDate.getDate() - 14);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'last30d':
          startDate.setDate(startDate.getDate() - 30);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'last60d':
          startDate.setDate(startDate.getDate() - 60);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'last90d':
          startDate.setDate(startDate.getDate() - 90);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'thisWeek':
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'lastWeek': {
          startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          result = `${startDate.toISOString()},${endDate.toISOString()}`;
          break;
        }
        case 'thisMonth':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'lastMonth': {
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
          endDate.setHours(23, 59, 59, 999);
          result = `${startDate.toISOString()},${endDate.toISOString()}`;
          break;
        }
        case 'thisYear':
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          result = `${startDate.toISOString()},${now.toISOString()}`;
          break;
        case 'lastYear': {
          startDate.setFullYear(startDate.getFullYear() - 1);
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setMonth(11, 31);
          endDate.setHours(23, 59, 59, 999);
          result = `${startDate.toISOString()},${endDate.toISOString()}`;
          break;
        }
        default:
          return undefined;
      }
      console.log('Processed preset result:', result);
    }
    break;
  }

  if (result) {
    console.log('Final processed date range:', result);
  } else {
    console.log('No result produced from date range processing');
  }

  return result;
}
