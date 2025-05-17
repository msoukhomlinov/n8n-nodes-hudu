import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange, type DateRangePreset, validateCompanyId } from '../../utils';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { NetworksOperations } from './networks.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

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
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
      const qs: IDataObject = {
        ...filters,
      };

      // Validate company_id if provided
      if (filters.company_id !== undefined && filters.company_id !== null && filters.company_id !== '') {
        qs.company_id = validateCompanyId(filters.company_id, this.getNode(), 'Company ID');
      }

      // Pass archived filter if present
      if (filters.archived !== undefined) {
        qs.archived = filters.archived;
      }

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
              preset: rangeObj.preset as DateRangePreset,
            },
          });
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
              preset: rangeObj.preset as DateRangePreset,
            },
          });
        }
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
          // Validate company_id if present
          if (key === 'company_id') {
            networkBody[key] = validateCompanyId(value, this.getNode(), 'Company ID');
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
