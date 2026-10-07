import type { IExecuteFunctions, IDataObject, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { FlagTypesOperation } from './flag_types.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

/**
 * Coerce an ID field to a positive integer.
 * Rejects malformed values (e.g. "12abc" from an expression) instead of sending NaN to the API.
 */
function coercePositiveInt(value: unknown, fieldName: string, itemIndex: number, node: INode): number {
  const candidate = typeof value === 'string' ? value.trim() : value;
  const num = typeof candidate === 'number' ? candidate : Number(candidate);
  if (!Number.isInteger(num) || num < 1) {
    throw new NodeOperationError(
      node,
      `${fieldName} must be a positive integer (got ${JSON.stringify(value)})`,
      { itemIndex },
    );
  }
  return num;
}

export async function handleFlagTypesOperation(
  this: IExecuteFunctions,
  operation: FlagTypesOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/flag_types';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
      const qs: IDataObject = { ...filters };
      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'flag_types',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = coercePositiveInt(this.getNodeParameter('id', i), 'id', i, this.getNode());
      responseData = await handleGetOperation.call(this, resourceEndpoint, id, 'flag_type');
      break;
    }

    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const color = this.getNodeParameter('color', i) as string;

      responseData = await handleCreateOperation.call(this, resourceEndpoint, {
        flag_type: { name, color },
      });
      break;
    }

    case 'update': {
      const id = coercePositiveInt(this.getNodeParameter('id', i), 'id', i, this.getNode());
      const updateFields = {
        ...(this.getNodeParameter('flagTypeUpdateFields', i, {}) as IDataObject),
      };

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, {
        flag_type: updateFields,
      });
      break;
    }

    case 'delete': {
      const id = coercePositiveInt(this.getNodeParameter('id', i), 'id', i, this.getNode());
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
      break;
    }

    default:
      throw new Error(`The operation "${operation}" is not supported!`);
  }

  return responseData;
}
