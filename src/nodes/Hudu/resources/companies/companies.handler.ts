import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils/GenericFunctions';
import { CompaniesOperations } from './companies.types';

export async function handleCompaniesOperation(
  this: IExecuteFunctions,
  operation: CompaniesOperations,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      responseData = await huduApiRequest.call(this, 'POST' as IHttpRequestMethods, '/companies', {
        company: body,
      });
      break;
    }

    case 'delete': {
      const companyId = this.getNodeParameter('id', i) as string;
      await huduApiRequest.call(this, 'DELETE' as IHttpRequestMethods, `/companies/${companyId}`);
      responseData = { success: true };
      break;
    }

    case 'get': {
      const companyId = this.getNodeParameter('id', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/companies/${companyId}`,
      );
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      const qs: IDataObject = {
        ...filters,
      };

      if (filters.updatedAt) {
        qs.updated_at = filters.updatedAt;
      }

      if (filters.idInIntegration) {
        qs.id_in_integration = filters.idInIntegration;
      }

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/companies',
        'companies',
        {},
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'update': {
      const companyId = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/companies/${companyId}`,
        { company: updateFields },
      );
      break;
    }

    case 'getAssets': {
      const companyId = this.getNodeParameter('companyId', i) as string;
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      const qs: IDataObject = {
        ...filters,
      };

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        `/companies/${companyId}/assets`,
        'assets',
        {},
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'createAsset': {
      const companyId = this.getNodeParameter('companyId', i) as string;
      const name = this.getNodeParameter('name', i) as string;
      const assetLayoutId = this.getNodeParameter('assetLayoutId', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        asset_layout_id: assetLayoutId,
        ...additionalFields,
      };

      if (additionalFields.customFields) {
        body.custom_fields = additionalFields.customFields;
        delete body.customFields;
      }

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        `/companies/${companyId}/assets`,
        { asset: body },
      );
      break;
    }

    case 'archive': {
      const companyId = this.getNodeParameter('id', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/companies/${companyId}/archive`,
      );
      break;
    }

    case 'unarchive': {
      const companyId = this.getNodeParameter('id', i) as string;
      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/companies/${companyId}/unarchive`,
      );
      break;
    }

    case 'jump': {
      const integrationSlug = this.getNodeParameter('integrationSlug', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const qs: IDataObject = {
        integration_slug: integrationSlug,
      };

      if (additionalFields.integrationId) {
        qs.integration_id = additionalFields.integrationId;
      }

      if (additionalFields.integrationIdentifier) {
        qs.integration_identifier = additionalFields.integrationIdentifier;
      }

      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/companies/jump',
        {},
        qs,
      );
      break;
    }
  }

  return responseData;
}
