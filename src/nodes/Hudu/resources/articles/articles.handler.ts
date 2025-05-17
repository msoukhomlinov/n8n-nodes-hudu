import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../../utils/operations';
import type { ArticlesOperation } from './articles.types';
import { DEBUG_CONFIG, debugLog } from '../../utils/debugConfig';
import { processDateRange, type DateRangePreset, validateCompanyId } from '../../utils';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleArticlesOperation(
  this: IExecuteFunctions,
  operation: ArticlesOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/articles';
  let responseData: IDataObject | IDataObject[] = {};

  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('Articles Handler - Input', {
      operation,
      index: i,
    });
  }

  switch (operation) {
    case 'create': {
      const body: IDataObject = {};

      // Name is required and cannot be blank
      const name = this.getNodeParameter('name', i) as string;
      if (!name || name.trim() === '') {
        throw new Error('Article name cannot be blank');
      }
      body.name = name;

      try {
        const content = this.getNodeParameter('content', i) as string;
        if (content) {
          body.content = content;
        }
      } catch (e) {
        // Parameter not set, ignore
      }

      try {
        const company_id = this.getNodeParameter('company_id', i) as string;
        if (company_id) {
          body.company_id = Number.parseInt(company_id, 10);
        }
      } catch (e) {
        // Parameter not set, ignore
      }

      try {
        const enable_sharing = this.getNodeParameter('enable_sharing', i) as boolean;
        if (enable_sharing !== undefined) {
          body.enable_sharing = enable_sharing;
        }
      } catch (e) {
        // Parameter not set, ignore
      }

      try {
        const folder_id = this.getNodeParameter('folder_id', i) as number;
        if (folder_id) {
          body.folder_id = folder_id;
        }
      } catch (e) {
        // Parameter not set, ignore
      }

      responseData = await handleCreateOperation.call(
        this,
        resourceEndpoint,
        { article: body },
      );
      break;
    }

    case 'get': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await handleGetOperation.call(
        this,
        resourceEndpoint,
        articleId,
      );
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      // Validate company_id if provided in filters
      if (filters.company_id) {
        filters.company_id = validateCompanyId(filters.company_id, this.getNode(), 'Company ID');
      }

      const qs: IDataObject = {
        ...filters,
      };

      if (filters.created_at) {
        const createdAtFilter = filters.created_at as IDataObject;
        if (createdAtFilter.range) {
          const rangeObj = createdAtFilter.range as IDataObject;
          filters.created_at = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as DateRangePreset,
            },
          });
          qs.created_at = filters.created_at;
        }
      }

      if (filters.updated_at) {
        const updatedAtFilter = filters.updated_at as IDataObject;
        if (updatedAtFilter.range) {
          const rangeObj = updatedAtFilter.range as IDataObject;
          filters.updated_at = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as DateRangePreset,
            },
          });
          qs.updated_at = filters.updated_at;
        }
      }

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'articles',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'update': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      if (Object.keys(updateFields).length === 0) {
        throw new Error('No fields to update were provided');
      }

      responseData = await handleUpdateOperation.call(
        this,
        resourceEndpoint,
        articleId,
        { article: updateFields },
      );
      break;
    }

    case 'delete': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await handleDeleteOperation.call(
        this,
        resourceEndpoint,
        articleId,
      );
      break;
    }

    case 'archive': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await handleArchiveOperation.call(
        this,
        resourceEndpoint,
        articleId,
        true,
      );
      break;
    }

    case 'unarchive': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await handleArchiveOperation.call(
        this,
        resourceEndpoint,
        articleId,
        false,
      );
      break;
    }

    case 'getVersionHistory': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      
      // Base additional fields
      const baseAdditionalFields: IDataObject = {
        resource_id: articleId,
        resource_type: 'Article',
      };

      // Process date range filters if provided
      if (filters.start_date && typeof filters.start_date === 'object' && 'range' in filters.start_date) {
        const rangeObj = (filters.start_date as IDataObject).range as IDataObject;
        baseAdditionalFields.created_at = processDateRange({
          range: {
            mode: rangeObj.mode as 'exact' | 'range' | 'preset',
            exact: rangeObj.exact as string,
            start: rangeObj.start as string,
            end: rangeObj.end as string,
            preset: rangeObj.preset as DateRangePreset,
          },
        });
      }

      if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
        debugLog('Articles Version History - Base Query', {
          articleId,
          baseAdditionalFields,
        });
      }

      // Get created activities
      const createdAdditionalFields = { ...baseAdditionalFields, action_message: 'created' };
      const createdLogs = await handleGetAllOperation.call(
        this,
        '/activity_logs',
        'activity_logs',
        createdAdditionalFields,
        true, // returnAll
        undefined, // limit
      ) as IDataObject[];

      if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
        debugLog('Articles Version History - Created Activities Response', createdLogs);
      }

      // Get updated activities
      const updatedAdditionalFields = { ...baseAdditionalFields, action_message: 'updated' };
      const updatedLogs = await handleGetAllOperation.call(
        this,
        '/activity_logs',
        'activity_logs',
        updatedAdditionalFields,
        true, // returnAll
        undefined, // limit
      ) as IDataObject[];

      if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
        debugLog('Articles Version History - Updated Activities Response', updatedLogs);
      }

      // Combine and transform responses
      const combinedLogs = [...createdLogs, ...updatedLogs];
      
      // Sort by created_at in ascending order (oldest first)
      combinedLogs.sort((a, b) => {
        const dateA = new Date(a.created_at as string).getTime();
        const dateB = new Date(b.created_at as string).getTime();
        return dateA - dateB;
      });

      // Transform to required format
      responseData = combinedLogs.map((activity, index) => {
        let articleContent = '';
        try {
          const detailsObj = JSON.parse(activity.details as string);
          articleContent = detailsObj.content || activity.details as string;
        } catch (e) {
          // If parsing fails, use the original details text
          articleContent = activity.details as string;
        }

        return {
          activity_id: activity.id,
          created_at: activity.created_at,
          user_name: activity.user_name,
          article_html: articleContent,
          seconds_since_last_revision: combinedLogs[index - 1] 
            ? Math.floor(
                (new Date(activity.created_at as string).getTime() - 
                new Date(combinedLogs[index - 1].created_at as string).getTime()) / 1000
              )
            : null,
        };
      });

      if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
        debugLog('Articles Version History - Final Response', responseData);
      }

      break;
    }
  }

  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('Articles Handler - Response', responseData);
  }

  return responseData;
}
