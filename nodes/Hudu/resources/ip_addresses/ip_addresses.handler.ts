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
// No pagination support for IP Addresses; no constants needed here
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
      // Normalise network_id: remove empty strings, parse numeric strings
      if (filters.network_id !== undefined) {
        if (typeof filters.network_id === 'string') {
          const trimmed = (filters.network_id as string).trim();
          if (trimmed === '') {
            delete filters.network_id;
          } else if (!Number.isNaN(Number.parseInt(trimmed, 10))) {
            filters.network_id = Number.parseInt(trimmed, 10);
          }
        }
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

      // IP Addresses do not support pagination in the API. Always fetch all results.
      // The `limit` parameter is unused when `returnAll` is true and no pagination is supported.
      const returnAll = true;
      const limit = 0;

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
      return await handleGetOperation.call(this, resourceEndpoint, id, 'ip_address');
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

      // Normalise network_id for create: parse numeric strings
      if (body.network_id !== undefined) {
        if (typeof body.network_id === 'string') {
          const trimmed = (body.network_id as string).trim();
          if (trimmed === '') {
            delete body.network_id;
          } else if (!Number.isNaN(Number.parseInt(trimmed, 10))) {
            body.network_id = Number.parseInt(trimmed, 10);
          }
        }
      }

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
      const updateFields = this.getNodeParameter('ipAddressUpdateFields', i) as IDataObject;

      if (updateFields.company_id) {
        updateFields.company_id = Number.parseInt(updateFields.company_id as string, 10);
      }

      // Normalise network_id for update: parse numeric strings
      if (updateFields.network_id !== undefined) {
        if (typeof updateFields.network_id === 'string') {
          const trimmed = (updateFields.network_id as string).trim();
          if (trimmed === '') {
            delete updateFields.network_id;
          } else if (!Number.isNaN(Number.parseInt(trimmed, 10))) {
            updateFields.network_id = Number.parseInt(trimmed, 10);
          }
        }
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
