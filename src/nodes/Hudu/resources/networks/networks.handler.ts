import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, processDateRange } from '../../utils/GenericFunctions';
import type { NetworksOperations } from './networks.types';

export async function handleNetworksOperation(
  this: IExecuteFunctions,
  operation: NetworksOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const address = this.getNodeParameter('address', i) as string;
      const networkType = this.getNodeParameter('network_type', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        address,
        network_type: networkType,
        ...additionalFields,
      };

      responseData = await huduApiRequest.call(this, 'POST' as IHttpRequestMethods, '/networks', {
        network: body,
      });
      break;
    }

    case 'delete': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      await huduApiRequest.call(this, 'DELETE' as IHttpRequestMethods, `/networks/${networkId}`);
      responseData = { success: true };
      break;
    }

    case 'get': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/networks/${networkId}`,
      );
      break;
    }

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
        '/networks',
        undefined,
        qs,
      );
      break;
    }

    case 'update': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/networks/${networkId}`,
        { network: updateFields },
      );
      break;
    }
  }

  return responseData;
}
