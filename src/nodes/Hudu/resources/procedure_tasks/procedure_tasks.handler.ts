import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { ProcedureTasksOperations } from './procedure_tasks.types';

export async function handleProcedureTasksOperation(
  this: IExecuteFunctions,
  operation: ProcedureTasksOperations,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'create': {
      const body: IDataObject = {
        name: this.getNodeParameter('name', i) as string,
        procedure_id: this.getNodeParameter('procedure_id', i) as number,
      };

      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Handle assigned_users conversion from comma-separated string to array
      if (additionalFields.assigned_users) {
        additionalFields.assigned_users = (additionalFields.assigned_users as string)
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));
      }

      // Only add non-empty additional fields
      Object.entries(additionalFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          body[key] = value;
        }
      });

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
      const qs: IDataObject = {};

      // Add filters if they are set
      try {
        const procedureId = this.getNodeParameter('procedure_id', i);
        if (procedureId !== undefined && procedureId !== null) {
          qs.procedure_id = procedureId;
        }
      } catch {}

      try {
        const name = this.getNodeParameter('name', i);
        if (name !== '') {
          qs.name = name;
        }
      } catch {}

      try {
        const companyId = this.getNodeParameter('company_id', i);
        if (companyId !== undefined && companyId !== null) {
          qs.company_id = companyId;
        }
      } catch {}

      const response = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/procedure_tasks',
        undefined,
        qs,
      );

      // Return the procedure_tasks array from the response
      return response.procedure_tasks || [];
    }

    case 'update': {
      const taskId = this.getNodeParameter('taskId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      // Handle assigned_users conversion from comma-separated string to array
      if (updateFields.assigned_users) {
        updateFields.assigned_users = (updateFields.assigned_users as string)
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));
      }

      // Only include non-empty update fields
      const body: IDataObject = {};
      Object.entries(updateFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          body[key] = value;
        }
      });

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
