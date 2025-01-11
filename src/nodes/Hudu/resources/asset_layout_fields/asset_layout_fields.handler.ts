import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	handleGetOperation,
	handleUpdateOperation,
} from '../../utils/operations';
import type { AssetLayoutFieldOperation, IAssetLayoutFieldEntity } from './asset_layout_fields.types';

export async function handleAssetLayoutFieldOperation(
	this: IExecuteFunctions,
	operation: AssetLayoutFieldOperation,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const assetLayoutId = this.getNodeParameter('asset_layout_id', i) as string;
	let responseData: IDataObject | IDataObject[] = {};

	// Get the current asset layout
	const assetLayout = await handleGetOperation.call(this, '/asset_layouts', assetLayoutId);
	const fields = ((assetLayout as { asset_layout: { fields: IAssetLayoutFieldEntity[] } }).asset_layout.fields || []) as IAssetLayoutFieldEntity[];

	switch (operation) {
		case 'getAll': {
			// Return all fields from the asset layout
			responseData = fields;
			break;
		}

		case 'get': {
			const fieldId = this.getNodeParameter('field_id', i) as string;
			// Find the specific field
			const field = fields.find((f) => f.id === Number.parseInt(fieldId, 10));
			if (!field) {
				throw new Error(`Field with ID ${fieldId} not found in Asset Layout ${assetLayoutId}`);
			}
			responseData = field;
			break;
		}

		case 'create': {
			// Get the field details
			const fieldType = this.getNodeParameter('field_type', i) as string;
			const label = this.getNodeParameter('label', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

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

			// Add the new field to the layout
			fields.push(newField);

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
			break;
		}

		case 'update': {
			const fieldId = this.getNodeParameter('field_id', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

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
			break;
		}

		case 'delete': {
			const fieldId = this.getNodeParameter('field_id', i) as string;

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
			break;
		}

		case 'reorder': {
			const fieldOrder = this.getNodeParameter('fieldOrder', i) as { fields: { field_id: string }[] };

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
			break;
		}
	}

	return responseData;
} 