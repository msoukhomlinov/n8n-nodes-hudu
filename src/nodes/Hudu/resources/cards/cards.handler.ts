import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { huduApiRequest } from '../../utils/GenericFunctions';
import { CardsOperation, ICardResponse } from './cards.types';

export async function handleCardOperation(
  this: IExecuteFunctions,
  operation: CardsOperation,
  i: number,
): Promise<any> {
  let responseData;

  switch (operation) {
    case 'lookup': {
      const integrationSlug = this.getNodeParameter('integration_slug', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const queryParams: IDataObject = {
        integration_slug: integrationSlug,
        ...additionalFields,
      };

      const response = await huduApiRequest.call(
        this,
        'GET' as IHttpRequestMethods,
        '/cards/lookup',
        undefined,
        queryParams,
      ) as ICardResponse;
      
      return response.integrator_cards || [];
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
        undefined,
        queryParams,
      );
      return responseData;
    }
  }

  return responseData;
}
