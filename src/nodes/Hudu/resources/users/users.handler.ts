import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
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
      const userId = this.getNodeParameter('userId', i) as string;
      const identifierType = this.getNodeParameter('identifierType', i, 'id') as string;

      if (identifierType === 'slug') {
        // Use getAll with slug filter for slug-based retrieval
        const users = await handleGetAllOperation.call(
          this,
          resourceEndpoint,
          'users',
          { slug: userId },
          false, // returnAll
          1,     // limit to 1 for efficiency
        ) as IDataObject[];

        if (users.length === 0) {
          throw new NodeOperationError(
            this.getNode(),
            `User with slug "${userId}" not found`,
            { itemIndex: i },
          );
        }

        if (users.length > 1) {
          // Should not happen if slugs are unique, but handle gracefully
          throw new NodeOperationError(
            this.getNode(),
            `Multiple users found with slug "${userId}" (expected unique)`,
            { itemIndex: i },
          );
        }

        return users[0];
      } else {
        // Use existing handleGetOperation for ID-based retrieval
        return await handleGetOperation.call(this, resourceEndpoint, userId, 'user');
      }
    }
  }

  // This should never be reached due to TypeScript's exhaustive check
  throw new Error(`Unsupported operation ${operation}`);
}
