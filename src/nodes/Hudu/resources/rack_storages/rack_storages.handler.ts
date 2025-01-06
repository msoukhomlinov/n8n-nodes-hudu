import type { IExecuteFunctions } from 'n8n-core';
import type { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing, processDateRange } from '../../utils/GenericFunctions';
import type { RackStorageOperation } from './rack_storages.types';

export async function handleRackStorageOperation(
  this: IExecuteFunctions,
  operation: RackStorageOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      // Process date range filters
      if (filters.created_at) {
        filters.created_at = processDateRange(
          filters.created_at as {
            range?: {
              mode: 'exact' | 'range' | 'preset';
              exact?: string;
              start?: string;
              end?: string;
              preset?: string;
            };
          },
        );
      }

      if (filters.updated_at) {
        filters.updated_at = processDateRange(
          filters.updated_at as {
            range?: {
              mode: 'exact' | 'range' | 'preset';
              exact?: string;
              start?: string;
              end?: string;
              preset?: string;
            };
          },
        );
      }

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/rack_storages',
        '',
        {},
        filters,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/rack_storages/${id}`,
      );
      break;
    }

    case 'create': {
      const body = {
        rack_storage: {
          name: this.getNodeParameter('name', i) as string,
          location_id: this.getNodeParameter('locationId', i) as number,
          ...(this.getNodeParameter('additionalFields', i) as IDataObject),
        },
      };
      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/rack_storages',
        body,
      );
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      const body = {
        rack_storage: {
          ...updateFields,
        },
      };
      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/rack_storages/${id}`,
        body,
      );
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/rack_storages/${id}`,
      );
      break;
    }
  }

  return responseData;
}
