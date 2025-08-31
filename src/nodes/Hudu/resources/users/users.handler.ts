import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { handleGetOperation, handleGetAllOperation } from '../../utils/operations';
import type { UserOperation } from './users.types';

export async function handleUserOperation(
  this: IExecuteFunctions,
  operation: UserOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/users';

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'users',
        filters,
        returnAll,
        limit,
      );
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      return await handleGetOperation.call(this, resourceEndpoint, id, 'user');
    }
  }

  // This should never be reached due to TypeScript's exhaustive check
  throw new Error(`Unsupported operation ${operation}`);
}
