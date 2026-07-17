import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { handleListing } from '../../utils';
import { debugLog } from '../../utils/debugConfig';

interface HuduLabelType {
  id: number;
  name: string;
  color?: string;
}

export async function getLabelTypes(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  try {
    const labelTypes = (await handleListing.call(
      this,
      'GET',
      '/label_types',
      'label_types',
      {},
      {},
      true,
      0,
    )) as unknown as HuduLabelType[];

    if (!Array.isArray(labelTypes)) {
      debugLog('[OPTION_LOADING] getLabelTypes returned non-array:', labelTypes);
      return [];
    }

    return labelTypes
      .map((lt) => {
        const id = typeof lt.id === 'number' ? lt.id : parseInt(String(lt.id), 10);
        return {
          name: `${lt.name as string} (${id})`,
          value: id,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    debugLog('[OPTION_LOADING] Error in getLabelTypes:', error);
    return [];
  }
}
