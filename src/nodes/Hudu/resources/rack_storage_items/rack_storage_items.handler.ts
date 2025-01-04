import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { RackStorageItemOperation } from './rack_storage_items.types';

export async function handleRackStorageItemOperation(
  this: IExecuteFunctions,
  operation: RackStorageItemOperation,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/rack_storage_items',
        {},
        filters,
      );
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/rack_storage_items/${id}`,
      );
      break;
    }

    case 'create': {
      const body = {
        rack_storage_item: {
          rack_storage_role_id: this.getNodeParameter('rack_storage_role_id', i) as number,
          asset_id: this.getNodeParameter('asset_id', i) as number,
          start_unit: this.getNodeParameter('start_unit', i) as number,
          end_unit: this.getNodeParameter('end_unit', i) as number,
          status: this.getNodeParameter('status', i) as number,
          side: this.getNodeParameter('side', i) as number,
          ...(this.getNodeParameter('additionalFields', i) as IDataObject),
        },
      };
      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/rack_storage_items',
        body,
      );
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const body = {
        rack_storage_item: {
          ...(this.getNodeParameter('updateFields', i) as IDataObject),
        },
      };
      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/rack_storage_items/${id}`,
        body,
      );
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/rack_storage_items/${id}`,
      );
      break;
    }
  }

  return responseData;
}
