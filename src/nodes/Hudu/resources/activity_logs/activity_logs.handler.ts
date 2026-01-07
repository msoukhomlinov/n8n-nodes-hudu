import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleGetAllOperation } from '../../utils/operations';
import type { ActivityLogsOperation } from './activity_logs.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { huduApiRequest, sleep } from '../../utils/requestUtils';

// Adaptive throttling constants to prevent rate limiting
const THROTTLE_CONFIG = {
  BASE_DELAY_MS: 50,         // 100ms between sequential requests
  RATE_LIMITED_DELAY_MS: 500, // 500ms after encountering a 429
} as const;

/**
 * Filter fields from a result object based on selected fields
 */
function filterFields(item: IDataObject, fields: string[] | undefined): IDataObject {
  if (!fields || fields.length === 0) {
    return item; // Return all fields if none specified
  }

  const filtered: IDataObject = {};
  for (const field of fields) {
    if (item.hasOwnProperty(field)) {
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

/**
 * Fetch activity logs with client-side resource_type filtering
 * Uses incremental pagination to avoid fetching all logs unnecessarily
 * Includes adaptive delay between requests to prevent rate limiting
 */
async function fetchWithResourceTypeFilter(
  context: IExecuteFunctions,
  endpoint: string,
  filters: IDataObject,
  resourceType: string,
  returnAll: boolean,
  limit: number,
  delayMs: number = THROTTLE_CONFIG.BASE_DELAY_MS,
): Promise<IDataObject[]> {
  const matchingResults: IDataObject[] = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    // Add delay between pagination requests (skip first page)
    if (page > 1) {
      await sleep(delayMs);
    }

    const qs = { ...filters, page, page_size: HUDU_API_CONSTANTS.PAGE_SIZE };
    const response = await huduApiRequest.call(context, 'GET', endpoint, {}, qs);
    const items = Array.isArray(response) 
      ? response 
      : ((response as IDataObject).activity_logs as IDataObject[] || []);

    // Filter this page by record_type
    const matching = items.filter((item) => item.record_type === resourceType);
    matchingResults.push(...matching);

    // Check if more pages exist
    hasMorePages = items.length === HUDU_API_CONSTANTS.PAGE_SIZE;

    // Early exit if we have enough (and not returning all)
    if (!returnAll && matchingResults.length >= limit) {
      break;
    }

    page++;
  }

  // Apply limit if not returning all
  if (!returnAll && matchingResults.length > limit) {
    return matchingResults.slice(0, limit);
  }

  return matchingResults;
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

      // Determine filtering mode
      const resourceType = cleanedFilters.resource_type as string | undefined;
      const resourceId = cleanedFilters.resource_id as number | undefined;
      const hasResourceType = resourceType && resourceType !== '';
      const hasResourceId = resourceId && resourceId !== 0;
      const needsClientSideResourceTypeFilter = hasResourceType && !hasResourceId;

      if (needsClientSideResourceTypeFilter) {
        delete cleanedFilters.resource_type;
      }
      if (!hasResourceType && hasResourceId) {
        delete cleanedFilters.resource_id; // API requires both
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
        let currentDelay: number = THROTTLE_CONFIG.BASE_DELAY_MS;

        // Query each action separately with adaptive throttling
        for (let actionIndex = 0; actionIndex < actionMessages.length; actionIndex++) {
          const action = actionMessages[actionIndex];
          const actionFilters = { ...cleanedFilters, action_message: action };

          // Add delay between requests to prevent rate limiting (skip first request)
          if (actionIndex > 0) {
            await sleep(currentDelay);
          }

          try {
            if (needsClientSideResourceTypeFilter) {
              // Use incremental fetch with filter for each action
              const actionResults = await fetchWithResourceTypeFilter(
                this,
                resourceEndpoint,
                actionFilters,
                resourceType!,
                returnAll,
                limit,
                currentDelay,
              );
              allResults.push(...actionResults);
            } else {
              // Use existing handleGetAllOperation
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
          } catch (error) {
            // If we hit a rate limit, increase delay for remaining requests
            if ((error as { statusCode?: number }).statusCode === 429) {
              currentDelay = THROTTLE_CONFIG.RATE_LIMITED_DELAY_MS;
            }
            throw error; // Re-throw to let existing retry logic handle it
          }
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

        if (needsClientSideResourceTypeFilter) {
          // Use incremental fetch with filter
          results = await fetchWithResourceTypeFilter(
            this,
            resourceEndpoint,
            cleanedFilters,
            resourceType!,
            returnAll,
            limit,
          );
        } else {
          // Use existing handleGetAllOperation
          results = await handleGetAllOperation.call(
            this,
            resourceEndpoint,
            'activity_logs',
            cleanedFilters,
            returnAll,
            limit,
          );
        }
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
