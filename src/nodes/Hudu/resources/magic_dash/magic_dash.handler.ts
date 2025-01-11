import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleCreateOperation, handleDeleteOperation, handleUpdateOperation } from '../../utils/operations';
import {
  handleMagicDashGetAllOperation,
  handleMagicDashGetByIdOperation,
  handleMagicDashDeleteByTitleOperation,
} from '../../utils/operations/magic_dash';
import type { MagicDashOperation } from './magic_dash.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleMagicDashOperation(
  this: IExecuteFunctions,
  operation: MagicDashOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/magic_dash';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      return await handleMagicDashGetAllOperation.call(this, filters, returnAll, limit as 25);
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      return await handleMagicDashGetByIdOperation.call(this, id);
    }

    case 'create':
    case 'update': {
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const message = this.getNodeParameter('message', i) as string;
      const companyName = this.getNodeParameter('companyName', i) as string;
      const title = this.getNodeParameter('title', i) as string;
      const content = this.getNodeParameter('content', i) as string;

      // Build the request body
      const magicDashBody: IDataObject = {
        message,
        company_name: companyName,
        title,
      };

      // Add content if it's not empty
      if (content) {
        magicDashBody.content = content;
      }

      // Add any additional fields
      for (const key of Object.keys(additionalFields)) {
        if (additionalFields[key] !== undefined && additionalFields[key] !== '') {
          magicDashBody[key] = additionalFields[key];
        }
      }

      const body = {
        magic_dash: magicDashBody,
      };

      responseData = operation === 'create' 
        ? await handleCreateOperation.call(this, resourceEndpoint, body)
        : await handleUpdateOperation.call(this, resourceEndpoint, title, body);
      break;
    }

    case 'delete': {
      const title = this.getNodeParameter('title', i) as string;
      const companyName = this.getNodeParameter('companyName', i) as string;
      responseData = await handleMagicDashDeleteByTitleOperation.call(this, title, companyName);
      break;
    }

    case 'deleteById': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
      break;
    }
  }

  return responseData;
}
