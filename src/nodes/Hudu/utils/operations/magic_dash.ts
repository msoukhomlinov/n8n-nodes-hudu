import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { HUDU_API_CONSTANTS } from '../constants';

export async function handleMagicDashGetAllOperation(
  this: IExecuteFunctions,
  filters: IDataObject = {},
  returnAll = false,
  limit = HUDU_API_CONSTANTS.PAGE_SIZE,
): Promise<IDataObject[]> {
  let allItems: IDataObject[] = [];
  let page = 1;
  const pageSize = HUDU_API_CONSTANTS.PAGE_SIZE;

  let hasMorePages = true;
  do {
    const qs: IDataObject = {
      page,
      page_size: pageSize,
    };

    // Handle filters
    if (filters.company_id) {
      qs.company_id = Number.parseInt(filters.company_id as string, 10);
    }
    if (filters.title) {
      qs.title = filters.title;
    }

    const response = await huduApiRequest.call(
      this,
      'GET',
      '/magic_dash',
      {},
      qs,
    );

    const items = Array.isArray(response) ? response : [];
    allItems.push(...items);

    if (items.length < pageSize || (!returnAll && allItems.length >= limit)) {
      hasMorePages = false;
    } else {
      page++;
    }
  } while (hasMorePages);

  if (!returnAll) {
    allItems = allItems.slice(0, limit);
  }

  return allItems;
}

export async function handleMagicDashGetByIdOperation(
  this: IExecuteFunctions,
  id: number,
): Promise<IDataObject> {
  // Use the getAll operation to fetch all items, ensuring pagination is handled.
  const allItems = await handleMagicDashGetAllOperation.call(this, {}, true);

  const item = allItems.find((item) => item.id === id);

  if (!item) {
    throw new Error(`Magic Dash item with ID ${id} not found.`);
  }

  return item;
} 