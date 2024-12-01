import { IDataObject } from 'n8n-workflow';

export interface IArticles extends IDataObject {
	id: number;                    // The unique ID of the article
	name: string;                  // The name of the article
	content: string;               // The HTML content of the article
	slug: string;                  // The url slug of the article
	draft: boolean;                // A flag that signifies if the article is a draft
	url: string;                   // The url of the article
	object_type: string;           // The object type is Article
	folder_id?: number;            // The unique folder ID where the article lives
	enable_sharing: boolean;       // A flag that signifies if the article is shareable
	share_url?: string;            // A url for shareable articles
	company_id?: number;           // The unique company ID for non-global articles
	created_at?: string;           // The date and time when the article was created
	updated_at?: string;           // The date and time when the article was last updated
	public_photos?: string[];      // A list of public photos
}

export interface IArticlesResponse extends IDataObject {
	article: IArticles;
}

export type ArticlesOperation =
	| 'create'
	| 'get'
	| 'getAll'
	| 'update'
	| 'delete'
	| 'archive'
	| 'unarchive'; 