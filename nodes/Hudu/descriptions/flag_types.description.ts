import type { INodeProperties } from 'n8n-workflow';
import { createWrapResultsField } from './resources';
import { FLAG_COLOR_OPTIONS } from '../utils/constants';

export const flagTypesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['flag_types'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a flag type',
        action: 'Create a flag type',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a flag type',
        action: 'Delete a flag type',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a flag type',
        action: 'Get a flag type',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many flag types',
        action: 'Get many flag types',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a flag type',
        action: 'Update a flag type',
      },
    ],
    default: 'getAll',
  },
];

export const flagTypesFields: INodeProperties[] = [
  {
    displayName: 'Flag Type ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['flag_types'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    description: 'ID of the flag type',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['flag_types'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Name of the flag type',
  },
  {
    displayName: 'Color',
    name: 'color',
    type: 'options',
    options: [...FLAG_COLOR_OPTIONS],
    required: true,
    displayOptions: {
      show: {
        resource: ['flag_types'],
        operation: ['create'],
      },
    },
    default: 'Red',
    description: 'Color of the flag type',
  },
  {
    displayName: 'Flag Type Update Fields',
    name: 'flagTypeUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['flag_types'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'options',
        options: [...FLAG_COLOR_OPTIONS],
        default: 'Red',
        description: 'Color of the flag type',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name of the flag type',
      },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['flag_types'],
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
    typeOptions: {
      minValue: 1,
    },
    displayOptions: {
      show: {
        resource: ['flag_types'],
        operation: ['getAll'],
        returnAll: [false],
      },
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
        resource: ['flag_types'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'options',
        options: [...FLAG_COLOR_OPTIONS],
        default: 'Red',
        description: 'Filter by color',
      },
      {
        displayName: 'Created At',
        name: 'created_at',
        type: 'dateTime',
        default: '',
        description: 'Filter by creation date (YYYY-MM-DD or ISO datetime)',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by exact flag type name',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter by exact slug value',
      },
      {
        displayName: 'Updated At',
        name: 'updated_at',
        type: 'dateTime',
        default: '',
        description: 'Filter by update date (YYYY-MM-DD or ISO datetime)',
      },
    ],
  },
  createWrapResultsField('flag_types'),
];
