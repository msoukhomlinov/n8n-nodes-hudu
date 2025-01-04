import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { IpAddressOperations } from './ip_addresses.types';

export async function handleIpAddressOperation(
  this: IExecuteFunctions,
  operation: IpAddressOperations,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'create': {
      // Get all parameters first
      const address = this.getNodeParameter('address', i) as string;
      const status = this.getNodeParameter('status', i) as string;
      const company_id = this.getNodeParameter('company_id', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Construct the request body
      const data = {
        address,
        status,
        company_id,
        ...additionalFields,
      };

      // Make the API request
      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/ip_addresses',
        { ip_address: data },
      );

      // Return the created IP address
      return responseData;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      await huduApiRequest.call(this, 'DELETE' as IHttpRequestMethods, `/ip_addresses/${id}`);
      return { success: true };
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/ip_addresses/${id}`,
      );
      return responseData;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/ip_addresses',
        {},
        filters,
      );

      // Check if we have the expected structure
      if (!responseData) {
        throw new Error('Invalid response from IP Addresses API');
      }

      // The response should be an array directly
      const ipAddresses = Array.isArray(responseData) ? responseData : [];

      if (!returnAll) {
        const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
        return ipAddresses.slice(0, limit);
      }
      return ipAddresses;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/ip_addresses/${id}`,
        { ip_address: updateFields },
      );
      return responseData;
    }
  }
}
