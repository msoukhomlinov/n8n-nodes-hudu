import type { IDataObject } from 'n8n-workflow';
import type { RelationRecordType } from '../../utils/constants';

export interface IRelation extends IDataObject {
  id: number; // The unique identifier of the relation
  description?: string; // The description of the relation (optional, can be null)
  is_inverse: boolean; // Indicates whether the relation is inverse or not
  name: string; // The name of the relation
  fromable_id: number; // The ID of the origin entity involved in the relation
  fromable_type: string; // The type of the origin entity involved in the relation
  fromable_url: string; // The URL of the origin entity involved in the relation
  toable_id: number; // The ID of the destination entity involved in the relation
  toable_type: string; // The type of the destination entity involved in the relation
  toable_url: string; // The URL of the destination entity involved in the relation
  created_at?: string; // ISO 8601 creation timestamp (API 2.44.2+)
  updated_at?: string; // ISO 8601 last-update timestamp (API 2.44.2+)
}

export interface IRelationResponse extends IDataObject {
  relation: IRelation;
}

export type RelationOperation = 'getAll' | 'create' | 'delete';

export type RelationType = RelationRecordType;
