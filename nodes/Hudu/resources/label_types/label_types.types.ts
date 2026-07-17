import type { IDataObject } from 'n8n-workflow';
import type { LabelRecordType } from '../../utils/constants';

export type LabelTypeAccessLevel = 'all_companies' | 'specific_companies';

export interface ILabelType extends IDataObject {
  id?: number;
  name: string;
  color: string;
  slug?: string;
  applicable_record_types: LabelRecordType[];
  access_level?: LabelTypeAccessLevel;
  allowed_company_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface ILabelTypeResponse extends IDataObject {
  label_type: ILabelType;
}

export type LabelTypesOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
