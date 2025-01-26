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
		debugLog('[ResourceMapping] Fetching linked layout details for ID:', layoutId);
		const response = await handleGetOperation.call(this, '/asset_layouts', layoutId);
		const layout = response as unknown as IAssetLayoutResponse;
		
		if (!layout || !layout.asset_layout) {
			return 'Unknown Layout';
		}
		
		return layout.asset_layout.name;
	} catch (error) {
		debugLog('[ResourceMapping] Error fetching linked layout:', error);
		return 'Unknown Layout';
	}
}

export async function mapAssetTagFieldsForResource(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	try {
		debugLog('[ResourceMapping] Starting getAssetTagFields');
		
		let layoutId: string;
		const operation = this.getNodeParameter('operation', 0) as string;

		if (operation === 'update') {
			// For update operation, get layout ID from asset details
			const assetId = this.getNodeParameter('id', 0) as string;
			debugLog('[ResourceMapping] Getting layout ID from asset:', assetId);

			const response = await huduApiRequest.call(
				this,
				'GET',
				'/assets',
				{},
				{ id: assetId },
			) as IAssetResponse;

			if (!response || !response.assets || !response.assets.length) {
				throw new Error(`Asset with ID ${assetId} not found`);
			}

			const asset = response.assets[0] as { asset_layout_id: number };
			layoutId = asset.asset_layout_id.toString();
			debugLog('[ResourceMapping] Got layout ID from asset:', layoutId);
		} else {
			// For create operation, get layout ID from UI
			layoutId = this.getNodeParameter('asset_layout_id', 0) as string;
			debugLog('[ResourceMapping] Got layout ID from UI:', layoutId);
		}
		
		debugLog('[ResourceMapping] Context:', { 
			node: this.getNode().name,
			layoutId,
		});

		if (!layoutId) {
			debugLog('[ResourceMapping] No layout ID available, returning empty fields');
			return {
				fields: [],
			};
		}

		// Fetch the layout details
		debugLog('[ResourceMapping] Fetching layout details for ID:', layoutId);
		const response = await handleGetOperation.call(this, '/asset_layouts', layoutId);
		const layout = response as unknown as IAssetLayoutResponse;
		debugLog('[ResourceMapping] Layout response:', layout);
		
		// Check if layout exists
		if (!layout || !layout.asset_layout) {
			debugLog('[ResourceMapping] Layout not found or inaccessible');
			throw new NodeOperationError(this.getNode(), 'Asset layout not found or inaccessible');
		}

		const layoutData = layout.asset_layout;
		const fields = layoutData.fields || [];
		debugLog('[ResourceMapping] Found fields:', fields);

		// If no fields are found
		if (fields.length === 0) {
			debugLog('[ResourceMapping] No fields found in layout, returning empty fields');
			return {
				fields: [],
			};
		}

		// Map fields to ResourceMapperFields format
		debugLog('[ResourceMapping] Starting field mapping process');
		const mappedFields = await Promise.all(fields
			.filter((field: IAssetLayoutFieldEntity) => {
				const isAssetTag = field.field_type === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG;
				const include = !field.is_destroyed && isAssetTag;
				debugLog(`[ResourceMapping] Filtering field ${field.label}:`, { include, field });
				return include;
			})
			.map(async (field: IAssetLayoutFieldEntity) => {
				debugLog(`[ResourceMapping] Processing field ${field.label} of type ${field.field_type}`);
				
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

				debugLog(`[ResourceMapping] Final mapped field ${field.label}:`, mappedField);
				return mappedField;
			}));

		const sortedFields = mappedFields.sort((a, b) => a.displayName.localeCompare(b.displayName));
		debugLog('[ResourceMapping] Final mapped fields:', sortedFields);
		
		return {
			fields: sortedFields,
		};
	} catch (error) {
		debugLog('[ResourceMapping] Error in getAssetTagFields:', error);
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw new NodeOperationError(this.getNode(), `Failed to load asset tag fields: ${(error as Error).message}`);
	}
} 
