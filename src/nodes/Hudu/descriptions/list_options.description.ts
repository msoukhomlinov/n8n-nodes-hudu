import type { INodeProperties } from 'n8n-workflow';

export const listOptionsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['list_options'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new list item',
        action: 'Create a list item',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a list item',
        action: 'Delete a list item',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get list items for a specific list',
        action: 'Get list items',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a list item',
        action: 'Update a list item',
      },
    ],
    default: 'get',
  },
];

export const listOptionsFields: INodeProperties[] = [
  // List ID for all operations
  {
    displayName: 'List Name or ID',
    name: 'list_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getLists',
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['list_options'],
        operation: ['get', 'create', 'update', 'delete'],
      },
    },
    default: '',
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  
  // Item ID for update and delete
  {
    displayName: 'List Item ID',
    name: 'item_id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['list_options'],
        operation: ['update', 'delete'],
      },
    },
    default: 0,
    description: 'The ID of the list item',
  },
  
  // Name for create and update
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['list_options'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'The name of the list item',
  },
]; 