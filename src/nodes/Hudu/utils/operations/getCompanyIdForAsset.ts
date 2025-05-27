import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { debugLog } from '../debugConfig';

/**
 * Fetches an asset by ID and returns its company ID and the asset object.
 * Throws a NodeOperationError if the asset is not found or has no company_id.
 *
 * @param context n8n execution context (this)
 * @param assetId The asset ID to look up
 * @param itemIndex Optional item index for error context
 * @returns { companyId: string | number, assetObject: IDataObject }
 */
export async function getCompanyIdForAsset(
  context: IExecuteFunctions,
  assetId: string | number,
  itemIndex?: number,
): Promise<{ companyId: string | number, assetObject: IDataObject }> {
  debugLog('[RESOURCE_PROCESSING] Looking up company_id for asset', { assetId });
  const assetLookup = await huduApiRequest.call(context, 'GET', '/assets', {}, { id: String(assetId) });
  const assetsArray = (assetLookup as IDataObject).assets as IDataObject[];
  if (!assetsArray?.length) {
    throw new NodeOperationError(context.getNode(), `No asset found with ID '${assetId}'`, { itemIndex });
  }
  const assetObject = assetsArray[0];
  const companyId = assetObject.company_id;
  if (typeof companyId !== 'string' && typeof companyId !== 'number') {
    throw new NodeOperationError(context.getNode(), `Asset with ID '${assetId}' has an invalid company_id type.`, { itemIndex });
  }
  debugLog('[RESOURCE_PROCESSING] Found company_id for asset', { assetId, companyId });
  return { companyId, assetObject };
} 