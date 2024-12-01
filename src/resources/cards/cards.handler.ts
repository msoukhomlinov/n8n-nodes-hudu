import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest, handleListing } from '../../utils/GenericFunctions';
import { CardsOperation } from './cards.types';

export async function handleCardsOperation(
	this: IExecuteFunctions,
	operation: CardsOperation,
	i: number,
): Promise<any> {
	let responseData;

	switch (operation) {
		case 'lookup': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const integrationSlug = this.getNodeParameter('integration_slug', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
			const limit = this.getNodeParameter('limit', i, 25) as number;

			const queryParams: IDataObject = {
				integration_slug: integrationSlug,
				...additionalFields,
			};

			responseData = await handleListing.call(
				this,
				'GET' as IHttpRequestMethods,
				'/cards/lookup',
				'integrator_cards',
				{},
				queryParams,
				returnAll,
				limit,
			);
			break;
		}

		case 'jump': {
			const integrationType = this.getNodeParameter('integration_type', i) as string;
			const integrationSlug = this.getNodeParameter('integration_slug', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const queryParams: IDataObject = {
				integration_type: integrationType,
				integration_slug: integrationSlug,
				...additionalFields,
			};

			responseData = await huduApiRequest.call(
				this,
				'GET' as IHttpRequestMethods,
				'/cards/jump',
				{},
				queryParams,
			);
			break;
		}
	}

	return responseData;
}
