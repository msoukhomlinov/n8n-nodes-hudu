import { IDataObject } from 'n8n-workflow';

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
