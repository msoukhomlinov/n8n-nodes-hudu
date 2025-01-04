import { IDataObject } from 'n8n-workflow';

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
}

export type NetworksOperations = 'create' | 'delete' | 'get' | 'getAll' | 'update';
