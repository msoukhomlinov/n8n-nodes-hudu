import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleGetAllOperation } from '../../utils/operations';
import type { ActivityLogsOperation } from './activity_logs.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleActivityLogsOperation(
  this: IExecuteFunctions,
  operation: ActivityLogsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/activity_logs';

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'activity_logs',
        filters,
        returnAll,
        limit,
      );
    }
  }

  throw new Error(`Unsupported operation ${operation}`);
}
