import { IDataObject } from 'n8n-workflow';

export interface IPublicPhoto extends IDataObject {
  id: number; // The ID of the public photo
  url: string; // The URL of the public photo
  record_type: string; // The type of record the public photo is associated with (e.g., Article)
  record_id: number; // The ID of the record the public photo is associated with
}

export interface IPublicPhotoResponse extends IDataObject {
  public_photo: IPublicPhoto;
}

export type PublicPhotoOperation = 'getAll' | 'create' | 'update';
