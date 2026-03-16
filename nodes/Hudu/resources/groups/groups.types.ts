import type { IDataObject } from 'n8n-workflow';

export interface GroupMember extends IDataObject {
  id: number; // The unique identifier of the user
  first_name: string; // The first name of the user
  last_name: string; // The last name of the user
  email: string; // The email address of the user
  security_level: string; // Security level assigned to the user
  slug: string; // A slug representing the user
}

export interface Group extends IDataObject {
  id: number; // The unique identifier of the group
  name: string; // The name of the group
  slug: string; // A slug representing the group
  url: string; // The URL to view the group in the web interface
  default: boolean; // Indicates if this is the default group for new users
  created_at: string; // The timestamp when the group was created
  updated_at: string; // The timestamp of the last group update
  member_count: number; // The number of members in the group (excludes admins and super admins)
  members: GroupMember[]; // List of group members (excludes admins and super admins)
}

export type GroupsOperation = 'getAll' | 'get';


