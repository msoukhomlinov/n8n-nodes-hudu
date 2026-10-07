import type { IDataObject } from 'n8n-workflow';
import type { FlagableType } from '../../utils/constants';

export interface IFlag extends IDataObject {
  id?: number;
  flag_type_id: number;
  flagable_type: FlagableType;
  flagable_id: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IFlagResponse extends IDataObject {
  flag: IFlag;
}

export type FlagsOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
