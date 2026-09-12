import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleGetAllOperation } from '../../utils/operations';
import type { ActivityLogsOperation } from './activity_logs.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { huduApiRequest } from '../../utils/requestUtils';

/**
 * Filter fields from a result object based on selected fields
 */
function filterFields(item: IDataObject, fields: string[] | undefined): IDataObject {
  if (!fields || fields.length === 0) {
    return item; // Return all fields if none specified
  }

  const filtered: IDataObject = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(item, field)) {
      filtered[field] = item[field];
    }
  }
  return filtered;
}

/**
 * Apply field filtering to an array of results
 */
function applyFieldFiltering(results: IDataObject[], fields: string[] | undefined): IDataObject[] {
  if (!fields || fields.length === 0) {
    return results; // Return all fields if none specified
  }

  return results.map((item) => filterFields(item, fields));
}

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

      // Extract fields to return (if specified)
      const fieldsToReturn = filters.fields as string[] | undefined;
      const cleanedFilters: IDataObject = { ...filters };
      delete cleanedFilters.fields; // Remove fields from API filters

      // Hudu API 2.45.1+: resource_type is a first-class server-side filter and
      // can be used alone; resource_id narrows results within resource_type and
      // is ignored when resource_type is not set.
      const hasResourceType =
        typeof cleanedFilters.resource_type === 'string' && cleanedFilters.resource_type !== '';
      if (!hasResourceType) {
        delete cleanedFilters.resource_id; // resource_id requires resource_type
      }
      if (cleanedFilters.resource_id === 0) {
        delete cleanedFilters.resource_id;
      }

      // Extract action_message from filters
      const actionMessages = cleanedFilters.action_message as string[] | string | undefined;
      delete cleanedFilters.action_message;

      let results: IDataObject[];

      // Handle multi-action selection: query each action separately and merge results
      if (Array.isArray(actionMessages) && actionMessages.length > 1) {
        const allResults: IDataObject[] = [];
        // Query each action separately
        for (let actionIndex = 0; actionIndex < actionMessages.length; actionIndex++) {
          const action = actionMessages[actionIndex];
          const actionFilters = { ...cleanedFilters, action_message: action };

          const actionResults = await handleGetAllOperation.call(
            this,
            resourceEndpoint,
            'activity_logs',
            actionFilters,
            returnAll,
            limit,
          );
          allResults.push(...(Array.isArray(actionResults) ? actionResults : [actionResults]));
        }

        // Deduplicate by id using Map (last occurrence wins)
        const uniqueMap = new Map<number, IDataObject>();
        for (const item of allResults) {
          if (item.id !== undefined && item.id !== null) {
            uniqueMap.set(item.id as number, item);
          }
        }

        // Convert to array and sort by created_at descending (most recent first)
        let merged = Array.from(uniqueMap.values());
        merged.sort((a, b) => {
          const dateA = a.created_at as string;
          const dateB = b.created_at as string;
          if (!dateA || !dateB) return 0;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        // Apply limit if not returning all
        if (!returnAll && limit && merged.length > limit) {
          merged = merged.slice(0, limit);
        }

        results = merged;
      } else {
        // Single action or no action
        if (Array.isArray(actionMessages) && actionMessages.length === 1) {
          cleanedFilters.action_message = actionMessages[0];
        } else if (typeof actionMessages === 'string' && actionMessages !== '') {
          cleanedFilters.action_message = actionMessages;
        }

        results = await handleGetAllOperation.call(
          this,
          resourceEndpoint,
          'activity_logs',
          cleanedFilters,
          returnAll,
          limit,
        );
      }

      // Apply field filtering
      return applyFieldFiltering(results, fieldsToReturn);
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
