import type { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import type { UploadOperation } from './uploads.types';

export async function handleUploadOperation(
  this: IExecuteFunctions,
  operation: UploadOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const binaryPropertyName = this.getNodeParameter('file', i) as string;
      const uploadableType = this.getNodeParameter('uploadable_type', i) as string;
      const uploadableId = this.getNodeParameter('uploadable_id', i) as number;

      const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
      const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

      const formData: IDataObject = {
        file: {
          value: fileBuffer,
          options: {
            filename: binaryData.fileName || 'file',
            contentType: binaryData.mimeType || 'application/octet-stream',
          },
        },
        'upload[uploadable_id]': uploadableId,
        'upload[uploadable_type]': uploadableType,
      } as unknown as IDataObject;

      (formData as any)._isMultipart = true;

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/uploads',
        formData,
      );
      break;
    }
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

      const response = await huduApiRequest.call(this, 'GET' as IHttpRequestMethods, '/uploads');
      responseData = Array.isArray(response) ? response : [response];

      if (!returnAll && responseData.length > limit) {
        responseData = responseData.slice(0, limit);
      }
      break;
    }

    case 'get': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        `/uploads/${id}`,
      );
      break;
    }

    case 'delete': {
      const id = this.getNodeParameter('id', i) as number;
      responseData = await huduApiRequest.call(
        this,
        'DELETE' as IHttpRequestMethods,
        `/uploads/${id}`,
      );
      break;
    }
  }

  return responseData;
}
