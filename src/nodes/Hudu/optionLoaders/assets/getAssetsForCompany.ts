import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { debugLog } from '../../utils/debugConfig';
import { handleListing } from '../../utils';

export async function getAssetsForCompany(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const companyId = this.getCurrentNodeParameter('companyIdForAssetLookup') as string | number;

  debugLog('[OPTION_LOADING] getAssetsForCompany called', { companyId });

  if (!companyId || companyId === '') {
    debugLog('[OPTION_LOADING] No companyId provided for getAssetsForCompany');
    return [{ name: 'Select a Company first...', value: '' }];
  }

  try {
    const endpoint = `/companies/${companyId}/assets`;
    debugLog('[OPTION_LOADING] Fetching assets for company using handleListing', { endpoint });
    
    // Use handleListing to properly handle pagination
    const assets = await handleListing.call(
      this,
      'GET',
      endpoint,
      'assets', // resourceName
      {},       // body
      {},       // query parameters
      true,     // returnAll
      0,        // limit
    );
    
    debugLog('[OPTION_LOADING] Received assets for company', { count: assets.length });

    if (Array.isArray(assets) && assets.length > 0) {
      const mappedAssets = assets.map((asset: any) => ({
        name: asset.name || `ID: ${asset.id}`,
        value: asset.id,
      }));
      
      debugLog('[OPTION_LOADING] Mapped assets for options', { count: mappedAssets.length });
      
      if (mappedAssets.length === 0) {
        return [{ name: 'No Assets Found for This Company', value: '' }];
      }
      
      return mappedAssets;
    } else {
      debugLog('[OPTION_LOADING] No assets found or invalid format', { assets });
      return [{ name: 'No Assets Found for This Company', value: '' }];
    }
  } catch (error) {
    debugLog('[ERROR] Error loading assets for company', { error });
    return [
      {
        name: `Error: ${error instanceof Error ? error.message : 'Failed to load assets'}`,
        value: 'ERROR_LOADING_ASSETS',
      },
    ];
  }
} 