import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils/GenericFunctions';
import { ArticlesOperation } from './articles.types';

export async function handleArticlesOperation(
  this: IExecuteFunctions,
  operation: ArticlesOperation,
  i: number,
): Promise<any> {
  let responseData;

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

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/articles',
        { article: body },
      );
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
      break;
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
      await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/articles/${articleId}`,
      );
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