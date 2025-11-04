import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleCreateOperation } from '../../utils/operations';
import type { S3ExportsOperation } from './s3_exports.types';

export async function handleS3ExportsOperation(
  this: IExecuteFunctions,
  operation: S3ExportsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  const resourceEndpoint = '/s3_exports';

  switch (operation) {
    case 'create': {
      // No parameters required; credentials must be configured in Hudu account settings
      return await handleCreateOperation.call(this, resourceEndpoint, {} as IDataObject);
    }
  }

  return {} as IDataObject;
}


