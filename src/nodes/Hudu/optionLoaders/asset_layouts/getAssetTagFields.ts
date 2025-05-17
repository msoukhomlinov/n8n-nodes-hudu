import type { ILoadOptionsFunctions, ResourceMapperFields, FieldType } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleGetOperation } from '../../utils/operations';
import type { IAssetLayoutFieldEntity } from '../../resources/asset_layout_fields/asset_layout_fields.types';
import { ASSET_LAYOUT_FIELD_TYPES } from '../../utils/constants';
import { debugLog } from '../../utils/debugConfig';
import { huduApiRequest } from '../../utils/requestUtils';
import type { IAssetResponse } from '../../resources/assets/assets.types';

interface IAssetLayout {
	id: number;
	active: boolean;
	name: string;
	fields: IAssetLayoutFieldEntity[];
}

interface IAssetLayoutResponse {
	asset_layout: IAssetLayout;
}

interface IMappedField {
	id: string;
	displayName: string;
	required: boolean;
	defaultMatch: boolean;
	type: FieldType;
	display: boolean;
	canBeUsedToMatch: boolean;
	description: string | undefined;
	label: string;
}

async function getLinkedLayoutName(
	this: ILoadOptionsFunctions,
	layoutId: number,
): Promise<string> {
	try {
		debugLog('[RESOURCE_MAPPING] Fetching linked layout details for ID:', layoutId);
		const response = await handleGetOperation.call(this, '/asset_layouts', layoutId);
		const layout = response as unknown as IAssetLayoutResponse;
		
		if (!layout || !layout.asset_layout) {
			return 'Unknown Layout';
		}
		
		return layout.asset_layout.name;
	} catch (error) {
		debugLog('[RESOURCE_MAPPING] Error fetching linked layout:', error);
		return 'Unknown Layout';
	}
}

export async function mapAssetTagFieldsForResource(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	try {
		debugLog('[RESOURCE_MAPPING] Starting getAssetTagFields');
		
		let layoutId: string;
		const operation = this.getNodeParameter('operation', 0) as string;

		if (operation === 'update') {
			// For update operation, get pre-loaded layout ID first
			try {
				layoutId = this.getNodeParameter('update_asset_layout_id', 0) as string;
				debugLog('[RESOURCE_MAPPING] Got pre-loaded layout ID:', layoutId);
			} catch (error) {
				// Fall back to getting layout ID from asset if pre-loaded ID is not available
				debugLog('[RESOURCE_MAPPING] Pre-loaded layout ID not found, fetching from asset');
				const assetId = this.getNodeParameter('id', 0) as string;
				debugLog('[RESOURCE_MAPPING] Getting layout ID from asset:', assetId);

				const response = await huduApiRequest.call(
					this,
					'GET',
					'/assets',
					{},
					{ id: assetId },
				) as IAssetResponse;

				if (!response || !response.assets || !response.assets.length) {
					throw new NodeOperationError(this.getNode(), `Asset with ID ${assetId} not found`);
				}

				const asset = response.assets[0] as { asset_layout_id: number };
				layoutId = asset.asset_layout_id.toString();
				debugLog('[RESOURCE_MAPPING] Got layout ID from asset:', layoutId);
			}
		} else {
			// For create operation, get layout ID from UI
			layoutId = this.getNodeParameter('asset_layout_id', 0) as string;
			debugLog('[RESOURCE_MAPPING] Got layout ID from UI:', layoutId);
		}
		
		debugLog('[RESOURCE_MAPPING] Context:', { 
			node: this.getNode().name,
			layoutId,
		});

		if (!layoutId) {
			debugLog('[RESOURCE_MAPPING] No layout ID available');
			throw new NodeOperationError(this.getNode(), 'Asset Layout Name or ID must be selected when returning assets as asset links');
		}

		// Fetch the layout details
		debugLog('[RESOURCE_MAPPING] Fetching layout details for ID:', layoutId);
		const response = await handleGetOperation.call(this, '/asset_layouts', layoutId);
		const layout = response as unknown as IAssetLayoutResponse;
		debugLog('[RESOURCE_MAPPING] Layout response:', layout);
		
		// Check if layout exists
		if (!layout || !layout.asset_layout) {
			debugLog('[RESOURCE_MAPPING] Layout not found or inaccessible');
			throw new NodeOperationError(this.getNode(), 'Asset layout not found or inaccessible');
		}

		const layoutData = layout.asset_layout;
		const fields = layoutData.fields || [];
		debugLog('[RESOURCE_MAPPING] Found fields:', fields);

		// If no fields are found
		if (fields.length === 0) {
			debugLog('[RESOURCE_MAPPING] No fields found in layout');
			throw new NodeOperationError(this.getNode(), 'No fields found in the selected Asset Layout');
		}

		// Filter for Asset Tag fields
		const assetTagFields = fields.filter((field: IAssetLayoutFieldEntity) => {
			const isAssetTag = field.field_type === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG;
			const include = !field.is_destroyed && isAssetTag;
			debugLog(`[RESOURCE_MAPPING] Filtering field ${field.label}:`, { include, field });
			return include;
		});

		// Check if there are any Asset Tag fields after filtering
		if (assetTagFields.length === 0) {
			debugLog('[RESOURCE_MAPPING] No Asset Link fields found in layout after filtering');
			throw new NodeOperationError(this.getNode(), 'No Asset Link fields are available in the asset\'s layout. Check for tag fields. Retry');
		}

		// Map fields to ResourceMapperFields format
		debugLog('[RESOURCE_MAPPING] Starting field mapping process');
		const mappedFields = await Promise.all(assetTagFields
			.map(async (field: IAssetLayoutFieldEntity) => {
				debugLog(`[RESOURCE_MAPPING] Processing field ${field.label} of type ${field.field_type}`);
				
				let linkedLayoutName = 'Any Asset Layout';
				if (field.linkable_id === 0) {
					linkedLayoutName = 'All';
				} else if (field.linkable_id && field.linkable_id > 0) {
					linkedLayoutName = await getLinkedLayoutName.call(this, field.linkable_id);
				}
				
				const mappedField: IMappedField = {
					id: field.id.toString(),
					displayName: `${field.label} (Asset Link: ${linkedLayoutName})${!layoutData.active ? ' [Archived Layout]' : ''}`,
					required: field.required || false,
					defaultMatch: false,
					type: 'string',
					display: true,
					canBeUsedToMatch: true,
					description: field.hint || undefined,
					label: field.label,
				};

				debugLog(`[RESOURCE_MAPPING] Final mapped field ${field.label}:`, mappedField);
				return mappedField;
			}));

		const sortedFields = mappedFields.sort((a, b) => a.displayName.localeCompare(b.displayName));
		debugLog('[RESOURCE_MAPPING] Final mapped fields:', sortedFields);
		
		return {
			fields: sortedFields,
		};
	} catch (error) {
		debugLog('[RESOURCE_MAPPING] Error in getAssetTagFields:', error);
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw new NodeOperationError(this.getNode(), `Failed to load asset tag fields: ${(error as Error).message}`);
	}
} 
