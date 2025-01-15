import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange } from '../../utils/index';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../../utils/operations';
import type { AssetsOperations } from './assets.types';
import type { DateRangePreset } from '../../utils/dateUtils';

export async function handleAssetsOperation(
  this: IExecuteFunctions,
  operation: AssetsOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/assets';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const companyId = this.getNodeParameter('company_id', i) as string;
      const name = this.getNodeParameter('name', i) as string;
      const asset_layout_id = this.getNodeParameter('asset_layout_id', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Define base body with required fields
      const body: IDataObject = {
        name,
        asset_layout_id,
      };

      // Handle primary fields if present
      const primaryFields = ['primary_serial', 'primary_mail', 'primary_model', 'primary_manufacturer'];
      for (const field of primaryFields) {
        if (additionalFields[field]) {
          body[field] = additionalFields[field];
        }
      }

      if (additionalFields.customFields) {
        const { customFields, ...rest } = additionalFields;
        const customFieldsArray = (customFields as IDataObject).field as IDataObject[];
        
        // Transform custom fields into the format expected by the API
        body.custom_fields = customFieldsArray.map((field: IDataObject) => ({
          [field.label as string]: field.value,
        }));

        // Add any remaining non-custom fields
        Object.assign(body, rest);
      }

      // Special case: assets are created under a company
      responseData = await handleCreateOperation.call(
        this,
        `/companies/${companyId}/assets`,
        { asset: body },
      );
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;
      const qs: IDataObject = {
        ...filters,
      };

      // Process date range if present
      if (filters.updated_at) {
        const updatedAtFilter = filters.updated_at as IDataObject;

        if (updatedAtFilter.range) {
          const rangeObj = updatedAtFilter.range as IDataObject;

          filters.updated_at = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as DateRangePreset,
            },
          });
          qs.updated_at = filters.updated_at;
        }
      }

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'assets',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const assetId = this.getNodeParameter('id', i) as string;
      const companyId = this.getNodeParameter('company_id', i) as string;
      responseData = await handleGetOperation.call(
        this,
        `/companies/${companyId}/assets`,
        assetId,
      );
      break;
    }

    case 'delete': {
      const assetId = this.getNodeParameter('id', i) as string;
      const companyId = this.getNodeParameter('company_id', i) as string;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, assetId, companyId);
      break;
    }

    case 'update': {
      const assetId = this.getNodeParameter('id', i) as string;
      const companyId = this.getNodeParameter('company_id', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const assetBody: IDataObject = {
        company_id: Number.parseInt(companyId, 10),
      };

      // Handle primary fields if present
      const primaryFields = ['primary_serial', 'primary_mail', 'primary_model', 'primary_manufacturer'];
      for (const field of primaryFields) {
        if (additionalFields[field]) {
          assetBody[field] = additionalFields[field];
        }
      }

      if (additionalFields.customFields) {
        const { customFields, ...rest } = additionalFields;
        const customFieldsArray = (customFields as IDataObject).field as IDataObject[];
        
        // Transform custom fields into the format expected by the API
        assetBody.custom_fields = customFieldsArray.map((field: IDataObject) => ({
          [field.label as string]: field.value,
        }));

        // Add any remaining non-custom fields
        Object.assign(assetBody, rest);
      }

      const body: IDataObject = {
        asset: assetBody,
      };

      responseData = await handleUpdateOperation.call(
        this,
        `/companies/${companyId}/assets`,
        assetId,
        body,
      );
      break;
    }

    case 'archive': {
      const assetId = this.getNodeParameter('id', i) as string;
      const companyId = this.getNodeParameter('company_id', i) as string;
      responseData = await handleArchiveOperation.call(this, resourceEndpoint, assetId, true, companyId);
      break;
    }

    case 'unarchive': {
      const assetId = this.getNodeParameter('id', i) as string;
      const companyId = this.getNodeParameter('company_id', i) as string;
      responseData = await handleArchiveOperation.call(this, resourceEndpoint, assetId, false, companyId);
      break;
    }
  }

  return responseData;
}
