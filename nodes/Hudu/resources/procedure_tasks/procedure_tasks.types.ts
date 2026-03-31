import type { IDataObject } from 'n8n-workflow';

export interface IProcedureTask extends IDataObject {
  id?: number; // Unique ID of the task
  name: string; // Task name
  description?: string; // Task description (base64 encoded)
  procedure_id: number; // ID of the process or run this task belongs to
  position?: number; // Position in the process/run
  user_id?: number; // ID of the user who completed the task (read-only)
  user_name?: string; // Name of the user who completed the task (read-only)
  due_date?: string; // Due date (YYYY-MM-DD)
  priority?: 'unsure' | 'low' | 'normal' | 'high' | 'urgent'; // Priority level
  assigned_users?: number[]; // Array of user IDs assigned to the task
  optional?: boolean; // Whether the task is optional
  parent_task_id?: number; // Parent task ID (for subtasks)
  has_subtasks?: boolean; // Whether this task has subtasks
  subtask_count?: number; // Number of subtasks
  subtask_ids?: number[]; // IDs of subtasks
  completion_notes?: string; // Notes about completion
  completed_date?: string; // Formatted completion date
  first_assigned_user_id?: number; // ID of first assigned user
  first_assigned_user_name?: string; // Name of first assigned user
  first_assigned_user_initials?: string; // Initials of first assigned user
  formatted_due_date?: string; // Formatted due date string
  url?: string; // URL to view this task
  created_at?: string; // Creation timestamp
  updated_at?: string; // Last update timestamp
}

export type ProcedureTasksOperations = 'create' | 'delete' | 'get' | 'getAll' | 'update';
