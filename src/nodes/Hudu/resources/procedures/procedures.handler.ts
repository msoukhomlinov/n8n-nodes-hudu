import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils/GenericFunctions';
import { ProceduresOperations } from './procedures.types';

export async function handleProceduresOperation(
  this: IExecuteFunctions,
  operation: ProceduresOperations,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/procedures',
        body,
      );
      break;
    }

    case 'delete': {
      const procedureId = this.getNodeParameter('id', i) as string;
      await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/procedures/${procedureId}`,
      );
      responseData = { success: true };
      break;
    }

    case 'get': {
      const procedureId = this.getNodeParameter('id', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/procedures/${procedureId}`,
      );
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      const qs: IDataObject = {
        ...filters,
      };

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/procedures',
        'procedures',
        {},
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'update': {
      const procedureId = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      if (Object.keys(updateFields).length === 0) {
        throw new Error('No valid parameters provided for update');
      }

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/procedures/${procedureId}`,
        updateFields,
      );
      break;
    }

    case 'createFromTemplate': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        ...additionalFields,
      };

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        `/procedures/${templateId}/create_from_template`,
        body,
      );
      break;
    }

    case 'duplicate': {
      const procedureId = this.getNodeParameter('id', i) as string;
      const companyId = this.getNodeParameter('companyId', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        company_id: companyId,
        ...additionalFields,
      };

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        `/procedures/${procedureId}/duplicate`,
        body,
      );
      break;
    }

    case 'kickoff': {
      const procedureId = this.getNodeParameter('id', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        ...additionalFields,
      };

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        `/procedures/${procedureId}/kickoff`,
        body,
      );
      break;
    }
  }

  return responseData;
}
