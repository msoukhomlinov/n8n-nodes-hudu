import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleCreateOperation } from '../../utils/operations';
import type { ExportsOperation, CreateExportPayload } from './exports.types';

export async function handleExportsOperation(
  this: IExecuteFunctions,
  operation: ExportsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/exports';

  switch (operation) {
    case 'create': {
      const companyId = this.getNodeParameter('companyId', i, undefined) as number | undefined;
      const format = this.getNodeParameter('format', i, undefined) as
        | 'pdf'
        | 'csv'
        | 's3'
        | undefined;
      const includeWebsites = this.getNodeParameter('includeWebsites', i, undefined) as
        | boolean
        | undefined;
      const includePasswords = this.getNodeParameter('includePasswords', i, undefined) as
        | boolean
        | undefined;
      const assetLayoutIds = this.getNodeParameter('assetLayoutIds', i, []) as number[];

      const exportBody: CreateExportPayload['export'] = {};

      if (companyId !== undefined && companyId !== null && companyId !== ('' as unknown)) {
        exportBody.company_id = Number(companyId);
      }
      if (format) {
        exportBody.format = format;
      }
      if (includeWebsites !== undefined) {
        exportBody.include_websites = includeWebsites as boolean;
      }
      if (includePasswords !== undefined) {
        exportBody.include_passwords = includePasswords as boolean;
      }
      if (Array.isArray(assetLayoutIds) && assetLayoutIds.length > 0) {
        exportBody.asset_layout_ids = assetLayoutIds.map((v) => Number(v));
      }

      const body: CreateExportPayload = { export: exportBody };
      return await handleCreateOperation.call(this, resourceEndpoint, body as unknown as IDataObject);
    }
  }

  return {} as IDataObject;
}


