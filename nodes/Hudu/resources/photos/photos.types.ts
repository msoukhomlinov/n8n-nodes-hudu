import type { IDataObject } from 'n8n-workflow';

export interface IPhoto extends IDataObject {
	id: number; // Unique identifier
	caption: string; // Caption/title
	company_id?: number; // Company this photo belongs to
	folder_id?: number; // Folder this photo is in (null if not in a folder)
	photoable_type?: string; // Type of record this photo is attached to (Company, Asset, Article, etc.)
	photoable_id?: number; // ID of the record this photo is attached to
	pinned?: boolean; // Whether the photo is pinned
	archived?: boolean; // Whether the photo is archived (soft-deleted)
	created_at?: string; // Creation timestamp
	updated_at?: string; // Last update timestamp
}

export interface IPhotoResponse extends IDataObject {
	photo: IPhoto;
}

export type PhotoOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete';
