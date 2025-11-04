import type { IDataObject } from 'n8n-workflow';

export interface IMagicDash extends IDataObject {
  id: number; // The unique identifier for the MagicDash item (required)
  title: string; // The title of the MagicDash item (required)
  message: string; // The primary content to be displayed on the MagicDash item (required)
  company_id: number; // The unique identifier of the associated company (required)
  company_name: string; // The name of the associated company (required)
  shade?: string; // An optional color for the MagicDash item to represent different contextual states (can be null)
  content_link?: string; // A link to an external website associated with the MagicDash item's content (can be null)
  content?: string; // HTML content (tables, images, videos, etc.) to be displayed in the MagicDash item (can be null)
  icon?: string; // A FontAwesome icon for the header of the MagicDash item (can be null)
  image_url?: string; // A URL for an image to be used in the header of the MagicDash item (can be null)
}

export type IMagicDashResponse = IMagicDash[];

export type MagicDashOperation =
  | 'getAll'
  | 'get'
  | 'createOrUpdate'
  | 'deleteById'
  | 'deleteByTitle';
