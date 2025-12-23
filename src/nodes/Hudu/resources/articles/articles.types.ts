import type { IDataObject } from 'n8n-workflow';
import type { FilterMapping } from '../../utils/index';

export interface IArticles extends IDataObject {
  id: number; // The unique ID of the article
  name: string; // The name of the article
  content: string; // The HTML content of the article
  slug: string; // The url slug of the article
  draft: boolean; // A flag that signifies if the article is a draft
  url: string; // The url of the article
  object_type: string; // The object type is Article
  folder_id?: number; // The unique folder ID where the article lives
  enable_sharing: boolean; // A flag that signifies if the article is shareable
  share_url?: string; // A url for shareable articles
  company_id?: number; // The unique company ID for non-global articles
  created_at?: string; // The date and time when the article was created
  updated_at?: string; // The date and time when the article was last updated
  public_photos?: string[]; // A list of public photos
  // Node-level enrichment fields (not part of raw Hudu API response)
  folder_id_label?: string; // Resolved folder name for folder_id
  folder_description?: string; // Resolved folder description for folder_id
  folder_path?: string; // Resolved folder path using folder getPath logic
}

export interface IArticlesResponse extends IDataObject {
  article: IArticles;
}

export type ArticlesOperation =
  | 'archive'
  | 'create'
  | 'delete'
  | 'get'
  | 'getAll'
  | 'getVersionHistory'
  | 'unarchive'
  | 'update';

export interface IArticlePostProcessFilters extends IDataObject {
  folder_id?: number;
}

// Define how each filter should be applied
export const articleFilterMapping: FilterMapping<IArticlePostProcessFilters> = {
  folder_id: (item: IDataObject, value: unknown) => {
    return Number(item.folder_id) === Number(value);
  },
};
