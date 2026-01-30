import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleCreateOperation, handleDeleteOperation, handleGetOperation } from '../../utils/operations';
import { huduApiRequest } from '../../utils/requestUtils';
import {
  handleMagicDashGetAllOperation,
  handleMagicDashGetByIdOperation,
} from '../../utils/operations/magic_dash';
import type { MagicDashOperation } from './magic_dash.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

/**
 * Resolve company ID to company name
 * If value is already a string (company name), return it directly
 * If value is a number (company ID), fetch the company and return its name
 */
async function resolveCompanyName(
  context: IExecuteFunctions,
  value: string | number,
): Promise<string> {
  // If empty or already a non-numeric string, return as-is
  if (!value) return '';
  
  const numericValue = typeof value === 'number' ? value : Number(value);
  
  // If not a valid number, assume it's a company name string
  if (isNaN(numericValue)) {
    return String(value);
  }
  
  // Fetch company by ID to get the name
  const company = await handleGetOperation.call(
    context,
    '/companies',
    String(numericValue),
    'company',
  ) as IDataObject;
  
  if (!company || !company.name) {
    throw new Error(`Company with ID ${numericValue} not found`);
  }
  
  return company.name as string;
}

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

    case 'createOrUpdate': {
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const message = this.getNodeParameter('message', i) as string;
      const companyValue = this.getNodeParameter('companyName', i) as string | number;
      const title = this.getNodeParameter('title', i) as string;
      const content = this.getNodeParameter('content', i) as string;

      // Resolve company ID to name (API requires company_name string)
      const companyName = await resolveCompanyName(this, companyValue);

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

      // Ensure mutually exclusive fields are handled
      // content and content_link are mutually exclusive
      if (magicDashBody.content && magicDashBody.content_link) {
        delete magicDashBody.content_link;
      }

      // icon and image_url are mutually exclusive
      if (magicDashBody.icon && magicDashBody.image_url) {
        delete magicDashBody.image_url;
      }

      responseData = await handleCreateOperation.call(
        this,
        resourceEndpoint,
        magicDashBody,
      );
      break;
    }

    case 'deleteById': {
      // Note: API v2.39.6 supports two DELETE methods:
      // 1. DELETE /magic_dash/{id} - implemented here (delete by ID)
      // 2. DELETE /magic_dash - not implemented (delete by title + company_name)
      const id = this.getNodeParameter('id', i) as number;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
      break;
    }

    case 'deleteByTitle': {
      const title = this.getNodeParameter('title', i) as string;
      const companyValue = this.getNodeParameter('companyName', i) as string | number;
      const companyName = await resolveCompanyName(this, companyValue);
      const body = { title, company_name: companyName } as IDataObject;
      responseData = await huduApiRequest.call(this, 'DELETE', resourceEndpoint, body);
      break;
    }
  }

  return responseData;
}
