import type { ILoadOptionsFunctions, IDataObject, ResourceMapperFields, FieldType, INodePropertyOptions, ResourceMapperField } from 'n8n-workflow';
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

async function getFieldTypeAndOptions(
	this: ILoadOptionsFunctions,
	huduType: string,
	field: IAssetLayoutFieldEntity,
): Promise<{ type: FieldType | undefined; options?: INodePropertyOptions[] }> {
	debugLog('[RESOURCE_MAPPING] getFieldTypeAndOptions called for field:', { 
		id: field.id, 
		label: field.label, 
		huduType: huduType,
		hasOptions: !!field.options,
		optionsValue: field.options,
		hasListId: !!(field as IDataObject).list_id,
		listIdValue: (field as IDataObject).list_id
	});
	
	// Map Hudu field types to n8n types
	switch (huduType) {
		case ASSET_LAYOUT_FIELD_TYPES.NUMBER:
			return { type: 'number' };
		case ASSET_LAYOUT_FIELD_TYPES.DATE:
			return { type: 'dateTime' };
		case ASSET_LAYOUT_FIELD_TYPES.CHECKBOX:
			return { type: 'boolean' };
		case ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT: {
			// Case 1: Options are defined as a static string on the layout field
			if (field.options && typeof field.options === 'string' && field.options.trim() !== '') {
				debugLog('[RESOURCE_MAPPING] Found static options for ListSelect field', { id: field.id, options: field.options });
				const availableOptions = field.options.split(/\r?\n/).map(opt => ({
					name: opt.trim(),
					value: opt.trim(),
				}));
				return { type: 'options', options: availableOptions };
			}

			// Case 2: Options are linked from a Hudu List via list_id
			const listId = (field as IDataObject).list_id as number | undefined;
			if (listId) {
				try {
					debugLog('[RESOURCE_MAPPING] Found list_id for ListSelect field, fetching parent list', { id: field.id, listId });
					const response = await handleGetOperation.call(
						this,
						'/lists',
						listId,
						'list',
					);

					let listItems: IDataObject[] = [];
					const responseObject = response as IDataObject;

					if (responseObject && typeof responseObject === 'object') {
						const list = (responseObject.list || responseObject) as IDataObject;
						if (list && Array.isArray(list.list_items)) {
							listItems = list.list_items as IDataObject[];
						} else {
							debugLog('[RESOURCE_MAPPING] Could not find list_items in response', { id: field.id, listId, response });
						}
					}

					const availableOptions = listItems.map(opt => ({
						name: opt.name as string,
						value: opt.name as string,
					}));

					debugLog('[RESOURCE_MAPPING] Successfully extracted list options', { id: field.id, listId, count: availableOptions.length });
					return { type: 'options', options: availableOptions };
				} catch (error) {
					debugLog('[RESOURCE_MAPPING] Error fetching list for options', { id: field.id, listId, error: (error as Error).message });
					return { type: 'string' }; // Fallback on error
				}
			}

			// Fallback for ListSelect fields with no options defined
			debugLog('[RESOURCE_MAPPING] No options found for ListSelect field', { id: field.id });
			return { type: 'string' };
		}
		case ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA:
			return { type: 'object' };
		case ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG:
		case ASSET_LAYOUT_FIELD_TYPES.PASSWORD:
		case ASSET_LAYOUT_FIELD_TYPES.TEXT:
		case ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT:
		case ASSET_LAYOUT_FIELD_TYPES.HEADING:
		case ASSET_LAYOUT_FIELD_TYPES.WEBSITE:
		case ASSET_LAYOUT_FIELD_TYPES.EMBED:
		case ASSET_LAYOUT_FIELD_TYPES.EMAIL:
		case ASSET_LAYOUT_FIELD_TYPES.PHONE:
		case ASSET_LAYOUT_FIELD_TYPES.RELATION:
			return { type: 'string' };
		default:
			return { type: undefined };
	}
}

