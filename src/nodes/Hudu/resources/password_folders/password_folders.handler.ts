import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils/GenericFunctions';
import type { PasswordFoldersOperations } from './password_folders.types';

export async function handlePasswordFoldersOperation(
  this: IExecuteFunctions,
  operation: PasswordFoldersOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'get': {
      const folderId = this.getNodeParameter('id', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/password_folders/${folderId}`,
      );
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      const qs: IDataObject = {
        ...filters,
      };

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/password_folders',
        'password_folders',
        {},
        qs,
        returnAll,
        limit,
      );
      break;
    }
  }

  return responseData;
}
