import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function getManyAsAssetLinksHandler(
	this: IExecuteFunctions,
	index: number,
	existingAssets?: IDataObject[],
): Promise<INodeExecutionData[] | IDataObject[]> {
	// If we have existing assets, format them as asset links
	if (existingAssets) {
		return existingAssets.map(asset => ({
			id: asset.id,
			url: `/a/${asset.slug}`,
			name: asset.name,
		}));
	}

	// For direct getManyAsAssetLinks operation calls
	const layoutId = this.getNodeParameter('customFields_asset_layout_id', index) as string;

	if (!layoutId) {
		throw new NodeOperationError(this.getNode(), 'Asset Layout ID is required');
	}

	// Return array of items formatted as asset links
	return [{
		json: {
			asset_layout_id: layoutId,
		} as IDataObject,
	}];
} 