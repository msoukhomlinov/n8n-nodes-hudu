import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';
import { createWrapResultsField } from './resources';

export const publicPhotosOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['public_photos'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new public photo',
        action: 'Create a public photo',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a specific public photo by its ID',
        action: 'Get a public photo',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve many public photos',
        action: 'Get many public photos',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a public photo',
        action: 'Update a public photo',
      },
    ],
    default: 'getAll',
  },
];

export const publicPhotosFields: INodeProperties[] = [
  // ----------------------------------
  //         public_photos:get
  // ----------------------------------
  {
    displayName: 'Photo ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['get'],
      },
    },
    required: true,
    default: 0,
    description: 'The ID of the public photo to retrieve',
  },
  // ----------------------------------
  //         public_photos:getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['public_photos'],
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
        resource: ['public_photos'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    default: HUDU_API_CONSTANTS.PAGE_SIZE,
    description: 'Max number of results to return',
  },
  createWrapResultsField('public_photos'),
  {
    displayName: 'Filter',
    name: 'filter',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['getAll'],
      },
    },
    placeholder: 'Add Filter',
    default: {},
    description: 'Optional filters to narrow down the public photos returned',
    options: [
      {
        name: 'criteria',
        displayName: 'Criteria',
        values: [
          {
            displayName: 'Record Type',
            name: 'record_type_filter',
            type: 'string',
            default: '',
            description: 'Filter photos by the type of record they are associated with (e.g., Article). Case-sensitive.',
          },
          {
            displayName: 'Record ID',
            name: 'record_id_filter',
            type: 'number',
            default: null,
            typeOptions: {
              minValue: 1,
            },
            description: 'Filter photos by the ID of the record they are associated with',
          },
        ],
      },
    ],
  },

  // ----------------------------------
  //         public_photos:create
  // ----------------------------------
  {
    displayName: 'Photo',
    name: 'photo',
    type: 'string',
    default: 'data',
    required: true,
    description: 'Name of the binary property containing the photo to upload',
    typeOptions: {
      loadOptionsMethod: 'getBinaryProperties',
    },
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Record Type',
    name: 'record_type',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['create'],
      },
    },
    required: true,
    default: '',
    description: 'The type of record the photo will be associated with (e.g., Article)',
  },
  {
    displayName: 'Record ID',
    name: 'record_id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['create'],
      },
    },
    required: true,
    default: 0,
    description: 'The ID of the record the photo will be associated with',
  },

  // ----------------------------------
  //         public_photos:update
  // ----------------------------------
  {
    displayName: 'Photo ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['update'],
      },
    },
    required: true,
    default: 0,
    description: 'The ID of the public photo to update',
  },
  {
    displayName: 'Record Type',
    name: 'record_type',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['update'],
      },
    },
    required: true,
    default: '',
    description: 'The updated type of record the photo is associated with (e.g., Article)',
  },
  {
    displayName: 'Record ID',
    name: 'record_id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['update'],
      },
    },
    required: true,
    default: 0,
    description: 'The ID of the record the photo will be associated with',
  },
];
