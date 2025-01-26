import type { ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { handleListing } from '../../utils';

interface AssetOption {
	name: string;
	value: string | number;
}

interface HuduAsset extends IDataObject {
	id: number;
	name: string;
	asset_type: string;
	company_name: string;
	slug: string;
	archived: boolean;
	company_id: number;
	asset_layout_id: number;
}

/**
 * Format asset display name based on filtering context
 */
function formatAssetName(
	asset: HuduAsset,
	showAssetType: boolean,
	showCompanyName: boolean,
): string {
	const parts = [asset.name];

	if (showAssetType) {
		parts.push(`(${asset.asset_type})`);
	}

	if (showCompanyName) {
		parts.push(`(${asset.company_name})`);
	}

	return parts.join(' ');
}

/**
 * Get assets from Hudu API with optional filtering and grouping
 */
export async function getAssets(this: ILoadOptionsFunctions) {
	try {
		const companyId = this.getNodeParameter('company_id', 0) as string;
		const assetLayoutId = this.getNodeParameter('asset_layout_id', 0) as string;

		// Build query parameters
		const qs: IDataObject = {
			archived: false,
		};

		if (companyId) {
			qs.company_id = Number.parseInt(companyId, 10);
		}

		if (assetLayoutId) {
			qs.asset_layout_id = Number.parseInt(assetLayoutId, 10);
		}

		const assets = (await handleListing.call(
			this,
			'GET',
			'/assets',
			'assets',
			qs,
			{},
			true,
			0,
		)) as HuduAsset[];

		if (!Array.isArray(assets)) {
			return [];
		}

		// Determine display options based on filters
		const showAssetType = !assetLayoutId;
		const showCompanyName = !companyId;

		// Map assets to options with appropriate grouping
		if (showAssetType) {
			// Group by asset_type (primary grouping)
			const groupedByType = assets.reduce((acc, asset) => {
				const group = asset.asset_type;
				if (!acc[group]) {
					acc[group] = [];
				}
				acc[group].push({
					name: formatAssetName(asset, false, showCompanyName),
					value: JSON.stringify({
						id: asset.id,
						url: `/a/${asset.slug}`,
						name: asset.name
					}),
				});
				return acc;
			}, {} as { [key: string]: AssetOption[] });

			// Sort groups and items within groups
			return Object.entries(groupedByType)
				.sort(([a], [b]) => a.localeCompare(b))
				.flatMap(([group, options]) => [
					{ name: group, value: group },
					...options.sort((a, b) => a.name.localeCompare(b.name)),
				]);
		}

		// Group by company if not grouping by asset_type
		const groupedByCompany = assets.reduce((acc, asset) => {
			const group = asset.company_name;
			if (!acc[group]) {
				acc[group] = [];
			}
			acc[group].push({
				name: formatAssetName(asset, showAssetType, false),
				value: JSON.stringify({
					id: asset.id,
					url: `/a/${asset.slug}`,
					name: asset.name
				}),
			});
			return acc;
		}, {} as { [key: string]: AssetOption[] });

		// Sort groups and items within groups
		return Object.entries(groupedByCompany)
			.sort(([a], [b]) => a.localeCompare(b))
			.flatMap(([group, options]) => [
				{ name: group, value: group },
				...options.sort((a, b) => a.name.localeCompare(b.name)),
			]);
	} catch (error) {
		return [];
	}
} 