import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { processDateRange, validateCompanyId } from '../../utils/index';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../../utils/operations';
import type { AssetsOperations } from './assets.types';
import type { DateRangePreset } from '../../utils/dateUtils';

export async function handleAssetsOperation(
  this: IExecuteFunctions,
  operation: AssetsOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/companies';
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const name = this.getNodeParameter('name', i) as string;
      const assetLayoutId = this.getNodeParameter('asset_layout_id', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = {
        name,
        asset_layout_id: assetLayoutId,
        ...additionalFields,
      };

      responseData = await handleCreateOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        { asset: body },
      );
      break;
    }

    case 'get': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('asset_id', i) as string;
      responseData = await handleGetOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
      );
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, 25) as number;

      // Validate company_id if provided in filters
      if (filters.company_id) {
        filters.company_id = validateCompanyId(
          filters.company_id,
          this.getNode(),
          'Company ID'
        );
      }

      const qs: IDataObject = {
        ...filters,
      };

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
        '/assets',
        'assets',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'update': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('asset_id', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {
        asset: updateFields,
      };

      responseData = await handleUpdateOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        body,
      );
      break;
    }

    case 'delete': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('asset_id', i) as string;
      responseData = await handleDeleteOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
      );
      break;
    }

    case 'archive': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('asset_id', i) as string;
      responseData = await handleArchiveOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        true,
      );
      break;
    }

    case 'unarchive': {
      const companyId = validateCompanyId(
        this.getNodeParameter('company_id', i),
        this.getNode(),
        'Company ID'
      );
      const assetId = this.getNodeParameter('asset_id', i) as string;
      responseData = await handleArchiveOperation.call(
        this,
        `${resourceEndpoint}/${companyId}/assets`,
        assetId,
        false,
      );
      break;
    }
  }

  return responseData;
}
