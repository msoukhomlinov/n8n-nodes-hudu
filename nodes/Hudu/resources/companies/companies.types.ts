import type { IDataObject } from 'n8n-workflow';

export interface ICompanyIntegration extends IDataObject {
  id: number; // The unique identifier of the integration
  integrator_id: number; // The unique identifier of the integrator
  integrator_name: string; // The name of the integrator
  sync_id: number; // The unique identifier for the synchronization
  identifier?: string; // The identifier of the integration (can be null)
  name: string; // The name of the integration
  potential_company_id?: number; // The unique identifier of the potential company associated with the integration (can be null)
  company_id: number; // The unique identifier of the company associated with the integration
  company_name: string; // The name of the company associated with the integration
}

export interface ICompany extends IDataObject {
  id: number; // The unique identifier of the company
  slug: string; // The URL-friendly identifier of the company
  name: string; // The full name of the company
  nickname?: string; // The nickname or short name of the company (can be null)
  address_line_1: string; // The first line of the company's address
  address_line_2?: string; // The second line of the company's address (can be null)
  city: string; // The city where the company is located
  state: string; // The state or province where the company is located
  zip: string; // The zip or postal code of the company's location
  country_name?: string; // The name of the country where the company is located (can be null)
  phone_number: string; // The company's phone number
  company_type?: string; // The type of the company (can be null)
  parent_company_id?: number; // The unique identifier of the parent company (can be null)
  parent_company_name?: string; // The name of the parent company (can be null)
  fax_number: string; // The company's fax number
  website: string; // The company's website URL
  notes?: string; // Additional notes or information about the company (can be null)
  archived: boolean; // Indicates if the company has been archived
  object_type: string; // The type of the object, in this case, "Company"
  id_number: string; // A custom set identification number
  url: string; // The URL path of the company within the application
  full_url: string; // The full URL of the company within the application
  passwords_url: string; // The URL for the company's passwords within the application
  knowledge_base_url: string; // The URL for the company's knowledge base within the application
  created_at?: string; // The date and time when the company was created
  updated_at?: string; // The date and time when the company was last updated
  integrations?: ICompanyIntegration[]; // A list of integrations associated with the company
}

export interface ICompanyResponse extends IDataObject {
  companies: ICompany[];
}

export type CompaniesOperations =
  | 'create'
  | 'get'
  | 'getAll'
  | 'update'
  | 'delete'
  | 'archive'
  | 'unarchive'
  | 'jump';
