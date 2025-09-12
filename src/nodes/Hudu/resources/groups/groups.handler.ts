import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleGetAllOperation, handleGetOperation } from '../../utils/operations';
import type { GroupsOperation } from './groups.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleGroupsOperation(
  this: IExecuteFunctions,
  operation: GroupsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/groups';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      const qs: IDataObject = { ...filters };

      // API returns groups wrapped in { "groups": [...] }
      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'groups',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as string;
      responseData = await handleGetOperation.call(this, resourceEndpoint, id, 'group');
      break;
    }
  }

  return responseData;
}


