import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import {
  handleCreateOperation,
  handleDeleteOperation,
  handleGetAllOperation,
} from '../../utils/operations';
import type { RelationOperation } from './relations.types';
import { relationFilterMapping } from './relations.types';

export async function handleRelationsOperation(
  this: IExecuteFunctions,
  operation: RelationOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/relations';

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'relations',
        {},
        returnAll,
        limit,
        filters,
        relationFilterMapping,
      );
    }

    case 'create': {
      const body = {
        relation: {
          toable_id: this.getNodeParameter('toable_id', i) as number,
          toable_type: this.getNodeParameter('toable_type', i) as string,
          fromable_id: this.getNodeParameter('fromable_id', i) as number,
          fromable_type: this.getNodeParameter('fromable_type', i) as string,
          description: this.getNodeParameter('description', i) as string,
          is_inverse: this.getNodeParameter('is_inverse', i) as boolean,
        },
      };

      return await handleCreateOperation.call(this, resourceEndpoint, body);
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      return await handleDeleteOperation.call(this, resourceEndpoint, id);
    }
  }

  // This should never be reached due to TypeScript's exhaustive check
  throw new Error(`Unsupported operation ${operation}`);
}
