import type { INodeProperties } from 'n8n-workflow';
import { createWrapResultsField } from './resources';
import { LABEL_RECORD_TYPE_OPTIONS } from '../utils/constants';

export const labelsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['labels'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Apply a label to a record',
        action: 'Create a label',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a label',
        action: 'Delete a label',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a label',
        action: 'Get a label',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many labels',
        action: 'Get many labels',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a label',
        action: 'Update a label',
      },
    ],
    default: 'getAll',
  },
];

export const labelsFields: INodeProperties[] = [
  {
    displayName: 'Label ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    description: 'ID of the label',
  },
  {
    displayName: 'Label Type Name or ID',
    name: 'label_type_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getLabelTypes',
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['create'],
      },
    },
    default: '',
    description:
      'Label type to apply. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Labelable Type',
    name: 'labelable_type',
    type: 'options',
    options: [...LABEL_RECORD_TYPE_OPTIONS],
    required: true,
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['create'],
      },
    },
    default: 'Asset',
    description: 'The type of record being labeled',
  },
  {
    displayName: 'Labelable ID',
    name: 'labelable_id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['create'],
      },
    },
    default: 0,
    description: 'The ID of the record being labeled',
  },
  {
    displayName: 'User Name or ID',
    name: 'user_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getUsers',
      loadOptionsParameters: {
        includeBlank: true,
      },
    },
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['create'],
      },
    },
    default: '',
    description:
      'Optional ID of the user applying the label. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Label Update Fields',
    name: 'labelUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['labels'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Label Type Name or ID',
        name: 'label_type_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getLabelTypes',
        },
        default: '',
        description:
          'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Labelable ID',
        name: 'labelable_id',
        type: 'number',
        default: 0,
        description: 'The ID of the record being labeled',
      },
      {
        displayName: 'Labelable Type',
        name: 'labelable_type',
        type: 'options',
        options: [...LABEL_RECORD_TYPE_OPTIONS],
        default: 'Asset',
        description: 'The type of record being labeled',
      },
      {
        displayName: 'User Name or ID',
        name: 'user_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getUsers',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description:
          'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
    ],
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['labels'],
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
        resource: ['labels'],
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
        resource: ['labels'],
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
        displayName: 'Label Type Name or ID',
        name: 'label_type_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getLabelTypes',
        },
        default: '',
        description:
          'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Labelable ID',
        name: 'labelable_id',
        type: 'number',
        default: 0,
        description: 'Filter by labelable record ID',
      },
      {
        displayName: 'Labelable Type',
        name: 'labelable_type',
        type: 'options',
        options: [...LABEL_RECORD_TYPE_OPTIONS],
        default: 'Asset',
        description: 'Filter by labelable type',
      },
      {
        displayName: 'Updated At',
        name: 'updated_at',
        type: 'dateTime',
        default: '',
        description: 'Filter by update date (YYYY-MM-DD or ISO datetime)',
      },
      {
        displayName: 'User Name or ID',
        name: 'user_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getUsers',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description:
          'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
    ],
  },
  createWrapResultsField('labels'),
];
