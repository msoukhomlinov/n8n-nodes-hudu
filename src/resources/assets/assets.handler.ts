import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { handleListing } from '../../utils/GenericFunctions';
import { AssetsOperations } from './assets.types';

export async function handleAssetsOperation(
	this: IExecuteFunctions,
	operation: AssetsOperations,
	i: number,
): Promise<any> {
	let responseData;

	switch (operation) {
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const limit = this.getNodeParameter('limit', i, 25) as number;

			responseData = await handleListing.call(
				this,
				'GET' as IHttpRequestMethods,
				'/assets',
				'assets',
				{},
				filters,
				returnAll,
				limit,
			);
			break;
		}
	}

	return responseData;
} 