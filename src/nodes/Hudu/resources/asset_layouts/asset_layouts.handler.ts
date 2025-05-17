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
import { debugLog } from '../../utils/debugConfig';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleAssetLayoutOperation(
  this: IExecuteFunctions,
  operation: AssetLayoutOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  debugLog(`[OPERATION_${operation.toUpperCase()}] Starting asset layout operation`, { operation, index: i });
  const resourceEndpoint = '/asset_layouts';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      debugLog('[OPERATION_GET_ALL] Processing get all asset layouts operation');
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
      const qs: IDataObject = {
        ...filters,
      };

      debugLog('[RESOURCE_PARAMS] Get all asset layouts parameters', { returnAll, filters, limit });

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
          debugLog('[UTIL_DATE_PROCESSING] Processed date range', qs.updated_at);
        }
      }

      debugLog('[API_REQUEST] Getting all asset layouts', { qs, returnAll, limit });

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'asset_layouts',
        qs,
        returnAll,
        limit,
      );

      debugLog('[API_RESPONSE] Get all asset layouts response', responseData);
      break;
    }

    case 'get': {
      debugLog('[OPERATION_GET] Processing get asset layout operation');
      const id = this.getNodeParameter('id', i) as string;

      debugLog('[API_REQUEST] Getting asset layout', { id });

      responseData = await handleGetOperation.call(this, resourceEndpoint, id);

      debugLog('[API_RESPONSE] Get asset layout response', responseData);
      break;
    }

    case 'create': {
      debugLog('[OPERATION_CREATE] Processing create asset layout operation');
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const fields = this.getNodeParameter('fields', i) as IDataObject;

      debugLog('[RESOURCE_PARAMS] Create asset layout parameters', { name, additionalFields, fields });

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      if (fields && (fields as IDataObject).field) {
        body.fields = (fields as IDataObject).field;
      }

      debugLog('[API_REQUEST] Creating asset layout with body', body);

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { asset_layout: body });

      debugLog('[API_RESPONSE] Create asset layout response', responseData);
      break;
    }

    case 'update': {
      debugLog('[OPERATION_UPDATE] Processing update asset layout operation');
      const id = this.getNodeParameter('id', i) as string;
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const fields = this.getNodeParameter('fields', i) as IDataObject;

      debugLog('[RESOURCE_PARAMS] Update asset layout parameters', { id, name, additionalFields, fields });

      const body: IDataObject = {
        asset_layout: {
          name,
          ...additionalFields,
        },
      };

      if (fields && (fields as IDataObject).field) {
        (body.asset_layout as IDataObject).fields = (fields as IDataObject).field;
      }

      debugLog('[API_REQUEST] Updating asset layout with body', body);

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, body);

      debugLog('[API_RESPONSE] Update asset layout response', responseData);
      break;
    }
  }

  debugLog(`[OPERATION_${operation.toUpperCase()}] Operation completed`, responseData);
  return responseData;
}
