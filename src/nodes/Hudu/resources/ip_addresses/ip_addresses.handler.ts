import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange, validateCompanyId } from '../../utils/index';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { IpAddressOperations } from './ip_addresses.types';
import type { DateRangePreset } from '../../utils/dateUtils';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { debugLog } from '../../utils/debugConfig';

export async function handleIpAddressesOperation(
  this: IExecuteFunctions,
  operation: IpAddressOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/ip_addresses';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
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

      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'ip_addresses',
        qs,
        returnAll,
        limit,
      );
      return responseData;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as string;
      return await handleGetOperation.call(this, resourceEndpoint, id);
    }

    case 'create': {
      const address = this.getNodeParameter('address', i) as string;
      const status = this.getNodeParameter('status', i) as string;
      const companyId = Number.parseInt(this.getNodeParameter('company_id', i) as string, 10);
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Map 'comments' to 'notes' for API compatibility
      const body: IDataObject = {
        address,
        status,
        company_id: companyId,
        ...additionalFields,
      };

      // Map comments to notes if it exists
      if (body.comments !== undefined) {
        debugLog('[RESOURCE_TRANSFORM] Mapping comments to notes field for IP address', { comments: body.comments });
        body.notes = body.comments;
        delete body.comments;
      }

      return await handleCreateOperation.call(this, resourceEndpoint, { ip_address: body });
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      if (updateFields.company_id) {
        updateFields.company_id = Number.parseInt(updateFields.company_id as string, 10);
      }

      // Map comments to notes if it exists
      if (updateFields.comments !== undefined) {
        debugLog('[RESOURCE_TRANSFORM] Mapping comments to notes field for IP address update', { comments: updateFields.comments });
        updateFields.notes = updateFields.comments;
        delete updateFields.comments;
      }

      return await handleUpdateOperation.call(this, resourceEndpoint, id, { ip_address: updateFields });
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as string;
      return await handleDeleteOperation.call(this, resourceEndpoint, id);
    }

    default:
      throw new Error(`Operation ${operation} is not supported`);
  }
}
