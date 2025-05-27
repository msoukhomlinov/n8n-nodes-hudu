import type { ILoadOptionsFunctions, INodePropertyOptions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/requestUtils';
import { debugLog } from '../../utils/debugConfig';
import { handleListing } from '../../utils';

export async function getLinkableAssets(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  try {
    const assetId = this.getCurrentNodeParameter('assetId') as number;
    const fieldIdentifier = this.getCurrentNodeParameter('fieldIdentifier') as string;
    let sameCompanyOnly: boolean;
    try {
      const rawValue = this.getCurrentNodeParameter('sameCompanyOnly');
      if (typeof rawValue === 'boolean') {
        sameCompanyOnly = rawValue;
      } else if (rawValue === 'true') {
        sameCompanyOnly = true;
      } else if (rawValue === 'false') {
        sameCompanyOnly = false;
      } else {
        sameCompanyOnly = true;
      }
    } catch (error) {
      sameCompanyOnly = true;
    }

    debugLog('[OPTION_LOADING] getLinkableAssets parameters:', { 
      assetId, 
      fieldIdentifier, 
      sameCompanyOnly,
      sameCompanyOnlyType: typeof sameCompanyOnly
    });

    if (!assetId || !fieldIdentifier) {
      debugLog('[OPTION_LOADING] Missing required parameters:', { assetId, fieldIdentifier });
      return [];
    }

    // Fetch the asset to get company_id and asset_layout_id
    debugLog('[OPTION_LOADING] Fetching asset details for ID:', assetId);
    const assetResp = await huduApiRequest.call(this, 'GET', '/assets', {}, { id: assetId }) as IDataObject;
    debugLog('[OPTION_LOADING] Asset API response:', assetResp);

    const assetsArr = Array.isArray(assetResp.assets) ? assetResp.assets : [];
    if (!assetsArr.length) {
      debugLog('[OPTION_LOADING] No asset found with ID:', assetId);
      return [];
    }

    const asset = assetsArr[0] as IDataObject;
    debugLog('[OPTION_LOADING] Found asset:', asset);

    const companyId = asset.company_id;
    const assetLayoutId = asset.asset_layout_id;
    if (!companyId || !assetLayoutId) {
      debugLog('[OPTION_LOADING] Asset missing company_id or asset_layout_id:', { companyId, assetLayoutId });
      return [];
    }

    // Fetch the asset layout to get the link field definition
    debugLog('[OPTION_LOADING] Fetching asset layout:', assetLayoutId);
    const layoutResp = await huduApiRequest.call(this, 'GET', `/asset_layouts/${assetLayoutId}`) as IDataObject;
    debugLog('[OPTION_LOADING] Asset layout response:', layoutResp);

    // Here's a key change: check if the layout has asset_layout property
    const layoutData = layoutResp.asset_layout as IDataObject || layoutResp;
    debugLog('[OPTION_LOADING] Using layout data:', layoutData);

    // Check if fields exist and are an array
    const layoutFields = Array.isArray(layoutData.fields) ? layoutData.fields : [];
    debugLog('[OPTION_LOADING] Found layout fields:', layoutFields);
    if (layoutFields.length === 0) {
      debugLog('[OPTION_LOADING] No fields found in layout');
      return [];
    }

    // Find the field by label
    debugLog('[OPTION_LOADING] Looking for field with label:', fieldIdentifier);
    const linkField = layoutFields.find((f: any) => {
      debugLog('[OPTION_LOADING] Comparing field:', { fieldLabel: f.label, fieldIdentifier });
      return f.label === fieldIdentifier;
    });
    
    if (!linkField) {
      debugLog('[OPTION_LOADING] No field found with label:', fieldIdentifier);
      return [];
    }
    
    debugLog('[OPTION_LOADING] Found link field:', linkField);
    const linkableId = linkField.linkable_id;
    debugLog('[OPTION_LOADING] Link field linkable_id:', linkableId);

    // Build query for assets
    const qs: IDataObject = { archived: false };
    if (linkableId && linkableId > 0) {
      qs.asset_layout_id = linkableId;
      debugLog('[OPTION_LOADING] Filtering by asset_layout_id:', linkableId);
    } else {
      debugLog('[OPTION_LOADING] Not filtering by asset_layout_id (linkable_id is 0 or missing)');
    }
    
    debugLog('[OPTION_LOADING] sameCompanyOnly value and type:', { 
      value: sameCompanyOnly, 
      type: typeof sameCompanyOnly,
      truthyCheck: !!sameCompanyOnly
    });
    
    if (sameCompanyOnly === true) {
      qs.company_id = companyId;
      debugLog('[OPTION_LOADING] Filtering by company_id:', companyId);
    } else {
      delete qs.company_id;
      debugLog('[OPTION_LOADING] NOT filtering by company_id (sameCompanyOnly is false)');
    }

    // Use the handleListing function to fetch all pages of assets
    debugLog('[OPTION_LOADING] Beginning paginated asset fetch with query:', qs);
    
    const allAssets = await handleListing.call(
      this,
      'GET',
      '/assets',
      'assets',
      {},  // body
      qs,   // query parameters
      true, // returnAll
      0,    // limit
    ) as IDataObject[];
    
    debugLog('[OPTION_LOADING] Finished fetching assets, total count:', allAssets.length);

    // Return as options
    const result = allAssets.map((a: any) => ({
      name: a.name,
      value: a.id,
      description: a.asset_type ? `Type: ${a.asset_type}` : undefined,
    }));
    
    debugLog('[OPTION_LOADING] Returning options count:', result.length);
    return result;
  } catch (error) {
    debugLog('[OPTION_LOADING] Error in getLinkableAssets:', error);
    // Return empty array rather than throwing, to avoid breaking the UI
    return [];
  }
} 