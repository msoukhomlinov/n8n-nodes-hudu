import type { IExecuteFunctions } from 'n8n-core';
import type { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils';
import type { PublicPhotoOperation } from './public_photos.types';

export async function handlePublicPhotoOperation(
  this: IExecuteFunctions,
  operation: PublicPhotoOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const formData = {
        photo: this.getNodeParameter('photo', i) as string,
        record_type: this.getNodeParameter('record_type', i) as string,
        record_id: this.getNodeParameter('record_id', i) as number,
      };

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
      const limit = this.getNodeParameter('limit', i, 25) as number;

      responseData = await handleListing.call(
        this,
        'GET' as IHttpRequestMethods,
        '/public_photos',
        'public_photos',
        {},
        {},
        returnAll,
        limit,
      );
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
