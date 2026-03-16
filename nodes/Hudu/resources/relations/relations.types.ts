import type { IDataObject } from 'n8n-workflow';
import type { FilterMapping } from '../../utils';

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
}

export interface IRelationResponse extends IDataObject {
  relation: IRelation;
}

export type RelationOperation = 'getAll' | 'create' | 'delete';

export type RelationType =
  | 'Asset'
  | 'Website'
  | 'Procedure'
  | 'AssetPassword'
  | 'Company'
  | 'Article';

export interface IRelationPostProcessFilters extends IDataObject {
  fromable_type?: string;
  fromable_id?: number;
  toable_type?: string;
  toable_id?: number;
  is_inverse?: boolean;
}

// Define how each filter should be applied
export const relationFilterMapping: FilterMapping<Record<string, unknown>> = {
  fromable_type: (item: IDataObject, value: unknown) => {
    return (
      typeof value === 'string' &&
      typeof item.fromable_type === 'string' &&
      item.fromable_type.toLowerCase() === value.toLowerCase()
    );
  },
  fromable_id: (item: IDataObject, value: unknown) => {
    return Number(item.fromable_id) === Number(value);
  },
  toable_type: (item: IDataObject, value: unknown) => {
    return (
      typeof value === 'string' &&
      typeof item.toable_type === 'string' &&
      item.toable_type.toLowerCase() === value.toLowerCase()
    );
  },
  toable_id: (item: IDataObject, value: unknown) => {
    return Number(item.toable_id) === Number(value);
  },
  is_inverse: (item: IDataObject, value: unknown) => {
    return Boolean(item.is_inverse) === Boolean(value);
  },
};
