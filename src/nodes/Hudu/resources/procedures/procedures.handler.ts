import type { IExecuteFunctions } from 'n8n-core';
import type { IDataObject } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleDeleteOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
} from '../../utils/operations';
import {
  handleProcedureCreateFromTemplateOperation,
  handleProcedureDuplicateOperation,
  handleProcedureKickoffOperation,
} from '../../utils/operations/procedures';
import type { ProceduresOperations } from './procedures.types';

export async function handleProceduresOperation(
  this: IExecuteFunctions,
  operation: ProceduresOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/procedures';

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      if (additionalFields.company_id) {
        additionalFields.company_id = Number.parseInt(additionalFields.company_id as string, 10);
      }

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      return await handleCreateOperation.call(this, resourceEndpoint, body);
    }

    case 'delete': {
      const procedureId = this.getNodeParameter('id', i) as string;
      return await handleDeleteOperation.call(this, resourceEndpoint, procedureId);
    }

    case 'get': {
      const procedureId = this.getNodeParameter('id', i) as string;
      return await handleGetOperation.call(this, resourceEndpoint, procedureId);
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      if (filters.company_id) {
        filters.company_id = Number.parseInt(filters.company_id as string, 10);
      }

      const qs: IDataObject = {
        ...filters,
      };

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'procedures',
        qs,
        returnAll,
        limit,
      );
    }

    case 'update': {
      const procedureId = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      if (updateFields.company_id) {
        updateFields.company_id = Number.parseInt(updateFields.company_id as string, 10);
      }

      if (Object.keys(updateFields).length === 0) {
        throw new Error('No valid parameters provided for update');
      }

      return await handleUpdateOperation.call(this, resourceEndpoint, procedureId, updateFields);
    }

    case 'createFromTemplate': {
      const templateId = this.getNodeParameter('templateId', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      return await handleProcedureCreateFromTemplateOperation.call(this, templateId, additionalFields);
    }

    case 'duplicate': {
      const procedureId = this.getNodeParameter('id', i) as string;
      const companyId = this.getNodeParameter('companyId', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      return await handleProcedureDuplicateOperation.call(this, procedureId, companyId, additionalFields);
    }

    case 'kickoff': {
      const procedureId = this.getNodeParameter('id', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      return await handleProcedureKickoffOperation.call(this, procedureId, additionalFields);
    }
  }

  // This should never be reached due to TypeScript's exhaustive check
  throw new Error(`Unsupported operation ${operation}`);
}
