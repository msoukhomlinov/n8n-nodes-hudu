import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { handleListing } from '../../utils';

interface HuduVlan { id: number; name: string; vlan_id?: number }

export async function getVlans(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  try {
    const includeBlank = this.getNodeParameter('includeBlank', true) as boolean;
    const vlans = (await handleListing.call(
      this,
      'GET',
      '/vlans',
      'vlans',
      {},
      {},
      true,
      0,
    )) as unknown as HuduVlan[];

    const options = (Array.isArray(vlans) ? vlans : [])
      .map((v) => ({ name: `${v.name} (${v.vlan_id ?? v.id})`, value: v.id }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return includeBlank ? [{ name: '- No VLAN -', value: '' }, ...options] : options;
  } catch {
    return [];
  }
}


