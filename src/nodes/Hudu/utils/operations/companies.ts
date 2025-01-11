import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleCompanyJumpOperation(
  this: IExecuteFunctions,
  integrationSlug: string,
  additionalParams: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
  const queryParams: IDataObject = {
    integration_slug: integrationSlug,
  };

  if (additionalParams.integrationId) {
    queryParams.integration_id = additionalParams.integrationId;
  }

  if (additionalParams.integrationIdentifier) {
    queryParams.integration_identifier = additionalParams.integrationIdentifier;
  }

  return await huduApiRequest.call(
    this,
    'GET',
    '/companies/jump',
    {},
    queryParams,
  );
} 