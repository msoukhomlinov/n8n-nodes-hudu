import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { huduApiRequest } from '../requestUtils';
import { coercePositiveInt } from '../validation';
import { DEBUG_CONFIG, debugLog } from '../debugConfig';

export async function handleArchiveOperation(
  this: IExecuteFunctions,
  resourceEndpoint: string,
  id: string | number,
  archive = true,
  companyId?: string | number,
): Promise<IDataObject | IDataObject[]> {
  if (DEBUG_CONFIG.OPERATION_ARCHIVE) {
    debugLog('Archive Operation - Input', {
      endpoint: resourceEndpoint,
      id,
      companyId,
      action: archive ? 'archive' : 'unarchive',
    });
  }

  const recordId = coercePositiveInt(id, this.getNode());
  const action = archive ? 'archive' : 'unarchive';
  const endpoint = companyId
    ? `/companies/${coercePositiveInt(companyId, this.getNode(), 'Company ID')}${resourceEndpoint}/${recordId}/${action}`
    : `${resourceEndpoint}/${recordId}/${action}`;

  const response = await huduApiRequest.call(
    this,
    'PUT',
    endpoint,
  );

  if (DEBUG_CONFIG.OPERATION_ARCHIVE) {
    debugLog('Archive Operation - Response', response);
  }

  return response;
} 