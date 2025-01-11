import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleListing } from '../requestUtils';
import type { FilterMapping } from '../types';

export async function handleGetAllOperation<T extends IDataObject = IDataObject>(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  resourceName?: string,
  filters: IDataObject = {},
  returnAll = false,
  limit = 25,
  postProcessFilters?: T,
  filterMapping?: FilterMapping,
): Promise<IDataObject | IDataObject[]> {
  return await handleListing.call(
    this,
    'GET',
    resourceEndpoint,
    resourceName,
    {},
    filters,
    returnAll,
    limit,
    postProcessFilters as IDataObject,
    filterMapping,
  );
} 