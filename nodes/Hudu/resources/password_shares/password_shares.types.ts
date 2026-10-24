import type { IDataObject } from 'n8n-workflow';

export interface IShare extends IDataObject {
  id: number;
  shareable_id: number;
  shareable_type: string;
  expire_in?: number | null;
  notes?: string | null;
  one_time_expire?: boolean;
  include_username?: boolean;
  include_otp?: boolean;
  include_url?: boolean;
  include_notes?: boolean;
  include_passwords?: boolean;
  include_files?: boolean;
  viewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  url: string;
}

export interface IShareResponse extends IDataObject {
  share: IShare;
}

export type PasswordSharesOperation = 'create' | 'delete' | 'get' | 'getAll';
