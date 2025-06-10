import { DateTime } from 'luxon';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import type { IAssetLayoutFieldEntity } from '../resources/asset_layout_fields/asset_layout_fields.types';
import { getCompanyIdForAsset } from './operations/getCompanyIdForAsset';
import { NodeOperationError } from 'n8n-workflow';
import { debugLog } from './debugConfig';
import { huduApiRequest } from './requestUtils';
import { 
  normaliseFieldType, 
  getExpectedJavaScriptType, 
  isFieldTypeUpdatable,
  detectFieldType 
} from './fieldTypeUtils';
import { ASSET_LAYOUT_FIELD_TYPES } from './constants';

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
 * Enhanced version that accepts layout fields as parameter for better efficiency.
 *
 * @param context n8n execution context (this)
 * @param layoutFields Array of asset layout fields (pre-fetched)
 * @param fieldIdentifier The field label or ID
 * @param expectedJsType The expected JavaScript type for validation
 * @param itemIndex Optional item index for error context
 * @returns FieldDefinition
 */
export function validateFieldForMapping(
  context: IExecuteFunctions,
  layoutFields: IAssetLayoutFieldEntity[],
  fieldIdentifier: string,
  expectedJsType: string,
  itemIndex: number
): FieldDefinition {
  debugLog('[RESOURCE_VALIDATION] Validating field for mapping', { fieldIdentifier, expectedJsType, fieldsCount: layoutFields.length });

  if (!Array.isArray(layoutFields) || layoutFields.length === 0) {
    debugLog('[RESOURCE_VALIDATION] No layout fields provided', { fieldIdentifier });
    throw new NodeOperationError(context.getNode(), `No layout fields available for validation of field '${fieldIdentifier}'.`, { itemIndex });
  }

  // Find the field by label or ID
  const field = layoutFields.find((f: IAssetLayoutFieldEntity) =>
    f.label === fieldIdentifier || String(f.id) === String(fieldIdentifier)
  ) as IAssetLayoutFieldEntity | undefined;

  if (!field) {
    debugLog('[RESOURCE_VALIDATION] Field not found in layout', { fieldIdentifier, availableFields: layoutFields.map(f => f.label) });
    throw new NodeOperationError(context.getNode(), `Field '${fieldIdentifier}' not found in asset layout. Available fields: ${layoutFields.map(f => f.label).join(', ')}.`, { itemIndex });
  }

  // Normalise the field type for consistent comparison
  const normalisedFieldType = normaliseFieldType(field.field_type);
  const expectedFieldJsType = getExpectedJavaScriptType(normalisedFieldType);

  // Validate field type compatibility
  if (normalisedFieldType === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG || normalisedFieldType === ASSET_LAYOUT_FIELD_TYPES.RELATION) {
    if (expectedJsType !== 'string' && expectedJsType !== 'number') {
      throw new NodeOperationError(
        context.getNode(),
        `Field '${fieldIdentifier}' of type ${normalisedFieldType} expects a string or a number, but got ${expectedJsType}.`,
        { itemIndex },
      );
    }
  } else if (expectedFieldJsType !== expectedJsType) {
    debugLog('[RESOURCE_VALIDATION] Field type mismatch', {
      fieldIdentifier,
      expected: expectedJsType,
      actual: expectedFieldJsType,
      huduFieldType: normalisedFieldType
    });
    throw new NodeOperationError(
      context.getNode(),
      `Field '${fieldIdentifier}' type mismatch: expected JavaScript type '${expectedJsType}', but field type '${normalisedFieldType}' expects '${expectedFieldJsType}'.`,
      { itemIndex }
    );
  }

  // Check if field type supports updates
  if (!isFieldTypeUpdatable(normalisedFieldType)) {
    debugLog('[RESOURCE_VALIDATION] Field type not updatable', { fieldIdentifier, fieldType: normalisedFieldType });
    throw new NodeOperationError(
      context.getNode(), 
      `Field '${fieldIdentifier}' of type '${normalisedFieldType}' cannot be updated via the API. Please use a different field type or update manually in Hudu.`, 
      { itemIndex }
    );
  }

  debugLog('[RESOURCE_VALIDATION] Field validated successfully', { 
    fieldIdentifier, 
    fieldType: normalisedFieldType,
    detectedType: detectFieldType(field),
    jsType: expectedFieldJsType 
  });

  return {
    id: String(field.id),
    label: field.label,
    fieldType: normalisedFieldType,
    required: !!field.required,
    linkableId: field.linkable_id,
  };
}

