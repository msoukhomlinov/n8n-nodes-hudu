import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange, validateCompanyId, huduApiRequest } from '../../utils';
import type { IDateRange } from '../../utils';
import {
  handleGetAllOperation,
  handleCreateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
  handleGetOperation,
} from '../../utils/operations';
import type { AssetsOperations } from './assets.types';
import { NodeOperationError, NodeApiError } from 'n8n-workflow';
import { debugLog } from '../../utils/debugConfig';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { getCompanyIdForAsset } from '../../utils/operations/getCompanyIdForAsset';
import {
  getAssetWithMetadata,
  validateFieldForMapping,
  transformFieldValueForUpdate,
  updateAssetWithMappedFields,
} from '../../utils/assetFieldUtils';
import type { IAssetLayoutFieldEntity } from '../asset_layout_fields/asset_layout_fields.types';
import { isStandardField } from '../../utils/fieldTypeUtils';
import { parseHuduApiErrorWithContext } from '../../utils/errorParser';
import { toSnakeCase } from '../../utils/formatters';

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
      const layoutId = this.getNodeParameter('asset_layout_id', i) as number;
      
      const rawMappedFields = this.getNodeParameter('mappedFields', i, {}) as IDataObject;
      let mappedFields: IDataObject;

      if (rawMappedFields.value && typeof rawMappedFields.value === 'object' && rawMappedFields.value !== null) {
        mappedFields = rawMappedFields.value as IDataObject;
      } else {
        mappedFields = { ...rawMappedFields };
        delete mappedFields.mappingMode;
      }

      const body: IDataObject = {
        asset_layout_id: layoutId,
      };

      const customFields: IDataObject[] = [];

      if (Object.keys(mappedFields).length === 0) {
        throw new NodeOperationError(this.getNode(), 'No fields provided to create the asset. Please map at least the "Asset Name" field.', { itemIndex: i });
      }

      // Fetch layout fields for validation of custom fields
      const layoutResponse = await handleGetOperation.call(this, '/asset_layouts', String(layoutId), 'asset_layout') as IDataObject;

      const layout = layoutResponse.asset_layout as { fields: IAssetLayoutFieldEntity[] } | undefined;
        
      if (!layout || !Array.isArray(layout.fields)) {
        throw new NodeOperationError(this.getNode(), `Asset layout with ID '${layoutId}' not found or has no fields.`, { itemIndex: i });
      }
      
      // Process each mapped field
      for (const [fieldId, fieldValue] of Object.entries(mappedFields)) {
        if (isStandardField(fieldId)) {
          // It's a standard field, add it to the top-level body
          body[fieldId] = fieldValue;
          debugLog('[RESOURCE_PROCESSING] Mapped standard field', { fieldKey: fieldId, fieldValue });
        } else {
          // It's a custom field, validate and transform it
          const fieldDef = validateFieldForMapping(
            this,
            layout.fields,
            fieldId,
            typeof fieldValue,
            i
          );
          const transformedValue = transformFieldValueForUpdate(fieldValue, fieldDef.fieldType);
          const customFieldObject = { [toSnakeCase(fieldDef.label)]: transformedValue };
          customFields.push(customFieldObject);
          debugLog('[RESOURCE_PROCESSING] Mapped custom field', { fieldId, fieldLabel: fieldDef.label, field: customFieldObject });
        }
      }

      if (!body.name) {
        throw new NodeOperationError(this.getNode(), 'The "Asset Name" field is required for asset creation.', { itemIndex: i });
      }
      
      if (customFields.length > 0) {
        body.custom_fields = customFields;
      }

      debugLog('[API_REQUEST] Creating asset with body', body);

      const requestBody = { asset: body };
      debugLog('[API_REQUEST] Final request payload for asset creation', requestBody);

      try {
        responseData = await handleCreateOperation.call(
          this,
          `/companies/${companyId}/assets`,
          requestBody,
        );
      } catch (error) {
        debugLog('[API_ERROR] Caught error in assets handler', { 
          errorType: error.constructor.name,
          isNodeApiError: error instanceof NodeApiError,
          httpCode: (error as any).httpCode,
          statusCode: (error as any).statusCode,
          message: (error as any).message,
          description: (error as any).description
        });
        
        if (error instanceof NodeApiError) {
          // Apply error parsing to all API errors, not just 422s
          const parsedErrorMessage = parseHuduApiErrorWithContext(error, 'asset creation');
          debugLog('[API_ERROR] Parsed API error message', { 
            httpCode: error.httpCode,
            original: error.message, 
            parsed: parsedErrorMessage 
          });
          throw new NodeOperationError(this.getNode(), parsedErrorMessage, { itemIndex: i });
        }
        // Re-throw original error if it's not a NodeApiError
        throw error;
      }

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
      const companyId = this.getNodeParameter('company_id', i) as string;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      debugLog('[RESOURCE_PARAMS] Get all assets parameters', { returnAll, filters, limit, companyId });

      const endpoint = companyId ? `/companies/${companyId}/assets` : '/assets';

      const mappedFilters: IDataObject = { ...filters };

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
        endpoint,
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
      const rawMappedFieldsUpdate = this.getNodeParameter('mappedFields', i, undefined) as IDataObject | undefined;

      if (rawMappedFieldsUpdate && Object.keys(rawMappedFieldsUpdate).length > 0) {
        let mappedFields: IDataObject;
        if (rawMappedFieldsUpdate.value && typeof rawMappedFieldsUpdate.value === 'object' && rawMappedFieldsUpdate.value !== null) {
          mappedFields = rawMappedFieldsUpdate.value as IDataObject;
        } else {
          mappedFields = { ...rawMappedFieldsUpdate };
          delete mappedFields.mappingMode;
        }

        debugLog('[RESOURCE_MAPPER] Using enhanced resource mapper for asset update', { assetId, mappedFields });
        // Fetch asset context
        const assetMeta = await getAssetWithMetadata(this, Number(assetId), i);
        
        // Fetch layout fields for efficient validation
        const layoutResponse = await handleGetOperation.call(this, '/asset_layouts', String(assetMeta.assetLayoutId), 'asset_layout') as IDataObject;
        const layout = layoutResponse.asset_layout as { fields: IAssetLayoutFieldEntity[] } | undefined;

        if (!layout || !Array.isArray(layout.fields)) {
          throw new NodeOperationError(this.getNode(), `Asset layout with ID '${assetMeta.assetLayoutId}' not found or has no fields.`, { itemIndex: i });
        }
        
        const updatePayload: IDataObject = {};
        const customUpdateFields: IDataObject[] = [];
        
        for (const [fieldId, fieldValue] of Object.entries(mappedFields)) {
          if (isStandardField(fieldId)) {
            updatePayload[fieldId] = fieldValue;
          } else {
            try {
              const fieldDef = validateFieldForMapping(
                this,
                layout.fields,
                fieldId,
                typeof fieldValue,
                i
              );
              const transformedValue = transformFieldValueForUpdate(fieldValue, fieldDef.fieldType);
              const customFieldObject = { [toSnakeCase(fieldDef.label)]: transformedValue };
              customUpdateFields.push(customFieldObject);
            } catch (error) {
              debugLog(`[RESOURCE_VALIDATION] Error validating field id '${fieldId}' for update.`, { error: (error as Error).message });
            }
          }
        }
        
        if (customUpdateFields.length > 0) {
          updatePayload.custom_fields = customUpdateFields;
        }

        // Always include name and asset_layout_id, but don't overwrite name if it was provided
        if (assetMeta.name && !updatePayload.hasOwnProperty('name')) {
          updatePayload.name = assetMeta.name;
        }
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
      
      // If we reach here, it means no mapped fields were provided, which is an error.
      throw new NodeOperationError(this.getNode(), "The 'Asset Fields' parameter is required for the update operation. Please map at least one field to update.", { itemIndex: i });
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
