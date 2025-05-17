import type { IDataObject } from 'n8n-workflow';

export type IpAddressOperations = 'create' | 'delete' | 'get' | 'getAll' | 'update';

export interface IpAddress {
  id?: number; // The unique identifier for the IP address
  address: string; // The IP address
  status: 'unassigned' | 'assigned' | 'reserved' | 'deprecated' | 'dhcp' | 'slaac'; // The status of the IP address
  fqdn?: string; // The Fully Qualified Domain Name associated with the IP address
  description?: string; // A brief description of the IP address
  comments?: string; // Additional comments about the IP address (maps to 'notes' in the API)
  asset_id?: number; // The identifier of the asset associated with this IP address
  network_id?: number; // The identifier of the network to which this IP address belongs
  company_id?: number; // The identifier of the company that owns this IP address
  skip_dns_validation?: boolean; // If true, the server will not attempt to verify that the FQDN resolves to the address
  created_at?: string; // The date and time when the IP address was created
  updated_at?: string; // The date and time when the IP address was last updated
}

export interface IpAddressFilters extends IDataObject {
  network_id?: number;
  address?: string;
  status?: string;
  fqdn?: string;
  asset_id?: number;
  company_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IpAddressCreateParams {
  address: string;
  status: string;
  fqdn?: string;
  description?: string;
  comments?: string;
  asset_id?: number;
  network_id?: number;
  company_id?: number;
  skip_dns_validation?: boolean;
}

export interface IpAddressUpdateParams extends IpAddressCreateParams {
  id: number;
}
