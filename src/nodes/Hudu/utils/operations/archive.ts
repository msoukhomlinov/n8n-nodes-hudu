import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { DEBUG_CONFIG, debugLog } from '../debugConfig';

export async function handleArchiveOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  id: string | number,
  archive = true,
  companyId?: string | number,
): Promise<IDataObject | IDataObject[]> {
  if (DEBUG_CONFIG.OPERATION_ARCHIVE) {
    debugLog('Archive Operation - Input', {
      endpoint: resourceEndpoint,
      id,
      companyId,
      action: archive ? 'archive' : 'unarchive',
    });
  }

  const endpoint = companyId 
    ? `/companies/${companyId}${resourceEndpoint}/${id}/${archive ? 'archive' : 'unarchive'}`
    : `${resourceEndpoint}/${id}/${archive ? 'archive' : 'unarchive'}`;

  const response = await huduApiRequest.call(
    this,
    'PUT',
    endpoint,
  );

  if (DEBUG_CONFIG.OPERATION_ARCHIVE) {
    debugLog('Archive Operation - Response', response);
  }

  return response;
} 