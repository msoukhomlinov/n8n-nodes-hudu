import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange, validateCompanyId, huduApiRequest } from '../../utils';
import type { IDateRange } from '../../utils';
import {
  handleGetAllOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../../utils/operations';
import type { AssetsOperations } from './assets.types';
import { NodeOperationError } from 'n8n-workflow';
import { debugLog } from '../../utils/debugConfig';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { getCompanyIdForAsset } from '../../utils/operations/getCompanyIdForAsset';
import {
  getAssetWithMetadata,
  validateFieldForMapping,
  transformFieldValueForUpdate,
  updateAssetWithMappedFields,
} from '../../utils/assetFieldUtils';

export async function handleAssetsOperation(
  this: IExecuteFunctions,
  operation: AssetsOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  debugLog(`[OPERATION_${operation.toUpperCase()}] Starting asset operation`, { operation, index: i });
  const assetsResourceEndpoint = '/assets';
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      debugLog('[OPERATION_CREATE] Processing create asset operation');
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i) as string,
        this.getNode(),
        'Company ID'
      );
      const name = this.getNodeParameter('name', i) as string;
      const layoutId = this.getNodeParameter('asset_layout_id', i) as number;
      
      const primary_serial = this.getNodeParameter('primary_serial', i, '') as string;
      const primary_model = this.getNodeParameter('primary_model', i, '') as string;
      const primary_manufacturer = this.getNodeParameter('primary_manufacturer', i, '') as string;
      const hostname = this.getNodeParameter('hostname', i, '') as string;
      const notes = this.getNodeParameter('notes', i, '') as string;

      debugLog('[RESOURCE_PARAMS] Create asset parameters', { companyId, name, layoutId, primary_serial, primary_model, primary_manufacturer, hostname, notes });

      const body: IDataObject = {
        name,
        asset_layout_id: layoutId,
      };

      if (primary_serial) body.primary_serial = primary_serial;
      if (primary_model) body.primary_model = primary_model;
      if (primary_manufacturer) body.primary_manufacturer = primary_manufacturer;
      if (hostname) body.hostname = hostname;
      if (notes) body.notes = notes;

      debugLog('[API_REQUEST] Creating asset with body', body);

      responseData = await handleCreateOperation.call(
        this,
        `/companies/${companyId}/assets`,
        { asset: body },
      );

      debugLog('[API_RESPONSE] Create asset response', responseData);
      break;
    }

    case 'get': {
      debugLog('[OPERATION_GET] Processing get asset operation');
      const assetId = this.getNodeParameter('assetId', i) as string;
      
      debugLog('[API_REQUEST] Getting asset', { assetId });
      
      const rawResponse = await huduApiRequest.call(this, 'GET', '/assets', {}, { id: assetId });

      if (!rawResponse || typeof rawResponse !== 'object' || !Array.isArray((rawResponse as IDataObject).assets)) {
        throw new NodeOperationError(this.getNode(), `Unexpected API response format when fetching asset ID '${assetId}'`, { itemIndex: i });
      }

      const assetsArray = (rawResponse as IDataObject).assets as IDataObject[];
      if (!assetsArray.length) {
        throw new NodeOperationError(this.getNode(), `No asset found with ID '${assetId}'`, { itemIndex: i });
      }

      const assetData = assetsArray[0];
      responseData = assetData;
      
      debugLog('[API_RESPONSE] Get asset response', responseData);
      break;
    }

    case 'getAll': {
      debugLog('[OPERATION_GET_ALL] Processing get all assets operation');
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      debugLog('[RESOURCE_PARAMS] Get all assets parameters', { returnAll, filters, limit });

      const mappedFilters: IDataObject = { ...filters };
      if (mappedFilters.company_id) {
        mappedFilters.company_id = validateCompanyId(
          mappedFilters.company_id as string,
          this.getNode(),
          'Company ID'
        );
      }

      if (mappedFilters.filter_layout_id) {
        mappedFilters.asset_layout_id = mappedFilters.filter_layout_id;
        delete mappedFilters.filter_layout_id;
      }
      if (mappedFilters.hasOwnProperty('archived')) {
        mappedFilters.archived = String(mappedFilters.archived).toLowerCase() === 'true';
      }

      debugLog('[RESOURCE_PROCESSING] Processed filters', mappedFilters);

      const qs: IDataObject = {
        ...mappedFilters,
      };

      if (filters.updated_at) {
        const dateFilterValue = processDateRange(filters.updated_at as IDateRange);
        if (dateFilterValue) {
          qs.updated_at = dateFilterValue;
        } else {
          if (typeof filters.updated_at === 'string') {
             qs.updated_at = filters.updated_at;
          } else {
            delete qs.updated_at;
          }
        }
      }
      
      responseData = await handleGetAllOperation.call(
        this,
        assetsResourceEndpoint,
        'assets',
        qs,
        returnAll,
        limit,
      );
      
      debugLog('[API_RESPONSE] Get all assets response');
      break;
    }

    case 'update': {
      debugLog('[OPERATION_UPDATE] Processing update asset operation');
      const assetId = this.getNodeParameter('assetId', i) as string;

      // --- Enhanced Resource Mapper Logic Start ---
      // Check if mappedFields parameter is present (resource mapper usage)
      const mappedFields = this.getNodeParameter('mappedFields', i, undefined) as IDataObject | undefined;
      if (mappedFields && Object.keys(mappedFields).length > 0) {
        debugLog('[RESOURCE_MAPPER] Using enhanced resource mapper for asset update', { assetId, mappedFields });
        // Fetch asset context
        const assetMeta = await getAssetWithMetadata(this, Number(assetId), i);
        const updatePayload: IDataObject = {};
        for (const [fieldKey, fieldValue] of Object.entries(mappedFields)) {
          // Validate and transform each field
          const fieldDef = await validateFieldForMapping(
            this,
            assetMeta.assetLayoutId,
            fieldKey,
            typeof fieldValue,
            i
          );
          updatePayload[fieldDef.label] = transformFieldValueForUpdate(fieldValue, fieldDef.fieldType);
        }
        // Always include name and asset_layout_id if present in assetMeta
        if (assetMeta.name) updatePayload.name = assetMeta.name;
        updatePayload.asset_layout_id = assetMeta.assetLayoutId;
        // Perform the update
        responseData = await updateAssetWithMappedFields(
          this,
          assetMeta.assetId,
          assetMeta.companyId,
          updatePayload,
          i
        );
        debugLog('[RESOURCE_MAPPER] Asset updated via resource mapper', responseData);
        break;
      }
      // --- Enhanced Resource Mapper Logic End ---

      // Legacy direct field update logic (backward compatibility)
      const name = this.getNodeParameter('name', i, undefined) as string | undefined;
      const primary_serial = this.getNodeParameter('primary_serial', i, undefined) as string | undefined;
      const primary_model = this.getNodeParameter('primary_model', i, undefined) as string | undefined;
      const primary_manufacturer = this.getNodeParameter('primary_manufacturer', i, undefined) as string | undefined;
      const hostname = this.getNodeParameter('hostname', i, undefined) as string | undefined;
      const notes = this.getNodeParameter('notes', i, undefined) as string | undefined;

      const body: IDataObject = {};
      if (name !== undefined) body.name = name;
      if (primary_serial !== undefined) body.primary_serial = primary_serial;
      if (primary_model !== undefined) body.primary_model = primary_model;
      if (primary_manufacturer !== undefined) body.primary_manufacturer = primary_manufacturer;
      if (hostname !== undefined) body.hostname = hostname;
      if (notes !== undefined) body.notes = notes;

      debugLog('[RESOURCE_PARAMS] Update asset parameters', { assetId, body });
      if (Object.keys(body).length === 0) {
        throw new NodeOperationError(this.getNode(), "No fields provided to update for asset.", { itemIndex: i });
      }
      const requestBody = { asset: body };
      debugLog('[API_REQUEST] Updating asset with body', requestBody);
      responseData = await handleUpdateOperation.call(this, assetsResourceEndpoint, assetId, requestBody);
      debugLog('[API_RESPONSE] Update asset response', responseData);
      break;
    }

    case 'archive':
    case 'unarchive': {
      const assetId = this.getNodeParameter('assetId', i) as string;
      const { companyId } = await getCompanyIdForAsset(this, assetId, i);
      responseData = await handleArchiveOperation.call(
        this,
        assetsResourceEndpoint,
        String(assetId),
        operation === 'archive',
        String(companyId)
      );
      debugLog('[API_RESPONSE] Archive/Unarchive asset response', responseData);
      break;
    }

    case 'delete': {
      const assetId = this.getNodeParameter('assetId', i) as string;
      const { companyId } = await getCompanyIdForAsset(this, assetId, i);
      responseData = await handleDeleteOperation.call(
        this,
        assetsResourceEndpoint,
        String(assetId),
        String(companyId)
      );
      debugLog('[API_RESPONSE] Delete asset response', responseData);
      break;
    }

    case 'moveLayout': {
      debugLog('[OPERATION_MOVE_LAYOUT] Processing move asset layout operation');
      const assetId = this.getNodeParameter('assetId', i) as string;
      const newLayoutId = this.getNodeParameter('target_asset_layout_id', i) as number;
      const preserveFields = this.getNodeParameter('preserve_fields', i, false) as boolean;
      const body: IDataObject = {
        asset_layout_id: newLayoutId,
        preserve_fields: preserveFields,
      };
      debugLog('[API_REQUEST] Moving asset layout with body', { assetId, body });
      responseData = await huduApiRequest.call(this, 'POST', `${assetsResourceEndpoint}/${assetId}/move_to_layout`, body);
      debugLog('[API_RESPONSE] Move asset layout response', responseData);
      break;
    }

    default:
      throw new NodeOperationError(
        this.getNode(),
        `The operation '${operation}' is not supported for assets.`,
      );
  }

  return responseData;
}
