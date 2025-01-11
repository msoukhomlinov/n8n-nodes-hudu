import type { ILoadOptionsFunctions, INodePropertyOptions, IDataObject } from 'n8n-workflow';
import { handleGetOperation } from '../../utils/operations';
import type { IAssetLayoutFieldEntity } from '../../resources/asset_layout_fields/asset_layout_fields.types';

interface IAssetLayout extends IDataObject {
	active: boolean;
	name: string;
	fields: IAssetLayoutFieldEntity[];
}

interface IAssetLayoutResponse extends IDataObject {
	asset_layout: IAssetLayout;
}

export async function getAssetLayoutFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const layoutId = this.getNodeParameter('asset_layout_id') as string;

		if (!layoutId) {
			return [
				{
					name: '- Please Select an Asset Layout First -',
					value: '',
				},
			];
		}

		// Fetch the layout details
		const layout = await handleGetOperation.call(this, '/asset_layouts', layoutId) as IAssetLayoutResponse;
		
		// Check if layout exists
		if (!layout || !layout.asset_layout) {
			return [
				{
					name: '- Layout Not Found or Inaccessible -',
					value: '',
				},
			];
		}

		const layoutData = layout.asset_layout;
		const fields = layoutData.fields || [];

		// If no fields are found
		if (fields.length === 0) {
			return [
				{
					name: '- No Fields Found in This Layout -',
					value: '',
				},
			];
		}

		// Map fields to options
		return fields
			.filter((field: IAssetLayoutFieldEntity) => !field.is_destroyed)
			.map((field: IAssetLayoutFieldEntity) => ({
				name: `${field.label} (${field.field_type})${!layoutData.active ? ' [Archived Layout]' : ''}`,
				value: field.id,
				description: field.hint || undefined,
			}))
			.sort((a: INodePropertyOptions, b: INodePropertyOptions) => a.name.localeCompare(b.name));
	} catch (error) {
		console.error('Error loading asset layout fields:', error);
		return [
			{
				name: '- Error Loading Fields -',
				value: '',
			},
		];
	}
} 