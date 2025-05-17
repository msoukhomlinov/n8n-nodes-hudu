import type { ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/requestUtils';
import type { IAssetResponse } from '../../resources/assets/assets.types';
import { debugLog } from '../../utils/debugConfig';
import { handleGetOperation } from '../../utils/operations';

interface IAssetLayoutResponse {
  asset_layout: {
    id: number;
    name: string;
    active: boolean;
  };
}

/**
 * Gets the asset layout ID for an asset
 * Used to pre-load the asset layout ID for the update operation
 */
export async function getAssetLayoutId(this: ILoadOptionsFunctions) {
  try {
    // Get the asset ID from the node parameters
    const assetId = this.getNodeParameter('id', 0) as string;
    
    // If no asset ID is provided, return an empty array
    if (!assetId) {
      return [];
    }

    debugLog('[OPTION_LOADING] Getting asset layout ID for asset:', assetId);

    // Fetch the asset details to get the layout ID
    const response = await huduApiRequest.call(
      this,
      'GET',
      '/assets',
      {},
      { id: assetId },
    ) as IAssetResponse;

    if (!response || !response.assets || !response.assets.length) {
      throw new NodeOperationError(this.getNode(), `Asset with ID ${assetId} not found`);
    }

    const asset = response.assets[0] as { asset_layout_id: number };
    const layoutId = asset.asset_layout_id;
    
    debugLog('[OPTION_LOADING] Got layout ID from asset:', layoutId);

    // Fetch the layout details to get the name
    const rawLayoutResponse = await handleGetOperation.call(this, '/asset_layouts', layoutId.toString());
    const layoutResponse = rawLayoutResponse as unknown as IAssetLayoutResponse;
    
    let layoutName = `Asset Layout ${layoutId}`;
    let isActive = true;
    
    if (layoutResponse && layoutResponse.asset_layout) {
      layoutName = layoutResponse.asset_layout.name;
      isActive = layoutResponse.asset_layout.active !== false;
    }
    
    debugLog('[OPTION_LOADING] Retrieved layout name:', layoutName);

    // Return the layout ID as the only option with the actual layout name
    return [
      {
        name: `${layoutName}${!isActive ? ' [Archived]' : ''}`,
        value: layoutId.toString(),
      }
    ];
  } catch (error) {
    debugLog('[OPTION_LOADING] Error in getAssetLayoutId:', error);
    if (error instanceof NodeOperationError) {
      throw error;
    }
    throw new NodeOperationError(this.getNode(), `Failed to get asset layout ID: ${(error as Error).message}`);
  }
} 