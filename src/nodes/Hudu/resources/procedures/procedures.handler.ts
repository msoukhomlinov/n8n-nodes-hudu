import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { processDateRange, validateCompanyId } from '../../utils/index';
import {
  handleGetAllOperation,
  handleGetOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import { handleProcedureKickoffOperation } from '../../utils/operations/procedures';
import { huduApiRequest } from '../../utils/requestUtils';
import type { ProceduresOperations } from './procedures.types';
import type { DateRangePreset } from '../../utils/dateUtils';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handleProceduresOperation(
  this: IExecuteFunctions,
  operation: ProceduresOperations,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/procedures';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      // Validate company_id if provided
      if (additionalFields.company_id) {
        additionalFields.company_id = validateCompanyId(
          additionalFields.company_id,
          this.getNode(),
          'Company ID'
        );
      }

      const body: IDataObject = {
        name,
        ...additionalFields,
      };

      responseData = await handleCreateOperation.call(this, resourceEndpoint, body);
      break;
    }

    case 'get': {
      const procedureId = this.getNodeParameter('procedureId', i) as string;
      const identifierType = this.getNodeParameter('identifierType', i, 'id') as string;

      if (identifierType === 'slug') {
        // Use getAll with slug filter for slug-based retrieval
        const procedures = await handleGetAllOperation.call(
          this,
          resourceEndpoint,
          'procedures',
          { slug: procedureId },
          false, // returnAll
          1,     // limit to 1 for efficiency
        ) as IDataObject[];

        if (procedures.length === 0) {
          throw new NodeOperationError(
            this.getNode(),
            `Procedure with slug "${procedureId}" not found`,
            { itemIndex: i },
          );
        }

        if (procedures.length > 1) {
          // Should not happen if slugs are unique, but handle gracefully
          throw new NodeOperationError(
            this.getNode(),
            `Multiple procedures found with slug "${procedureId}" (expected unique)`,
            { itemIndex: i },
          );
        }

        responseData = procedures[0];
      } else {
        // Use existing handleGetOperation for ID-based retrieval
        responseData = await handleGetOperation.call(this, resourceEndpoint, procedureId, 'procedure');
      }
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

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
        resourceEndpoint,
        'procedures',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'update': {
      const procedureId = this.getNodeParameter('procedureId', i) as string;
      const updateFields = this.getNodeParameter('procedureUpdateFields', i) as IDataObject;

      // Validate company_id if provided
      if (updateFields.company_id) {
        updateFields.company_id = validateCompanyId(
          updateFields.company_id,
          this.getNode(),
          'Company ID'
        );
      }

      const body: IDataObject = updateFields;

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, procedureId, body);
      break;
    }

    case 'delete': {
      const procedureId = this.getNodeParameter('procedureId', i) as string;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, procedureId);
      break;
    }

    

    case 'createFromTemplate': {
      const templateId = this.getNodeParameter('template_id', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const qs: IDataObject = {};

      // Validate and add company_id if provided
      if (additionalFields.company_id) {
        qs.company_id = validateCompanyId(
          additionalFields.company_id,
          this.getNode(),
          'Company ID'
        );
      }

      // Add name if provided
      if (additionalFields.name) {
        qs.name = additionalFields.name as string;
      }

      // Add description if provided
      if (additionalFields.description) {
        qs.description = additionalFields.description as string;
      }

      responseData = await huduApiRequest.call(
        this,
        'POST',
        `${resourceEndpoint}/${templateId}/create_from_template`,
        {},
        qs,
        'procedure',
      );
      break;
    }

    case 'duplicate': {
      const procedureId = this.getNodeParameter('id', i) as string;
      const companyId = validateCompanyId(
        this.getNodeParameter('companyId', i),
        this.getNode(),
        'Company ID'
      );
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const qs: IDataObject = {
        company_id: companyId,
      };

      // Add name if provided
      if (additionalFields.name) {
        qs.name = additionalFields.name as string;
      }

      // Add description if provided
      if (additionalFields.description) {
        qs.description = additionalFields.description as string;
      }

      responseData = await huduApiRequest.call(
        this,
        'POST',
        `${resourceEndpoint}/${procedureId}/duplicate`,
        {},
        qs,
        'procedure',
      );
      break;
    }

    case 'kickoff': {
      const procedureId = this.getNodeParameter('id', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      responseData = await handleProcedureKickoffOperation.call(this, procedureId, additionalFields);
      break;
    }
  }

  return responseData;
}
