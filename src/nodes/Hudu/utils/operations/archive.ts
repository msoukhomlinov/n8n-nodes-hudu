import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleArchiveOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  resourceId: string | number,
  isArchive: boolean,
): Promise<IDataObject | IDataObject[]> {
  const action = isArchive ? 'archive' : 'unarchive';
  return await huduApiRequest.call(
    this,
    'PUT',
    `${resourceEndpoint}/${resourceId}/${action}`,
  );
} 