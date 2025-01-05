import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
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
