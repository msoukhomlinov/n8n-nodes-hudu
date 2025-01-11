import type { ILoadOptionsFunctions, IDataObject, INodePropertyOptions } from 'n8n-workflow';
import { handleListing } from '../../utils';

interface AssetLayoutOption {
  name: string;
  value: number;
  archived: boolean;
}

interface HuduAssetLayout extends IDataObject {
  id: number;
  name: string;
  active: boolean;
}

/**
 * Get all asset layouts from Hudu API
 */
export async function getAssetLayouts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    let includeBlank = false;
    try {
      includeBlank = (this.getNodeParameter('parameters.includeBlank', false) as boolean) || false;
    } catch {
      // Parameter doesn't exist, ignore
    }

    const assetLayouts = (await handleListing.call(
      this,
      'GET',
      '/asset_layouts',
      'asset_layouts',
      {},
      {},
      true,
      0,
    )) as HuduAssetLayout[];

    const mappedLayouts = assetLayouts
      .map((layout) => ({
        name: `${layout.name} (${layout.id})${!layout.active ? ' - Archived' : ''}`,
        value: layout.id,
        archived: !layout.active,
      }))
      .sort((a: AssetLayoutOption, b: AssetLayoutOption) => {
        if (a.archived !== b.archived) {
          return a.archived ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });

    if (includeBlank) {
      return [
        {
          name: '- No Asset Layout -',
          value: '',
        },
        ...mappedLayouts.map(({ name, value }) => ({ name, value })),
      ];
    }

    return mappedLayouts.map(({ name, value }) => ({ name, value }));
  } catch (error) {
    return [];
  }
}
