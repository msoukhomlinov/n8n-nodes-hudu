import { IDataObject } from 'n8n-workflow';

export interface IUser extends IDataObject {
	id: number;                           // The unique identifier of the user
	email: string;                        // The email address of the user
	otp_required_for_login: boolean;      // Indicates if OTP is required for logging in
	security_level: string;               // Security level assigned to the user
	first_name: string;                   // The first name of the user
	last_name: string;                    // The last name of the user
	phone_number?: string;                // The phone number of the user (can be null)
	slug: string;                         // A slug representing the user
	time_zone?: string;                   // The time zone of the user (can be null)
	accepted_invite: boolean;             // Indicates if the user has accepted an invite
	sign_in_count: number;                // The number of times the user has signed in
	currently_signed_in: boolean;         // Indicates if the user is currently signed in
	last_sign_in_at?: string;            // Timestamp of the last sign-in (can be null)
	last_sign_in_ip?: string;            // IP address from the last sign-in (can be null)
	created_at: string;                   // The timestamp when the user was created
	updated_at?: string;                  // The timestamp of the last user update (can be null)
	archived: boolean;                    // Indicates if the user is archived (discarded)
	portal_member_company_id?: number;    // The ID of the associated company for portal members (can be null)
	score_30_days?: number;              // The user's score over the past 30 days (can be null)
	score_all_time?: number;             // The user's all-time score (can be null)
	score_90_days?: number;              // The user's score over the past 90 days (can be null)
}

export interface IUserResponse extends IDataObject {
	user: IUser;
}

export type UserOperation =
	| 'getAll'  // List first as it's the default operation
	| 'get';    // Get a single user by ID 