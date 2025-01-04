import { IDataObject } from 'n8n-workflow';

interface IAssetField extends IDataObject {
  id: number; // The identifier of the field
  value: string; // The value stored in the field
  label: string; // The label of the field
  position: number; // The position of the field in the asset's layout
}

export interface IAsset extends IDataObject {
  id: number; // The unique identifier of the asset
  company_id: number; // The identifier of the company to which the asset belongs
  asset_layout_id: number; // The identifier of the asset layout associated with the asset
  slug: string; // The URL slug used to identify the asset
  name: string; // The name of the asset
  primary_serial?: string; // The primary serial number of the asset (if available)
  primary_mail?: string; // The primary email associated with the asset (if available)
  primary_model?: string; // The primary model of the asset (if available)
  primary_manufacturer?: string; // The primary manufacturer of the asset (if available)
  company_name: string; // The name of the company to which the asset belongs
  object_type: string; // The type of object the asset represents
  asset_type: string; // The category of the asset
  archived: boolean; // Indicates whether the asset is archived or not
  url: string; // The URL of the asset page
  created_at?: string; // The date and time when the asset was created (format: date-time)
  updated_at?: string; // The date and time when the asset was last updated (format: date-time)
  fields: IAssetField[]; // A list of fields associated with the asset
  cards?: IDataObject[]; // A list of cards associated with the asset (if available)
}

export interface IAssetResponse extends IDataObject {
  assets: IAsset[];
}

export type AssetsOperations =
  | 'create'
  | 'get'
  | 'getAll'
  | 'update'
  | 'delete'
  | 'archive'
  | 'unarchive';
