import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, processDateRange } from '../../utils/GenericFunctions';
import type { IpAddressOperations } from './ip_addresses.types';

export async function handleIpAddressesOperation(
  this: IExecuteFunctions,
  operation: IpAddressOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs: IDataObject = {
        ...filters,
      };

      if (filters.created_at) {
        const createdAtFilter = filters.created_at as IDataObject;

        if (createdAtFilter.range) {
          const rangeObj = createdAtFilter.range as IDataObject;

          const dateRange = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as string,
            },
          });

          qs.created_at = dateRange || undefined;
        } else {
          qs.created_at = undefined;
        }
      }

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

          qs.updated_at = dateRange || undefined;
        } else {
          qs.updated_at = undefined;
        }
      }

      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/ip_addresses',
        {},
        qs,
      );
      return responseData;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as string;
      return await huduApiRequest.call(this, 'GET' as IHttpRequestMethods, `/ip_addresses/${id}`);
    }

    case 'create': {
      const address = this.getNodeParameter('address', i) as string;
      const status = this.getNodeParameter('status', i) as string;
      const companyId = this.getNodeParameter('company_id', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        address,
        status,
        company_id: companyId,
        ...additionalFields,
      };

      return await huduApiRequest.call(this, 'POST' as IHttpRequestMethods, '/ip_addresses', {
        ip_address: body,
      });
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      return await huduApiRequest.call(this, 'PUT' as IHttpRequestMethods, `/ip_addresses/${id}`, {
        ip_address: updateFields,
      });
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as string;
      await huduApiRequest.call(this, 'DELETE' as IHttpRequestMethods, `/ip_addresses/${id}`);
      return { success: true };
    }

    default:
      throw new Error(`Operation ${operation} is not supported`);
  }
}
