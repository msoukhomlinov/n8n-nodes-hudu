import { IDataObject } from 'n8n-workflow';

interface IRackStorageItem {
  has_items: boolean;
  items: any[] | null;
  number: number;
}

export interface IRackStorageFilters extends IDataObject {
  company_id?: number; // Filter by company id
  location_id?: number; // Filter by location id
  height?: number; // Filter by rack height
  min_width?: number; // Filter by minimum rack width
  max_width?: number; // Filter by maximum rack width
  created_at?: string; // Filter by creation date range or exact time
  updated_at?: string; // Filter by update date range or exact time
}

export interface IRackStorage extends IDataObject {
  id?: number; // The unique ID of the rack storage
  location_id: number; // The unique ID of the location of the rack storage
  name: string; // The name of the rack storage
  description?: string; // The description of the rack storage
  descending_units?: boolean; // Whether the units are numbered in descending order
  max_wattage?: number | null; // The maximum wattage the rack storage can handle
  starting_unit?: number; // The starting unit of the rack storage
  height?: number; // The height of the rack storage
  width?: number | null; // The width of the rack storage
  serial_number?: string; // The serial number of the rack storage
  asset_tag?: string; // The asset tag of the rack storage
  front_items?: IRackStorageItem[]; // Array of items on the front of the rack
  created_at?: string; // The date and time when the rack storage was created
  updated_at?: string; // The date and time when the rack storage was last updated
  discarded_at?: string; // The date and time when the rack storage was discarded (can be null)
  company_id?: number; // The unique ID of the company
}

export interface IRackStorageResponse extends IDataObject {
  rack_storage: IRackStorage;
}

export type RackStorageOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
