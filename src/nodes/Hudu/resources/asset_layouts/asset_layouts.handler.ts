import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing, processDateRange } from '../../utils/GenericFunctions';
import type { AssetLayoutOperation } from './asset_layouts.types';

export async function handleAssetLayoutOperation(
  this: IExecuteFunctions,
  operation: AssetLayoutOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      // Process date range if present
      if (filters.updated_at) {
        const updatedAtFilter = filters.updated_at as IDataObject;

        if (updatedAtFilter.range) {
          const rangeObj = updatedAtFilter.range as IDataObject;

          const dateRange = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as string,
            },
          });

          filters.updated_at = dateRange || undefined;
        } else {
          filters.updated_at = undefined;
        }
      }

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/asset_layouts',
        'asset_layouts',
        undefined,
        filters,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as string;
      responseData = await huduApiRequest.call(this, 'GET', `/asset_layouts/${id}`);
      break;
    }

    case 'create': {
      const body = this.getNodeParameter('body', i) as IDataObject;
      responseData = await huduApiRequest.call(this, 'POST', '/asset_layouts', {
        asset_layout: body,
      });
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const body = this.getNodeParameter('body', i) as IDataObject;
      responseData = await huduApiRequest.call(this, 'PUT', `/asset_layouts/${id}`, {
        asset_layout: body,
      });
      break;
    }
  }

  return responseData;
}
