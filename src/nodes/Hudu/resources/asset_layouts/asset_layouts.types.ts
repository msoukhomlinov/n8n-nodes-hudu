import { IDataObject } from 'n8n-workflow';

export interface IAssetLayoutField extends IDataObject {
  id: number; // The unique identifier for the field
  label: string; // The label of the field
  show_in_list: boolean; // Whether to show this field in the list view
  field_type: string; // The type of the field
  required?: boolean; // Whether the field is required (Can be null)
  hint: string; // Help text for the field
  min?: number; // Minimum value for the field (Can be null)
  max?: number; // Maximum value for the field (Can be null)
  linkable_id: number; // The ID of the linked item
  expiration: boolean; // Whether this field has expiration tracking
  options: string; // Field options
  position: number; // The position of the field in the layout
  is_destroyed: boolean; // Whether this field has been destroyed
}

export interface IAssetLayout extends IDataObject {
  id: number; // The unique identifier for the layout
  slug: string; // The URL slug for the layout
  name: string; // The name of the layout
  icon: string; // The icon for the layout
  color: string; // The color for the layout
  icon_color: string; // The icon color for the layout
  sidebar_folder_id?: number; // The folder ID for the sidebar (Can be null)
  active: boolean; // Whether the layout is active
  include_passwords: boolean; // Whether to include passwords section
  include_photos: boolean; // Whether to include photos section
  include_comments: boolean; // Whether to include comments section
  include_files: boolean; // Whether to include files section
  created_at: string; // When the layout was created (format: date-time)
  updated_at: string; // When the layout was last updated (format: date-time)
  fields: IAssetLayoutField[]; // The fields defined for this layout
}

export interface IAssetLayoutResponse extends IDataObject {
  asset_layout: IAssetLayout;
}

export type AssetLayoutOperation = 'create' | 'get' | 'getAll' | 'update';
