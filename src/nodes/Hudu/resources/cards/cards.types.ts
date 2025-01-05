import type { IDataObject } from 'n8n-workflow';
import type { INTEGRATION_SLUGS } from '../../utils/constants';

export interface ICard extends IDataObject {
  integration_slug: string;
  integration_id?: string;
  integration_identifier?: string;
  integration_type?: string;
}

export interface ICardResponse extends IDataObject {
  integrator_cards: ICard[];
}

export type CardsOperation =
  | 'lookup' // List first as it's the default operation
  | 'jump';

export interface ICardsJumpParams {
  integration_id?: string;
  integration_identifier?: string;
  integration_slug: (typeof INTEGRATION_SLUGS)[number];
  integration_type: string;
}

export interface ICardsLookupParams {
  integration_id?: string;
  integration_identifier?: string;
  integration_slug: (typeof INTEGRATION_SLUGS)[number];
  integration_type: string;
}
