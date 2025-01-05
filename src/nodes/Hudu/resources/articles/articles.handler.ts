import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing, processDateRange } from '../../utils/GenericFunctions';
import type { ArticlesOperation } from './articles.types';

export async function handleArticlesOperation(
  this: IExecuteFunctions,
  operation: ArticlesOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const content = this.getNodeParameter('content', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        content,
        ...additionalFields,
      };

      responseData = await huduApiRequest.call(this, 'POST' as IHttpRequestMethods, '/articles', {
        article: body,
      });
      break;
    }

    case 'get': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/articles/${articleId}`,
      );
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      console.log('Initial filters:', JSON.stringify(filters, null, 2));

      // Process date range if present
      if (filters.updated_at) {
        console.log('Raw updated_at filter:', JSON.stringify(filters.updated_at, null, 2));
        const updatedAtFilter = filters.updated_at as IDataObject;
        
        if (updatedAtFilter.range) {
          console.log('Range object:', JSON.stringify(updatedAtFilter.range, null, 2));
          const rangeObj = updatedAtFilter.range as IDataObject;
          
          // Special logging for last7d
          if (rangeObj.mode === 'preset' && rangeObj.preset === 'last7d') {
            console.log('Last 7 Days filter detected');
          }

          const dateRange = processDateRange({
            range: {
              mode: rangeObj.mode as 'exact' | 'range' | 'preset',
              exact: rangeObj.exact as string,
              start: rangeObj.start as string,
              end: rangeObj.end as string,
              preset: rangeObj.preset as string,
            },
          });

          if (dateRange) {
            console.log('Processed date range:', dateRange);
            filters.updated_at = dateRange;
          } else {
            console.log('Date range processing returned undefined');
            filters.updated_at = undefined;
          }
        } else {
          console.log('No range found in updated_at filter');
          filters.updated_at = undefined;
        }
      } else {
        console.log('No updated_at filter found in filters object');
      }

      console.log('Final filters:', JSON.stringify(filters, null, 2));

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/articles',
        'articles',
        {},
        filters,
        returnAll,
        limit,
      );
      return responseData;
    }

    case 'update': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      const name = this.getNodeParameter('name', i) as string;
      const content = this.getNodeParameter('content', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        content,
        ...additionalFields,
      };

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/articles/${articleId}`,
        { article: body },
      );
      break;
    }

    case 'delete': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      await huduApiRequest.call(this, 'DELETE' as IHttpRequestMethods, `/articles/${articleId}`);
      responseData = { success: true };
      break;
    }

    case 'archive': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/articles/${articleId}/archive`,
      );
      break;
    }

    case 'unarchive': {
      const articleId = this.getNodeParameter('articleId', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/articles/${articleId}/unarchive`,
      );
      break;
    }
  }

  return responseData;
}
