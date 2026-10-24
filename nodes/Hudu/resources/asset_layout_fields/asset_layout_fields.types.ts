import type { IDataObject } from 'n8n-workflow';

export interface IAssetLayoutFieldEntity extends IDataObject {
	id: number;
	label: string;
	show_in_list: boolean;
	field_type: string;
	required?: boolean;
	hint: string;
	min?: number;
	max?: number;
	/** Number fields only: plain number, currency, or percentage (API 2.48+) */
	number_type?: 'number' | 'currency' | 'percentage';
	/** ISO 4217 code when number_type is currency (API 2.48+) */
	currency_code?: string | null;
	linkable_id: number;
	expiration: boolean;
	options: string;
	position: number;
	is_destroyed: boolean;
	list_id?: number;
	multiple_options?: boolean;
}

export interface IAssetLayoutFieldResponse extends IDataObject {
	asset_layout_field: IAssetLayoutFieldEntity;
}

export type AssetLayoutFieldOperation = 'get' | 'getAll' | 'update' | 'delete' | 'create' | 'reorder'; 