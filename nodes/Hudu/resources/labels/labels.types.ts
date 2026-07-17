import type { IDataObject } from 'n8n-workflow';
import type { LabelRecordType } from '../../utils/constants';

export interface ILabel extends IDataObject {
  id?: number;
  label_type_id: number;
  labelable_type: LabelRecordType;
  labelable_id: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ILabelResponse extends IDataObject {
  label: ILabel;
}

export type LabelsOperation = 'getAll' | 'get' | 'create' | 'update' | 'delete';
