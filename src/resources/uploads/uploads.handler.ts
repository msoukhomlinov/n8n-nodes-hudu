import { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { UploadOperation } from './uploads.types';

export async function handleUploadOperation(
	this: IExecuteFunctions,
	operation: UploadOperation,
	i: number,
): Promise<any> {
	let responseData;

	switch (operation) {
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

			responseData = await huduApiRequest.call(
				this,
				'GET' as IHttpRequestMethods,
				'/uploads',
			);

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