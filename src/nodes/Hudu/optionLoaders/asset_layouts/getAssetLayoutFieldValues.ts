import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { handleGetOperation } from '../../utils/operations';
import type { IAssetLayoutFieldEntity } from '../../resources/asset_layout_fields/asset_layout_fields.types';

export async function getAssetLayoutFieldValues(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const layoutId = this.getNodeParameter('asset_layout_id') as string;
		const fieldId = this.getNodeParameter('field_id') as string;

		if (!layoutId || !fieldId) {
			return [];
		}

		// Fetch the layout details
		const layout = await handleGetOperation.call(this, '/asset_layouts', layoutId, 'asset_layout');
		const fields = (layout as { fields: IAssetLayoutFieldEntity[] }).fields || [];
		const field = fields.find((f) => f.id === Number.parseInt(fieldId, 10));

		if (!field) {
			return [];
		}

		// Return the current values of the field as options
		return [
			{
				name: 'Expiration',
				value: 'expiration',
				description: field.expiration.toString(),
			},
			{
				name: 'Field Type',
				value: 'field_type',
				description: field.field_type,
			},
			{
				name: 'Hint',
				value: 'hint',
				description: field.hint,
			},
			{
				name: 'Label',
				value: 'label',
				description: field.label,
			},
			{
				name: 'Options',
				value: 'options',
				description: field.options,
			},
			{
				name: 'Position',
				value: 'position',
				description: field.position.toString(),
			},
			{
				name: 'Required',
				value: 'required',
				description: field.required?.toString() || 'false',
			},
			{
				name: 'Show in List',
				value: 'show_in_list',
				description: field.show_in_list.toString(),
			},
		];
	} catch (error) {
		return [];
	}
} 