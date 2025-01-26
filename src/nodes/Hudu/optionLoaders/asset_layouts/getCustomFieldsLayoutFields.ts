import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleGetOperation } from '../../utils/operations';
import type { IAssetLayoutFieldEntity } from '../../resources/asset_layout_fields/asset_layout_fields.types';
import { debugLog } from '../../utils/debugConfig';
import { ASSET_LAYOUT_FIELD_TYPES } from '../../utils/constants';

interface IAssetLayout {
	active: boolean;
	name: string;
	fields: IAssetLayoutFieldEntity[];
}

interface IAssetLayoutResponse {
	asset_layout: IAssetLayout;
}

export async function getCustomFieldsLayoutFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		debugLog('[CustomFields] Starting getCustomFieldsLayoutFields');
		
		const layoutId = this.getCurrentNodeParameter('customFields_asset_layout_id') as string;
		
		debugLog('[CustomFields] Context:', { 
			node: this.getNode().name,
			layoutId,
		});

		if (!layoutId) {
			debugLog('[CustomFields] No layout ID provided, returning empty options');
			return [];
		}

		// Fetch the layout details
		debugLog('[CustomFields] Fetching layout details for ID:', layoutId);
		const response = await handleGetOperation.call(this, '/asset_layouts', layoutId);
		const layout = response as unknown as IAssetLayoutResponse;
		debugLog('[CustomFields] Layout response:', layout);
		
		// Check if layout exists
		if (!layout || !layout.asset_layout) {
			debugLog('[CustomFields] Layout not found or inaccessible');
			throw new NodeOperationError(this.getNode(), 'Asset layout not found or inaccessible');
		}

		const layoutData = layout.asset_layout;
		const fields = layoutData.fields || [];
		debugLog('[CustomFields] Found fields:', fields);

		// If no fields are found
		if (fields.length === 0) {
			debugLog('[CustomFields] No fields found in layout, returning empty options');
			return [];
		}

		// Map fields to options format
		debugLog('[CustomFields] Starting field mapping process');
		const options = fields
			.filter((field: IAssetLayoutFieldEntity) => !field.is_destroyed && field.field_type === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG)
			.map((field: IAssetLayoutFieldEntity) => ({
				name: `${field.label} (${field.field_type})${!layoutData.active ? ' [Archived Layout]' : ''}`,
				value: field.id.toString(),
				description: field.hint || undefined,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		debugLog('[CustomFields] Final mapped options:', options);
		return options;
	} catch (error) {
		debugLog('[CustomFields] Error in getCustomFieldsLayoutFields:', error);
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw new NodeOperationError(this.getNode(), `Failed to load custom fields layout fields: ${(error as Error).message}`);
	}
} 