import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { DEBUG_CONFIG, debugLog } from '../debugConfig';

export async function handleDeleteOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  id: string | number,
  companyId?: string | number,
): Promise<IDataObject | IDataObject[]> {
  if (DEBUG_CONFIG.OPERATION_DELETE) {
    debugLog('Delete Operation - Input', {
      endpoint: resourceEndpoint,
      id,
      companyId,
    });
  }

  const endpoint = companyId 
    ? `/companies/${companyId}${resourceEndpoint}/${id}`
    : `${resourceEndpoint}/${id}`;

  const response = await huduApiRequest.call(
    this,
    'DELETE',
    endpoint,
  );

  if (DEBUG_CONFIG.OPERATION_DELETE) {
    debugLog('Delete Operation - Response', response);
  }

  return response;
} 