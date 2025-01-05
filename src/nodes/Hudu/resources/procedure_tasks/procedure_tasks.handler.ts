import type { IExecuteFunctions } from 'n8n-core';
import type { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import type { ProcedureTasksOperations } from './procedure_tasks.types';

export async function handleProcedureTasksOperation(
  this: IExecuteFunctions,
  operation: ProcedureTasksOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const body: IDataObject = {
        name: this.getNodeParameter('name', i) as string,
        procedure_id: this.getNodeParameter('procedure_id', i) as number,
      };

      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Only add non-empty additional fields
      for (const [key, value] of Object.entries(additionalFields)) {
        if (value !== undefined && value !== null && value !== '') {
          body[key] = value;
        }
      }

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/procedure_tasks',
        { procedure_task: body },
      );
      return responseData;
    }

    case 'delete': {
      const taskId = this.getNodeParameter('taskId', i) as string;
      await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/procedure_tasks/${taskId}`,
      );
      return { success: true };
    }

    case 'get': {
      const taskId = this.getNodeParameter('taskId', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/procedure_tasks/${taskId}`,
      );
      return responseData;
    }

    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;

      const qs: IDataObject = {
        ...filters,
      };

      const response = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/procedure_tasks',
        undefined,
        qs,
      );

      // Return the procedure_tasks array from the response
      return Array.isArray(response) ? response : (response as IDataObject).procedure_tasks as IDataObject[] || [];
    }

    case 'update': {
      const taskId = this.getNodeParameter('taskId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      // Only include non-empty update fields
      const body: IDataObject = {};
      for (const [key, value] of Object.entries(updateFields)) {
        if (value !== undefined && value !== null && value !== '') {
          body[key] = value;
        }
      }

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/procedure_tasks/${taskId}`,
        { procedure_task: body },
      );
      return responseData;
    }
  }

  return responseData;
}
