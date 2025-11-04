import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleGetAllOperation } from '../../utils/operations';
import type { ActivityLogsOperation } from './activity_logs.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { huduApiRequest } from '../../utils/requestUtils';

export async function handleActivityLogsOperation(
  this: IExecuteFunctions,
  operation: ActivityLogsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/activity_logs';

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('additionalFields', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      // Filter out 0 values for optional numeric filters to avoid sending invalid filter values
      const cleanedFilters: IDataObject = { ...filters };
      if (cleanedFilters.resource_id === 0) {
        delete cleanedFilters.resource_id;
      }

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'activity_logs',
        cleanedFilters,
        returnAll,
        limit,
      );
    }

    case 'delete': {
      const datetime = this.getNodeParameter('datetime', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const qs: IDataObject = {
        datetime,
      };

      if (additionalFields.delete_unassigned_logs !== undefined) {
        qs.delete_unassigned_logs = additionalFields.delete_unassigned_logs;
      }

      return await huduApiRequest.call(this, 'DELETE', resourceEndpoint, {}, qs);
    }
  }

  throw new Error(`Unsupported operation ${operation}`);
}
