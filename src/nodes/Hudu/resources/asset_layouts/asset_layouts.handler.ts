import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange } from '../../utils/index';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
} from '../../utils/operations';
import type { AssetLayoutOperation } from './asset_layouts.types';
import type { DateRangePreset } from '../../utils/dateUtils';

export async function handleAssetLayoutOperation(
  this: IExecuteFunctions,
  operation: AssetLayoutOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/asset_layouts';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
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
        'asset_layouts',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as string;
      responseData = await handleGetOperation.call(this, resourceEndpoint, id);
      break;
    }

    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const fields = this.getNodeParameter('fields', i) as IDataObject;

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      if (fields && (fields as IDataObject).field) {
        body.fields = (fields as IDataObject).field;
      }

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { asset_layout: body });
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const fields = this.getNodeParameter('fields', i) as IDataObject;

      const body: IDataObject = {
        asset_layout: {
          name,
          ...additionalFields,
        },
      };

      if (fields && (fields as IDataObject).field) {
        (body.asset_layout as IDataObject).fields = (fields as IDataObject).field;
      }

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, body);
      break;
    }
  }

  return responseData;
}
