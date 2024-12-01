import { IDataObject } from 'n8n-workflow';

export interface IAssetPassword extends IDataObject {
	id: number; // Unique identifier of the asset password
	passwordable_type: string; // Type of the related object for the password (e.g., 'Asset', 'Website')
	company_id: number; // Identifier of the company to which the password belongs
	name: string; // Name of the password
	username: string; // Username associated with the password
	slug: string; // URL-friendly identifier for the password
	description: string; // Description or notes related to the password
	password: string; // The actual password string
	otp_secret: string; // Secret key for one-time passwords (OTP), if used
	url: string; // URL related to the password, if applicable
	passwordable_id?: number; // ID of the related object (e.g., 'Website') for the password. Can be null.
	password_type?: string; // Type or category of the password. Can be null.
	created_at?: string; // Timestamp when the password was created (format: date-time)
	updated_at?: string; // Timestamp when the password was last updated (format: date-time)
	password_folder_id?: number; // ID of the folder in which the password is stored, if any. Can be null.
	password_folder_name?: string; // Name of the folder in which the password is stored, if any. Can be null.
	login_url?: string; // URL for the login page associated with the password. Can be null.
	in_portal?: boolean; // Whether the password is accessible in the portal
}

export interface IAssetPasswordResponse extends IDataObject {
	asset_password: IAssetPassword;
}

export type AssetPasswordOperation =
	| 'create'
	| 'get'
	| 'getAll'
	| 'update'
	| 'delete'
	| 'archive'
	| 'unarchive';
