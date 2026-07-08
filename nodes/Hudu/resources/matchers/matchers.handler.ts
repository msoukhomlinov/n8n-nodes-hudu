import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleUpdateOperation, handleDeleteOperation } from '../../utils/operations';
import { handleMatcherGetAllOperation } from '../../utils/operations/matchers';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { resolveRequiredCompanyId } from '../../utils';
import type { MatcherOperation } from './matchers.types';

export async function handleMatcherOperation(
  this: IExecuteFunctions,
  operation: MatcherOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/matchers';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
      const integrationId = this.getNodeParameter('integrationId', i) as number;

      responseData = await handleMatcherGetAllOperation.call(
        this,
        integrationId,
        filters,
        returnAll,
        limit,
      );
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const updateFields = this.getNodeParameter('matcherUpdateFields', i) as IDataObject;

      // Build the request body with only defined fields
      const matcherUpdate: IDataObject = {};

      if (
        updateFields.company_id !== undefined &&
        updateFields.company_id !== null &&
        updateFields.company_id !== ''
      ) {
        matcherUpdate.company_id = await resolveRequiredCompanyId(
          this,
          updateFields.company_id,
          this.getNode(),
          'Company ID',
        );
      }
      if (
        updateFields.potential_company_id !== undefined &&
        updateFields.potential_company_id !== null &&
        updateFields.potential_company_id !== ''
      ) {
        matcherUpdate.potential_company_id = await resolveRequiredCompanyId(
          this,
          updateFields.potential_company_id,
          this.getNode(),
          'Potential Company ID',
        );
      }
      if (updateFields.sync_id !== undefined) {
        matcherUpdate.sync_id = String(updateFields.sync_id);
      }
      if (updateFields.identifier !== undefined) {
        matcherUpdate.identifier = updateFields.identifier;
      }

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, { matcher: matcherUpdate });
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
      break;
    }
  }

  return responseData;
}
