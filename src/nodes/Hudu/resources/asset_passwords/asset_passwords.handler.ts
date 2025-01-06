import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest, handleListing, processDateRange } from '../../utils/GenericFunctions';
import type { AssetPasswordOperation } from './asset_passwords.types';

export async function handleAssetPasswordOperation(
  this: IExecuteFunctions,
  operation: AssetPasswordOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  try {
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
          '/asset_passwords',
          'asset_passwords',
          undefined,
          filters,
          returnAll,
          limit,
        );
        break;
      }

      case 'get': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }
        responseData = await huduApiRequest.call(this, 'GET', `/asset_passwords/${id}`);
        break;
      }

      case 'create': {
        // Get required fields directly
        const name = this.getNodeParameter('name', i) as string;
        const password = this.getNodeParameter('password', i) as string;
        const companyId = this.getNodeParameter('company_id', i) as number;

        // Get additional fields
        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

        // Combine all fields
        const body = {
          asset_password: {
            name,
            password,
            company_id: companyId,
            ...additionalFields,
          },
        };

        responseData = await huduApiRequest.call(this, 'POST', '/asset_passwords', body);
        break;
      }

      case 'update': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }

        const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
        const body = {
          asset_password: updateFields,
        };

        responseData = await huduApiRequest.call(this, 'PUT', `/asset_passwords/${id}`, body);
        break;
      }

      case 'delete': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }
        responseData = await huduApiRequest.call(this, 'DELETE', `/asset_passwords/${id}`);
        break;
      }

      case 'archive': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }
        responseData = await huduApiRequest.call(this, 'PUT', `/asset_passwords/${id}/archive`);
        break;
      }

      case 'unarchive': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }
        responseData = await huduApiRequest.call(this, 'PUT', `/asset_passwords/${id}/unarchive`);
        break;
      }

      default: {
        throw new NodeOperationError(this.getNode(), `Operation ${operation} is not supported`);
      }
    }

    return responseData;
  } catch (error) {
    // If it's already a NodeApiError or NodeOperationError, rethrow it
    if (error.name === 'NodeApiError' || error.name === 'NodeOperationError') {
      throw error;
    }

    // Handle any other unexpected errors
    throw new NodeOperationError(
      this.getNode(),
      `Failed to execute ${operation} operation: ${error.message}`,
      { description: error.description || 'An unexpected error occurred' },
    );
  }
}
