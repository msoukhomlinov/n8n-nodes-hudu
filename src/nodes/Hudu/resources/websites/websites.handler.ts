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
import type { WebsiteOperation } from './websites.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { DEBUG_CONFIG, debugLog } from '../../utils/debugConfig';

export async function handleWebsitesOperation(
  this: IExecuteFunctions,
  operation: WebsiteOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  if (DEBUG_CONFIG.RESOURCE_PROCESSING) {
    debugLog('[ResourceProcessing] Processing Websites resource', { operation, itemIndex: i });
  }

  const resourceEndpoint = '/websites';

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] Websites getAll parameters', { returnAll, filters, limit });
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

      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] Websites getAll transformed query', { qs });
      }

      return await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'websites',
        qs,
        returnAll,
        limit,
      );
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] Websites get parameters', { id });
      }
      
      return await handleGetOperation.call(this, resourceEndpoint, id, 'website');
    }

    case 'create': {
      const companyId = validateCompanyId(
        this.getNodeParameter('companyId', i),
        this.getNode(),
        'Company ID'
      );
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] Websites create parameters', { 
          companyId, 
          name, 
          additionalFields 
        });
      }
      
      const body = {
        website: {
          name,
          company_id: companyId,
          ...additionalFields,
        },
      };
      
      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] Websites create transformed body', { body });
      }
      
      return await handleCreateOperation.call(this, resourceEndpoint, body);
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const updateFields = this.getNodeParameter('websiteUpdateFields', i) as IDataObject;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] Websites update parameters', { id, updateFields });
      }
      
      const body = {
        website: {
          ...updateFields,
        },
      };
      
      if (DEBUG_CONFIG.RESOURCE_TRANSFORM) {
        debugLog('[ResourceTransform] Websites update transformed body', { body });
      }
      
      return await handleUpdateOperation.call(this, resourceEndpoint, id, body);
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      
      if (DEBUG_CONFIG.RESOURCE_PARAMS) {
        debugLog('[ResourceParams] Websites delete parameters', { id });
      }
      
      return await handleDeleteOperation.call(this, resourceEndpoint, id);
    }
  }

  // This should never be reached due to TypeScript's exhaustive check
  throw new Error(`Unsupported operation ${operation}`);
}
