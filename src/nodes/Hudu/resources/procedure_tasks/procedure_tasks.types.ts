import { IDataObject } from 'n8n-workflow';

export interface IProcedureTask extends IDataObject {
  id?: number; // The unique ID of the procedure task
  name: string; // The name of the task
  description?: string; // A detailed description of the task
  procedure_id: number; // The ID of the procedure this task belongs to
  position?: number; // The position of the task in the procedure
  user_id?: number; // The ID of the user assigned to the task
  due_date?: string; // The due date for the task
  priority?: 'unsure' | 'low' | 'normal' | 'high' | 'urgent'; // The priority level of the task
  assigned_users?: number[]; // An array of user IDs assigned to the task
  completed?: boolean; // Indicates whether the task is completed
  completed_at?: string; // The date and time when the task was completed
  created_at?: string; // The date and time when the task was created
  updated_at?: string; // The date and time when the task was last updated
}

export type ProcedureTasksOperations = 'create' | 'delete' | 'get' | 'getAll' | 'update';
