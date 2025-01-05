import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import type { ApiInfoOperation } from './api_info.types';

export async function handleApiInfoOperation(
  this: IExecuteFunctions,
  operation: ApiInfoOperation,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/api_info',
      );
      break;
    }
  }

  return responseData;
}
