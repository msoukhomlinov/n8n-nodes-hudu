import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange } from '../../utils';
import type { IDateRange } from '../../utils';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { NetworksOperations } from './networks.types';

export async function handleNetworksOperation(
  this: IExecuteFunctions,
  operation: NetworksOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/networks';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const body: IDataObject = {
        name: this.getNodeParameter('name', i) as string,
        address: this.getNodeParameter('address', i) as string,
        network_type: this.getNodeParameter('network_type', i) as number,
      };

      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Only add non-empty additional fields
      for (const [key, value] of Object.entries(additionalFields)) {
        if (value !== undefined && value !== null && value !== '') {
          // Convert company_id to number if present
          if (key === 'company_id') {
            body[key] = Number.parseInt(value as string, 10);
          } else {
            body[key] = value;
          }
        }
      }

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { network: body });
      return responseData;
    }

    case 'delete': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      return await handleDeleteOperation.call(this, resourceEndpoint, networkId);
    }

    case 'get': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      return await handleGetOperation.call(this, resourceEndpoint, networkId);
    }

    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, 25) as number;
      const qs: IDataObject = {
        ...filters,
      };

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

      // Convert company_id to number if present
      if (filters.company_id !== undefined && filters.company_id !== null && filters.company_id !== '') {
        qs.company_id = Number.parseInt(filters.company_id as string, 10);
      }

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'networks',
        qs,
        returnAll,
        limit,
      );
    }

    case 'update': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      // Only include non-empty update fields
      const networkBody: IDataObject = {};
      for (const [key, value] of Object.entries(updateFields)) {
        if (value !== undefined && value !== null && value !== '') {
          // Convert company_id to number if present
          if (key === 'company_id') {
            networkBody[key] = Number.parseInt(value as string, 10);
          } else {
            networkBody[key] = value;
          }
        }
      }

      const body: IDataObject = {
        network: networkBody,
      };

      return await handleUpdateOperation.call(this, resourceEndpoint, networkId, body);
    }
  }

  return responseData;
}
