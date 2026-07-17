import type { INodeProperties } from 'n8n-workflow';
import { createWrapResultsField } from './resources';
import { LABEL_RECORD_TYPE_OPTIONS } from '../utils/constants';

export const labelTypesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['label_types'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a label type',
        action: 'Create a label type',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a label type',
        action: 'Delete a label type',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a label type',
        action: 'Get a label type',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many label types',
        action: 'Get many label types',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a label type',
        action: 'Update a label type',
      },
    ],
    default: 'getAll',
  },
];

export const labelTypesFields: INodeProperties[] = [
  {
    displayName: 'Label Type ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['label_types'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    description: 'ID of the label type',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['label_types'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Name of the label type (must be unique)',
  },
  {
    displayName: 'Color',
    name: 'color',
    type: 'color',
    required: true,
    displayOptions: {
      show: {
        resource: ['label_types'],
        operation: ['create'],
      },
    },
    default: '#0000ff',
    description: 'Hex color value (e.g. #0000ff). Accepts 3- or 6-digit hex.',
  },
  {
    displayName: 'Applicable Record Types',
    name: 'applicable_record_types',
    type: 'multiOptions',
    options: [...LABEL_RECORD_TYPE_OPTIONS],
    required: true,
    displayOptions: {
      show: {
        resource: ['label_types'],
        operation: ['create'],
      },
    },
    default: [],
    description: 'Record types this label type may be applied to',
  },
  {
    displayName: 'Access Level',
    name: 'access_level',
    type: 'options',
    options: [
      { name: 'All Companies', value: 'all_companies' },
      { name: 'Specific Companies', value: 'specific_companies' },
    ],
    displayOptions: {
      show: {
        resource: ['label_types'],
        operation: ['create'],
      },
    },
    default: 'all_companies',
    description: 'Whether the label type is available to all companies or only specific companies',
  },
  {
    displayName: 'Allowed Company Names or IDs',
    name: 'allowed_company_ids',
    type: 'multiOptions',
    typeOptions: {
      loadOptionsMethod: 'getCompanies',
      loadOptionsParameters: {
        includeBlank: true,
      },
    },
    displayOptions: {
      show: {
        resource: ['label_types'],
        operation: ['create'],
        access_level: ['specific_companies'],
      },
    },
    default: [],
    description:
      'Company IDs to restrict the label type to. Required when Access Level is Specific Companies. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Label Type Update Fields',
    name: 'labelTypeUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['label_types'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Access Level',
        name: 'access_level',
        type: 'options',
        options: [
          { name: 'All Companies', value: 'all_companies' },
          { name: 'Specific Companies', value: 'specific_companies' },
        ],
        default: 'all_companies',
        description:
          'Whether the label type is available to all companies or only specific companies',
      },
      {
        displayName: 'Allowed Company Names or IDs',
        name: 'allowed_company_ids',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: [],
        description:
          'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Applicable Record Types',
        name: 'applicable_record_types',
        type: 'multiOptions',
        options: [...LABEL_RECORD_TYPE_OPTIONS],
        default: [],
        description: 'Record types this label type may be applied to',
      },
      {
        displayName: 'Color',
        name: 'color',
        type: 'color',
        default: '',
        description: 'Hex color value (e.g. #0000ff)',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name of the label type',
      },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['label_types'],
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
        resource: ['label_types'],
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
        resource: ['label_types'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color',
        default: '',
        description: 'Filter by exact color value (e.g. #0000ff)',
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
        description: 'Filter by exact label type name',
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
  createWrapResultsField('label_types'),
];
