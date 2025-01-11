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

      const body: IDataObject = {
        name,
        asset_layout_id,
      };

      if (additionalFields.customFields) {
        const { customFields, ...rest } = additionalFields;
        const customFieldsArray = (customFields as IDataObject).field as IDataObject[];
        
        // Transform custom fields into the format expected by the API
        body.custom_fields = customFieldsArray.reduce((acc: IDataObject, field: IDataObject) => {
          acc[field.label as string] = field.value;
          return acc;
        }, {});

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

      // Process date range if present
      if (filters.updated_at) {
        const updatedAtFilter = filters.updated_at as IDataObject;

        if (updatedAtFilter.range) {
          const rangeObj = updatedAtFilter.range as IDataObject;

          const dateRange = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as DateRangePreset,
            },
          });

          filters.updated_at = dateRange || undefined;
        } else {
          filters.updated_at = undefined;
        }
      }

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'assets',
        filters,
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
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, assetId);
      break;
    }

    case 'update': {
      const assetId = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const assetBody: IDataObject = {
        ...updateFields,
      };

      if (updateFields.custom_fields) {
        const { custom_fields, ...rest } = updateFields;
        assetBody.custom_fields = custom_fields;
        Object.assign(assetBody, rest);
      }

      const body: IDataObject = {
        asset: assetBody,
      };

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, assetId, body);
      break;
    }

    case 'archive': {
      const assetId = this.getNodeParameter('id', i) as string;
      responseData = await handleArchiveOperation.call(this, resourceEndpoint, assetId, true);
      break;
    }

    case 'unarchive': {
      const assetId = this.getNodeParameter('id', i) as string;
      responseData = await handleArchiveOperation.call(this, resourceEndpoint, assetId, false);
      break;
    }
  }

  return responseData;
}
