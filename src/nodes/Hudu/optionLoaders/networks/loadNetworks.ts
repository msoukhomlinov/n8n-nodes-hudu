import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { handleListing } from '../../utils';

interface HuduNetwork { id: number; name: string; }

export async function getNetworks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const includeBlank = this.getNodeParameter('includeBlank', true) as boolean;
    const networks = (await handleListing.call(
      this,
      'GET',
      '/networks',
      'networks',
      {},
      {},
      true,
      0,
    )) as unknown as HuduNetwork[];

    const options = (Array.isArray(networks) ? networks : [])
      .map((n) => ({ name: `${n.name} (${n.id})`, value: n.id }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return includeBlank ? [{ name: '- No Network -', value: '' }, ...options] : options;
  } catch {
    return [];
  }
}


