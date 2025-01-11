import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleGetAllOperation } from '../../utils/operations';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import type { ExpirationsOperations } from './expirations.types';

export async function handleExpirationOperation(
  this: IExecuteFunctions,
  operation: ExpirationsOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/expirations';
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'expirations',
        filters,
        returnAll,
        limit,
      );
      break;
    }
  }

  return responseData;
}
