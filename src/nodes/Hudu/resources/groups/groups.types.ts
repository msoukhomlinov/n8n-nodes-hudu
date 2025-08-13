import type { IDataObject } from 'n8n-workflow';

export interface GroupMember extends IDataObject {
  id: number;
  email?: string;
  name?: string;
}

export interface Group extends IDataObject {
  id: number;
  name: string;
  default?: boolean;
  members?: GroupMember[];
}

export type GroupsOperation = 'getAll' | 'get';


