import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import type { IAssetLayoutFieldEntity } from '../resources/asset_layout_fields/asset_layout_fields.types';
import { getCompanyIdForAsset } from './operations/getCompanyIdForAsset';
import { NodeOperationError } from 'n8n-workflow';
import { debugLog } from './debugConfig';
import { huduApiRequest } from './requestUtils';

/**
 * Interface for asset metadata with fields and layout info
 */
export interface AssetWithMetadata {
  assetId: number;
  companyId: number;
  assetLayoutId: number;
  name: string;
  fields: IDataObject[];
  assetObject: IDataObject;
}

/**
 * Interface for field definition used in validation
 */
export interface FieldDefinition {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  linkableId?: number;
}

/**
 * Retrieves asset metadata including company, layout, and fields.
 * Extends getCompanyIdForAsset to provide a richer metadata object.
 *
 * @param context n8n execution context (this)
 * @param assetId The asset ID to look up
 * @param itemIndex Optional item index for error context
 * @returns AssetWithMetadata
 */
export async function getAssetWithMetadata(
  context: IExecuteFunctions,
  assetId: number,
  itemIndex: number
): Promise<AssetWithMetadata> {
  debugLog('[RESOURCE_PROCESSING] Fetching asset metadata', { assetId });
  const { companyId, assetObject } = await getCompanyIdForAsset(context, assetId, itemIndex);

  if (!assetObject) {
    debugLog('[RESOURCE_PROCESSING] Asset object not found', { assetId });
    throw new NodeOperationError(context.getNode(), `Asset with ID '${assetId}' not found.`, { itemIndex });
  }

  const assetLayoutIdRaw = assetObject.asset_layout_id;
  let assetLayoutId: number;
  if (typeof assetLayoutIdRaw === 'number') {
    assetLayoutId = assetLayoutIdRaw;
  } else if (typeof assetLayoutIdRaw === 'string' && !isNaN(Number(assetLayoutIdRaw))) {
    assetLayoutId = Number(assetLayoutIdRaw);
  } else {
    debugLog('[RESOURCE_PROCESSING] Invalid asset layout ID type', { assetId, assetLayoutIdRaw });
    throw new NodeOperationError(context.getNode(), `Asset with ID '${assetId}' has an invalid asset_layout_id.`, { itemIndex });
  }

  const name = assetObject.name;
  const fields = Array.isArray(assetObject.fields) ? assetObject.fields : [];

  if (!assetLayoutId) {
    debugLog('[RESOURCE_PROCESSING] Asset layout ID not found', { assetId });
    throw new NodeOperationError(context.getNode(), `Asset with ID '${assetId}' does not have an asset_layout_id.`, { itemIndex });
  }

  debugLog('[RESOURCE_PROCESSING] Asset metadata retrieved', { assetId, companyId, assetLayoutId, name, fieldsCount: fields.length });

  return {
    assetId: Number(assetId),
    companyId: typeof companyId === 'string' ? Number(companyId) : companyId,
    assetLayoutId,
    name: name as string,
    fields,
    assetObject,
  };
}

/**
 * Validates a field for mapping by checking existence, type, and required status.
 *
 * @param context n8n execution context (this)
 * @param assetLayoutId The asset layout ID
 * @param fieldIdentifier The field label or ID
 * @param fieldType The expected field type
 * @param itemIndex Optional item index for error context
 * @returns FieldDefinition
 */
