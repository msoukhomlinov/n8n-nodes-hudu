export type ActivityLogsOperation = 'getAll' | 'delete';

export interface IActivityLogsGetAllParams {
	limit?: number;
	user_id?: number;
	user_email?: string;
	resource_id?: number;
	resource_type?: string;
	action_message?: string;
	start_date?: string;
}

export interface IActivityLogsDeleteParams {
	datetime: string;
	delete_unassigned_logs?: boolean;
}

export interface IActivityLog {
	id: number;
	user_id: number | null;
	user_email: string | null;
	resource_id: number;
	resource_type: string;
	action_message: string;
	created_at: string;
	updated_at: string;
} 