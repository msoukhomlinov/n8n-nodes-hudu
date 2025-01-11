import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleMatcherGetAllOperation(
  this: IExecuteFunctions,
  integrationId: number,
  filters: IDataObject = {},
  returnAll = false,
  limit = 25,
): Promise<IDataObject[]> {
  const queryParams: IDataObject = {
    integration_id: integrationId,
  };

  // Add optional filters
  if (filters.matched !== undefined) {
    queryParams.matched = filters.matched;
  }
  if (filters.sync_id !== undefined) {
    queryParams.sync_id = filters.sync_id;
  }
  if (filters.identifier !== undefined) {
    queryParams.identifier = filters.identifier;
  }
  if (filters.company_id !== undefined) {
    queryParams.company_id = Number.parseInt(filters.company_id as string, 10);
  }
  if (!returnAll) {
    queryParams.page_size = limit;
  }

  const response = await huduApiRequest.call(
    this,
    'GET',
    '/matchers',
    undefined,
    queryParams,
  );

  // Extract the matchers array from the response
  let matchers = Array.isArray(response)
    ? response
    : ((response as IDataObject).matchers as IDataObject[]) || [];

  if (!returnAll && matchers.length > limit) {
    matchers = matchers.slice(0, limit);
  }

  return matchers;
} 