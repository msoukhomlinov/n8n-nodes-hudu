import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleGetOperation, handleUpdateOperation } from '../../utils/operations';
import type { ListOptionsOperation } from './list_options.types';
import { DEBUG_CONFIG, debugLog } from '../../utils/debugConfig';

export async function handleListOptionsOperation(
  this: IExecuteFunctions,
  operation: ListOptionsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = [];

  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('List Options Handler - Processing', {
      operation,
      index: i,
    });
  }

  switch (operation) {
    case 'get': {
      // Get list ID - should be a number from the option loader
      const listId = this.getNodeParameter('list_id', i) as string | number;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('List Options Handler - Parameters', {
          operation,
          listId,
        });
      }
      
      if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
        debugLog('Getting list options for list ID:', { listId });
      }
      
      try {
        // Get the list data using the lists endpoint
        const response = await handleGetOperation.call(
          this,
          '/lists',
          listId,
          'list',
        ) as IDataObject;
        
        if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
          debugLog('API Response Keys:', { keys: Object.keys(response) });
        }
        
        // The API returns the list directly (not wrapped in a 'list' property)
        // for single list "get" operations, matching the getAll structure
        if (response && typeof response === 'object') {
          if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
            debugLog('List Options Handler - Begin Response Transformation', {
              rawResponse: response,
            });
          }
          
          // Check if the response already has list_items property (direct list object)
          if ('list_items' in response && Array.isArray(response.list_items)) {
            if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
              debugLog(`Found ${(response.list_items as IDataObject[]).length} list items in direct response`);
            }
            responseData = response.list_items as IDataObject[];
            
            if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
              debugLog('List Options Handler - Extracted Items from Direct Response', {
                itemsCount: (response.list_items as IDataObject[]).length,
                firstItem: (response.list_items as IDataObject[]).length > 0 ? (response.list_items as IDataObject[])[0] : null,
              });
            }
          } 
          // Or check if it's wrapped in a 'list' property
          else if ('list' in response && typeof response.list === 'object') {
            const list = response.list as IDataObject;
            if ('list_items' in list && Array.isArray(list.list_items)) {
              if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
                debugLog(`Found ${(list.list_items as IDataObject[]).length} list items in list property`);
              }
              responseData = list.list_items as IDataObject[];
              
              if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
                debugLog('List Options Handler - Extracted Items from List Property', {
                  itemsCount: (list.list_items as IDataObject[]).length,
                  firstItem: (list.list_items as IDataObject[]).length > 0 ? (list.list_items as IDataObject[])[0] : null,
                });
              }
            } else {
              if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
                debugLog('No list_items found in list property:', { list });
              }
              responseData = [];
              
              if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
                debugLog('List Options Handler - No Items Found in List Property', { list });
              }
            }
          } else {
            if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
              debugLog('Unexpected response structure:', { response });
            }
            responseData = [];
            
            if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
              debugLog('List Options Handler - Unexpected Response Structure', { response });
            }
          }
        } else {
          if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
            debugLog('Empty or invalid response:', { response });
          }
          responseData = [];
          
          if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
            debugLog('List Options Handler - Empty or Invalid Response', { response });
          }
        }
        
        if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
          debugLog('Returning list options:', { responseData });
        }
      } catch (error) {
        if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
          debugLog('Error fetching list options:', { error });
        }
        throw new Error(`Error fetching list options: ${error.message}`);
      }
      
      break;
    }
    case 'create': {
      // Get list ID
      const listId = this.getNodeParameter('list_id', i) as string | number;
      // Get list item name
      const name = this.getNodeParameter('name', i) as string;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('List Options Handler - Parameters', {
          operation,
          listId,
          name,
        });
      }
      
      if (!name || name.trim() === '') {
        if (DEBUG_CONFIG.RESOURCE_PARAMS) {
          debugLog('List Options Handler - Parameter Validation Failed', {
            operation,
            listId,
            name,
            error: 'List item name cannot be blank',
          });
        }
        throw new Error('List item name cannot be blank');
      }
      
      if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
        debugLog('Creating list item', { listId, name });
      }
      
      // Add the new item to list_items_attributes
      const updateData: IDataObject = {
        list_items_attributes: [{ name }]
      };
      
      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('List Options Handler - Transforming Create Request', {
          operation,
          updateData,
        });
      }
      
      // Update the list with the new item
      responseData = await handleUpdateOperation.call(
        this,
        '/lists',
        listId,
        { list: updateData },
      );
      break;
    }
    case 'update': {
      // Get list ID
      const listId = this.getNodeParameter('list_id', i) as string | number;
      // Get list item ID - coerce to number to match API integer requirement
      const itemId = Number(this.getNodeParameter('item_id', i));
      // Get updated name
      const name = this.getNodeParameter('name', i) as string;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('List Options Handler - Parameters', {
          operation,
          listId,
          itemId,
          name,
        });
      }
      
      if (!name || name.trim() === '') {
        if (DEBUG_CONFIG.RESOURCE_PARAMS) {
          debugLog('List Options Handler - Parameter Validation Failed', {
            operation,
            listId,
            itemId,
            name,
            error: 'List item name cannot be blank',
          });
        }
        throw new Error('List item name cannot be blank');
      }
      
      if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
        debugLog('Updating list item', { listId, itemId, name });
      }
      
      // Update the list item
      const updateData: IDataObject = {
        list_items_attributes: [{ id: itemId, name }]
      };
      
      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('List Options Handler - Transforming Update Request', {
          operation,
          updateData,
        });
      }
      
      // Update the list with the modified item
      responseData = await handleUpdateOperation.call(
        this,
        '/lists',
        listId,
        { list: updateData },
      );
      break;
    }
    case 'delete': {
      // Get list ID
      const listId = this.getNodeParameter('list_id', i) as string | number;
      // Get list item ID - coerce to number to match API integer requirement
      const itemId = Number(this.getNodeParameter('item_id', i));
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('List Options Handler - Parameters', {
          operation,
          listId,
          itemId,
        });
      }
      
      if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
        debugLog('Deleting list item', { listId, itemId });
      }
      
      // Mark the item for deletion
      const updateData: IDataObject = {
        list_items_attributes: [{ id: itemId, _destroy: true }]
      };
      
      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('List Options Handler - Transforming Delete Request', {
          operation,
          updateData,
        });
      }
      
      // Update the list to remove the item
      responseData = await handleUpdateOperation.call(
        this,
        '/lists',
        listId,
        { list: updateData },
      );
      break;
    }
    default:
      throw new Error(`The operation "${operation}" is not supported!`);
  }

  if (DEBUG_CONFIG.RESOURCE_TRANSFORM && responseData) {
    debugLog('List Options Handler - Final Transformed Response', {
      responseData,
      type: Array.isArray(responseData) ? 'array' : 'object',
      itemCount: Array.isArray(responseData) ? responseData.length : 'N/A',
    });
  }

  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('List Options Handler - Response', responseData);
  }

  return responseData;
} 