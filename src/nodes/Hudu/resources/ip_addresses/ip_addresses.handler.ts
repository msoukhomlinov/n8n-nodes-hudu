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
import type { IpAddressOperations } from './ip_addresses.types';

export async function handleIpAddressesOperation(
  this: IExecuteFunctions,
  operation: IpAddressOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/ip_addresses';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      if (filters.company_id) {
        filters.company_id = Number.parseInt(filters.company_id as string, 10);
      }
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

      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'ip_addresses',
        qs,
        returnAll,
        limit,
      );
      return responseData;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as string;
      return await handleGetOperation.call(this, resourceEndpoint, id);
    }

    case 'create': {
      const address = this.getNodeParameter('address', i) as string;
      const status = this.getNodeParameter('status', i) as string;
      const companyId = Number.parseInt(this.getNodeParameter('company_id', i) as string, 10);
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        address,
        status,
        company_id: companyId,
        ...additionalFields,
      };

      return await handleCreateOperation.call(this, resourceEndpoint, { ip_address: body });
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      if (updateFields.company_id) {
        updateFields.company_id = Number.parseInt(updateFields.company_id as string, 10);
      }

      return await handleUpdateOperation.call(this, resourceEndpoint, id, { ip_address: updateFields });
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as string;
      return await handleDeleteOperation.call(this, resourceEndpoint, id);
    }

    default:
      throw new Error(`Operation ${operation} is not supported`);
  }
}
