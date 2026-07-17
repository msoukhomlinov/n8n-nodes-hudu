import type { IExecuteFunctions, IDataObject, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { LabelsOperation } from './labels.types';
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

export async function handleLabelsOperation(
  this: IExecuteFunctions,
  operation: LabelsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/labels';
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
        'labels',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as string;
      responseData = await handleGetOperation.call(this, resourceEndpoint, id, 'label');
      break;
    }

    case 'create': {
      const labelTypeId = this.getNodeParameter('label_type_id', i) as number;
      const labelableType = this.getNodeParameter('labelable_type', i) as string;
      const labelableId = this.getNodeParameter('labelable_id', i) as number;
      const userId = this.getNodeParameter('user_id', i, '') as number | string;

      const body: IDataObject = {
        label_type_id: coercePositiveInt(labelTypeId, 'label_type_id', i, this.getNode()),
        labelable_type: labelableType,
        labelable_id: coercePositiveInt(labelableId, 'labelable_id', i, this.getNode()),
      };

      if (userId !== '' && userId !== undefined && userId !== null) {
        body.user_id = coercePositiveInt(userId, 'user_id', i, this.getNode());
      }

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { label: body });
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const updateFields = {
        ...(this.getNodeParameter('labelUpdateFields', i, {}) as IDataObject),
      };

      if (updateFields.label_type_id !== undefined && updateFields.label_type_id !== '') {
        updateFields.label_type_id = coercePositiveInt(
          updateFields.label_type_id,
          'labelUpdateFields.label_type_id',
          i,
          this.getNode(),
        );
      } else {
        delete updateFields.label_type_id;
      }

      if (updateFields.labelable_id !== undefined && updateFields.labelable_id !== '') {
        updateFields.labelable_id = coercePositiveInt(
          updateFields.labelable_id,
          'labelUpdateFields.labelable_id',
          i,
          this.getNode(),
        );
      } else {
        delete updateFields.labelable_id;
      }

      if (updateFields.user_id !== undefined && updateFields.user_id !== '') {
        updateFields.user_id = coercePositiveInt(
          updateFields.user_id,
          'labelUpdateFields.user_id',
          i,
          this.getNode(),
        );
      } else {
        delete updateFields.user_id;
      }

      if (updateFields.labelable_type === '') {
        delete updateFields.labelable_type;
      }

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, {
        label: updateFields,
      });
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as string;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
      break;
    }

    default:
      throw new Error(`The operation "${operation}" is not supported!`);
  }

  return responseData;
}
