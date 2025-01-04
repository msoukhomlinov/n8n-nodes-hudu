import { IDataObject } from 'n8n-workflow';

export type IpAddressOperations = 'create' | 'delete' | 'get' | 'getAll' | 'update';

export interface IpAddress {
  id?: number;
  address: string;
  status: 'unassigned' | 'assigned' | 'reserved' | 'deprecated' | 'dhcp' | 'slaac';
  fqdn?: string;
  description?: string;
  comments?: string;
  asset_id?: number;
  network_id?: number;
  company_id?: number;
  created_at?: string;
  updated_at?: string;
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
}

export interface IpAddressUpdateParams extends IpAddressCreateParams {
  id: number;
}
