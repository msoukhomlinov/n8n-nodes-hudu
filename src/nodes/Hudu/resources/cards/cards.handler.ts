import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
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
      
      const integrationId = additionalFields.integration_id as string | undefined;
      const integrationIdentifier = additionalFields.integration_identifier as string | undefined;
      
      if (!integrationId && !integrationIdentifier) {
        throw new NodeOperationError(
          this.getNode(),
          'Either Integration ID or Integration Identifier must be provided for the Jump operation.',
          { itemIndex: i },
        );
      }
      
      return handleCardJumpOperation.call(this, integrationType, integrationSlug, additionalFields);
    }

    default:
      return {};
  }
}
