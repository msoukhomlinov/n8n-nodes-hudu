import { IDataObject } from 'n8n-workflow';

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

export type FolderOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
