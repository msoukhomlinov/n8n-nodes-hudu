import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { handleListing } from '../../utils';

interface HuduVlanZone { id: number; name: string; }

export async function getVlanZones(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const includeBlank = this.getNodeParameter('includeBlank', true) as boolean;
    const zones = (await handleListing.call(
      this,
      'GET',
      '/vlan_zones',
      'vlan_zones',
      {},
      {},
      true,
      0,
    )) as unknown as HuduVlanZone[];

    const options = (Array.isArray(zones) ? zones : [])
      .map((z) => ({ name: `${z.name} (${z.id})`, value: z.id }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return includeBlank ? [{ name: '- No VLAN Zone -', value: '' }, ...options] : options;
  } catch {
    return [];
  }
}


