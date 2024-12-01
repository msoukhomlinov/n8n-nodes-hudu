import { IDataObject } from 'n8n-workflow';

export interface IUpload extends IDataObject {
	id: number;                    // Unique identifier of the upload
	url: string;                   // URL where the file can be accessed
	name: string;                  // Name of the file
	ext: string;                   // File extension
	mime: string;                  // MIME type of the file
	size: string;                  // Size of the file
	created_date: string;          // Date when the file was uploaded
	archived_at?: string;          // Date when the file was archived (can be null)
	uploadable_id?: number;        // ID of the object the file is associated with (can be null)
	uploadable_type?: string;      // Type of the object the file is associated with (can be null)
}

export interface IUploadResponse extends IDataObject {
	upload: IUpload;
}

export type UploadOperation =
	| 'getAll'
	| 'get'
	| 'delete'; 