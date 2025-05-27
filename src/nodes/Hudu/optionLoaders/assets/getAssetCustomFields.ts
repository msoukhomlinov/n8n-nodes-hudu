import type { ILoadOptionsFunctions, INodePropertyOptions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/requestUtils';
import { debugLog } from '../../utils/debugConfig';

export async function getAssetCustomFields(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const assetId = this.getCurrentNodeParameter('assetId') as string | number;
  if (!assetId || isNaN(Number(assetId)) || Number(assetId) <= 0) {
    return [{ name: 'Please Enter a Valid Asset ID First', value: '' }];
  }
  
  try {
    debugLog('[OPTION_LOADING] Fetching custom fields for asset ID:', assetId);
    const response = await huduApiRequest.call(this, 'GET', '/assets', {}, { id: assetId }) as IDataObject;
    const assets = Array.isArray(response.assets) ? response.assets : [];
    
    if (!assets.length) {
      debugLog('[OPTION_LOADING] No asset found with ID:', assetId);
      return [{ name: `Asset with ID ${assetId} not found`, value: '' }];
    }
    
    const fields = Array.isArray(assets[0].fields) ? assets[0].fields : [];
    debugLog('[OPTION_LOADING] Found fields for asset:', { count: fields.length });
    debugLog('[OPTION_LOADING] Field labels and types (raw):', fields.map((f: any) => ({ label: f.label, type: f.field_type })));

    // Fetch asset layout to get field types
    const assetLayoutId = assets[0].asset_layout_id;
    let layoutFields: any[] = [];
    if (assetLayoutId) {
      try {
        const layoutResponse = await huduApiRequest.call(this, 'GET', `/asset_layouts/${assetLayoutId}`) as IDataObject;
        layoutFields = Array.isArray((layoutResponse.asset_layout as IDataObject)?.fields)
          ? (layoutResponse.asset_layout as IDataObject).fields as IDataObject[]
          : [];
        debugLog('[OPTION_LOADING] Asset layout fields retrieved', { count: layoutFields.length });
      } catch (layoutError) {
        debugLog('[OPTION_LOADING] Error fetching asset layout:', layoutError);
      }
    }

    // Build picklist from layout fields, not asset fields
    if (!layoutFields.length) {
      debugLog('[OPTION_LOADING] No layout fields found, cannot build picklist');
      return [{ name: 'No Custom Fields Found for This Asset', value: 'NO_CUSTOM_FIELDS_FOUND' }];
    }

    // Map asset field values by label for quick lookup
    const assetFieldValueMap = new Map<string, any>();
    for (const field of fields) {
      if (field.label) {
        assetFieldValueMap.set(field.label, field.value);
      }
    }

    // Build picklist from layout fields
    const customFields = layoutFields
      .filter((layoutField: any) => layoutField.field_type !== 'AssetTag')
      .map((layoutField: any) => {
        const value = assetFieldValueMap.get(layoutField.label);
        return {
          name: layoutField.label,
          value: layoutField.label,
          description: layoutField.field_type + (value !== undefined && value !== null ? ` (Current value: ${value})` : ''),
        };
      });
    debugLog('[OPTION_LOADING] Custom fields from layout:', customFields);

    if (customFields.length === 0) {
      debugLog('[OPTION_LOADING] No custom fields found for asset/layout');
      return [{ name: 'No Custom Fields Found for This Asset', value: 'NO_CUSTOM_FIELDS_FOUND' }];
    }

    return customFields;
  } catch (error) {
    debugLog('[OPTION_LOADING] Error in getAssetCustomFields:', error);
    throw new NodeOperationError(this.getNode(), `Failed to load custom fields for asset: ${(error as Error).message}`);
  }
} 