/**
 * Legacy version of validateFieldForMapping that fetches layout fields.
 * Maintained for backward compatibility. New code should use the enhanced version.
 *
 * @param context n8n execution context (this)
 * @param assetLayoutId The asset layout ID
 * @param fieldIdentifier The field label or ID
 * @param fieldType The expected field type
 * @param itemIndex Optional item index for error context
 * @returns FieldDefinition
 * @deprecated Use the enhanced validateFieldForMapping with pre-fetched layout fields
 */
export async function validateFieldForMappingLegacy(
  context: IExecuteFunctions,
  assetLayoutId: number,
  fieldIdentifier: string,
  fieldType: string,
  itemIndex: number
): Promise<FieldDefinition> {
  debugLog('[RESOURCE_VALIDATION] Using legacy field validation (consider upgrading)', { assetLayoutId, fieldIdentifier, fieldType });

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

  // Use the enhanced validation with fetched fields
  const expectedJsType = getExpectedJavaScriptType(normaliseFieldType(fieldType));
  return validateFieldForMapping(context, layout.fields, fieldIdentifier, expectedJsType, itemIndex);
}

/**
 * Transforms a value for update based on Hudu field type.
 * Handles type conversion and formatting for all supported Hudu field types.
 * Enhanced version that uses specific Hudu field type constants.
 *
 * @param value The value to transform
 * @param fieldType The Hudu field type (from ASSET_LAYOUT_FIELD_TYPES)
 * @returns Transformed value ready for Hudu API
 */
