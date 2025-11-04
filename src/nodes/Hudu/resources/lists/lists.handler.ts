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
      
      // Process list_items_attributes if provided
      const listItemsParam = this.getNodeParameter('list_items_attributes', i, {}) as IDataObject;
      if (listItemsParam && listItemsParam.item && Array.isArray(listItemsParam.item)) {
        const listItemsAttributes = (listItemsParam.item as IDataObject[])
          .map((item: IDataObject) => {
            const processedItem: IDataObject = {};
            if (item.name && typeof item.name === 'string' && item.name.trim() !== '') {
              processedItem.name = item.name.trim();
            }
            // Only include items with a name
            return Object.keys(processedItem).length > 0 ? processedItem : null;
          })
          .filter((item: IDataObject | null) => item !== null);
        
        if (listItemsAttributes.length > 0) {
          body.list_items_attributes = listItemsAttributes;
        }
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
        'list',
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
      
      // Process list_items_attributes if provided
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
      if (updateFields.list_items_attributes) {
        const listItemsParam = updateFields.list_items_attributes as IDataObject;
        if (listItemsParam && listItemsParam.item && Array.isArray(listItemsParam.item)) {
          const listItemsAttributes = (listItemsParam.item as IDataObject[])
            .map((item: IDataObject) => {
              const processedItem: IDataObject = {};
              
              // Include id if provided (for updates/deletions)
              if (item.id !== undefined && item.id !== null && item.id !== '') {
                processedItem.id = Number(item.id);
              }
              
              // Include name if provided (for new items or updates)
              if (item.name !== undefined && item.name !== null && item.name !== '') {
                processedItem.name = String(item.name).trim();
              }
              
              // Include _destroy if true (for deletions)
              if (item._destroy === true) {
                processedItem._destroy = true;
              }
              
              // Only include items that have at least one valid field
              return Object.keys(processedItem).length > 0 ? processedItem : null;
            })
            .filter((item: IDataObject | null) => item !== null);
          
          if (listItemsAttributes.length > 0) {
            updateData.list_items_attributes = listItemsAttributes;
          }
        }
      }
      
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