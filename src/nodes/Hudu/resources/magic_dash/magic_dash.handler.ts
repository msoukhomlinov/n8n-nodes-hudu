import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import type { MagicDashOperation } from './magic_dash.types';

export async function handleMagicDashOperation(
  this: IExecuteFunctions,
  operation: MagicDashOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      let allItems: IDataObject[] = [];
      let page = 1;
      const pageSize = HUDU_API_CONSTANTS.PAGE_SIZE;

      let hasMorePages = true;
      do {
        const qs: IDataObject = {
          ...filters,
          page,
          page_size: pageSize,
        };

        const response = await huduApiRequest.call(
          this,
          'GET' as IHttpRequestMethods,
          '/magic_dash',
          {},
          qs,
        );

        const items = Array.isArray(response) ? response : [];
        allItems.push(...items);

        if (items.length < pageSize || (!returnAll && allItems.length >= limit)) {
          hasMorePages = false;
        } else {
          page++;
        }
      } while (hasMorePages);

      if (!returnAll) {
        allItems = allItems.slice(0, limit);
      }

      return allItems;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      const response = await huduApiRequest.call(this, 'GET' as IHttpRequestMethods, '/magic_dash');

      const items = Array.isArray(response) ? response : [];
      const item = items.find((item) => item.id === id);

      if (!item) {
        throw new Error(`Magic Dash item with ID ${id} not found`);
      }
      return item;
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
