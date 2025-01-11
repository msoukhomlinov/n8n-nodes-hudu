import type { IExecuteFunctions } from 'n8n-core';
import type { IDataObject } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleDeleteOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
} from '../../utils/operations';
import type { RackStorageItemOperation } from './rack_storage_items.types';

export async function handleRackStorageItemOperation(
  this: IExecuteFunctions,
  operation: RackStorageItemOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/rack_storage_items';

  switch (operation) {
    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'rack_storage_items',
        filters,
        returnAll,
        limit,
      );
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      return await handleGetOperation.call(this, resourceEndpoint, id);
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
      return await handleCreateOperation.call(this, resourceEndpoint, body);
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const body = {
        rack_storage_item: {
          ...(this.getNodeParameter('updateFields', i) as IDataObject),
        },
      };
      return await handleUpdateOperation.call(this, resourceEndpoint, id, body);
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      return await handleDeleteOperation.call(this, resourceEndpoint, id);
    }
  }

  // This should never be reached due to TypeScript's exhaustive check
  throw new Error(`Unsupported operation ${operation}`);
}
