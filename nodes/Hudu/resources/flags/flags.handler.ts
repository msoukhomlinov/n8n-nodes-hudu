import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { FlagsOperation } from './flags.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { coercePositiveInt } from '../../utils/validation';

export async function handleFlagsOperation(
  this: IExecuteFunctions,
  operation: FlagsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/flags';
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
        'flags',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = coercePositiveInt(this.getNodeParameter('id', i), this.getNode(), 'id', i);
      responseData = await handleGetOperation.call(this, resourceEndpoint, id, 'flag');
      break;
    }

    case 'create': {
      const flagTypeId = this.getNodeParameter('flag_type_id', i) as number;
      const flagableType = this.getNodeParameter('flagable_type', i) as string;
      const flagableId = this.getNodeParameter('flagable_id', i) as number;
      const description = this.getNodeParameter('description', i, '') as string;

      const body: IDataObject = {
        flag_type_id: coercePositiveInt(flagTypeId, this.getNode(), 'flag_type_id', i),
        flagable_type: flagableType,
        flagable_id: coercePositiveInt(flagableId, this.getNode(), 'flagable_id', i),
      };

      if (description !== '') {
        body.description = description;
      }

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { flag: body });
      break;
    }

    case 'update': {
      const id = coercePositiveInt(this.getNodeParameter('id', i), this.getNode(), 'id', i);
      const updateFields = {
        ...(this.getNodeParameter('flagUpdateFields', i, {}) as IDataObject),
      };

      if (updateFields.flag_type_id !== undefined && updateFields.flag_type_id !== '') {
        updateFields.flag_type_id = coercePositiveInt(
          updateFields.flag_type_id,
          this.getNode(),
          'flagUpdateFields.flag_type_id',
          i,
        );
      } else {
        delete updateFields.flag_type_id;
      }

      if (updateFields.flagable_id !== undefined && updateFields.flagable_id !== '') {
        updateFields.flagable_id = coercePositiveInt(
          updateFields.flagable_id,
          this.getNode(),
          'flagUpdateFields.flagable_id',
          i,
        );
      } else {
        delete updateFields.flagable_id;
      }

      if (updateFields.flagable_type === '') {
        delete updateFields.flagable_type;
      }

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, {
        flag: updateFields,
      });
      break;
    }

    case 'delete': {
      const id = coercePositiveInt(this.getNodeParameter('id', i), this.getNode(), 'id', i);
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
      break;
    }

    default:
      throw new Error(`The operation "${operation}" is not supported!`);
  }

  return responseData;
}