async function getLayoutFields(
	this: ILoadOptionsFunctions,
	includeAssetTags = false,
): Promise<ResourceMapperFields> {
	debugLog('[RESOURCE_MAPPING] Starting getLayoutFields. Context Operation:', this.getNodeParameter('operation', 0));
	
	let layoutId: string;
	const operation = this.getNodeParameter('operation', 0) as string;

	if (operation === 'update') {
		const assetId = this.getNodeParameter('assetId', 0) as string;
		debugLog('[RESOURCE_MAPPING] Update Operation - Asset ID from parameter:', { assetId });

		if (!assetId) {
			debugLog('[RESOURCE_MAPPING] Asset ID not provided for update, returning empty fields');
			return { fields: [] };
		}
		try {
			const response = await huduApiRequest.call(
				this,
				'GET',
				'/assets',
				{},
				{ id: assetId },
			) as IAssetResponse;

			if (!response || !response.assets || !response.assets.length) {
				debugLog('[RESOURCE_MAPPING] Asset not found via API for Asset ID:', assetId);
				throw new Error(`Asset with ID ${assetId} not found`);
			}
			const asset = response.assets[0] as { asset_layout_id: number };
			layoutId = asset.asset_layout_id.toString();
			debugLog('[RESOURCE_MAPPING] Layout ID from asset:', { layoutId });
		} catch (error) {
			debugLog('[RESOURCE_MAPPING] Error fetching asset or layoutId for update:', { assetId, error: (error as Error).message });
			return { fields: [] }; // Return empty on error to prevent node crash
		}
	} else { // Create operation
		layoutId = this.getNodeParameter('asset_layout_id', 0) as string;
		debugLog('[RESOURCE_MAPPING] Create Operation - Layout ID from parameter:', { layoutId });
	}
	
	if (!layoutId) {
		debugLog('[RESOURCE_MAPPING] No Layout ID available (either from asset or parameter), returning empty fields');
		return { fields: [] };
	}

	try {
		const layout = await handleGetOperation.call(this, '/asset_layouts', layoutId) as IAssetLayoutResponse;
		if (!layout || !layout.asset_layout || !Array.isArray(layout.asset_layout.fields)) {
			debugLog('[RESOURCE_MAPPING] Layout not found or fields array missing for Layout ID:', { layoutId, layoutResponse: layout });
			return { fields: [] };
		}
		const layoutFields = layout.asset_layout.fields;
		debugLog('[RESOURCE_MAPPING] Fields fetched for Layout ID:', { layoutId, count: layoutFields.length, firstField: layoutFields[0] });

		const standardFields: ResourceMapperField[] = [
			{ id: 'name', displayName: 'Asset Name (name)', type: 'string', required: true, defaultMatch: false, display: true, canBeUsedToMatch: true },
			{ id: 'primary_serial', displayName: 'Primary Serial (primary_serial)', type: 'string', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true },
			{ id: 'primary_model', displayName: 'Primary Model (primary_model)', type: 'string', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true },
			{ id: 'primary_manufacturer', displayName: 'Primary Manufacturer (primary_manufacturer)', type: 'string', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true },
		];

		const customFieldsPromises = layoutFields
			.filter((field: IAssetLayoutFieldEntity) => !field.is_destroyed && field.field_type !== ASSET_LAYOUT_FIELD_TYPES.HEADING)
			.map(async (field: IAssetLayoutFieldEntity): Promise<ResourceMapperField> => {
				debugLog('[RESOURCE_MAPPING] About to call getFieldTypeAndOptions for field:', { id: field.id, label: field.label, fieldType: field.field_type });
				const { type, options } = await getFieldTypeAndOptions.call(this, field.field_type, field);
				debugLog('[RESOURCE_MAPPING] getFieldTypeAndOptions returned:', { id: field.id, label: field.label, type, options: options ? `${options.length} options` : 'none' });
				let displayName = `${field.label} (${field.field_type})${!layout.asset_layout.active ? ' [Archived Layout]' : ''}`;
				if (field.field_type === ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG || field.field_type === ASSET_LAYOUT_FIELD_TYPES.RELATION) {
					displayName += ' - Use comma-separated IDs';
				} else if (field.field_type === ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT && (field as IDataObject).multiple_options == true) {
					displayName += ' - Use comma-separated values for multiple options';
				} else if (field.field_type === ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA) {
					displayName += ' - Address object: address_line_1, address_line_2, city, state, zip, country_name (ISO alpha-2, e.g., AU), state uses region code (e.g., NSW)';
				}
				return {
					id: field.id.toString(),
					displayName: displayName,
					required: field.required || false,
					defaultMatch: false,
					type,
					display: true,
					canBeUsedToMatch: true,
					options,
				};
			});
		
		const customFields = (await Promise.all(customFieldsPromises))
			.sort((a, b) => a.displayName.localeCompare(b.displayName));
		
		const sortedStandardFields = standardFields.sort((a, b) => a.displayName.localeCompare(b.displayName));

		const mappedFields = [...sortedStandardFields, ...customFields];

		debugLog('[RESOURCE_MAPPING] Final Mapped Fields to be returned:', { count: mappedFields.length, mappedFieldsSample: mappedFields.slice(0, 5) });
		return {
			fields: mappedFields,
		};
	} catch (error) {
		debugLog('[RESOURCE_MAPPING] Error fetching or processing layout fields:', { layoutId, error: (error as Error).message });
		return { fields: [] }; // Return empty on error
	}
}

export async function mapAssetLayoutFieldsForResource(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	try {
		const parameterName = this.getNodeParameter('name', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const includeAssetTags = parameterName === 'tagFieldMappings' || parameterName === 'updateTagFieldMappings';
		
		// For update operation, check if we can get the pre-loaded layout ID
		if (operation === 'update') {
			try {
				// Try to use the pre-loaded layout ID
				const layoutId = this.getNodeParameter('update_asset_layout_id', 0) as string;
				debugLog('[RESOURCE_MAPPING] Using pre-loaded asset layout ID for update:', layoutId);
				
				// If we have a valid layout ID, use it for getLayoutFields
				if (layoutId) {
					// Replace asset_layout_id in context so getLayoutFields can use it
					this.getNode().parameters.asset_layout_id = layoutId;
				}
			} catch (error) {
				debugLog('[RESOURCE_MAPPING] Pre-loaded layout ID not available:', error);
				// Continue with standard behavior if pre-loaded ID is not available
			}
		}
		
		return getLayoutFields.call(this, includeAssetTags);
	} catch (error) {
		debugLog('[RESOURCE_MAPPING] Error in getAssetLayoutFields:', error);
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
		
		debugLog('[OPTION_LOADING] Starting getAssetLayoutFields for layout:', layoutId);

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
		debugLog('[OPTION_LOADING] Error in getAssetLayoutFields:', error);
		if (error instanceof NodeOperationError) {
			throw error;
		}
		throw new NodeOperationError(this.getNode(), `Failed to load asset layout fields: ${(error as Error).message}`);
	}
} 