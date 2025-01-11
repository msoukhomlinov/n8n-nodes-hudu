import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange } from '../../utils/index';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../../utils/operations';
import { handleCompanyJumpOperation } from '../../utils/operations/companies';
import type { CompaniesOperations } from './companies.types';
import type { DateRangePreset } from '../../utils/dateUtils';

export async function handleCompaniesOperation(
  this: IExecuteFunctions,
  operation: CompaniesOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/companies';
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      responseData = await handleCreateOperation.call(this, resourceEndpoint, { company: body });
      break;
    }

    case 'delete': {
      const companyId = this.getNodeParameter('id', i) as string;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, companyId);
      break;
    }

    case 'get': {
      const companyId = this.getNodeParameter('id', i) as string;
      responseData = await handleGetOperation.call(this, resourceEndpoint, companyId);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      const qs: IDataObject = {
        ...filters,
      };

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
              preset: rangeObj.preset as DateRangePreset,
            },
          });

          qs.updated_at = dateRange || undefined;
        } else {
          qs.updated_at = undefined;
        }
      }

      if (filters.idInIntegration) {
        qs.id_in_integration = filters.idInIntegration;
      }

      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'companies',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'update': {
      const companyId = this.getNodeParameter('id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      const body: IDataObject = {
        company: updateFields,
      };
      responseData = await handleUpdateOperation.call(this, resourceEndpoint, companyId, body);
      break;
    }

    case 'archive': {
      const companyId = this.getNodeParameter('id', i) as string;
      responseData = await handleArchiveOperation.call(this, resourceEndpoint, companyId, true);
      break;
    }

    case 'unarchive': {
      const companyId = this.getNodeParameter('id', i) as string;
      responseData = await handleArchiveOperation.call(this, resourceEndpoint, companyId, false);
      break;
    }

    case 'jump': {
      const integrationSlug = this.getNodeParameter('integrationSlug', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      responseData = await handleCompanyJumpOperation.call(this, integrationSlug, additionalFields);
      break;
    }
  }

  return responseData;
}
