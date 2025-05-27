import type {
  IExecuteFunctions,
  IDataObject,
  IHttpRequestMethods,
} from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils';
import type { PublicPhotoOperation, IPublicPhoto } from './public_photos.types';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { NodeOperationError } from 'n8n-workflow';

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
      if (filter && Array.isArray(filter.criteria) && filter.criteria.length > 0) {
        const criteria = filter.criteria[0] as IDataObject;
        recordTypeFilter = (criteria.record_type_filter as string) || '';
        recordIdFilter = criteria.record_id_filter !== undefined ? (criteria.record_id_filter as number) : null;
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
      const photoId = this.getNodeParameter('id', i) as number;
      if (photoId === undefined || photoId === null) {
        throw new NodeOperationError(this.getNode(), 'Photo ID is required for the Get operation.');
      }

      // Efficiently fetch pages of public photos and search for the requested ID
      const pageSize = HUDU_API_CONSTANTS.PAGE_SIZE;
      let page = 1;
      let foundPhoto: IPublicPhoto | undefined;
      let hasMore = true;

      while (hasMore && !foundPhoto) {
        // Fetch the current page
        const queryParams = { page, page_size: pageSize };
        const batch = await huduApiRequest.call(
          this,
          'GET' as IHttpRequestMethods,
          '/public_photos',
          {},
          queryParams,
          'public_photos',
        ) as IPublicPhoto[];

        if (Array.isArray(batch) && batch.length > 0) {
          foundPhoto = batch.find(photo => photo.id === photoId);
          // If found, break early
          if (foundPhoto) {
            break;
          }
          // If batch is less than pageSize, this is the last page
          hasMore = batch.length === pageSize;
          page++;
        } else {
          // No more results
          hasMore = false;
        }
      }

      if (!foundPhoto) {
        throw new NodeOperationError(this.getNode(), `Public photo with ID "${photoId}" not found.`);
      }
      responseData = foundPhoto;
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('id', i) as number;
      const formData = {
        record_type: this.getNodeParameter('record_type', i) as string,
        record_id: this.getNodeParameter('record_id', i) as number,
      };

      responseData = await huduApiRequest.call(
        this,
        'PUT' as IHttpRequestMethods,
        `/public_photos/${id}`,
        { public_photo: formData },
      );
      break;
    }
  }

  return responseData;
}
