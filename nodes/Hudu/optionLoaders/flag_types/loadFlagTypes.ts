import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { handleListing } from '../../utils';
import { debugLog } from '../../utils/debugConfig';

interface HuduFlagType {
  id: number;
  name: string;
  color?: string;
}

export async function getFlagTypes(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  try {
    const flagTypes = (await handleListing.call(
      this,
      'GET',
      '/flag_types',
      'flag_types',
      {},
      {},
      true,
      0,
    )) as unknown as HuduFlagType[];

    if (!Array.isArray(flagTypes)) {
      debugLog('[OPTION_LOADING] getFlagTypes returned non-array:', flagTypes);
      return [];
    }

    return flagTypes
      .map((ft) => {
        const id = typeof ft.id === 'number' ? ft.id : parseInt(String(ft.id), 10);
        return {
          name: `${ft.name as string} (${id})`,
          value: id,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    debugLog('[OPTION_LOADING] Error in getFlagTypes:', error);
    return [];
  }
}
