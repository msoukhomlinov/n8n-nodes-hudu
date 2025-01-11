import type { INodeProperties } from 'n8n-workflow';
import { RESOURCE_TYPES } from '../utils/constants';

// Convert RESOURCE_TYPES to options array
const resourceTypeOptions = RESOURCE_TYPES.map((type) => ({
  name: type.replace(/([A-Z])/g, ' $1').trim(), // Add spaces before capital letters
  value: type,
}));

export const relationsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['relations'],
      },
    },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many relations',
        action: 'Get many relations',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new relation',
        action: 'Create a relation',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a relation',
        action: 'Delete a relation',
      },
    ],
    default: 'getAll',
  },
];

export const relationsFields: INodeProperties[] = [
  // ----------------------------------
  //         relations:getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['relations'],
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
        resource: ['relations'],
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
        resource: ['relations'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'From Entity ID 🐌',
        name: 'fromable_id',
        type: 'number',
        default: 0,
        description: 'Filter by the ID of the origin entity (Filtering applied client-side, may impact performance)',
      },
      {
        displayName: 'From Entity Type 🐌',
        name: 'fromable_type',
        type: 'options',
        default: 'Asset',
        options: resourceTypeOptions,
        description: 'Filter by the type of the origin entity (Filtering applied client-side, may impact performance)',
      },
      {
        displayName: 'Is Inverse 🐌',
        name: 'is_inverse',
        type: 'boolean',
        default: false,
        description: 'Whether the relation is inverse (Filtering applied client-side, may impact performance)',
      },
      {
        displayName: 'To Entity ID 🐌',
        name: 'toable_id',
        type: 'number',
        default: 0,
        description: 'Filter by the ID of the destination entity (Filtering applied client-side, may impact performance)',
      },
      {
        displayName: 'To Entity Type 🐌',
        name: 'toable_type',
        type: 'options',
        default: 'Asset',
        options: resourceTypeOptions,
        description: 'Filter by the type of the destination entity (Filtering applied client-side, may impact performance)',
      },
    ],
  },

  // ----------------------------------
  //         relations:create
  // ----------------------------------
  {
    displayName: 'To Entity ID',
    name: 'toable_id',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['relations'],
        operation: ['create'],
      },
    },
    description: 'The ID of the destination entity in the relation',
  },
  {
    displayName: 'To Entity Type',
    name: 'toable_type',
    type: 'options',
    required: true,
    default: 'Asset',
    options: resourceTypeOptions,
    displayOptions: {
      show: {
        resource: ['relations'],
        operation: ['create'],
      },
    },
    description: 'The type of the destination entity in the relation',
  },
  {
    displayName: 'From Entity ID',
    name: 'fromable_id',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['relations'],
        operation: ['create'],
      },
    },
    description: 'The ID of the origin entity in the relation',
  },
  {
    displayName: 'From Entity Type',
    name: 'fromable_type',
    type: 'options',
    required: true,
    default: 'Asset',
    options: resourceTypeOptions,
    displayOptions: {
      show: {
        resource: ['relations'],
        operation: ['create'],
      },
    },
    description: 'The type of the origin entity in the relation',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['relations'],
        operation: ['create'],
      },
    },
    description:
      'Provide a description for the relation to explain the relationship between the two entities',
  },
  {
    displayName: 'Is Inverse',
    name: 'is_inverse',
    type: 'boolean',
    required: true,
    default: false,
    displayOptions: {
      show: {
        resource: ['relations'],
        operation: ['create'],
      },
    },
    description: 'Whether this relation is the inverse of another relation that will be automatically created',
  },

  // ----------------------------------
  //         relations:delete
  // ----------------------------------
  {
    displayName: 'Relation ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['relations'],
        operation: ['delete'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the relation to delete',
  },
];
