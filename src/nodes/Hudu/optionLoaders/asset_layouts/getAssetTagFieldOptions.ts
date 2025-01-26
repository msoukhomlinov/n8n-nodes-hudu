import type { ILoadOptionsFunctions, IDataObject, INodePropertyOptions, IExecuteFunctions, FieldType } from 'n8n-workflow';
import { handleGetAllOperation } from '../../utils/operations';
import type { IAssetLayoutFieldEntity } from '../../resources/asset_layout_fields/asset_layout_fields.types';
import type { IAsset } from '../../resources/assets/assets.types';
import { debugLog } from '../../utils/debugConfig';

async function getAssetOptions(
	this: ILoadOptionsFunctions,
	linkableLayoutId?: number,
	companyId?: string | number,
	isGlobalSearch = false,
): Promise<INodePropertyOptions[]> {
	try {
		debugLog('[AssetOptions] Starting getAssetOptions:', { linkableLayoutId, companyId, isGlobalSearch });

		const qs: IDataObject = {
			archived: false,
		};

		// Only filter by asset_layout_id if we have a valid linkable_id
		if (linkableLayoutId && linkableLayoutId > 0) {
			qs.asset_layout_id = linkableLayoutId;
			debugLog('[AssetOptions] Filtering by asset_layout_id:', linkableLayoutId);
		}

		// Filter by company unless global search is enabled
		if (!isGlobalSearch && companyId) {
			qs.company_id = companyId;
			debugLog('[AssetOptions] Filtering by company_id:', companyId);
		} else if (isGlobalSearch) {
			debugLog('[AssetOptions] Global search enabled, not filtering by company');
		}

		debugLog('[AssetOptions] Querying with params:', qs);

		const assets = await handleGetAllOperation.call(
			this as unknown as IExecuteFunctions,
			'/assets',
			'assets',
			qs,
			true,
			0,
		) as IAsset[];

		debugLog('[AssetOptions] Found assets:', assets);

		const options = assets.map(asset => ({
			name: asset.name,
			value: asset.id,
			description: `Company: ${asset.company_name}`,
		}));

		debugLog('[AssetOptions] Mapped options:', options);
		return options;
	} catch (error) {
		debugLog('[AssetOptions] Error in getAssetOptions:', error);
		return [];
	}
}

export async function getAssetTagFieldOptions(
	this: ILoadOptionsFunctions,
	field: IAssetLayoutFieldEntity,
): Promise<{ type: FieldType | undefined; options?: INodePropertyOptions[] }> {
	try {
		debugLog('[FieldTypeMapping] Processing ASSET_TAG field:', field);

		// Check for linkable_id to determine which asset layout to filter by
		const linkableLayoutId = field.linkable_id ? Number(field.linkable_id) : undefined;
		debugLog('[FieldTypeMapping] Found linkable_id:', linkableLayoutId);

		// Get global search setting and company ID from context
		let companyId: string | number | undefined;
		let isGlobalSearch = false;
		
		try {
			// Try to get global search setting from the resource mapper's parent context
			isGlobalSearch = this.getNodeParameter('asset_tag_scope', 0) as boolean;
			debugLog('[FieldTypeMapping] Global search enabled:', isGlobalSearch);

			// Only get company_id if not doing global search
			if (!isGlobalSearch) {
				companyId = this.getNodeParameter('company_id', 0) as string | number;
				debugLog('[FieldTypeMapping] Found company_id:', companyId);
			}
		} catch (error) {
			debugLog('[FieldTypeMapping] Could not get parameters from context:', error);
		}
		
		const options = await getAssetOptions.call(this, linkableLayoutId, companyId, isGlobalSearch);
		debugLog('[FieldTypeMapping] Got options for field:', { 
			fieldName: field.label, 
			optionsCount: options.length,
			linkableLayoutId,
			isGlobalSearch,
		});

		const result = {
			type: 'options' as FieldType,
			options,
		};
		debugLog('[FieldTypeMapping] Returning result:', result);
		return result;
	} catch (error) {
		debugLog('[FieldTypeMapping] Error in getAssetTagFieldOptions:', error);
		return { type: 'options', options: [] }; // Return empty options instead of falling back to string
	}
} 