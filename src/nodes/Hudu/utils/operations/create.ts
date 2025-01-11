import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleCreateOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  body: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  return await huduApiRequest.call(
    this,
    'POST',
    resourceEndpoint,
    body,
  );
} 