import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleGetOperation, handleGetAllOperation } from '../../utils/operations';
import type { PasswordFoldersOperations } from './password_folders.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handlePasswordFoldersOperation(
  this: IExecuteFunctions,
  operation: PasswordFoldersOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/password_folders';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'get': {
      const folderId = this.getNodeParameter('id', i) as string;
      responseData = await handleGetOperation.call(this, resourceEndpoint, folderId);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      const qs: IDataObject = {
        ...filters,
      };

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'password_folders',
        qs,
        returnAll,
        limit,
      );
      break;
    }
  }

  return responseData;
}
