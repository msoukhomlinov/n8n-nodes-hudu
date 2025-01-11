export type ActivityLogsOperation = 'getAll' | 'delete';

export interface IActivityLogsGetAllParams {
  /** n8n UI parameter for maximum number of records to return */
  limit?: number;
  /** Specify the current page of results to retrieve */
  page?: number;
  /** Specify the number of results to return per page */
  page_size?: number;
  /** Filter logs by a specific user ID */
  user_id?: number;
  /** Filter logs by a user's email address */
  user_email?: string;
  /** Filter logs by resource ID (matches response's record_id); must be used in conjunction with resource_type */
  resource_id?: number;
  /** Filter logs by resource type (matches response's record_type - Asset, AssetPassword, Company, Article, etc.); must be used in conjunction with resource_id */
  resource_type?: string;
  /** Filter logs by the action performed (matches response's action field) */
  action_message?: string;
  /** Filter logs starting from a specific date; must be in ISO 8601 format */
  start_date?: string;
}

export interface IActivityLogsDeleteParams {
  /** Starting datetime from which logs will be deleted (ISO 8601 format) */
  datetime: string;
  /** Whether to only delete logs where user_id is nil */
  delete_unassigned_logs?: boolean;
}

/**
 * Activity Log response from the API
 * Note: When filtering, resource_id maps to record_id and resource_type maps to record_type in the response
 */
export interface IActivityLog {
  /** Unique identifier for the activity log */
  id: number;
  /** Additional details about the activity, may contain JSON data */
  details: Record<string, unknown>;
  /** The action performed (maps to action_message in query) */
  action: string;
  /** IP address from which the action was performed */
  ip_address: string;
  /** Unique token for the activity */
  token: string;
  /** ID of the user who performed the action */
  user_id: number | null;
  /** Email of the user who performed the action */
  user_email: string | null;
  /** Original name of the record if it was changed */
  original_record_name: string | null;
  /** Full name of the user who performed the action */
  user_name: string;
  /** Short name of the user who performed the action */
  user_short_name: string;
  /** Type of record affected (maps to resource_type in query) */
  record_type: string | null;
  /** Name of the company associated with the record */
  company_name: string | null;
  /** URL to the company in Hudu */
  record_company_url: string | null;
  /** URL to the user's profile in Hudu */
  record_user_url: string;
  /** Type of application where the action occurred */
  app_type: string;
  /** ID of the record affected (maps to resource_id in query) */
  record_id: number | null;
  /** Name of the record affected */
  record_name: string | null;
  /** URL to the record in Hudu */
  record_url: string | null;
  /** ISO 8601 timestamp of when the activity occurred */
  created_at: string;
  /** Human-readable formatted datetime */
  formatted_datetime: string;
  /** User's initials */
  user_initials: string;
  /** URL to view the activity in Hudu */
  url: string | null;
  /** User agent string of the browser/client */
  agent_string: string | null;
  /** Device type used */
  device: string;
  /** Operating system used */
  os: string;
}
