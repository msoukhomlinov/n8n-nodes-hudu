import type { IDataObject } from 'n8n-workflow';

export interface IRackStorageItem extends IDataObject {
  id?: number; // The unique ID of the rack storage item
  rack_storage_role_id: number; // The unique ID of the rack storage role
  asset_id: number; // The unique ID of the asset
  start_unit: number; // The start unit of the rack storage item
  end_unit: number; // The end unit of the rack storage item
  status: number; // The status of the rack storage item
  side: number; // The side of the rack storage item
  max_wattage?: number; // The maximum wattage of the rack storage item
  power_draw?: number; // The power draw of the rack storage item
  rack_storage_role_name?: string; // The name of the rack storage role
  reserved_message?: string; // The reserved message for the rack storage item
  rack_storage_role_description?: string; // The description of the rack storage role
  rack_storage_role_hex_color?: string; // The hex color of the rack storage role
  asset_name?: string; // The name of the asset
  asset_url?: string; // The URL of the asset
  url?: string; // The URL of the rack storage item
  company_id?: number; // The unique ID of the company
}

export interface IRackStorageItemResponse extends IDataObject {
  rack_storage_item: IRackStorageItem;
}

export type RackStorageItemOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
