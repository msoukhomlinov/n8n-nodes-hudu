import type { INodeProperties } from 'n8n-workflow';
import { createWrapResultsField } from './resources';
import { FLAGABLE_TYPE_OPTIONS } from '../utils/constants';

export const flagsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['flags'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Apply a flag to a record',
        action: 'Create a flag',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a flag',
        action: 'Delete a flag',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a flag',
        action: 'Get a flag',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many flags',
        action: 'Get many flags',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a flag',
        action: 'Update a flag',
      },
    ],
    default: 'getAll',
  },
];

export const flagsFields: INodeProperties[] = [
  {
    displayName: 'Flag ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['flags'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    description: 'ID of the flag',
  },
  {
    displayName: 'Flag Type Name or ID',
    name: 'flag_type_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getFlagTypes',
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['flags'],
        operation: ['create'],
      },
    },
    default: '',
    description:
      'Flag type to apply. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Flagable Type',
    name: 'flagable_type',
    type: 'options',
    options: [...FLAGABLE_TYPE_OPTIONS],
    required: true,
    displayOptions: {
      show: {
        resource: ['flags'],
        operation: ['create'],
      },
    },
    default: 'Asset',
    description: 'The type of record being flagged',
  },
  {
    displayName: 'Flagable ID',
    name: 'flagable_id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['flags'],
        operation: ['create'],
      },
    },
    default: 0,
    description: 'The ID of the record being flagged',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['flags'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Optional description for the flag',
  },
  {
    displayName: 'Flag Update Fields',
    name: 'flagUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['flags'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description for the flag',
      },
      {
        displayName: 'Flag Type Name or ID',
        name: 'flag_type_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getFlagTypes',
        },
        default: '',
        description:
          'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Flagable ID',
        name: 'flagable_id',
        type: 'number',
        default: 0,
        description: 'The ID of the record being flagged',
      },
      {
        displayName: 'Flagable Type',
        name: 'flagable_type',
        type: 'options',
        options: [...FLAGABLE_TYPE_OPTIONS],
        default: 'Asset',
        description: 'The type of record being flagged',
      },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['flags'],
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
        resource: ['flags'],
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
        resource: ['flags'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Created At',
        name: 'created_at',
        type: 'dateTime',
        default: '',
        description: 'Filter by creation date (YYYY-MM-DD or ISO datetime)',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Filter by exact description',
      },
      {
        displayName: 'Flag Type Name or ID',
        name: 'flag_type_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getFlagTypes',
        },
        default: '',
        description:
          'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Flagable ID',
        name: 'flagable_id',
        type: 'number',
        default: 0,
        description: 'Filter by flagable record ID',
      },
      {
        displayName: 'Flagable Type',
        name: 'flagable_type',
        type: 'options',
        options: [...FLAGABLE_TYPE_OPTIONS],
        default: 'Asset',
        description: 'Filter by flagable type',
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
  createWrapResultsField('flags'),
];
