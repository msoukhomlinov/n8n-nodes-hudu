import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleSystemInfoOperation(
  this: IExecuteFunctions,
  endpoint: string,
): Promise<IDataObject | IDataObject[]> {
  return await huduApiRequest.call(
    this,
    'GET',
    endpoint,
  );
} 