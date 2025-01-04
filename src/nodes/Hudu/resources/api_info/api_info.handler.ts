import { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { ApiInfoOperation } from './api_info.types';

export async function handleApiInfoOperation(
  this: IExecuteFunctions,
  operation: ApiInfoOperation,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'get': {
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/api_info',
      );
      return responseData;
    }
  }

  return responseData;
}
