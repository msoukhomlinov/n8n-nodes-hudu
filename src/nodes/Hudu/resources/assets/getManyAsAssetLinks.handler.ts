import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';

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

	return [];
} 