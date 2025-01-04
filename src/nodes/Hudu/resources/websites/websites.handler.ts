import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { handleListing, huduApiRequest } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { WebsiteOperation } from './websites.types';

export async function handleWebsitesOperation(
  this: IExecuteFunctions,
  operation: WebsiteOperation,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/websites',
        undefined,
        {},
        filters,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/websites/${id}`,
      );
      break;
    }

    case 'create': {
      const body = {
        website: {
          name: this.getNodeParameter('name', i) as string,
          company_id: this.getNodeParameter('companyId', i) as number,
          ...(this.getNodeParameter('additionalFields', i) as IDataObject),
        },
      };
      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/websites',
        body,
      );
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const body = {
        website: {
          ...(this.getNodeParameter('updateFields', i) as IDataObject),
        },
      };
      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/websites/${id}`,
        body,
      );
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/websites/${id}`,
      );
      break;
    }
  }

  return responseData;
}
