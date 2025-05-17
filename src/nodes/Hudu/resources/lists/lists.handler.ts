import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { ListsOperation } from './lists.types';
import { DEBUG_CONFIG, debugLog } from '../../utils/debugConfig';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleListsOperation(
  this: IExecuteFunctions,
  operation: ListsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/lists';
  let responseData: IDataObject | IDataObject[] = {};

  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('Lists Handler - Input', {
      operation,
      index: i,
    });
  }

  switch (operation) {
    case 'create': {
      // Name is required
      const name = this.getNodeParameter('name', i) as string;
      if (!name || name.trim() === '') {
        throw new Error('List name cannot be blank');
      }
      
      const body: IDataObject = {
        name,
      };
      
      responseData = await handleCreateOperation.call(
        this,
        resourceEndpoint,
        { list: body },
      );
      break;
    }
    case 'get': {
      const listId = this.getNodeParameter('id', i) as string;
      responseData = await handleGetOperation.call(
        this,
        resourceEndpoint,
        listId,
      );
      break;
    }
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
      const qs: IDataObject = { ...filters };
      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'lists',
        qs,
        returnAll,
        limit,
      );
      break;
    }
    case 'update': {
      const listId = this.getNodeParameter('id', i) as string;
      const name = this.getNodeParameter('updateFields.name', i) as string;
      if (!name || name.trim() === '') {
        throw new Error('List name cannot be blank');
      }
      
      const updateData: IDataObject = {
        name,
      };
      
      responseData = await handleUpdateOperation.call(
        this,
        resourceEndpoint,
        listId,
        { list: updateData },
      );
      break;
    }
    case 'delete': {
      const listId = this.getNodeParameter('id', i) as string;
      responseData = await handleDeleteOperation.call(
        this,
        resourceEndpoint,
        listId,
      );
      break;
    }
    default:
      throw new Error(`The operation "${operation}" is not supported!`);
  }

  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('Lists Handler - Response', responseData);
  }

  return responseData;
} 