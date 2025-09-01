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
import type { VlanOperation } from './vlans.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { DEBUG_CONFIG, debugLog } from '../../utils/debugConfig';

export async function handleVlansOperation(
  this: IExecuteFunctions,
  operation: VlanOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/vlans';
  
  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('[ResourceProcessing] VLAN operation started', { operation, index: i });
  }

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN getAll parameters', { returnAll, filters, limit });
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
              preset: rangeObj.preset 
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
              preset: rangeObj.preset 
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
        debugLog('[Filters] VLAN filters after processing', qs);
      }

      // Note: VLAN endpoint doesn't support pagination parameters (page, page_size)
      // The updated handleListing function should handle this by not adding these parameters
      const result = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'vlans',
        qs,
        returnAll,
        limit,
      );
      
      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] VLAN getAll results count', { 
          count: Array.isArray(result) ? result.length : 1 
        });
      }
      
      return result;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN get parameters', { id });
      }
      
      return await handleGetOperation.call(this, resourceEndpoint, id, 'vlan');
    }

    case 'create': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const name = this.getNodeParameter('name', i) as string;
      const vlanId = this.getNodeParameter('vlan_id', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN create parameters', { 
          companyId, 
          name, 
          vlanId,
          additionalFields 
        });
      }
      
      const body = {
        vlan: {
          name,
          vlan_id: vlanId,
          company_id: companyId,
          ...additionalFields,
        },
      };
      
      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] VLAN create request body', body);
      }
      
      return await handleCreateOperation.call(this, resourceEndpoint, body);
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const updateFields = this.getNodeParameter('vlanUpdateFields', i) as IDataObject;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN update parameters', { id, updateFields });
      }
      
      const body = {
        vlan: {
          ...updateFields,
        },
      };
      
      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] VLAN update request body', body);
      }
      
      return await handleUpdateOperation.call(this, resourceEndpoint, id, body);
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] VLAN delete parameters', { id });
      }
      
      return await handleDeleteOperation.call(this, resourceEndpoint, id);
    }
  }

  throw new Error(`Unsupported operation ${operation}`);
} 