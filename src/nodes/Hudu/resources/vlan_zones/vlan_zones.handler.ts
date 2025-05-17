import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange, validateCompanyId } from '../../utils/index';
import type { DateRangePreset } from '../../utils/dateUtils';
import {
  handleCreateOperation,
  handleDeleteOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
} from '../../utils/operations';
import type { VlanZoneOperation } from './vlan_zones.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { DEBUG_CONFIG, debugLog } from '../../utils/debugConfig';

export async function handleVlanZonesOperation(
  this: IExecuteFunctions,
  operation: VlanZoneOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/vlan_zones';

  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('[ResourceProcessing] VLAN Zone operation started', { operation, index: i });
  }

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN Zone getAll parameters', { returnAll, filters, limit });
      }

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
          if (DEBUG_CONFIG.UTIL_DATE_PROCESSING) {
            debugLog('[DateProcessing] Processing created_at date range', {
              mode: rangeObj.mode,
              exact: rangeObj.exact,
              start: rangeObj.start,
              end: rangeObj.end,
              preset: rangeObj.preset,
            });
          }

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

          if (DEBUG_CONFIG.UTIL_DATE_PROCESSING) {
            debugLog('[DateProcessing] Processed created_at result', filters.created_at);
          }
        }
      }

      if (filters.updated_at) {
        const updatedAtFilter = filters.updated_at as IDataObject;
        if (updatedAtFilter.range) {
          const rangeObj = updatedAtFilter.range as IDataObject;
          if (DEBUG_CONFIG.UTIL_DATE_PROCESSING) {
            debugLog('[DateProcessing] Processing updated_at date range', {
              mode: rangeObj.mode,
              exact: rangeObj.exact,
              start: rangeObj.start,
              end: rangeObj.end,
              preset: rangeObj.preset,
            });
          }

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

          if (DEBUG_CONFIG.UTIL_DATE_PROCESSING) {
            debugLog('[DateProcessing] Processed updated_at result', filters.updated_at);
          }
        }
      }

      if (DEBUG_CONFIG.UTIL_FILTERS) {
        debugLog('[Filters] VLAN Zone filters after processing', qs);
      }

      const result = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'vlan_zones',
        qs,
        returnAll,
        limit,
      );

      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] VLAN Zone getAll results count', {
          count: Array.isArray(result) ? result.length : 1,
        });
      }

      return result;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;

      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN Zone get parameters', { id });
      }

      return await handleGetOperation.call(this, resourceEndpoint, id);
    }

    case 'create': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID',
      );
      const name = this.getNodeParameter('name', i) as string;
      const vlanIdRanges = this.getNodeParameter('vlan_id_ranges', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN Zone create parameters', {
          companyId,
          name,
          vlanIdRanges,
          additionalFields,
        });
      }

      const body = {
        vlan_zone: {
          name,
          vlan_id_ranges: vlanIdRanges,
          company_id: companyId,
          ...additionalFields,
        },
      };

      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] VLAN Zone create request body', body);
      }

      return await handleCreateOperation.call(this, resourceEndpoint, body);
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN Zone update parameters', { id, updateFields });
      }

      const body = {
        vlan_zone: {
          ...updateFields,
        },
      };

      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] VLAN Zone update request body', body);
      }

      return await handleUpdateOperation.call(this, resourceEndpoint, id, body);
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;

      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN Zone delete parameters', { id });
      }

      return await handleDeleteOperation.call(this, resourceEndpoint, id);
    }
  }

  throw new Error(`Unsupported operation ${operation}`);
} 