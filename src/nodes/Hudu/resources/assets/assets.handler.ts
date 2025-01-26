import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange, validateCompanyId } from '../../utils/index';
import {
  handleGetAllOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../../utils/operations';
import type { AssetsOperations } from './assets.types';
import type { DateRangePreset } from '../../utils/dateUtils';
import type { FieldType, INodePropertyOptions } from 'n8n-workflow';
import { getManyAsAssetLinksHandler } from './getManyAsAssetLinks.handler';
import { NodeOperationError } from 'n8n-workflow';
import { debugLog } from '../../utils/debugConfig';

interface AssetFieldMapping {
  value: IDataObject;
  schema: Array<{
    id: string;
    displayName: string;
    required: boolean;
    defaultMatch: boolean;
    type: FieldType | undefined;
    display: boolean;
    canBeUsedToMatch: boolean;
    description?: string;
    options?: INodePropertyOptions[];
    label: string;
  }>;
}

interface CustomFieldsResponse {
  custom_fields: Record<string, string>[];
}

function processCustomFields(fieldMappings: AssetFieldMapping): CustomFieldsResponse {
  debugLog('[ResourceMapping] Processing custom fields', fieldMappings);
  const { value: mappingsValue, schema } = fieldMappings;
  const customFieldObject: Record<string, string> = {};
  
  for (const [fieldId, value] of Object.entries(mappingsValue)) {
    const fieldInfo = schema.find(f => f.id === fieldId);
    if (fieldInfo) {
      const fieldName = (fieldInfo.label as string)
        .toLowerCase()
        .replace(/\s+/g, '_');
      customFieldObject[fieldName] = value?.toString() || '';
    }
  }
  
  debugLog('[ResourceMapping] Processed custom fields result', customFieldObject);
  return { custom_fields: [customFieldObject] };
}

export async function handleAssetsOperation(
  this: IExecuteFunctions,
  operation: AssetsOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  debugLog(`[OPERATION_${operation.toUpperCase()}] Starting asset operation`, { operation, index: i });
  const resourceEndpoint = '/companies';
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      debugLog('[OPERATION_CREATE] Processing create asset operation');
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const name = this.getNodeParameter('name', i) as string;
      const layoutId = this.getNodeParameter('asset_layout_id', i) as number;
      
      debugLog('[RESOURCE_PARAMS] Create asset parameters', { companyId, name, layoutId });

      const fieldMappings = this.getNodeParameter('fieldMappings', i) as AssetFieldMapping;
      const tagFieldMappings = this.getNodeParameter('tagFieldMappings', i) as AssetFieldMapping;

      debugLog('[RESOURCE_MAPPING] Processing field mappings', { fieldMappings, tagFieldMappings });

      const customFields = fieldMappings?.value ? processCustomFields(fieldMappings) : undefined;
      const tagFields = tagFieldMappings?.value ? processCustomFields(tagFieldMappings) : undefined;

      // Merge custom fields and tag fields
      const mergedFields: CustomFieldsResponse = {
        custom_fields: [
          {
            ...(customFields?.custom_fields[0] || {}),
            ...(tagFields?.custom_fields[0] || {}),
          },
        ],
      };

      debugLog('[RESOURCE_TRANSFORM] Merged custom fields', mergedFields);

      const body: IDataObject = {
        name,
        asset_layout_id: layoutId,
        ...mergedFields,
      };

      debugLog('[API_REQUEST] Creating asset with body', body);

      responseData = await handleCreateOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        { asset: body },
      );

      debugLog('[API_RESPONSE] Create asset response', responseData);
      break;
    }

    case 'get': {
      debugLog('[OPERATION_GET] Processing get asset operation');
      const assetId = this.getNodeParameter('id', i) as string;
      const qs: IDataObject = {
        id: assetId,
      };
      
      debugLog('[API_REQUEST] Getting asset', { assetId, qs });
      
      const response = await handleGetAllOperation.call(
        this,
        '/assets',
        'assets',
        qs,
        false,
        1,
      );

      if (!response || !response.length) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }

      responseData = response[0];
      debugLog('[API_RESPONSE] Get asset response', responseData);
      break;
    }

    case 'getAll': {
      debugLog('[OPERATION_GET_ALL] Processing get all assets operation');
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;
      const returnAsAssetLinks = this.getNodeParameter('returnAsAssetLinks', i, false) as boolean;

      debugLog('[RESOURCE_PARAMS] Get all assets parameters', { returnAll, filters, limit, returnAsAssetLinks });

      // Check for asset layout ID if returning as asset links
      if (returnAsAssetLinks && !filters.filter_layout_id) {
        throw new NodeOperationError(this.getNode(), 'Asset Layout Name or ID must be selected when returning assets as asset links');
      }

      // Validate company_id if provided in filters
      if (filters.company_id) {
        filters.company_id = validateCompanyId(
          filters.company_id,
          this.getNode(),
          'Company ID'
        );
      }

      // Map filter_layout_id to asset_layout_id
      const mappedFilters: IDataObject = { ...filters };
      if (mappedFilters.filter_layout_id) {
        mappedFilters.asset_layout_id = mappedFilters.filter_layout_id;
        mappedFilters.filter_layout_id = undefined;
      }

      debugLog('[UTIL_FILTERS] Processed filters', mappedFilters);

      const qs: IDataObject = {
        ...mappedFilters,
        page_size: filters.page_size || limit
      };

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

      debugLog('[API_REQUEST] Getting all assets', { qs, returnAll, limit });

      const results = await handleGetAllOperation.call(
        this,
        '/assets',
        'assets',
        qs,
        returnAll,
        limit,
      );

      if (returnAsAssetLinks) {
        // Format results as asset links and return as JSON string
        const assetLinks = await getManyAsAssetLinksHandler.call(this, i, results);
        responseData = { json: JSON.stringify(assetLinks) };
        debugLog('[RESOURCE_TRANSFORM] Transformed assets to asset links', responseData);
      } else {
        responseData = results;
      }

      debugLog('[API_RESPONSE] Get all assets response', responseData);
      break;
    }

    case 'update': {
      debugLog('[OPERATION_UPDATE] Processing update asset operation');
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      
      debugLog('[RESOURCE_PARAMS] Update asset parameters', { companyId, assetId, updateFields });
      
      let customFields: CustomFieldsResponse | undefined;
      let tagFields: CustomFieldsResponse | undefined;

      // Only get field mappings if their selectors are enabled
      const showOtherFields = this.getNodeParameter('updateShowOtherFieldsSelector', i) as boolean;
      const showAssetLinks = this.getNodeParameter('updateShowAssetLinkSelector', i) as boolean;

      debugLog('[RESOURCE_PARAMS] Field selector states', { showOtherFields, showAssetLinks });

      if (showOtherFields) {
        const updateFieldMappings = this.getNodeParameter('updateFieldMappings', i) as AssetFieldMapping;
        if (updateFieldMappings?.value) {
          customFields = processCustomFields(updateFieldMappings);
          debugLog('[RESOURCE_MAPPING] Processed custom fields', customFields);
        }
      }

      if (showAssetLinks) {
        const updateTagFieldMappings = this.getNodeParameter('updateTagFieldMappings', i) as AssetFieldMapping;
        if (updateTagFieldMappings?.value) {
          tagFields = processCustomFields(updateTagFieldMappings);
          debugLog('[RESOURCE_MAPPING] Processed tag fields', tagFields);
        }
      }

      // Merge custom fields and tag fields if any exist
      const mergedFields: CustomFieldsResponse = {
        custom_fields: [
          {
            ...(customFields?.custom_fields[0] || {}),
            ...(tagFields?.custom_fields[0] || {}),
          },
        ],
      };

      debugLog('[RESOURCE_TRANSFORM] Merged fields', mergedFields);

      const body: IDataObject = {
        asset: {
          ...updateFields,
          ...(Object.keys(mergedFields.custom_fields[0]).length > 0 ? mergedFields : {}),
        },
      };

      debugLog('[API_REQUEST] Updating asset with body', body);

      responseData = await handleUpdateOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        body,
      );

      debugLog('[API_RESPONSE] Update asset response', responseData);
      break;
    }

    case 'delete': {
      debugLog('[OPERATION_DELETE] Processing delete asset operation');
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('id', i) as string;

      debugLog('[API_REQUEST] Deleting asset', { companyId, assetId });

      responseData = await handleDeleteOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
      );

      debugLog('[API_RESPONSE] Delete asset response', responseData);
      break;
    }

    case 'archive': {
      debugLog('[OPERATION_ARCHIVE] Processing archive asset operation');
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('id', i) as string;

      debugLog('[API_REQUEST] Archiving asset', { companyId, assetId });

      responseData = await handleArchiveOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        true,
      );

      debugLog('[API_RESPONSE] Archive asset response', responseData);
      break;
    }

    case 'unarchive': {
      debugLog('[OPERATION_ARCHIVE] Processing unarchive asset operation');
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('id', i) as string;

      debugLog('[API_REQUEST] Unarchiving asset', { companyId, assetId });

      responseData = await handleArchiveOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        false,
      );

      debugLog('[API_RESPONSE] Unarchive asset response', responseData);
      break;
    }

    default:
      throw new Error(`The operation "${operation}" is not supported!`);
  }

  debugLog(`[OPERATION_${operation.toUpperCase()}] Operation completed`, responseData);
  return responseData;
}
