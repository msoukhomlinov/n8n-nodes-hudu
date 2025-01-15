import type { IExecuteFunctions, ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { DEBUG_CONFIG, debugLog } from '../debugConfig';

export async function handleGetOperation(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  resourceEndpoint: string,
  id: string | number,
): Promise<IDataObject | IDataObject[]> {
  if (DEBUG_CONFIG.OPERATION_GET) {
    debugLog('Get Operation - Input', {
      endpoint: resourceEndpoint,
      id,
    });
  }

  const response = await huduApiRequest.call(
    this,
    'GET',
    `${resourceEndpoint}/${id}`,
  );

  if (DEBUG_CONFIG.OPERATION_GET) {
    debugLog('Get Operation - Response', response);
  }

  return response;
} 