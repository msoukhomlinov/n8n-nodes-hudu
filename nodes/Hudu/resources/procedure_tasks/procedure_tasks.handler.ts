import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
  handleGetAllOperation,
  handleUpdateOperation,
  handleCreateOperation,
  handleDeleteOperation,
  handleGetOperation,
} from '../../utils/operations';
import type { ProcedureTasksOperations } from './procedure_tasks.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { convertToDateOnlyFormat } from '../../utils/dateUtils';

export async function handleProcedureTasksOperation(
  this: IExecuteFunctions,
  operation: ProcedureTasksOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/procedure_tasks';

  switch (operation) {
    case 'create': {
      const body: IDataObject = {
        name: this.getNodeParameter('name', i) as string,
        procedure_id: this.getNodeParameter('procedure_id', i) as number,
      };

      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Only add non-empty additional fields (skip 0 for ID fields like parent_task_id)
      for (const [key, value] of Object.entries(additionalFields)) {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'parent_task_id' && value === 0) continue;
          body[key] = value;
        }
      }

      return await handleCreateOperation.call(this, resourceEndpoint, { procedure_task: body });
    }

    case 'delete': {
      const taskId = this.getNodeParameter('taskId', i) as string;
      return await handleDeleteOperation.call(this, resourceEndpoint, taskId);
    }

    case 'get': {
      const taskId = this.getNodeParameter('taskId', i) as string;
      return await handleGetOperation.call(this, resourceEndpoint, taskId, 'procedure_task');
    }

    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      const qs: IDataObject = {
        ...filters,
      };

      // Strip zero-value ID filters that would match no records
      if (qs.procedure_id === 0) delete qs.procedure_id;

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'procedure_tasks',
        qs,
        returnAll,
        limit,
      );
    }

    case 'update': {
      const taskId = this.getNodeParameter('taskId', i) as string;
      const updateFields = this.getNodeParameter('procedureTaskUpdateFields', i) as IDataObject;

      // Only include non-empty update fields (skip 0 for ID fields, convert due_date)
      const body: IDataObject = {};
      for (const [key, value] of Object.entries(updateFields)) {
        if (value !== undefined && value !== null && value !== '') {
          if ((key === 'parent_task_id' || key === 'procedure_id') && value === 0) continue;
          if (key === 'due_date') {
            const convertedDate = convertToDateOnlyFormat(value);
            if (convertedDate) {
              body[key] = convertedDate;
            }
          } else {
            body[key] = value;
          }
        }
      }

      return await handleUpdateOperation.call(this, resourceEndpoint, taskId, { procedure_task: body });
    }
  }

  // This should never be reached due to TypeScript's exhaustive check
  throw new Error(`Unsupported operation ${operation}`);
}
