import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleDeleteOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  resourceId: string | number,
): Promise<IDataObject | IDataObject[]> {
  await huduApiRequest.call(
    this,
    'DELETE',
    `${resourceEndpoint}/${resourceId}`,
  );
  return { success: true };
} 