import { IDataObject } from 'n8n-workflow';

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
