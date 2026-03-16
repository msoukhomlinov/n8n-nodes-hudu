import type { IDataObject } from 'n8n-workflow';
import type { FilterMapping } from '../../utils';

export interface IFolder extends IDataObject {
  id: number;
  company_id?: number;
  icon?: string;
  description?: string;
  name: string;
  parent_folder_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IFolderResponse extends IDataObject {
  folder: IFolder;
}

export interface IFolderPostProcessFilters {
  parent_folder_id?: number;
  childFolder?: 'yes' | 'no' | '';
  [key: string]: unknown;
}

// Define how each filter should be applied
export const folderFilterMapping: FilterMapping<IFolderPostProcessFilters> = {
  parent_folder_id: (item: IDataObject, value: unknown) => {
    if (value === undefined || value === 0 || value === '') return true;
    return item.parent_folder_id === value;
  },
  childFolder: (item: IDataObject, value: unknown) => {
    if (value === 'yes') return item.parent_folder_id !== null;
    if (value === 'no') return item.parent_folder_id === null;
    return true;
  },
};

export interface IFolderPathResponse extends IDataObject {
  path: string;
}

export type FolderOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete' | 'getPath';
