import { IExecuteFunctions } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import type { ApiInfoOperation } from './api_info.types';

export async function handleApiInfoOperation(
  this: IExecuteFunctions,
  operation: ApiInfoOperation,
  i: number,
): Promise<any> {
  let responseData;

  if (operation === 'get') {
    responseData = await huduApiRequest.call(this, 'GET', '/api_info');
  }

  return responseData;
}
