import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	handleGetOperation,
	handleUpdateOperation,
} from '../../utils/operations';
import type { AssetLayoutFieldOperation, IAssetLayoutFieldEntity } from './asset_layout_fields.types';
import { debugLog } from '../../utils/debugConfig';

export async function handleAssetLayoutFieldOperation(
	this: IExecuteFunctions,
	operation: AssetLayoutFieldOperation,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	debugLog(`[OPERATION_${operation.toUpperCase()}] Starting asset layout field operation`, { operation, index: i });
	const assetLayoutId = this.getNodeParameter('asset_layout_id', i) as string;
	let responseData: IDataObject | IDataObject[] = {};

	debugLog('[API_REQUEST] Getting asset layout', { assetLayoutId });
	// Get the current asset layout
	const assetLayout = await handleGetOperation.call(this, '/asset_layouts', assetLayoutId);
	const fields = ((assetLayout as { asset_layout: { fields: IAssetLayoutFieldEntity[] } }).asset_layout.fields || []) as IAssetLayoutFieldEntity[];
	debugLog('[RESOURCE_PARAMS] Retrieved asset layout fields', fields);

	switch (operation) {
		case 'getAll': {
			debugLog('[OPERATION_GET_ALL] Processing get all fields operation');
			// Return all fields from the asset layout
			responseData = fields;
			debugLog('[API_RESPONSE] Get all fields response', responseData);
			break;
		}

		case 'get': {
			debugLog('[OPERATION_GET] Processing get field operation');
			const fieldId = this.getNodeParameter('field_id', i) as string;
			debugLog('[RESOURCE_PARAMS] Get field parameters', { fieldId });

			// Find the specific field
			const field = fields.find((f) => f.id === Number.parseInt(fieldId, 10));
			if (!field) {
				throw new Error(`Field with ID ${fieldId} not found in Asset Layout ${assetLayoutId}`);
			}
			responseData = field;
			debugLog('[API_RESPONSE] Get field response', responseData);
			break;
		}

		case 'create': {
			debugLog('[OPERATION_CREATE] Processing create field operation');
			// Get the field details
			const fieldType = this.getNodeParameter('field_type', i) as string;
			const label = this.getNodeParameter('label', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			debugLog('[RESOURCE_PARAMS] Create field parameters', { fieldType, label, additionalFields });

			// Create the new field
			const newField: IAssetLayoutFieldEntity = {
				id: Math.max(0, ...fields.map((f) => f.id)) + 1, // Generate a temporary ID
				label,
				field_type: fieldType,
				show_in_list: false,
				hint: '',
				expiration: false,
				options: '',
				position: fields.length + 1,
				is_destroyed: false,
				linkable_id: 0,
				...additionalFields,
			};

			debugLog('[RESOURCE_TRANSFORM] Created new field', newField);

			// Add the new field to the layout
			fields.push(newField);

			debugLog('[API_REQUEST] Updating asset layout with new field', { assetLayoutId, fields });

			// Update the asset layout with the new field
			const updatedAssetLayout = await handleUpdateOperation.call(
				this,
				'/asset_layouts',
				assetLayoutId,
				{
					asset_layout: {
						...assetLayout,
						fields,
					},
				},
			);

			// Return the newly created field
			const updatedFields = ((updatedAssetLayout as { asset_layout: { fields: IAssetLayoutFieldEntity[] } }).asset_layout.fields || []) as IAssetLayoutFieldEntity[];
			responseData = updatedFields[updatedFields.length - 1];
			debugLog('[API_RESPONSE] Create field response', responseData);
			break;
		}

		case 'update': {
			debugLog('[OPERATION_UPDATE] Processing update field operation');
			const fieldId = this.getNodeParameter('field_id', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			debugLog('[RESOURCE_PARAMS] Update field parameters', { fieldId, updateFields });

			// Find the field to update
			const fieldIndex = fields.findIndex((f) => f.id === Number.parseInt(fieldId, 10));
			if (fieldIndex === -1) {
				throw new Error(`Field with ID ${fieldId} not found in Asset Layout ${assetLayoutId}`);
			}

			// Update the field
			fields[fieldIndex] = {
				...fields[fieldIndex],
				...updateFields,
			};

			debugLog('[RESOURCE_TRANSFORM] Updated field', fields[fieldIndex]);

			debugLog('[API_REQUEST] Updating asset layout with modified field', { assetLayoutId, fields });

			// Update the asset layout with the modified fields
			const updatedAssetLayout = await handleUpdateOperation.call(
				this,
				'/asset_layouts',
				assetLayoutId,
				{
					asset_layout: {
						fields,
					},
				},
			);

			// Return the updated field
			const updatedFields = ((updatedAssetLayout as { asset_layout: { fields: IAssetLayoutFieldEntity[] } }).asset_layout.fields || []) as IAssetLayoutFieldEntity[];
			responseData = updatedFields[fieldIndex];
			debugLog('[API_RESPONSE] Update field response', responseData);
			break;
		}

		case 'delete': {
			debugLog('[OPERATION_DELETE] Processing delete field operation');
			const fieldId = this.getNodeParameter('field_id', i) as string;

			debugLog('[RESOURCE_PARAMS] Delete field parameters', { fieldId });

			// Find the field to delete
			const fieldIndex = fields.findIndex((f) => f.id === Number.parseInt(fieldId, 10));
			if (fieldIndex === -1) {
				throw new Error(`Field with ID ${fieldId} not found in Asset Layout ${assetLayoutId}`);
			}

			// Mark the field as destroyed
			fields[fieldIndex] = {
				...fields[fieldIndex],
				is_destroyed: true,
			};

			debugLog('[RESOURCE_TRANSFORM] Marked field as destroyed', fields[fieldIndex]);

			debugLog('[API_REQUEST] Updating asset layout with destroyed field', { assetLayoutId, fields });

			// Update the asset layout with the field marked as destroyed
			await handleUpdateOperation.call(
				this,
				'/asset_layouts',
				assetLayoutId,
				{
					asset_layout: {
						fields,
					},
				},
			);

			// Return an empty object for successful deletion
			responseData = {};
			debugLog('[API_RESPONSE] Delete field response', responseData);
			break;
		}

		case 'reorder': {
			debugLog('[OPERATION_REORDER] Processing reorder fields operation');
			const fieldOrder = this.getNodeParameter('fieldOrder', i) as { fields: { field_id: string }[] };

			debugLog('[RESOURCE_PARAMS] Reorder fields parameters', { fieldOrder });

			// Update positions based on the new order
			const newFields = [...fields];
			fieldOrder.fields.forEach((item, index) => {
				const fieldIndex = newFields.findIndex((f) => f.id === Number.parseInt(item.field_id, 10));
				if (fieldIndex !== -1) {
					newFields[fieldIndex] = {
						...newFields[fieldIndex],
						position: index + 1,
					};
				}
			});

			debugLog('[RESOURCE_TRANSFORM] Reordered fields', newFields);

			debugLog('[API_REQUEST] Updating asset layout with reordered fields', { assetLayoutId, fields: newFields });

			// Update the asset layout with the reordered fields
			const updatedAssetLayout = await handleUpdateOperation.call(
				this,
				'/asset_layouts',
				assetLayoutId,
				{
					asset_layout: {
						...assetLayout,
						fields: newFields,
					},
				},
			);

			// Return the reordered fields
			responseData = ((updatedAssetLayout as { asset_layout: { fields: IAssetLayoutFieldEntity[] } }).asset_layout.fields || []) as IAssetLayoutFieldEntity[];
			debugLog('[API_RESPONSE] Reorder fields response', responseData);
			break;
		}
	}

	debugLog(`[OPERATION_${operation.toUpperCase()}] Operation completed`, responseData);
	return responseData;
} 