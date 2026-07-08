import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleListing } from '../requestUtils';
import { resolveRequiredCompanyId } from '../companyResolver';

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
  if (filters.company_id !== undefined && filters.company_id !== null && filters.company_id !== '') {
    queryParams.company_id = await resolveRequiredCompanyId(
      this,
      filters.company_id,
      this.getNode(),
      'Company ID',
    );
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