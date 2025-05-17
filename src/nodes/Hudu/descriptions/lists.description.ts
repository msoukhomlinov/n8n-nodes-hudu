import type { INodeProperties } from 'n8n-workflow';

export const listsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['lists'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new list',
        action: 'Create a list',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a list',
        action: 'Delete a list',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific list',
        action: 'Get a list',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many lists',
        action: 'Get many lists',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a list',
        action: 'Update a list',
      },
    ],
    default: 'getAll',
  },
];

export const listsFields: INodeProperties[] = [
  // List ID for get, update, delete
  {
    displayName: 'List Name or ID',
    name: 'id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getLists',
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: '',
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  // Name for create
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the list',
  },
  // Name for update
  {
    displayName: 'Name',
    name: 'updateFields.name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['update'],
      },
    },
    default: '',
    description: 'The new name of the list',
  },
  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        default: '',
        description: 'Search lists by name (partial match)',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by exact list name',
      },
    ],
    description: 'Filters to apply when retrieving lists',
  },
  // Return all toggle for getAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to return all results or limit by a set number',
  },
  // Limit for getAll
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
    },
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    default: 50,
    description: 'Max number of results to return',
  },
]; 