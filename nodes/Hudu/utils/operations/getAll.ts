import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleListing } from '../requestUtils';
import type { FilterMapping } from '../types';
import { DEBUG_CONFIG, debugLog } from '../debugConfig';

export async function handleGetAllOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  resourceName: string | undefined,
  filters: IDataObject = {},
  returnAll = false,
  limit = 25,
  postProcessFilters?: IDataObject,
  filterMapping?: FilterMapping<IDataObject>,
): Promise<IDataObject[]> {
  if (DEBUG_CONFIG.OPERATION_GET_ALL) {
    debugLog('GetAll Operation - Input', {
      endpoint: resourceEndpoint,
      resourceName,
      filters,
      returnAll,
      limit,
      hasPostProcessFilters: !!postProcessFilters,
      hasFilterMapping: !!filterMapping,
    });
  }

  const results = await handleListing.call(
    this,
    'GET',
    resourceEndpoint,
    resourceName,
    {},
    filters,
    returnAll,
    limit,
    postProcessFilters,
    filterMapping,
  );

  if (DEBUG_CONFIG.OPERATION_GET_ALL) {
    debugLog('GetAll Operation - Response', {
      totalResults: Array.isArray(results) ? results.length : 1,
      results,
    });
  }

  return Array.isArray(results) ? results : [results];
} 