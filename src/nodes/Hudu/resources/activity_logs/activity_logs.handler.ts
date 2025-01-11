import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleGetAllOperation } from '../../utils/operations';
import type { ActivityLogsOperation, IActivityLogsDeleteParams } from './activity_logs.types';
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
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const filters: IDataObject = {};

      // Process filters
      for (const [key, value] of Object.entries(additionalFields)) {
        if (value !== undefined && value !== '') {
          filters[key] = key === 'start_date' ? new Date(value as string).toISOString() : value;
        }
      }

      // Set page_size to prevent infinite pagination loop
      filters.page_size = HUDU_API_CONSTANTS.PAGE_SIZE;

      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      // Activity logs response is a direct array, so we pass undefined as resourceName
      return handleGetAllOperation.call(
        this,
        resourceEndpoint,
        undefined,
        filters,
        returnAll,
        limit,
      );
    }

    case 'delete': {
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const datetime = this.getNodeParameter('datetime', i) as string;
      
      const deleteParams: IActivityLogsDeleteParams = {
        datetime: new Date(datetime).toISOString(),
        ...(additionalFields.delete_unassigned_logs !== undefined && {
          delete_unassigned_logs: additionalFields.delete_unassigned_logs as boolean,
        }),
      };

      // Special case: bulk delete with query params
      const response = await huduApiRequest.call(
        this,
        'DELETE',
        resourceEndpoint,
        {},
        deleteParams as unknown as IDataObject,
      );
      return response as IDataObject;
    }

    default:
      return {};
  }
}
