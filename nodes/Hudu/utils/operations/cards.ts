import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleCardLookupOperation(
  this: IExecuteFunctions,
  integrationSlug: string,
  additionalParams: IDataObject = {},
): Promise<IDataObject[]> {
  const queryParams: IDataObject = {
    integration_slug: integrationSlug,
    ...additionalParams,
  };

  const response = await huduApiRequest.call(
    this,
    'GET',
    '/cards/lookup',
    undefined,
    queryParams,
  );

  return (response as { integrator_cards: IDataObject[] }).integrator_cards || [];
}

export async function handleCardJumpOperation(
  this: IExecuteFunctions,
  integrationType: string,
  integrationSlug: string,
  additionalParams: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
  const queryParams: IDataObject = {
    integration_type: integrationType,
    integration_slug: integrationSlug,
    ...additionalParams,
  };

  return await huduApiRequest.call(
    this,
    'GET',
    '/cards/jump',
    undefined,
    queryParams,
  );
} 