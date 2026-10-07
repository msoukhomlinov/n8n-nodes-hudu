import type { IDataObject } from 'n8n-workflow';
import type { FlagColor } from '../../utils/constants';

export interface IFlagType extends IDataObject {
  id?: number;
  name: string;
  color: FlagColor;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IFlagTypeResponse extends IDataObject {
  flag_type: IFlagType;
}

export type FlagTypesOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
