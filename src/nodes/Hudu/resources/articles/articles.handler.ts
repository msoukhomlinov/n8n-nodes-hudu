import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { processDateRange } from '../../utils/index';
import type { ArticlesOperation, IArticlePostProcessFilters } from './articles.types';
import { articleFilterMapping } from './articles.types';
import type { DateRangePreset } from '../../utils/dateUtils';
import {
  handleCreateOperation,
  handleDeleteOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
  handleArchiveOperation,
} from '../../utils/operations';

export async function handleArticlesOperation(
  this: IExecuteFunctions,
  operation: ArticlesOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/articles';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getVersionHistory': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const activityEndpoint = '/activity_logs';

      // Process date range if present
      let startDate: string | undefined;
      if (filters.start_date) {
        const startDateFilter = filters.start_date as IDataObject;
        if (startDateFilter.range) {
          const rangeObj = startDateFilter.range as IDataObject;
          const dateRange = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as DateRangePreset,
            },
          });
          if (dateRange) {
            startDate = dateRange;
          }
        }
      }

      // Fetch creation history
      const creationFilters: IDataObject = {
        resource_type: 'Article',
        resource_id: Number(articleId),
        action_message: 'created',
        ...(startDate && { start_date: startDate }),
      };
      const creationHistory = await handleGetAllOperation.call(
        this,
        activityEndpoint,
        undefined,
        creationFilters,
        true, // returnAll
      ) as IDataObject[];

      // Fetch update history
      const updateFilters: IDataObject = {
        resource_type: 'Article',
        resource_id: Number(articleId),
        action_message: 'updated',
        ...(startDate && { start_date: startDate }),
      };
      const updateHistory = await handleGetAllOperation.call(
        this,
        activityEndpoint,
        undefined,
        updateFilters,
        true, // returnAll
      ) as IDataObject[];

      // Combine and process the results
      const combinedHistory = [...creationHistory, ...updateHistory].map((entry) => {
        // Parse details if it's a string
        const rawDetails = entry.details;
        let parsedDetails: IDataObject = {};
        
        try {
          parsedDetails = typeof rawDetails === 'string' 
            ? JSON.parse(rawDetails) 
            : (rawDetails as IDataObject);
        } catch (e) {
          // If parsing fails, use empty object
          parsedDetails = {};
        }

        return {
          activity_id: entry.id,
          datetime: entry.created_at,
          user_name: entry.user_name,
          record_name: entry.record_name,
          details: parsedDetails.content || '',
        };
      });

      // Sort by datetime oldest to newest
      combinedHistory.sort((a, b) => {
        const dateA = new Date(a.datetime as string).getTime();
        const dateB = new Date(b.datetime as string).getTime();
        return dateA - dateB;
      });

      responseData = combinedHistory;
      break;
    }

    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const content = this.getNodeParameter('content', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Convert company_id to number if present in additionalFields
      if (additionalFields.company_id) {
        additionalFields.company_id = Number.parseInt(additionalFields.company_id as string, 10);
      }

      const body: IDataObject = {
        name,
        content,
        ...additionalFields,
      };

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { article: body });
      break;
    }

    case 'get': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await handleGetOperation.call(this, resourceEndpoint, articleId);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      // Extract post-processing filters and API filters separately
      const postProcessFilters: IArticlePostProcessFilters = {};
      const apiFilters: IDataObject = {};

      // Copy only API filters
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'folder_id') {
          postProcessFilters.folder_id = value as number;
        } else {
          apiFilters[key] = value;
        }
      }

      // Convert company_id to number if present in filters
      if (apiFilters.company_id) {
        apiFilters.company_id = Number.parseInt(apiFilters.company_id as string, 10);
      }

      // Process date range if present
      if (apiFilters.updated_at) {
        const updatedAtFilter = apiFilters.updated_at as IDataObject;

        if (updatedAtFilter.range) {
          const rangeObj = updatedAtFilter.range as IDataObject;

          const dateRange = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as DateRangePreset,
            },
          });

          if (dateRange) {
            apiFilters.updated_at = dateRange;
          } else {
            apiFilters.updated_at = undefined;
          }
        } else {
          apiFilters.updated_at = undefined;
        }
      }

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'articles',
        apiFilters,
        returnAll,
        limit,
        postProcessFilters,
        articleFilterMapping,
      );
      return responseData;
    }

    case 'update': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      const name = this.getNodeParameter('name', i) as string;
      const content = this.getNodeParameter('content', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        article: {
          name,
          content,
          ...additionalFields,
        },
      };

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, articleId, body);
      break;
    }

    case 'delete': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, articleId);
      break;
    }

    case 'archive': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await handleArchiveOperation.call(this, resourceEndpoint, articleId, true);
      break;
    }

    case 'unarchive': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await handleArchiveOperation.call(this, resourceEndpoint, articleId, false);
      break;
    }
  }

  return responseData;
}
