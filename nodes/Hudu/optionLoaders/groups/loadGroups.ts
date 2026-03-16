import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { handleListing } from '../../utils';

interface HuduGroup {
  id: number;
  name: string;
  default?: boolean;
}

export async function getGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const includeBlank = this.getNodeParameter('includeBlank', true) as boolean;

    const groups = (await handleListing.call(
      this,
      'GET',
      '/groups',
      undefined, // direct array
      {},
      {},
      true, // returnAll
      0, // no limit
    )) as unknown as HuduGroup[];

    if (!Array.isArray(groups)) {
      return [];
    }

    const options = groups
      .map((g) => ({ name: `${g.name} (${g.id})${g.default ? ' - Default' : ''}`, value: g.id }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (includeBlank) {
      return [{ name: '- No Group -', value: '' }, ...options];
    }

    return options;
  } catch {
    return [];
  }
}


