import { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import { handleListing } from '../../utils/GenericFunctions';
import { PublicPhotoOperation } from './public_photos.types';

export async function handlePublicPhotoOperation(
  this: IExecuteFunctions,
  operation: PublicPhotoOperation,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
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
  }

  return responseData;
}
