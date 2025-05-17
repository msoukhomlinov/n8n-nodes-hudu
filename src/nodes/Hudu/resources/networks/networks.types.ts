import type { IDataObject } from 'n8n-workflow';

export interface INetwork extends IDataObject {
  id?: number; // The unique identifier for the network
  name: string; // The name of the network
  address: string; // The network address, typically in CIDR notation
  network_type: number; // The type of network, represented as an integer
  slug?: string; // A slug representing the network
  company_id?: number; // The identifier of the company that owns this network
  location_id?: number; // The identifier of the location associated with this network
  description?: string; // A brief description of the network
  created_at?: string; // The date and time when the network was created
  updated_at?: string; // The date and time when the network was last updated
  archived?: boolean; // Whether the network is archived
  notes?: string; // Additional comments about the network
  ancestry?: string; // Ancestry path for hierarchical network structure
  settings?: IDataObject; // Settings for the network
  sync_identifier?: string; // External identifier for synchronisation purposes
  is_discovery?: boolean; // Indicates if the network was discovered automatically
  status_list_item_id?: number; // The status list item ID for this network
  role_list_item_id?: number; // The role list item ID for this network
  vlan_id?: number; // The VLAN ID associated with this network
  url?: string; // The URL to access this network in the web interface (read-only)
  archived_at?: string; // The date and time when the network was archived. Null if not archived (read-only)
}

export type NetworksOperations = 'create' | 'delete' | 'get' | 'getAll' | 'update';
