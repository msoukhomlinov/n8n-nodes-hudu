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
  
  return { custom_fields: [customFieldObject] };
}

export async function handleAssetsOperation(
  this: IExecuteFunctions,
  operation: AssetsOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/companies';
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const name = this.getNodeParameter('name', i) as string;
      const layoutId = this.getNodeParameter('asset_layout_id', i) as number;
      const fieldMappings = this.getNodeParameter('fieldMappings', i) as AssetFieldMapping;
      const tagFieldMappings = this.getNodeParameter('tagFieldMappings', i) as AssetFieldMapping;

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

      const body: IDataObject = {
        name,
        asset_layout_id: layoutId,
        ...mergedFields,
      };

      responseData = await handleCreateOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        { asset: body },
      );
      break;
    }

    case 'get': {
      const assetId = this.getNodeParameter('id', i) as string;
      const qs: IDataObject = {
        id: assetId,
      };
      
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
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;
      const returnAsAssetLinks = this.getNodeParameter('returnAsAssetLinks', i, false) as boolean;

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
        }
      }

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
      } else {
        responseData = results;
      }
      break;
    }

    case 'update': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('id', i) as string;
      const updateOtherFields = this.getNodeParameter('updateOtherFields', i) as IDataObject;

      // Extract and format custom fields if they exist
      let customFields: Record<string, unknown> | undefined;
      const { customFields: customFieldsData, ...remainingFields } = updateOtherFields;
      if (customFieldsData) {
        const fields = customFieldsData as IDataObject;
        if (fields.field) {
          customFields = (fields.field as IDataObject[]).reduce<Record<string, unknown>>((acc, field) => {
            const key = (field.label as string).replace(/\s+/g, '_');
            acc[key] = field.value;
            return acc;
          }, {});
        }
      }

      const body: IDataObject = {
        asset: {
          ...remainingFields,
          ...(customFields && { custom_fields: [customFields] }),
        },
      };

      responseData = await handleUpdateOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        body,
      );
      break;
    }

    case 'delete': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('id', i) as string;
      responseData = await handleDeleteOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
      );
      break;
    }

    case 'archive': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('id', i) as string;
      responseData = await handleArchiveOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        true,
      );
      break;
    }

    case 'unarchive': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('id', i) as string;
      responseData = await handleArchiveOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        false,
      );
      break;
    }

    case 'getManyAsAssetLinks': {
      responseData = await getManyAsAssetLinksHandler.call(this, i);
      break;
    }

    default:
      throw new Error(`The operation "${operation}" is not supported!`);
  }

  return responseData;
}
