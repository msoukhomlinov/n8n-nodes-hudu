import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleSystemInfoOperation } from '../../utils/operations';
import type { ApiInfoOperation } from './api_info.types';

export async function handleApiInfoOperation(
  this: IExecuteFunctions,
  operation: ApiInfoOperation,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      responseData = await handleSystemInfoOperation.call(
        this,
        '/api_info',
      );
      break;
    }
  }

  return responseData;
}
