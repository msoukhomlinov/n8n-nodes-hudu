import type { ILoadOptionsFunctions, IDataObject, ResourceMapperFields, FieldType, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleGetOperation } from '../../utils/operations';
import type { IAssetLayoutFieldEntity } from '../../resources/asset_layout_fields/asset_layout_fields.types';
import { ASSET_LAYOUT_FIELD_TYPES } from '../../utils/constants';
import { debugLog } from '../../utils/debugConfig';
import { huduApiRequest } from '../../utils/requestUtils';
import type { IAssetResponse } from '../../resources/assets/assets.types';

interface IAssetLayout extends IDataObject {
	active: boolean;
	name: string;
	fields: IAssetLayoutFieldEntity[];
}

interface IAssetLayoutResponse extends IDataObject {
	asset_layout: IAssetLayout;
}

interface IMappedField {
	id: string;
	displayName: string;
	required: boolean;
	defaultMatch: boolean;
	type: FieldType | undefined;
	display: boolean;
	canBeUsedToMatch: boolean;
	description: string | undefined;
	options?: INodePropertyOptions[];
	label: string;
}

async function getFieldTypeAndOptions(
	this: ILoadOptionsFunctions,
	huduType: string,
	field: IAssetLayoutFieldEntity,
): Promise<{ type: FieldType | undefined; options?: INodePropertyOptions[] }> {
	debugLog('[FieldTypeMapping] Starting type mapping for field:', { huduType, field });
	
	// Map Hudu field types to n8n types
	switch (huduType) {
		case ASSET_LAYOUT_FIELD_TYPES.NUMBER:
			return { type: 'number' };
		case ASSET_LAYOUT_FIELD_TYPES.DATE:
			return { type: 'dateTime' };
		case ASSET_LAYOUT_FIELD_TYPES.CHECKBOX:
			return { type: 'boolean' };
		case ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT:
			return { type: 'string' };
		case ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG:
		case ASSET_LAYOUT_FIELD_TYPES.PASSWORD:
		case ASSET_LAYOUT_FIELD_TYPES.TEXT:
		case ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT:
		case ASSET_LAYOUT_FIELD_TYPES.HEADING:
		case ASSET_LAYOUT_FIELD_TYPES.WEBSITE:
		case ASSET_LAYOUT_FIELD_TYPES.EMBED:
		case ASSET_LAYOUT_FIELD_TYPES.EMAIL:
		case ASSET_LAYOUT_FIELD_TYPES.PHONE:
		case ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA:
			return { type: 'string' };
		default:
			return { type: undefined };
	}
}

async function getLayoutFields(
	this: ILoadOptionsFunctions,
	includeAssetTags = false,
): Promise<ResourceMapperFields> {
	debugLog('[ResourceMapping] Starting getLayoutFields');
	
	let layoutId: string;
	const operation = this.getNodeParameter('operation', 0) as string;

	if (operation === 'update') {
		// For update operation, get layout ID from asset details
		const assetId = this.getNodeParameter('id', 0) as string;
		debugLog('[ResourceMapping] Getting layout ID from asset:', assetId);

		// Use huduApiRequest directly since handleGetAllOperation expects IExecuteFunctions
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
		includeAssetTags,
	});

	if (!layoutId) {
		debugLog('[ResourceMapping] No layout ID available, returning empty fields');
		return {
			fields: [],
		};
	}

	// Fetch the layout details
	debugLog('[ResourceMapping] Fetching layout details for ID:', layoutId);
	const layout = await handleGetOperation.call(this, '/asset_layouts', layoutId) as IAssetLayoutResponse;
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
			const include = !field.is_destroyed && (includeAssetTags ? isAssetTag : !isAssetTag);
			debugLog(`[ResourceMapping] Filtering field ${field.label}:`, { include, field });
			return include;
		})
		.map(async (field: IAssetLayoutFieldEntity) => {
			debugLog(`[ResourceMapping] Processing field ${field.label} of type ${field.field_type}`);
			const { type, options } = await getFieldTypeAndOptions.call(this, field.field_type, field);
			debugLog(`[ResourceMapping] Mapped field ${field.label}:`, { field, type, options });
			
			const mappedField: IMappedField = {
				id: field.id.toString(),
				displayName: `${field.label} (${field.field_type})${!layoutData.active ? ' [Archived Layout]' : ''}`,
				required: field.required || false,
				defaultMatch: false,
				type,
				display: true,
				canBeUsedToMatch: true,
				description: field.hint || undefined,
				label: field.label,
			};

			if (options) {
				debugLog(`[ResourceMapping] Adding options to field ${field.label}:`, options);
				mappedField.options = options;
			}

			debugLog(`[ResourceMapping] Final mapped field ${field.label}:`, mappedField);
			return mappedField;
		}))
		.then(fields => fields.sort((a, b) => a.displayName.localeCompare(b.displayName)));

	debugLog('[ResourceMapping] Final mapped fields:', mappedFields);
	return {
		fields: mappedFields,
	};
}

export async function mapAssetLayoutFieldsForResource(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	try {
		const parameterName = this.getNodeParameter('name', 0) as string;
		const includeAssetTags = parameterName === 'tagFieldMappings';
		return getLayoutFields.call(this, includeAssetTags);
	} catch (error) {
		debugLog('[ResourceMapping] Error in getAssetLayoutFields:', error);
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw new NodeOperationError(this.getNode(), `Failed to load asset layout fields: ${(error as Error).message}`);
	}
}

export async function getAssetLayoutFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const layoutId = this.getNodeParameter('asset_layout_id', 0) as string;
		
		debugLog('[FieldLoading] Starting getAssetLayoutFields for layout:', layoutId);

		if (!layoutId) {
			return [];
		}

		// Fetch the layout details
		const layout = await handleGetOperation.call(this, '/asset_layouts', layoutId) as IAssetLayoutResponse;
		
		if (!layout || !layout.asset_layout) {
			throw new NodeOperationError(this.getNode(), 'Asset layout not found or inaccessible');
		}

		const layoutData = layout.asset_layout;
		const fields = layoutData.fields || [];

		// Map fields to INodePropertyOptions format
		return fields
			.filter((field: IAssetLayoutFieldEntity) => !field.is_destroyed)
			.map((field: IAssetLayoutFieldEntity) => ({
				name: `${field.label} (${field.field_type})${!layoutData.active ? ' [Archived Layout]' : ''}`,
				value: field.id.toString(),
				description: field.hint || undefined,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

	} catch (error) {
		debugLog('[FieldLoading] Error in getAssetLayoutFields:', error);
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw new NodeOperationError(this.getNode(), `Failed to load asset layout fields: ${(error as Error).message}`);
	}
} 