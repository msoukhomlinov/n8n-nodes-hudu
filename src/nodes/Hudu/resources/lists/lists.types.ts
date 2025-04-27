import type { IDataObject } from 'n8n-workflow';

export interface IListItem extends IDataObject {
  id?: number; // The unique ID of the list item
  name: string; // The name of the list item
  _destroy?: boolean; // Used for marking item for deletion in update
}

export interface IList extends IDataObject {
  id: number; // The unique ID of the list
  name: string; // The name of the list
  list_items: IListItem[]; // The items in the list
  created_at?: string; // The date and time when the list was created
  updated_at?: string; // The date and time when the list was last updated
}

export interface IListResponse extends IDataObject {
  list: IList;
}

export type ListsOperation =
  | 'create'
  | 'get'
  | 'getAll'
  | 'update'
  | 'delete'; 