import type { ILoadOptionsFunctions } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/requestUtils';
import { debugLog } from '../../utils/debugConfig';
import { handleGetOperation } from '../../utils/operations';
import type { IAssetLayoutFieldEntity } from '../../resources/asset_layout_fields/asset_layout_fields.types';
import { ASSET_LAYOUT_FIELD_TYPES } from '../../utils/constants';
import type { IAssetResponse } from '../../resources/assets/assets.types';

/**
 * Loads asset link fields (fields of type AssetTag) for a given asset.
 * Used as a loadOptionsMethod for the assetLinkField resource dropdown in n8n.
 *
 * @param this - n8n ILoadOptionsFunctions context
 * @returns Array of options for asset link fields
 */
export async function getAssetLinkFields(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string; description?: string }[]> {
	const assetId = this.getCurrentNodeParameter('assetId') as string | number;
	if (!assetId || isNaN(Number(assetId)) || Number(assetId) <= 0) {
		return [{ name: 'Please Enter a Valid Asset ID First', value: '' }];
	}

	try {
		debugLog('[OPTION_LOADING] Fetching asset link fields for asset ID:', assetId);

		// Fetch the asset to get its layout ID
		const assetResponse = await huduApiRequest.call(this, 'GET', '/assets', {}, { id: assetId }) as IAssetResponse;
		if (!assetResponse || !assetResponse.assets || !assetResponse.assets.length) {
			debugLog('[OPTION_LOADING] No asset found with ID:', assetId);
			return [{ name: `Asset with ID ${assetId} Not Found`, value: '' }];
		}

		const asset = assetResponse.assets[0];
		const layoutId = asset.asset_layout_id;
		if (!layoutId) {
			debugLog('[OPTION_LOADING] Asset has no layout ID');
			return [{ name: 'Asset Has No Associated Layout', value: '' }];
		}

		// Fetch the layout
		debugLog('[OPTION_LOADING] Fetching layout details for ID:', layoutId);
		const layoutResponse = await handleGetOperation.call(this, '/asset_layouts', layoutId);
		const layout = (layoutResponse as { asset_layout: { fields: IAssetLayoutFieldEntity[] } }).asset_layout;
		if (!layout || !Array.isArray(layout.fields)) {
			debugLog('[OPTION_LOADING] Layout not found or has no fields');
			return [{ name: 'Layout Not Found or Has No Fields', value: '' }];
		}

		// Filter for ASSET_TAG fields
		const assetTagFields = layout.fields.filter((field: IAssetLayoutFieldEntity) => field.field_type === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG && !field.is_destroyed);
		debugLog('[OPTION_LOADING] Found asset link fields:', { count: assetTagFields.length });

		// Return message if no asset link fields are found
		if (assetTagFields.length === 0) {
			debugLog('[OPTION_LOADING] No asset link fields found in layout');
			return [{ name: 'No Asset Link Fields Found for This Asset', value: 'NO_LINK_FIELDS_FOUND' }];
		}

		// Return as options
		return assetTagFields.map(field => ({
			name: field.label,
			value: field.label,
			description: field.hint || undefined,
		}));
	} catch (error) {
		debugLog('[OPTION_LOADING] Error in getAssetLinkFields:', error);
		return [{ name: `Error: ${(error as Error).message}`, value: '' }];
	}
} 