export async function validateFieldForMapping(
  context: IExecuteFunctions,
  assetLayoutId: number,
  fieldIdentifier: string,
  fieldType: string,
  itemIndex: number
): Promise<FieldDefinition> {
  debugLog('[RESOURCE_VALIDATION] Validating field for mapping', { assetLayoutId, fieldIdentifier, fieldType });

  // Fetch asset layout fields
  const layoutResponseRaw = await huduApiRequest.call(context, 'GET', '/asset_layouts', {}, { id: assetLayoutId });
  const layoutResponse = Array.isArray(layoutResponseRaw) ? layoutResponseRaw[0] : layoutResponseRaw;
  const layout = (layoutResponse && typeof layoutResponse === 'object' && 'asset_layout' in layoutResponse)
    ? (layoutResponse as { asset_layout: { fields: IAssetLayoutFieldEntity[] } }).asset_layout
    : undefined;
  if (!layout || !Array.isArray(layout.fields)) {
    debugLog('[RESOURCE_VALIDATION] Asset layout not found or has no fields', { assetLayoutId });
    throw new NodeOperationError(context.getNode(), `Asset layout with ID '${assetLayoutId}' not found or has no fields.`, { itemIndex });
  }

  // Find the field by label or ID
  const field = layout.fields.find((f: IAssetLayoutFieldEntity) =>
    f.label === fieldIdentifier || String(f.id) === String(fieldIdentifier)
  ) as IAssetLayoutFieldEntity | undefined;

  if (!field) {
    debugLog('[RESOURCE_VALIDATION] Field not found in layout', { assetLayoutId, fieldIdentifier });
    throw new NodeOperationError(context.getNode(), `Field '${fieldIdentifier}' not found in asset layout '${assetLayoutId}'.`, { itemIndex });
  }

  // Check field type
  if (field.field_type !== fieldType) {
    debugLog('[RESOURCE_VALIDATION] Field type mismatch', { fieldIdentifier, expected: fieldType, actual: field.field_type });
    throw new NodeOperationError(context.getNode(), `Field '${fieldIdentifier}' type mismatch: expected '${fieldType}', got '${field.field_type}'.`, { itemIndex });
  }

  debugLog('[RESOURCE_VALIDATION] Field validated successfully', { fieldIdentifier, fieldType });

  return {
    id: String(field.id),
    label: field.label,
    fieldType: field.field_type,
    required: !!field.required,
    linkableId: field.linkable_id,
  };
}

/**
 * Transforms a value for update based on field type.
 * Handles type conversion and formatting for all supported field types.
 *
 * @param value The value to transform
 * @param fieldType The type of the field
 * @returns Transformed value
 */
export function transformFieldValueForUpdate(value: any, fieldType: string): any {
  // Handles type conversion and formatting for all supported field types
  // Supported field types: string, number, boolean, date, array, object
  switch (fieldType) {
    case 'number':
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) return Number(value);
      throw new Error(`Invalid value for number field: ${value}`);
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.trim().toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === '1') return true;
        if (lower === 'false' || lower === 'no' || lower === '0') return false;
      }
      throw new Error(`Invalid value for boolean field: ${value}`);
    case 'date':
    case 'dateTime':
      // Accepts ISO strings or Date objects
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'string' && !isNaN(Date.parse(value))) return new Date(value).toISOString();
      throw new Error(`Invalid value for date field: ${value}`);
    case 'array':
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      throw new Error(`Invalid value for array field: ${value}`);
    case 'object':
      if (typeof value === 'object' && value !== null) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
        } catch {}
      }
      throw new Error(`Invalid value for object field: ${value}`);
    case 'string':
    default:
      // Default to string conversion
      if (value === null || value === undefined) return '';
      return String(value);
  }
}

/**
 * Updates an asset with mapped fields using the correct API endpoint and payload structure.
 *
 * @param context n8n execution context (this)
 * @param assetId The asset ID
 * @param companyId The company ID
 * @param mappedFields Object of field/value pairs to update
 * @param itemIndex Optional item index for error context
 * @returns API response
 */
export async function updateAssetWithMappedFields(
  context: IExecuteFunctions,
  assetId: number,
  companyId: number,
  mappedFields: IDataObject,
  itemIndex: number
): Promise<IDataObject> {
  debugLog('[RESOURCE_PROCESSING] Preparing to update asset with mapped fields', { assetId, companyId, mappedFields });

  // Construct the update payload
  const payload: IDataObject = {};
  for (const [key, value] of Object.entries(mappedFields)) {
    payload[key] = value;
  }

  debugLog('[RESOURCE_PROCESSING] Final update payload', payload);

  // Construct the endpoint
  const endpoint = `/companies/${companyId}/assets/${assetId}`;

  try {
    debugLog('[API_REQUEST] Sending asset update request', { endpoint, payload });
    const response = await huduApiRequest.call(context, 'PUT', endpoint, payload);
    debugLog('[API_RESPONSE] Asset update response received', response);
    return response as IDataObject;
  } catch (error) {
    debugLog('[API_RESPONSE] Asset update failed', { error });
    throw new NodeOperationError(context.getNode(), `Failed to update asset with ID '${assetId}': ${(error as Error).message}`, { itemIndex });
  }
} 