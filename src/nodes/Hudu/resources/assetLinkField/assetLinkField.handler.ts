import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/requestUtils';
import { toSnakeCase } from '../../utils/formatters';
import type { AssetLinkFieldOperation } from './assetLinkField.types';
import { ASSET_LAYOUT_FIELD_TYPES } from '../../utils/constants';
import { debugLog } from '../../utils/debugConfig';

/**
 * Handles operations for asset link fields in Hudu
 * 
 * Asset link fields allow connecting assets to other assets within Hudu. 
 * These fields appear in the asset's fields array and have a field_type of 'AssetTag'.
 * The values of these fields are arrays of asset IDs that point to other assets in Hudu.
 * 
 * When updating asset link fields:
 * 1. The field name must be converted to snake_case
 * 2. The value must be an array of asset IDs
 * 3. The linked assets must exist and have the correct layout type (linkable_id)
 * 
 * @param operation - The operation to perform (get/update)
 * @param itemIndex - The index of the current item being processed
 * @returns The result of the operation
 */
export async function handleAssetLinkFieldOperation(
    this: IExecuteFunctions,
    operation: AssetLinkFieldOperation,
    itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
    debugLog('[RESOURCE_PROCESSING] Starting asset link field operation', { operation, itemIndex });
    
    const assetId = this.getNodeParameter('assetId', itemIndex) as number;
    const fieldIdentifier = this.getNodeParameter('fieldIdentifier', itemIndex) as string; // This is the label of the link field

    if (!assetId) {
        throw new NodeOperationError(this.getNode(), 'Asset ID is required.', { itemIndex });
    }

    if (!fieldIdentifier) {
        throw new NodeOperationError(this.getNode(), 'Link Field Identifier is required.', { itemIndex });
    }
    
    debugLog('[RESOURCE_PARAMS] Asset link field parameters', { assetId, fieldIdentifier });

    // Check for placeholder value indicating no link fields are available
    if (fieldIdentifier === 'NO_LINK_FIELDS_FOUND') {
        throw new NodeOperationError(
            this.getNode(),
            `This asset doesn't have any asset link fields. Please select an asset that has link fields defined in its layout.`,
            { itemIndex }
        );
    }

    let response;

    if (operation === 'get') {
        debugLog('[OPERATION_GET] Getting asset link field value');
        
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

        if (!Array.isArray(assetObject.fields)) {
            throw new NodeOperationError(this.getNode(), `Asset ID '${assetId}' does not have a 'fields' array or it's not an array.`, { itemIndex });
        }

        const assetFields = assetObject.fields as IDataObject[];
        const targetField = assetFields.find(field => field.label === fieldIdentifier);

        if (!targetField) {
            throw new NodeOperationError(this.getNode(), `Link Field with label '${fieldIdentifier}' not found on asset ID '${assetId}'.`, { itemIndex });
        }
        
        debugLog('[RESOURCE_TRANSFORM] Found link field', { 
            label: targetField.label, 
            fieldType: targetField.field_type 
        });

        let fieldValue = targetField.value;
        let assetIds: number[] = [];

        // Extract just the IDs from the field value
        if (fieldValue === null || fieldValue === undefined) {
            // Return empty array for null/undefined
            debugLog('[RESOURCE_TRANSFORM] Field value is null/undefined, returning empty array');
            assetIds = [];
        } else if (typeof fieldValue === 'string') {
            debugLog('[RESOURCE_TRANSFORM] Field value is string, attempting to parse as JSON');
            try {
                // Try to parse the string as JSON
                const parsedValue = JSON.parse(fieldValue);
                if (Array.isArray(parsedValue)) {
                    // Extract IDs from the array of objects
                    assetIds = parsedValue
                        .filter(item => item && typeof item === 'object' && 'id' in item)
                        .map(item => {
                            const id = item.id;
                            if (typeof id === 'number') {
                                return id;
                            } else if (typeof id === 'string') {
                                return parseInt(id, 10);
                            }
                            return NaN;
                        })
                        .filter(id => !isNaN(id));
                    
                    debugLog('[RESOURCE_TRANSFORM] Parsed JSON array into asset IDs', { count: assetIds.length });
                }
            } catch (error) {
                // If it's not valid JSON, just return empty array
                debugLog('[RESOURCE_TRANSFORM] Error parsing JSON string', { error });
                assetIds = [];
            }
        } else if (Array.isArray(fieldValue)) {
            debugLog('[RESOURCE_TRANSFORM] Field value is already an array, extracting IDs');
            // It's already an array, extract IDs if objects, or use directly if numbers
            assetIds = fieldValue
                .map(item => {
                    if (item && typeof item === 'object' && 'id' in item) {
                        const id = item.id;
                        if (typeof id === 'number') {
                            return id;
                        } else if (typeof id === 'string') {
                            return parseInt(id, 10);
                        }
                        return NaN;
                    } else if (typeof item === 'number') {
                        return item;
                    } else if (typeof item === 'string' && !isNaN(parseInt(item, 10))) {
                        return parseInt(item, 10);
                    }
                    return NaN;
                })
                .filter(id => !isNaN(id));
            
            debugLog('[RESOURCE_TRANSFORM] Extracted asset IDs from array', { count: assetIds.length });
        }

        response = {
            asset_id: assetId,
            field_identifier: fieldIdentifier,
            value: assetIds.join(','),
            asset_ids: assetIds, // Also include the array for flexibility
        };

    } else if (operation === 'update') {
        debugLog('[OPERATION_UPDATE] Updating asset link field value');
        
        const valueToSet = this.getNodeParameter('value', itemIndex) as string; // Comma-separated string of asset IDs
        
        // Convert comma-separated string to array of integers
        const linkedAssetIds = valueToSet.split(',')
            .map(id => parseInt(id.trim(), 10))
            .filter(id => !isNaN(id));
        
        debugLog('[RESOURCE_TRANSFORM] Converted comma-separated IDs to array', { 
            input: valueToSet, 
            output: linkedAssetIds 
        });

        const snakeCaseFieldLabel = toSnakeCase(fieldIdentifier);

        if (!snakeCaseFieldLabel) {
            throw new NodeOperationError(this.getNode(), `Could not convert field label '${fieldIdentifier}' to snake_case.`, { itemIndex });
        }
        
        debugLog('[RESOURCE_TRANSFORM] Converted field name to snake_case', { 
            original: fieldIdentifier, 
            snakeCase: snakeCaseFieldLabel 
        });

        // Fetch asset to get company_id, asset_layout_id and other required fields
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
        
        debugLog('[RESOURCE_PROCESSING] Found asset metadata', { 
            assetId, 
            companyId, 
            assetLayoutId 
        });

        // Fetch the asset layout to find the link field definition and its linkable_id
        debugLog('[RESOURCE_PROCESSING] Fetching asset layout to validate link field');
        const layoutResponse = await huduApiRequest.call(this, 'GET', `/asset_layouts/${assetLayoutId}`);
        const layoutData = (layoutResponse as IDataObject).asset_layout as IDataObject || layoutResponse;
        
        if (!layoutData || !layoutData.fields || !Array.isArray(layoutData.fields)) {
            throw new NodeOperationError(this.getNode(), `Could not retrieve field definitions for asset layout ID '${assetLayoutId}'.`, { itemIndex });
        }
        
        // Find the link field by label
        const linkField = (layoutData.fields as IDataObject[]).find(
            field => field.label === fieldIdentifier && field.field_type === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG
        );
        
        if (!linkField) {
            throw new NodeOperationError(
                this.getNode(), 
                `Field '${fieldIdentifier}' is not found or is not an Asset Link field in asset layout ID '${assetLayoutId}'.`, 
                { itemIndex }
            );
        }
        
        debugLog('[RESOURCE_TRANSFORM] Found link field in layout', { 
            fieldId: linkField.id,
            fieldType: linkField.field_type,
            linkableId: linkField.linkable_id
        });
        
        const linkableId = linkField.linkable_id;
        
        if (!linkableId) {
            throw new NodeOperationError(
                this.getNode(), 
                `Asset Link field '${fieldIdentifier}' does not have a linkable_id defined. Cannot validate linked assets.`, 
                { itemIndex }
            );
        }

        // If there are IDs to validate
        if (linkedAssetIds.length > 0) {
            debugLog('[RESOURCE_VALIDATION] Validating linked asset IDs', { count: linkedAssetIds.length });
            
            // Validate that all asset IDs exist and are of the correct layout type
            const invalidAssets: Array<{id: number, reason: string}> = [];
            const missingAssets: number[] = [];

            // Fetch each asset to validate (in parallel for efficiency)
            const assetValidationPromises = linkedAssetIds.map(async (id) => {
                try {
                    debugLog('[RESOURCE_VALIDATION] Validating asset ID', { id });
                    const assetResponse = await huduApiRequest.call(this, 'GET', '/assets', {}, { id });
                    const assetData = (assetResponse as IDataObject).assets as IDataObject[];
                    
                    if (!assetData || !assetData.length) {
                        debugLog('[RESOURCE_VALIDATION] Asset not found', { id });
                        missingAssets.push(id);
                        return { id, exists: false };
                    }
                    
                    const asset = assetData[0];
                    if (asset.asset_layout_id !== linkableId) {
                        debugLog('[RESOURCE_VALIDATION] Asset has incorrect layout', { 
                            id, 
                            actualLayoutId: asset.asset_layout_id, 
                            expectedLayoutId: linkableId 
                        });
                        
                        invalidAssets.push({
                            id,
                            reason: `Asset ID ${id} has layout ID ${asset.asset_layout_id}, but field '${fieldIdentifier}' requires layout ID ${linkableId}`
                        });
                        return { id, exists: true, valid: false };
                    }
                    
                    debugLog('[RESOURCE_VALIDATION] Asset is valid', { id });
                    return { id, exists: true, valid: true };
                } catch (error) {
                    debugLog('[RESOURCE_VALIDATION] Error validating asset', { id, error });
                    missingAssets.push(id);
                    return { id, exists: false, error };
                }
            });
            
            await Promise.all(assetValidationPromises);
            
            // Throw error if any assets are invalid or missing
            if (missingAssets.length > 0 || invalidAssets.length > 0) {
                debugLog('[RESOURCE_VALIDATION] Validation failed', { 
                    missingCount: missingAssets.length,
                    invalidCount: invalidAssets.length
                });
                
                let errorMessage = 'Validation failed for the following linked asset IDs:\n';
                
                if (missingAssets.length > 0) {
                    errorMessage += `- Missing assets: ${missingAssets.join(', ')}\n`;
                }
                
                if (invalidAssets.length > 0) {
                    errorMessage += '- Invalid assets:\n';
                    invalidAssets.forEach(asset => {
                        errorMessage += `  - ${asset.id}: ${asset.reason}\n`;
                    });
                }
                
                throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex });
            }
            
            debugLog('[RESOURCE_VALIDATION] All assets validated successfully');
        }

        // Prepare the update payload with required fields
        const updatePayload: IDataObject = {
            name: assetObject.name,
            asset_layout_id: assetObject.asset_layout_id,
            custom_fields: [
                {
                    [snakeCaseFieldLabel]: linkedAssetIds,
                }
            ],
        };

        // Optionally include standard fields if present
        if (assetObject.primary_serial) updatePayload.primary_serial = assetObject.primary_serial;
        if (assetObject.primary_mail) updatePayload.primary_mail = assetObject.primary_mail;
        if (assetObject.primary_model) updatePayload.primary_model = assetObject.primary_model;
        if (assetObject.primary_manufacturer) updatePayload.primary_manufacturer = assetObject.primary_manufacturer;

        debugLog('[API_REQUEST] Updating asset with payload', updatePayload);

        // Use the correct endpoint for update with company_id
        const updateEndpoint = `/companies/${companyId}/assets/${assetId}`;
        const updateResponseData = await huduApiRequest.call(this, 'PUT', updateEndpoint, updatePayload);
        debugLog('[API_RESPONSE] Update asset response received');

        response = {
            message: `Successfully updated link field '${fieldIdentifier}' for asset ID '${assetId}'.`,
            asset_id: assetId,
            field_identifier: fieldIdentifier,
            new_linked_asset_ids: linkedAssetIds,
            response: updateResponseData,
        };
    }

    if (response) {
        debugLog('[RESOURCE_PROCESSING] Completed asset link field operation', { operation });
        return response;
    }

    throw new NodeOperationError(this.getNode(), `Operation '${operation}' not implemented in handleAssetLinkFieldOperation`, { itemIndex });
} 