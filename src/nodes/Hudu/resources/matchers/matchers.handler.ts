import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import type { MatcherOperation } from './matchers.types';

export async function handleMatcherOperation(
  this: IExecuteFunctions,
  operation: MatcherOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      // integration_id is required
      const integrationId = this.getNodeParameter('integrationId', i) as number;

      const queryParams: IDataObject = {
        integration_id: integrationId,
      };

      // Add optional filters
      if (filters.matched !== undefined) {
        queryParams.matched = filters.matched;
      }
      if (filters.sync_id !== undefined) {
        queryParams.sync_id = filters.sync_id;
      }
      if (filters.identifier !== undefined) {
        queryParams.identifier = filters.identifier;
      }
      if (filters.company_id !== undefined) {
        queryParams.company_id = filters.company_id;
      }
      if (!returnAll) {
        queryParams.page_size = limit;
      }

      const response = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/matchers',
        undefined,
        queryParams,
      );

      // Extract the matchers array from the response
      responseData = Array.isArray(response)
        ? response
        : ((response as IDataObject).matchers as IDataObject[]) || [];

      if (!returnAll && responseData.length > limit) {
        responseData = responseData.slice(0, limit);
      }
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      // Build the request body with only defined fields
      const matcherUpdate: IDataObject = {};

      if (updateFields.company_id !== undefined) {
        matcherUpdate.company_id = updateFields.company_id;
      }
      if (updateFields.potential_company_id !== undefined) {
        matcherUpdate.potential_company_id = updateFields.potential_company_id;
      }
      if (updateFields.sync_id !== undefined) {
        matcherUpdate.sync_id = updateFields.sync_id;
      }
      if (updateFields.identifier !== undefined) {
        matcherUpdate.identifier = updateFields.identifier;
      }

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/matchers/${id}`,
        { matcher: matcherUpdate },
      );
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;

      responseData = await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/matchers/${id}`,
      );
      break;
    }
  }

  return responseData;
}
