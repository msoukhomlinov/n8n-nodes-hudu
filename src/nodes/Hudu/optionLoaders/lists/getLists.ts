import type { ILoadOptionsFunctions, IDataObject, INodePropertyOptions } from 'n8n-workflow';
import { handleListing } from '../../utils';
import { debugLog } from '../../utils/debugConfig';

interface IList extends IDataObject {
  id: number;
  name: string;
  list_items: {
    id: number;
    name: string;
  }[];
}

/**
 * Get all lists from Hudu API
 */
export async function getLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    // Use debug to see what's happening
    const lists = (await handleListing.call(
      this,
      'GET',
      '/lists',
      'lists',
      {},
      {},
      true,
      0,
    )) as IList[];

    if (!Array.isArray(lists)) {
      debugLog('[OPTION_LOADING] getLists returned non-array:', lists);
      return [];
    }

    debugLog(`[OPTION_LOADING] getLists found ${lists.length} lists`);
    
    const mappedLists = lists
      .map((list) => {
        // Ensure ID is a number and convert to string for the value
        const id = typeof list.id === 'number' ? list.id : parseInt(String(list.id), 10);
        return {
          name: `${list.name as string} (${id})`,
          value: id,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Log the first few mapped lists
    debugLog('[OPTION_LOADING] First few mapped lists:', mappedLists.slice(0, 3));
    
    return mappedLists as INodePropertyOptions[];
  } catch (error) {
    debugLog('[OPTION_LOADING] Error in getLists:', error);
    return [];
  }
} 