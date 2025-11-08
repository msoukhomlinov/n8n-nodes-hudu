import type { INodeProperties } from 'n8n-workflow';

export const groupsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['groups'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get group',
        action: 'Get group',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many groups',
        action: 'Get many groups',
      },
    ],
    default: 'getAll',
  },
];

export const groupsFields: INodeProperties[] = [
  // Identifier Type toggle for get operation
  {
    displayName: 'Identifier Type',
    name: 'identifierType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['groups'],
        operation: ['get'],
      },
    },
    options: [
      {
        name: 'ID',
        value: 'id',
        description: 'Use numeric group ID',
      },
      {
        name: 'Slug',
        value: 'slug',
        description: 'Use group URL slug',
      },
    ],
    default: 'id',
    description: 'Whether to retrieve the group by numeric ID or slug identifier',
  },
  {
    displayName: 'Group ID',
    name: 'groupId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['groups'],
        operation: ['get'],
      },
    },
    default: '',
    description: 'The unique ID or slug of the group',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['groups'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['groups'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    default: 50,
    description: 'Max number of results to return',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['groups'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter groups by name',
      },
      {
        displayName: 'Default',
        name: 'default',
        type: 'boolean',
        default: false,
        description: 'Whether the group is the default group',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search across group names',
      },
    ],
  },
];


