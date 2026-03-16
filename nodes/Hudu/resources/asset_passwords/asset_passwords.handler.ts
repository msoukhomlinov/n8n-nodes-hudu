import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { processDateRange } from '../../utils/index';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../../utils/operations';
import type { AssetPasswordOperation } from './asset_passwords.types';
import type { DateRangePreset } from '../../utils/dateUtils';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleAssetPasswordOperation(
  this: IExecuteFunctions,
  operation: AssetPasswordOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/asset_passwords';
  let responseData: IDataObject | IDataObject[] = {};

  try {
    switch (operation) {
      case 'getAll': {
        const returnAll = this.getNodeParameter('returnAll', i) as boolean;
        const filters = this.getNodeParameter('filters', i) as IDataObject;
        const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
        const qs: IDataObject = {
          ...filters,
        };

        // Process date range if present
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
          'asset_passwords',
          qs,
          returnAll,
          limit,
        );
        break;
      }

      case 'get': {
        const id = this.getNodeParameter('id', i) as string;
        const identifierType = this.getNodeParameter('identifierType', i, 'id') as string;
        
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }

        if (identifierType === 'slug') {
          // Use getAll with slug filter for slug-based retrieval
          const assetPasswords = await handleGetAllOperation.call(
            this,
            resourceEndpoint,
            'asset_passwords',
            { slug: id },
            false, // returnAll
            1,     // limit to 1 for efficiency
          ) as IDataObject[];

          if (assetPasswords.length === 0) {
            throw new NodeOperationError(
              this.getNode(),
              `Asset password with slug "${id}" not found`,
              { itemIndex: i },
            );
          }

          if (assetPasswords.length > 1) {
            // Should not happen if slugs are unique, but handle gracefully
            throw new NodeOperationError(
              this.getNode(),
              `Multiple asset passwords found with slug "${id}" (expected unique)`,
              { itemIndex: i },
            );
          }

          responseData = assetPasswords[0];
        } else {
          // Use existing handleGetOperation for ID-based retrieval
          responseData = await handleGetOperation.call(this, resourceEndpoint, id, 'asset_password');
        }
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
          name,
          password,
          company_id: companyId,
          ...additionalFields,
        };

        responseData = await handleCreateOperation.call(this, resourceEndpoint, { asset_password: body });
        break;
      }

      case 'update': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }

        const updateFields = this.getNodeParameter('assetPasswordUpdateFields', i) as IDataObject;
        responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, { asset_password: updateFields });
        break;
      }

      case 'delete': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }
        responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
        break;
      }

      case 'archive': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }
        responseData = await handleArchiveOperation.call(this, resourceEndpoint, id, true);
        break;
      }

      case 'unarchive': {
        const id = this.getNodeParameter('id', i) as string;
        if (!id) {
          throw new NodeOperationError(this.getNode(), 'Password ID is required');
        }
        responseData = await handleArchiveOperation.call(this, resourceEndpoint, id, false);
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
