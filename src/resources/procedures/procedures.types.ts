import { IDataObject } from 'n8n-workflow';

export interface IProcedure extends IDataObject {
	id: number;                    // The unique identifier of the procedure
	slug: string;                  // The URL-friendly unique identifier of the procedure
	name: string;                  // The name of the procedure
	description?: string;          // A brief description of the procedure (can be null)
	total: number;                 // The total number of tasks in the procedure
	completed: number;             // The number of completed tasks in the procedure
	url: string;                   // The URL for accessing the procedure
	object_type: string;           // The type of object the procedure represents
	company_id?: number;           // The unique identifier of the company this procedure belongs to (can be null)
	company_name?: string;         // The name of the associated company (can be null)
	completion_percentage: string;  // The completion percentage of the procedure
	created_at: string;            // The date and time when the procedure was created
	updated_at: string;            // The date and time when the procedure was last updated
	parent_procedure?: string;     // The parent procedure, if any (can be null)
	asset?: string;               // The associated asset, if any (can be null)
	share_url: string;            // The URL for sharing the procedure
	procedure_tasks_attributes?: IDataObject[]; // A list of attributes for the tasks associated with the procedure
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