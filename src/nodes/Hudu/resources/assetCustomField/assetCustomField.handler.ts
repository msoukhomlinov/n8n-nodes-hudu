import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/requestUtils';
import type { AssetCustomFieldOperation } from './assetCustomField.types';
import { ASSET_LAYOUT_FIELD_TYPES } from '../../utils/constants';
import { debugLog } from '../../utils/debugConfig';

/**
 * Handles operations for asset custom fields in Hudu
 * 
 * This handler manages custom fields for assets, which are user-defined fields
 * that appear in the asset fields array rather than as top-level properties.
 * Custom fields are stored in the Hudu API using snake_case versions of their labels.
 * 
 * Different field types require special handling:
 * - Date fields: Require formatting as YYYY-MM-DD for the API
 * - CheckBox fields: Require boolean values
 * - Number fields: Require numeric values
 * - RichText fields: Support HTML markup
 * - Password fields: Treated as sensitive data
 * 
 * @param operation - The operation to perform (get/update)
 * @param itemIndex - The index of the current item being processed
 * @returns The result of the operation
 */
export async function handleAssetCustomFieldOperation(
    this: IExecuteFunctions,
    operation: AssetCustomFieldOperation,
    itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
    debugLog('[RESOURCE_PROCESSING] Starting asset custom field operation', { operation, itemIndex });
    
    const assetId = this.getNodeParameter('assetId', itemIndex) as number;
    const rawFieldIdentifier = this.getNodeParameter('fieldIdentifier', itemIndex);
    if (typeof rawFieldIdentifier !== 'string' || !rawFieldIdentifier) {
        throw new NodeOperationError(this.getNode(), 'Custom Field Identifier is required and must be a string.', { itemIndex });
    }
    const fieldIdentifier = rawFieldIdentifier;
    const fieldIdentifierString = String(fieldIdentifier);

    if (!assetId) {
        throw new NodeOperationError(this.getNode(), 'Asset ID is required.', { itemIndex });
    }

    debugLog('[RESOURCE_PARAMS] Asset custom field parameters', { assetId, fieldIdentifier });

    // Check for placeholder value indicating no custom fields are available
    if (fieldIdentifier === 'NO_CUSTOM_FIELDS_FOUND') {
        throw new NodeOperationError(
            this.getNode(),
            `This asset doesn't have any custom fields. Please select an asset that has custom fields defined in its layout.`,
            { itemIndex }
        );
    }

    let response;

    if (operation === 'get') {
        debugLog('[OPERATION_GET] Getting asset custom field value');
        
        // Use the correct endpoint: /assets?id={assetId} (Hudu expects asset ID as a query parameter)
        const rawResponse = await huduApiRequest.call(this, 'GET', '/assets', {}, { id: assetId });
        debugLog('[API_RESPONSE] Asset response received');

        // The response should be an object with an 'assets' array
        if (!rawResponse || typeof rawResponse !== 'object' || !Array.isArray((rawResponse as IDataObject).assets)) {
            throw new NodeOperationError(this.getNode(), `Unexpected API response format when fetching asset ID '${assetId}'.`, { itemIndex });
        }

        const assetsArray = (rawResponse as IDataObject).assets as IDataObject[];
        if (!assetsArray.length) {
            throw new NodeOperationError(this.getNode(), `No asset found with ID '${assetId}'.`, { itemIndex });
        }

        const assetObject = assetsArray[0];
        debugLog('[RESOURCE_PROCESSING] Found asset', { assetId, layoutId: assetObject.asset_layout_id });

        // Asset fields might be null or undefined if no custom fields are set
        const assetFields = (assetObject.fields || []) as IDataObject[];
        const targetField = assetFields.find(field => field.label === fieldIdentifier);

        let fieldValue: any = null; // Default to null if field not found or has no value
        let fieldType: string | null = null;

        if (targetField) {
            fieldValue = targetField.value;
            fieldType = targetField.field_type as string || null;
            debugLog('[RESOURCE_TRANSFORM] Found field', { 
                label: targetField.label, 
                value: fieldValue, 
                type: fieldType 
            });
            
            // Format the value based on field type for better usability
            if (fieldType === ASSET_LAYOUT_FIELD_TYPES.DATE && fieldValue) {
                // Ensure dates are in a consistent format (ISO)
                try {
                    const dateObj = new Date(fieldValue);
                    if (!isNaN(dateObj.getTime())) {
                        fieldValue = dateObj.toISOString();
                    }
                } catch (error) {
                    // If date parsing fails, keep the original value
                    debugLog('[RESOURCE_TRANSFORM] Error parsing date value', { error });
                }
            } else if (fieldType === ASSET_LAYOUT_FIELD_TYPES.CHECKBOX) {
                // Ensure boolean values are actual booleans
                fieldValue = String(fieldValue).toLowerCase() === 'true';
            } else if (fieldType === ASSET_LAYOUT_FIELD_TYPES.NUMBER && fieldValue !== null && fieldValue !== undefined) {
                // Ensure numbers are numeric
                const numValue = parseFloat(String(fieldValue));
                if (!isNaN(numValue)) {
                    fieldValue = numValue;
                }
            }
        } else {
            debugLog('[RESOURCE_TRANSFORM] Field not found', { fieldIdentifier });
        }

        response = {
            asset_id: assetId,
            field_identifier: fieldIdentifier,
            value: fieldValue,
        };

    } else if (operation === 'update') {
        debugLog('[OPERATION_UPDATE] Updating asset custom field value');
        
        const valueToSet = this.getNodeParameter('value', itemIndex);
        debugLog('[RESOURCE_PARAMS] Value to set', { valueToSet });
        
        // Fetch asset to get company_id and asset_layout_id
        const assetLookup = await huduApiRequest.call(this, 'GET', '/assets', {}, { id: assetId });
        debugLog('[API_RESPONSE] Asset lookup response received');
        
        const assetsArray = (assetLookup as IDataObject).assets as IDataObject[];
        
        if (!assetsArray?.length) {
            throw new NodeOperationError(this.getNode(), `No asset found with ID '${assetId}'.`, { itemIndex });
        }
        
        const assetObject = assetsArray[0];
        const companyId = assetObject.company_id;
        const assetLayoutId = assetObject.asset_layout_id;
        
        if (!companyId) {
            throw new NodeOperationError(this.getNode(), `Asset with ID '${assetId}' does not have a company_id.`, { itemIndex });
        }
        if (!assetLayoutId) {
            throw new NodeOperationError(this.getNode(), `Asset with ID '${assetId}' does not have an asset_layout_id.`, { itemIndex });
        }
        
        debugLog('[RESOURCE_PROCESSING] Found asset metadata', { companyId, assetLayoutId });

        // Fetch the asset layout to find the custom field definition
        debugLog('[RESOURCE_PROCESSING] Fetching asset layout to validate custom field');
        const layoutResponse = await huduApiRequest.call(this, 'GET', `/asset_layouts/${assetLayoutId}`);
        const layoutData = (layoutResponse as IDataObject).asset_layout as IDataObject || layoutResponse;
        
        if (!layoutData || !layoutData.fields || !Array.isArray(layoutData.fields)) {
            throw new NodeOperationError(this.getNode(), `Could not retrieve field definitions for asset layout ID '${assetLayoutId}'.`, { itemIndex });
        }
        
        // Find the custom field by label (and not of type AssetTag)
        const customField = (layoutData.fields as IDataObject[]).find(
            field => typeof field.label === 'string' && field.label === fieldIdentifier && field.field_type !== ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG
        );
        
        if (!customField) {
            throw new NodeOperationError(
                this.getNode(),
                `Field '${fieldIdentifier}' is not found or is not a Custom Field in asset layout ID '${assetLayoutId}'.`,
                { itemIndex }
            );
        }
        
        debugLog('[RESOURCE_TRANSFORM] Found custom field in layout', {
            fieldId: customField.id,
            fieldType: customField.field_type,
        });

        // Detect legacy/unsupported field types (e.g., Dropdown) and prevent update
        const unsupportedTypes = ['Dropdown']; // Add more if needed
        if (typeof customField.field_type === 'string' && unsupportedTypes.includes(customField.field_type)) {
            debugLog('[RESOURCE_PARAMS] Attempted to update unsupported legacy field type', {
                fieldLabel: customField.label,
                fieldType: customField.field_type,
            });
            throw new NodeOperationError(
                this.getNode(),
                `The field '${customField.label}' is a legacy Dropdown field, which cannot be updated via the Hudu API. Please convert it to a List field in Hudu to enable API updates.`,
                { itemIndex }
            );
        }
        
        // Use robust toSnakeCase for the field key
        // Import toSnakeCase from formatters
        // (If not already imported, add: import { toSnakeCase } from '../../utils/formatters';)
        const { toSnakeCase } = await import('../../utils/formatters') as { toSnakeCase: (input: string) => string };
        const snakeCaseFieldLabel = toSnakeCase(fieldIdentifierString as string);
        
        if (!snakeCaseFieldLabel) {
            throw new NodeOperationError(this.getNode(), `Could not convert field label '${fieldIdentifier}' to snake_case.`, { itemIndex });
        }
        
        debugLog('[RESOURCE_TRANSFORM] Converted field name to snake_case', {
            original: fieldIdentifierString,
            snakeCase: snakeCaseFieldLabel
        });
        
        // Prepare the value based on field type
        let processedValue: any = valueToSet;
        if (customField.field_type === ASSET_LAYOUT_FIELD_TYPES.DATE && valueToSet) {
            // Format as YYYY-MM-DD, only if valueToSet is string or number
            if (typeof valueToSet === 'string' || typeof valueToSet === 'number') {
                const dateObj = new Date(valueToSet);
                if (!isNaN(dateObj.getTime())) {
                    processedValue = dateObj.toISOString().split('T')[0];
                }
            }
        } else if (customField.field_type === ASSET_LAYOUT_FIELD_TYPES.CHECKBOX) {
            // Boolean
            processedValue = String(valueToSet ?? '').toLowerCase() === 'true';
        } else if (customField.field_type === ASSET_LAYOUT_FIELD_TYPES.NUMBER && valueToSet !== null && valueToSet !== undefined) {
            // Number
            const numValue = parseFloat(String(valueToSet));
            if (!isNaN(numValue)) {
                processedValue = numValue;
            }
        }

        /**
         * Hudu API expects certain custom field values (e.g., List fields) to be sent as stringified JSON.
         * If the processed value is an object or array, we must JSON.stringify it before sending.
         * This is based on Hudu support guidance and API behaviour.
         */
        if (typeof processedValue === 'object' && processedValue !== null) {
            debugLog('[RESOURCE_TRANSFORM] Stringifying value for custom field', {
                fieldType: customField.field_type,
                originalValue: processedValue
            });
            processedValue = JSON.stringify(processedValue);
        }

        debugLog('[RESOURCE_TRANSFORM] Processed value for field', {
            fieldType: customField.field_type,
            originalValue: valueToSet,
            processedValue
        });
        
        // Build custom_fields array with only the updated field
        const customFieldsArray: IDataObject[] = [
            { [snakeCaseFieldLabel]: processedValue }
        ];
        
        debugLog('[RESOURCE_TRANSFORM] Built custom_fields array for update', {
            customFieldsArray
        });
        
        // Prepare the update payload as a flat object (not wrapped in 'asset')
        const updatePayload: IDataObject = {
            name: assetObject.name,
            asset_layout_id: assetObject.asset_layout_id,
            custom_fields: customFieldsArray,
        };
        if (assetObject.primary_serial) updatePayload.primary_serial = assetObject.primary_serial;
        if (assetObject.primary_mail) updatePayload.primary_mail = assetObject.primary_mail;
        if (assetObject.primary_model) updatePayload.primary_model = assetObject.primary_model;
        if (assetObject.primary_manufacturer) updatePayload.primary_manufacturer = assetObject.primary_manufacturer;

        debugLog('[API_REQUEST] Updating asset with payload', updatePayload);

        // Use the same endpoint as assetLinkField.handler.ts
        const updateEndpoint = `/companies/${companyId}/assets/${assetId}`;
        const updateResponseData = await huduApiRequest.call(this, 'PUT', updateEndpoint, updatePayload);
        debugLog('[API_RESPONSE] Update asset response received');

        response = {
            message: `Successfully updated custom field '${fieldIdentifierString}' for asset ID '${assetId}'.`,
            asset_id: assetId,
            field_identifier: fieldIdentifierString,
            processed_value: processedValue,
            response: updateResponseData,
        };
    }

    if (response) {
        debugLog('[RESOURCE_PROCESSING] Completed asset custom field operation', { operation });
        return response;
    }

    throw new NodeOperationError(this.getNode(), `Operation '${operation}' not implemented in handleAssetCustomFieldOperation`, { itemIndex });
} 