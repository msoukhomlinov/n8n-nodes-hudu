import type { IDataObject } from 'n8n-workflow';

export interface IPasswordFolder extends IDataObject {
  id: number; // The unique identifier of the password folder
  company_id: number | null; // The ID of the associated company, if any. Can Be null.
  description: string; // A brief description of the password folder
  name: string; // The name of the password folder
  slug: string; // A slug representing the password folder
  security: 'all_users' | 'specific'; // Who has permission to see the folder
  allowed_groups: number[]; // Group IDs with access when security = specific
  created_at: string; // The timestamp of password folder creation
  updated_at: string; // The timestamp of the last password folder update
}

export interface IPasswordFolderResponse extends IDataObject {
  password_folders: IPasswordFolder[];
}

export type PasswordFoldersOperations = 'get' | 'getAll' | 'create' | 'update' | 'delete';
