import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils/GenericFunctions';
import { AssetLayoutOperation } from './asset_layouts.types';

export async function handleAssetLayoutOperation(
  this: IExecuteFunctions,
  operation: AssetLayoutOperation,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/asset_layouts',
        'asset_layouts',
        {},
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
