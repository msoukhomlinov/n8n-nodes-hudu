import type {
  IExecuteFunctions,
  IDataObject,
  IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { huduApiRequest, handleListing, handleBinaryDownload } from '../../utils';
import type { PublicPhotoOperation, IPublicPhoto } from './public_photos.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';

export async function handlePublicPhotoOperation(
  this: IExecuteFunctions,
  operation: PublicPhotoOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      // Get the binary property name from the parameter (default: 'data')
      const binaryPropertyName = this.getNodeParameter('photo', i) as string;
      const recordType = this.getNodeParameter('record_type', i) as string;
      const recordId = this.getNodeParameter('record_id', i) as number;

      // Extract binary data from the item
      const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
      const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

      // Prepare form data for multipart upload
      const formData = {
        photo: {
          value: fileBuffer,
          options: {
            filename: binaryData.fileName || 'photo',
            contentType: binaryData.mimeType || 'application/octet-stream',
          },
        },
        record_type: recordType,
        record_id: recordId,
      };

      // Signal multipart upload to the request utility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (formData as any)._isMultipart = true;

      responseData = await huduApiRequest.call(
        this,
        'POST' as IHttpRequestMethods,
        '/public_photos',
        formData,
      );
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;
      const filter = this.getNodeParameter('filter', i, {}) as IDataObject;
      let recordTypeFilter = '';
      let recordIdFilter: number | null = null;
      const criteria = filter?.criteria as IDataObject | undefined;
      if (criteria) {
        recordTypeFilter = (criteria.record_type_filter as string) || '';
        recordIdFilter = criteria.record_id_filter != null ? (criteria.record_id_filter as number) : null;
      }

      let photos = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/public_photos',
        'public_photos',
        {},
        {},
        returnAll,
        limit,
      ) as IPublicPhoto[];

      if (recordTypeFilter) {
        photos = photos.filter(photo => photo.record_type === recordTypeFilter);
      }

      if (recordIdFilter !== null) {
        photos = photos.filter(photo => photo.record_id === recordIdFilter);
      }

      responseData = photos;
      break;
    }

    case 'get': {
      const photoId = this.getNodeParameter('id', i) as string;
      const download = this.getNodeParameter('download', i, false) as boolean;

      if (download) {
        responseData = await handleBinaryDownload.call(
          this,
          `/public_photos/${photoId}`,
          'data',
          i,
        );
      } else {
        responseData = await huduApiRequest.call(
          this,
          'GET' as IHttpRequestMethods,
          `/public_photos/${photoId}`,
        );
        if (
          responseData === null ||
          responseData === undefined ||
          (typeof responseData === 'object' && !Array.isArray(responseData) && Object.keys(responseData).length === 0)
        ) {
          throw new NodeOperationError(
            this.getNode(),
            `Public photo with ID "${photoId}" not found.`,
          );
        }
      }
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as string;
      const formData: IDataObject = {
        record_type: this.getNodeParameter('record_type', i) as string,
        record_id: this.getNodeParameter('record_id', i) as number,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (formData as any)._isMultipart = true;

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/public_photos/${id}`,
        formData,
      );
      break;
    }
  }

  return responseData;
}
