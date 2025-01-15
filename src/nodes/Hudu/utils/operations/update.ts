import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { DEBUG_CONFIG, debugLog } from '../debugConfig';

export async function handleUpdateOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  id: string | number,
  body: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  if (DEBUG_CONFIG.OPERATION_UPDATE) {
    debugLog('Update Operation - Input', {
      endpoint: resourceEndpoint,
      id,
      body,
    });
  }

  const response = await huduApiRequest.call(
    this,
    'PUT',
    `${resourceEndpoint}/${id}`,
    body,
  );

  if (DEBUG_CONFIG.OPERATION_UPDATE) {
    debugLog('Update Operation - Response', response);
  }

  return response;
} 