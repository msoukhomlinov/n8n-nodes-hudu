import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { handleListing } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import type { ExpirationsOperations } from './expirations.types';

export async function handleExpirationOperation(
  this: IExecuteFunctions,
  operation: ExpirationsOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/expirations',
        'expirations',
        {},
        filters,
        returnAll,
        limit,
      );
      break;
    }
  }

  return responseData;
}
