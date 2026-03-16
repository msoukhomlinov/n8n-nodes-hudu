import type { IExecuteFunctions, ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { DEBUG_CONFIG, debugLog } from '../debugConfig';

export async function handleGetOperation(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  resourceEndpoint: string,
  id: string | number,
  resourceName?: string,
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
    {},
    {},
    resourceName,
  );

  if (DEBUG_CONFIG.OPERATION_GET) {
    debugLog('Get Operation - Response', response);
  }

  // For GET operations, if we get an array with a single item, return the item directly
  if (Array.isArray(response) && response.length === 1) {
    return response[0];
  }

  return response;
} 