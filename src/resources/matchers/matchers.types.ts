import { IDataObject } from 'n8n-workflow';

export interface IMatcher extends IDataObject {
	id: number;                    // The unique identifier for the matcher (required)
	integrator_id: number;         // The unique identifier for the integrator (required)
	integrator_name: string;       // The name of the integrator (required)
	sync_id: number;              // The unique identifier for the synchronization (required)
	name: string;                  // The name of the matcher (required)
	identifier?: string;           // The identifier in the integration (can be null)
	potential_company_id?: number; // The potential company ID (can be null)
	company_id?: number;          // The company ID (can be null)
	company_name?: string;        // The name of the company (can be null)
}

export interface IMatcherResponse extends IDataObject {
	matchers: IMatcher[];
}

export type MatcherOperation =
	| 'getAll'
	| 'update'
	| 'delete'; 