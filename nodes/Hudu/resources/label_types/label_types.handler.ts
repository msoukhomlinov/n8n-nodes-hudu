import type { IExecuteFunctions, IDataObject, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
  handleCreateOperation,
  handleGetOperation,
  handleGetAllOperation,
  handleUpdateOperation,
  handleDeleteOperation,
} from '../../utils/operations';
import type { LabelTypesOperation } from './label_types.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

/**
 * Coerce an array of company IDs to positive integers.
 * Rejects malformed values (e.g. "12abc", "12.5") instead of truncating via parseInt.
 */
function normaliseNumberArray(value: unknown, fieldName: string, itemIndex: number, node: INode): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids: number[] = [];
  for (const raw of value) {
    if (raw === '' || raw === null || raw === undefined) {
      continue;
    }

    const candidate = typeof raw === 'string' ? raw.trim() : raw;
    if (candidate === '') {
      continue;
    }

    const num = typeof candidate === 'number' ? candidate : Number(candidate);
    if (!Number.isInteger(num) || num < 1) {
      throw new NodeOperationError(
        node,
        `${fieldName} must contain positive integers only (got ${JSON.stringify(raw)})`,
        { itemIndex },
      );
    }
    ids.push(num);
  }
  return ids;
}

export async function handleLabelTypesOperation(
  this: IExecuteFunctions,
  operation: LabelTypesOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/label_types';
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
      const qs: IDataObject = { ...filters };
      responseData = await handleGetAllOperation.call(
        this,
        resourceEndpoint,
        'label_types',
        qs,
        returnAll,
        limit,
      );
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as string;
      responseData = await handleGetOperation.call(this, resourceEndpoint, id, 'label_type');
      break;
    }

    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const color = this.getNodeParameter('color', i) as string;
      const applicableRecordTypes = this.getNodeParameter(
        'applicable_record_types',
        i,
      ) as string[];
      const accessLevel = this.getNodeParameter('access_level', i, 'all_companies') as string;
      const allowedCompanyIds = normaliseNumberArray(
        this.getNodeParameter('allowed_company_ids', i, []),
        'allowed_company_ids',
        i,
        this.getNode() as unknown as INode,
      );

      if (!Array.isArray(applicableRecordTypes) || applicableRecordTypes.length === 0) {
        throw new NodeOperationError(
          this.getNode() as unknown as INode,
          'applicable_record_types is required and must contain at least one record type',
          { itemIndex: i },
        );
      }

      const body: IDataObject = {
        name,
        color,
        applicable_record_types: applicableRecordTypes,
        access_level: accessLevel,
      };

      if (accessLevel === 'specific_companies') {
        if (allowedCompanyIds.length === 0) {
          throw new NodeOperationError(
            this.getNode() as unknown as INode,
            'allowed_company_ids is required when access_level is "specific_companies"',
            { itemIndex: i },
          );
        }
        body.allowed_company_ids = allowedCompanyIds;
      }

      responseData = await handleCreateOperation.call(this, resourceEndpoint, {
        label_type: body,
      });
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const updateFields = {
        ...(this.getNodeParameter('labelTypeUpdateFields', i, {}) as IDataObject),
      };

      if (Array.isArray(updateFields.allowed_company_ids)) {
        updateFields.allowed_company_ids = normaliseNumberArray(
          updateFields.allowed_company_ids,
          'labelTypeUpdateFields.allowed_company_ids',
          i,
          this.getNode() as unknown as INode,
        );
      }

      if (updateFields.access_level === 'specific_companies') {
        const companies = updateFields.allowed_company_ids as number[] | undefined;
        if (!Array.isArray(companies) || companies.length === 0) {
          throw new NodeOperationError(
            this.getNode() as unknown as INode,
            'labelTypeUpdateFields.allowed_company_ids is required when access_level is "specific_companies"',
            { itemIndex: i },
          );
        }
      } else if (updateFields.access_level === 'all_companies') {
        delete updateFields.allowed_company_ids;
      } else if (!updateFields.access_level) {
        if (
          Array.isArray(updateFields.allowed_company_ids) &&
          (updateFields.allowed_company_ids as number[]).length === 0
        ) {
          delete updateFields.allowed_company_ids;
        }
      }

      if (
        Array.isArray(updateFields.applicable_record_types) &&
        (updateFields.applicable_record_types as string[]).length === 0
      ) {
        delete updateFields.applicable_record_types;
      }

      responseData = await handleUpdateOperation.call(this, resourceEndpoint, id, {
        label_type: updateFields,
      });
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as string;
      responseData = await handleDeleteOperation.call(this, resourceEndpoint, id);
      break;
    }

    default:
      throw new Error(`The operation "${operation}" is not supported!`);
  }

  return responseData;
}
