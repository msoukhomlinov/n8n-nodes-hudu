import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { DEBUG_CONFIG, debugLog } from '../debugConfig';

export async function handleCreateOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  body: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  if (DEBUG_CONFIG.OPERATION_CREATE) {
    debugLog('Create Operation - Input', {
      endpoint: resourceEndpoint,
      body,
    });
  }

  const response = await huduApiRequest.call(
    this,
    'POST',
    resourceEndpoint,
    body,
  );

  if (DEBUG_CONFIG.OPERATION_CREATE) {
    debugLog('Create Operation - Response', response);
  }

  return response;
} 