export function transformFieldValueForUpdate(value: any, fieldType: string): any {
  debugLog('[RESOURCE_TRANSFORM] Transforming field value', { value, fieldType, valueType: typeof value });
  
  // Normalise the field type to handle variations
  const normalisedFieldType = normaliseFieldType(fieldType);
  
  // Handle null/undefined values
  if (value === null || value === undefined) {
    debugLog('[RESOURCE_TRANSFORM] Null/undefined value, returning empty string', { fieldType: normalisedFieldType });
    return '';
  }

  switch (normalisedFieldType) {
    case ASSET_LAYOUT_FIELD_TYPES.NUMBER:
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
        const numValue = Number(value);
        debugLog('[RESOURCE_TRANSFORM] Converted string to number', { original: value, converted: numValue });
        return numValue;
      }
      throw new Error(`Invalid value for Number field: ${value}. Expected a numeric value.`);

    case ASSET_LAYOUT_FIELD_TYPES.CHECKBOX:
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.trim().toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === '1') {
          debugLog('[RESOURCE_TRANSFORM] Converted string to true', { original: value });
          return true;
        }
        if (lower === 'false' || lower === 'no' || lower === '0' || lower === '') {
          debugLog('[RESOURCE_TRANSFORM] Converted string to false', { original: value });
          return false;
        }
      }
      throw new Error(`Invalid value for CheckBox field: ${value}. Expected true/false, yes/no, or 1/0.`);

    case ASSET_LAYOUT_FIELD_TYPES.DATE:
      // Hudu expects dates in YYYY-MM-DD format. We use Luxon for robust parsing.
      // This handles ISO strings from n8n's date picker without timezone shifts.
      try {
        const dt = DateTime.fromISO(value);
        if (dt.isValid) {
          const dateString = dt.toFormat('yyyy-MM-dd');
          debugLog('[RESOURCE_TRANSFORM] Converted ISO string to yyyy-MM-dd', { original: value, converted: dateString });
          return dateString;
        }
      } catch (e) {
        // Ignore parsing errors and try other formats
      }
      
      // Fallback for other common date formats
      try {
        const dt = DateTime.fromFormat(value, 'yyyy-MM-dd');
        if (dt.isValid) {
          return value; // Already in correct format
        }
      } catch(e) {
        // Fallback for other common date formats
      }

      // Final attempt with forgiving parsing for other formats like 'DD/MM/YYYY' etc.
      try {
        const dt = DateTime.fromJSDate(new Date(value));
        if (dt.isValid) {
            const dateString = dt.toFormat('yyyy-MM-dd');
            debugLog('[RESOURCE_TRANSFORM] Converted JS Date to yyyy-MM-dd (fallback)', { original: value, converted: dateString });
            return dateString;
        }
      } catch (e) {
        // Let it fall through to the error
      }
      
      throw new Error(`Invalid value for Date field: '${value}'. Expected a valid date string (e.g., YYYY-MM-DD or a full ISO timestamp).`);

    case ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT:
      // List fields may require JSON stringification for complex values
      if (typeof value === 'object' && value !== null) {
        const jsonString = JSON.stringify(value);
        debugLog('[RESOURCE_TRANSFORM] Stringified object for List field', { original: value, converted: jsonString });
        return jsonString;
      }
      if (Array.isArray(value)) {
        const jsonString = JSON.stringify(value);
        debugLog('[RESOURCE_TRANSFORM] Stringified array for List field', { original: value, converted: jsonString });
        return jsonString;
      }
      // For simple values, return as string
      const stringValue = String(value);
      debugLog('[RESOURCE_TRANSFORM] Converted to string for List field', { original: value, converted: stringValue });
      return stringValue;

    case ASSET_LAYOUT_FIELD_TYPES.RELATION:
    case ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG:
      // Asset link fields expect an array of asset IDs
      if (Array.isArray(value)) {
        debugLog('[RESOURCE_TRANSFORM] Value is already an array for AssetTag/Relation', { value });
        return value.map(Number); // Ensure all elements are numbers
      }
      if (typeof value === 'number') {
        const result = [value];
        debugLog('[RESOURCE_TRANSFORM] Converted single number to array for AssetTag/Relation', { result });
        return result;
      }
      if (typeof value === 'string' && value.trim() !== '') {
        const ids = value.split(',').map(id => {
          const num = Number(id.trim());
          if (isNaN(num)) {
            throw new Error(`Invalid non-numeric ID '${id.trim()}' found in list for AssetTag/Relation field.`);
          }
          return num;
        });
        debugLog('[RESOURCE_TRANSFORM] Parsed comma-separated string to ID array for AssetTag/Relation', { original: value, converted: ids });
        return ids;
      }
      // Return empty array if value is empty string, null, or undefined
      return [];

    case ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA:
      // Address fields expect objects
      if (typeof value === 'object' && value !== null) {
        debugLog('[RESOURCE_TRANSFORM] Using object for Address field', { value });
        return value;
      }
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object' && parsed !== null) {
            debugLog('[RESOURCE_TRANSFORM] Parsed JSON string for Address field', { original: value, parsed });
            return parsed;
          }
        } catch (error) {
          throw new Error(`Invalid JSON for Address field: ${value}. Please provide a valid JSON object string. Error: ${(error as Error).message}`);
        }
      }
      throw new Error(`Invalid value for Address field: ${value}. Expected an address object or JSON string.`);

    case ASSET_LAYOUT_FIELD_TYPES.EMAIL:
    case ASSET_LAYOUT_FIELD_TYPES.PHONE:
    case ASSET_LAYOUT_FIELD_TYPES.WEBSITE:
    case ASSET_LAYOUT_FIELD_TYPES.PASSWORD:
    case ASSET_LAYOUT_FIELD_TYPES.TEXT:
    case ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT:
    case ASSET_LAYOUT_FIELD_TYPES.EMBED:
      // These field types expect string values
      const stringResult = String(value);
      debugLog('[RESOURCE_TRANSFORM] Converted to string for text-based field', { 
        fieldType: normalisedFieldType, 
        original: value, 
        converted: stringResult 
      });
      return stringResult;

    case ASSET_LAYOUT_FIELD_TYPES.HEADING:
      // Heading fields are display-only and shouldn't be updated
      throw new Error(`Heading fields cannot be updated. Field type '${normalisedFieldType}' is for display purposes only.`);

    case ASSET_LAYOUT_FIELD_TYPES.DROPDOWN:
      // Legacy dropdown fields are not supported for updates
      throw new Error(`Dropdown fields cannot be updated via the API. Please convert the field to a List type in Hudu to enable API updates.`);

    default:
      // For unknown field types, default to string conversion with a warning
      debugLog('[RESOURCE_TRANSFORM] Unknown field type, defaulting to string conversion', { 
        fieldType: normalisedFieldType, 
        originalFieldType: fieldType,
        value 
      });
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