import type { IExecuteFunctions, IDataObject, ILoadOptionsFunctions } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleGetOperation(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  resourceEndpoint: string,
  resourceId: string | number,
): Promise<IDataObject | IDataObject[]> {
  return await huduApiRequest.call(
    this,
    'GET',
    `${resourceEndpoint}/${resourceId}`,
  );
} 