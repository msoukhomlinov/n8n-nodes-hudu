import type { IDataObject } from 'n8n-workflow';
import type { IListItem } from '../lists/lists.types';

export interface IListOptionsResponse extends IDataObject {
  list_options: IListItem[]; // The list items to display as options
}

export type ListOptionsOperation = 'get' | 'create' | 'update' | 'delete'; 