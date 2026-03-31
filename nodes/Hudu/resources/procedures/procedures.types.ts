import type { IDataObject } from 'n8n-workflow';

export interface IProcedure extends IDataObject {
  id: number; // Unique identifier of the process or run
  slug: string; // URL-friendly unique identifier
  name: string; // Name of the process or run
  description?: string; // Description (can be null)
  total: number; // Total number of tasks
  completed: number; // Number of completed tasks
  url: string; // URL for accessing the process or run
  object_type: string; // Always 'Process'
  company_id?: number; // Company ID (null for global templates)
  company_name?: string; // Associated company name (can be null)
  completion_percentage: string; // Completion percentage
  created_at: string; // Creation timestamp
  updated_at: string; // Last update timestamp
  parent_procedure?: string; // Parent process, if any (can be null)
  parent_process_id?: number; // Parent process ID (for runs only, null for processes)
  asset?: string; // Associated asset, if any (can be null)
  share_url: string; // Sharing URL
  procedure_tasks_attributes?: IDataObject[]; // Task attributes list
  run: boolean; // true = run (active instance), false = process (template)
  process_type?: 'global' | 'company' | null; // Scope: global or company (null for runs)
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled'; // Current status
}

export interface IProcedureResponse extends IDataObject {
  procedures: IProcedure[];
}

export type ProceduresOperations =
  | 'create'
  | 'delete'
  | 'get'
  | 'getAll'
  | 'update'
  | 'createFromTemplate'
  | 'duplicate'
  | 'kickoff';
