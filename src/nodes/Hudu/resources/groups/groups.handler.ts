import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleGetAllOperation, handleGetOperation } from '../../utils/operations';
import type { GroupsOperation } from './groups.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleGroupsOperation(
  this: IExecuteFunctions,
  operation: GroupsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/groups';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      const qs: IDataObject = { ...filters };

      // API returns array directly (not wrapped in object)
      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        undefined,
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const groupId = this.getNodeParameter('groupId', i) as string;
      const identifierType = this.getNodeParameter('identifierType', i, 'id') as string;

      if (identifierType === 'slug') {
        // Use getAll with slug filter for slug-based retrieval
        const groups = await handleGetAllOperation.call(
          this,
          resourceEndpoint,
          'groups',
          { slug: groupId },
          false, // returnAll
          1,     // limit to 1 for efficiency
        ) as IDataObject[];

        if (groups.length === 0) {
          throw new NodeOperationError(
            this.getNode(),
            `Group with slug "${groupId}" not found`,
            { itemIndex: i },
          );
        }

        if (groups.length > 1) {
          // Should not happen if slugs are unique, but handle gracefully
          throw new NodeOperationError(
            this.getNode(),
            `Multiple groups found with slug "${groupId}" (expected unique)`,
            { itemIndex: i },
          );
        }

        responseData = groups[0];
      } else {
        // Use existing handleGetOperation for ID-based retrieval
        responseData = await handleGetOperation.call(this, resourceEndpoint, groupId, 'group');
      }
      break;
    }
  }

  return responseData;
}


