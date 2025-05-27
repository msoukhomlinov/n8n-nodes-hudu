import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/requestUtils';
import type { AssetStandardFieldOperation } from './assetStandardField.types';
import { debugLog } from '../../utils/debugConfig';

/**
 * Handles operations for asset standard fields in Hudu
 * 
 * Standard fields are top-level properties of the asset object, such as:
 * - primary_serial
 * - primary_mail
 * - primary_model
 * - primary_manufacturer
 * 
 * Unlike custom fields, standard fields don't need snake_case conversion
 * as they are already predefined in the API with the correct format.
 * 
 * @param operation - The operation to perform (get/update)
 * @param itemIndex - The index of the current item being processed
 * @returns The result of the operation
 */
export async function handleAssetStandardFieldOperation(
    this: IExecuteFunctions,
    operation: AssetStandardFieldOperation,
    itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
    debugLog('[RESOURCE_PROCESSING] Starting asset standard field operation', { operation, itemIndex });
    
    const assetId = this.getNodeParameter('assetId', itemIndex) as number;
    const fieldIdentifier = this.getNodeParameter('fieldIdentifier', itemIndex) as string;

    if (!assetId) {
        throw new NodeOperationError(this.getNode(), 'Asset ID is required.', { itemIndex });
    }

    if (!fieldIdentifier) {
        throw new NodeOperationError(this.getNode(), 'Standard Field Identifier is required.', { itemIndex });
    }

    debugLog('[RESOURCE_PARAMS] Asset standard field parameters', { assetId, fieldIdentifier });

    let response;

    if (operation === 'get') {
        debugLog('[OPERATION_GET] Getting asset standard field value');
        
        // Fetch the asset
        const assetResponse = await huduApiRequest.call(this, 'GET', '/assets', {}, { id: assetId });
        debugLog('[API_RESPONSE] Asset response received');
        
        const assets = (assetResponse as IDataObject).assets as IDataObject[];
        
        if (!assets || !assets.length) {
            throw new NodeOperationError(this.getNode(), `Asset with ID ${assetId} not found.`, { itemIndex });
        }
        
        const asset = assets[0];
        debugLog('[RESOURCE_PROCESSING] Found asset', { assetId, layoutId: asset.asset_layout_id });
        
        const fieldValue = asset[fieldIdentifier];
        debugLog('[RESOURCE_TRANSFORM] Found standard field value', { 
            fieldIdentifier, 
            value: fieldValue 
        });
        
        response = {
            asset_id: assetId,
            field_identifier: fieldIdentifier,
            value: fieldValue,
        };
    } else if (operation === 'update') {
        debugLog('[OPERATION_UPDATE] Updating asset standard field value');
        
        const valueToSet = this.getNodeParameter('value', itemIndex) as string;
        debugLog('[RESOURCE_TRANSFORM] Updating standard field', { 
            fieldIdentifier, 
            newValue: valueToSet 
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
        
        if (!companyId) {
            throw new NodeOperationError(this.getNode(), `Asset with ID '${assetId}' does not have a company_id.`, { itemIndex });
        }
        
        debugLog('[RESOURCE_PROCESSING] Found asset metadata', { 
            assetId, 
            companyId, 
            layoutId: assetObject.asset_layout_id 
        });
        
        // Prepare the update payload, starting with all required fields
        const updatePayload: IDataObject = {
            name: assetObject.name,
            asset_layout_id: assetObject.asset_layout_id,
            [fieldIdentifier]: valueToSet,
        };
        
        // Optionally include other standard fields if present (except the one being updated)
        const standardFields = ['primary_serial', 'primary_mail', 'primary_model', 'primary_manufacturer'];
        for (const field of standardFields) {
            if (field !== fieldIdentifier && assetObject[field]) {
                updatePayload[field] = assetObject[field];
            }
        }
        
        debugLog('[API_REQUEST] Updating asset with payload', updatePayload);
        
        // Use the correct endpoint for update with company_id
        const updateEndpoint = `/companies/${companyId}/assets/${assetId}`;
        const updateResponseData = await huduApiRequest.call(this, 'PUT', updateEndpoint, updatePayload);
        debugLog('[API_RESPONSE] Update asset response received');
        
        response = {
            message: `Successfully updated standard field '${fieldIdentifier}' for asset ID '${assetId}'.`,
            asset_id: assetId,
            field_identifier: fieldIdentifier,
            new_value: valueToSet,
            response: updateResponseData,
        };
    }
    
    if (response) {
        debugLog('[RESOURCE_PROCESSING] Completed asset standard field operation', { operation });
        return response;
    }
    
    throw new NodeOperationError(this.getNode(), `Operation '${operation}' not implemented in handleAssetStandardFieldOperation`, { itemIndex });
} 