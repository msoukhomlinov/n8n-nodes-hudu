import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { handleListing, huduApiRequest } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { UserOperation } from './users.types';

export async function handleUserOperation(
	this: IExecuteFunctions,
	operation: UserOperation,
	i: number,
): Promise<any> {
	let responseData;

	switch (operation) {
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

			responseData = await handleListing.call(
				this,
				'GET' as IHttpRequestMethods,
				'/users',
				'users',
				{},
				filters,
				returnAll,
				limit,
			);
			break;
		}

		case 'get': {
			const id = this.getNodeParameter('id', i) as number;
			responseData = await huduApiRequest.call(this, 'GET' as IHttpRequestMethods, `/users/${id}`);
			break;
		}
	}

	return responseData;
}
