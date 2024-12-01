import { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import { handleListing, huduApiRequest } from '../../utils/GenericFunctions';
import { HUDU_API_CONSTANTS } from '../../utils/constants';
import { RelationOperation } from './relations.types';

export async function handleRelationsOperation(
	this: IExecuteFunctions,
	operation: RelationOperation,
	i: number,
): Promise<any> {
	let responseData;

	switch (operation) {
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const limit = this.getNodeParameter('limit', i, HUDU_API_CONSTANTS.PAGE_SIZE) as number;

			responseData = await handleListing.call(
				this,
				'GET' as IHttpRequestMethods,
				'/relations',
				'relations',
				{},
				{},
				returnAll,
				limit,
			);
			break;
		}

		case 'create': {
			const body = {
				relation: {
					toable_id: this.getNodeParameter('toable_id', i) as number,
					toable_type: this.getNodeParameter('toable_type', i) as string,
					fromable_id: this.getNodeParameter('fromable_id', i) as number,
					fromable_type: this.getNodeParameter('fromable_type', i) as string,
					description: this.getNodeParameter('description', i) as string,
					is_inverse: this.getNodeParameter('is_inverse', i) as boolean,
				},
			};

			responseData = await huduApiRequest.call(
				this,
				'POST' as IHttpRequestMethods,
				'/relations',
				body,
			);
			break;
		}

		case 'delete': {
			const id = this.getNodeParameter('id', i) as number;
			responseData = await huduApiRequest.call(
				this,
				'DELETE' as IHttpRequestMethods,
				`/relations/${id}`,
			);
			break;
		}
	}

	return responseData;
}
