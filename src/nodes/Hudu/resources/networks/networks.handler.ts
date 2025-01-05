import type { IExecuteFunctions } from 'n8n-core';
import type { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import type { NetworksOperations } from './networks.types';

export async function handleNetworksOperation(
  this: IExecuteFunctions,
  operation: NetworksOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
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
          body[key] = value;
        }
      }

      responseData = await huduApiRequest.call(this, 'POST' as IHttpRequestMethods, '/networks', {
        network: body,
      });
      return responseData;
    }

    case 'delete': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      await huduApiRequest.call(this, 'DELETE' as IHttpRequestMethods, `/networks/${networkId}`);
      return { success: true };
    }

    case 'get': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/networks/${networkId}`,
      );
      return responseData;
    }

    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs: IDataObject = {};

      // Add all non-empty filters to query parameters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          qs[key] = value;
        }
      }

      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/networks',
        undefined,
        qs,
      );

      return responseData;
    }

    case 'update': {
      const networkId = this.getNodeParameter('networkId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      // Only include non-empty update fields
      const body: IDataObject = {};
      for (const [key, value] of Object.entries(updateFields)) {
        if (value !== undefined && value !== null && value !== '') {
          body[key] = value;
        }
      }

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/networks/${networkId}`,
        { network: body },
      );
      return responseData;
    }
  }

  return responseData;
}
