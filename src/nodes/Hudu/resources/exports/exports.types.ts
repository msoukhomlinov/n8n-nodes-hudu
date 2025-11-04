import type { IDataObject } from 'n8n-workflow';

export type ExportsOperation = 'create';

export interface CreateExportPayload extends IDataObject {
  export: {
    company_id?: number;
    format?: 'pdf' | 'csv' | 's3';
    include_websites?: boolean;
    include_passwords?: boolean;
    asset_layout_ids?: number[];
  };
}


