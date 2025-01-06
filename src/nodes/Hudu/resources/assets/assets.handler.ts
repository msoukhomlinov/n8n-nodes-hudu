import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { handleListing, processDateRange } from '../../utils/GenericFunctions';
import type { AssetsOperations } from './assets.types';

export async function handleAssetsOperation(
  this: IExecuteFunctions,
  operation: AssetsOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      // Process date range if present
      if (filters.updated_at) {
        const updatedAtFilter = filters.updated_at as IDataObject;

        if (updatedAtFilter.range) {
          const rangeObj = updatedAtFilter.range as IDataObject;

          const dateRange = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as string,
            },
          });

          filters.updated_at = dateRange || undefined;
        } else {
          filters.updated_at = undefined;
        }
      }

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/assets',
        'assets',
        undefined,
        filters,
        returnAll,
        limit,
      );
      break;
    }
  }

  return responseData;
}
