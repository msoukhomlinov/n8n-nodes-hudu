import { IDataObject } from 'n8n-workflow';

export interface IExpiration extends IDataObject {
	// Required fields
	id: number; // The unique identifier for the expiration
	date: string; // The expiration date (format: date)
	expirationable_type: string; // The type of object associated with the expiration (e.g., Website)
	expirationable_id: number; // The ID of the object associated with the expiration
	account_id: number; // The account ID associated with the expiration
	company_id: number; // The company ID associated with the expiration
	expiration_type: string; // The type of expiration (e.g., domain)

	// Optional fields
	asset_layout_field_id?: number; // The asset layout field ID associated with the expiration (if any)
	sync_id?: number; // The sync ID associated with the expiration (if any)
	discarded_at?: string; // The timestamp when the expiration was discarded (if any) (format: date-time)
	created_at?: string; // The timestamp when the expiration was created (format: date-time)
	updated_at?: string; // The timestamp when the expiration was last updated (format: date-time)
	asset_field_id?: number; // The asset field ID associated with the expiration (if any)
}

export interface IExpirationResponse extends IDataObject {
	expirations: IExpiration[];
}

export type ExpirationsOperations = 'getAll';
