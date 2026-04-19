import type { IDataObject } from 'n8n-workflow';
import type { FilterMapping } from '../../utils';

export interface IPublicPhoto extends IDataObject {
  id: string; // Slug-based ID returned in API responses (use numeric_id for path params)
  numeric_id: number; // Original numeric ID — use this for GET/update/delete path parameters
  url: string; // The URL of the public photo
  record_type: string; // The type of record the public photo is associated with (e.g., Article)
  record_id: number; // The ID of the record the public photo is associated with
  file_name?: string; // Original filename of the photo
  file_size?: number; // Size of the photo file in bytes
}

export interface IPublicPhotoResponse extends IDataObject {
  public_photo: IPublicPhoto;
}

export type PublicPhotoOperation = 'getAll' | 'create' | 'update' | 'get';

export const publicPhotoFilterMapping: FilterMapping<Record<string, unknown>> = {
  record_type: (item: IDataObject, value: unknown) =>
    typeof value === 'string' &&
    typeof item.record_type === 'string' &&
    item.record_type === value,
  record_id: (item: IDataObject, value: unknown) =>
    Number(item.record_id) === Number(value),
};
