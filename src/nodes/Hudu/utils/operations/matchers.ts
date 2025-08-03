import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleListing } from '../requestUtils';

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

  // Use the shared handleListing function for proper pagination support
  return await handleListing.call(
    this,
    'GET',
    '/matchers',
    'matchers',
    {},
    queryParams,
    returnAll,
    limit,
  );
} 