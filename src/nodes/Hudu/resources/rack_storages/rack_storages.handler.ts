import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange } from '../../utils';
import type { IDateRange } from '../../utils';
import {
  handleCreateOperation,
  handleDeleteOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
} from '../../utils/operations';
import type { RackStorageOperation } from './rack_storages.types';

export async function handleRackStorageOperation(
  this: IExecuteFunctions,
  operation: RackStorageOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/rack_storages';

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      if (filters.company_id) {
        filters.company_id = Number.parseInt(filters.company_id as string, 10);
      }

      // Process date range filters
      if (filters.created_at) {
        const createdAtFilter = filters.created_at as IDataObject;
        if (createdAtFilter.range) {
          const rangeObj = createdAtFilter.range as IDataObject;
          filters.created_at = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as string,
            },
          } as IDateRange);
        }
      }

      if (filters.updated_at) {
        const updatedAtFilter = filters.updated_at as IDataObject;
        if (updatedAtFilter.range) {
          const rangeObj = updatedAtFilter.range as IDataObject;
          filters.updated_at = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as string,
            },
          } as IDateRange);
        }
      }

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        '',
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
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      if (additionalFields.company_id) {
        additionalFields.company_id = Number.parseInt(additionalFields.company_id as string, 10);
      }

      const body = {
        rack_storage: {
          name: this.getNodeParameter('name', i) as string,
          location_id: this.getNodeParameter('locationId', i) as number,
          ...additionalFields,
        },
      };
      return await handleCreateOperation.call(this, resourceEndpoint, body);
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      if (updateFields.company_id) {
        updateFields.company_id = Number.parseInt(updateFields.company_id as string, 10);
      }

      const body = {
        rack_storage: {
          ...updateFields,
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
