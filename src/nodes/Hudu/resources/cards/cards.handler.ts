import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { handleCardLookupOperation, handleCardJumpOperation } from '../../utils/operations/cards';
import type { CardsOperation } from './cards.types';

export async function handleCardOperation(
  this: IExecuteFunctions,
  operation: CardsOperation,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  switch (operation) {
    case 'lookup': {
      const integrationSlug = this.getNodeParameter('integration_slug', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      return handleCardLookupOperation.call(this, integrationSlug, additionalFields);
    }

    case 'jump': {
      const integrationType = this.getNodeParameter('integration_type', i) as string;
      const integrationSlug = this.getNodeParameter('integration_slug', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      return handleCardJumpOperation.call(this, integrationType, integrationSlug, additionalFields);
    }

    default:
      return {};
  }
}
