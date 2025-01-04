import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { MagicDashOperation } from './magic_dash.types';

export async function handleMagicDashOperation(
  this: IExecuteFunctions,
  operation: MagicDashOperation,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      const queryParams: IDataObject = {};
      if (filters.title) {
        queryParams.title = filters.title;
      }
      if (filters.company_id) {
        queryParams.company_id = filters.company_id;
      }

      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/magic_dash',
        undefined,
        queryParams,
      );

      if (!returnAll && responseData.length > limit) {
        responseData = responseData.slice(0, limit);
      }
      break;
    }

    case 'create':
    case 'update': {
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const message = this.getNodeParameter('message', i) as string;
      const companyName = this.getNodeParameter('companyName', i) as string;
      const title = this.getNodeParameter('title', i) as string;
      const content = this.getNodeParameter('content', i) as string;

      // Build the request body
      const body: IDataObject = {
        message,
        company_name: companyName,
        title,
      };

      // Add content if it's not empty
      if (content) {
        body.content = content;
      }

      // Add any additional fields
      for (const key of Object.keys(additionalFields)) {
        if (additionalFields[key] !== undefined && additionalFields[key] !== '') {
          body[key] = additionalFields[key];
        }
      }

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/magic_dash',
        body,
      );
      break;
    }

    case 'delete': {
      const title = this.getNodeParameter('title', i) as string;
      const companyName = this.getNodeParameter('companyName', i) as string;

      const body = {
        title,
        company_name: companyName,
      };

      responseData = await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        '/magic_dash',
        body,
      );
      break;
    }

    case 'deleteById': {
      const id = this.getNodeParameter('id', i) as number;

      responseData = await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/magic_dash/${id}`,
      );
      break;
    }
  }

  return responseData;
}
