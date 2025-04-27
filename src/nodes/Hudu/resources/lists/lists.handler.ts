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
      // Flatten the fixedCollection structure for list_items_attributes
      const listItemsRaw = this.getNodeParameter('list_items_attributes', i, {}) as IDataObject;
      const listItems = Array.isArray(listItemsRaw.item) ? listItemsRaw.item : [];
      const body: IDataObject = {
        name,
      };
      if (listItems.length > 0) {
        body.list_items_attributes = listItems;
      }
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
      const limit = this.getNodeParameter('limit', i, 25) as number;
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
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      if (!updateFields || Object.keys(updateFields).length === 0) {
        throw new Error('No fields to update were provided');
      }
      // Flatten the fixedCollection structure for list_items_attributes if present
      if (updateFields.list_items_attributes) {
        const itemsRaw = updateFields.list_items_attributes as IDataObject;
        let items = Array.isArray(itemsRaw.item) ? itemsRaw.item : [];
        // Process each item for addNew logic
        items = items.map(item => {
          const newItem = { ...item };
          if (newItem.addNew) {
            delete newItem.id;
            delete newItem._destroy;
          }
          delete newItem.addNew;
          return newItem;
        });
        updateFields.list_items_attributes = items;
      }
      responseData = await handleUpdateOperation.call(
        this,
        resourceEndpoint,
        listId,
        { list: updateFields },
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