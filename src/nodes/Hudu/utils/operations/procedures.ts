import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';

export async function handleProcedureCreateFromTemplateOperation(
  this: IExecuteFunctions,
  templateId: string,
  additionalFields: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
  return await huduApiRequest.call(
    this,
    'POST',
    `/procedures/${templateId}/create_from_template`,
    additionalFields,
  );
}

export async function handleProcedureDuplicateOperation(
  this: IExecuteFunctions,
  procedureId: string,
  companyId: number,
  additionalFields: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
  const body: IDataObject = {
    company_id: companyId,
    ...additionalFields,
  };

  return await huduApiRequest.call(
    this,
    'POST',
    `/procedures/${procedureId}/duplicate`,
    body,
  );
}

export async function handleProcedureKickoffOperation(
  this: IExecuteFunctions,
  procedureId: string,
  additionalFields: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  const qs: IDataObject = {};

  if (additionalFields.asset_id) {
    qs.asset_id = additionalFields.asset_id;
  }

  if (additionalFields.name) {
    qs.name = additionalFields.name;
  }

  return await huduApiRequest.call(
    this,
    'POST',
    `/procedures/${procedureId}/kickoff`,
    {},
    qs,
  );
} 