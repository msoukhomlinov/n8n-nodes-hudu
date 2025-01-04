import { IDataObject } from 'n8n-workflow';

export interface IRackStorage extends IDataObject {
  id?: number; // The unique ID of the rack storage
  location_id: number; // The unique ID of the location of the rack storage
  name: string; // The name of the rack storage
  description?: string; // The description of the rack storage
  max_wattage?: number; // The maximum wattage the rack storage can handle
  starting_unit?: number; // The starting unit of the rack storage
  height?: number; // The height of the rack storage
  width?: number; // The width of the rack storage
  created_at?: string; // The date and time when the rack storage was created
  updated_at?: string; // The date and time when the rack storage was last updated
  discarded_at?: string; // The date and time when the rack storage was discarded (can be null)
  company_id?: number; // The unique ID of the company
}

export interface IRackStorageResponse extends IDataObject {
  rack_storage: IRackStorage;
}

export type RackStorageOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
