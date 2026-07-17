import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { LabelsOperation } from './labels.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

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
        label_type_id: Number(labelTypeId),
        labelable_type: labelableType,
        labelable_id: Number(labelableId),
      };

      if (userId !== '' && userId !== undefined && userId !== null) {
        body.user_id = Number(userId);
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
        updateFields.label_type_id = Number(updateFields.label_type_id);
      } else {
        delete updateFields.label_type_id;
      }

      if (updateFields.labelable_id !== undefined && updateFields.labelable_id !== '') {
        updateFields.labelable_id = Number(updateFields.labelable_id);
      } else {
        delete updateFields.labelable_id;
      }

      if (updateFields.user_id !== undefined && updateFields.user_id !== '') {
        updateFields.user_id = Number(updateFields.user_id);
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
