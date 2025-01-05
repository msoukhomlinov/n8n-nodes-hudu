import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

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
        name: 'Get All',
        value: 'getAll',
        description: 'Retrieve all public photos',
        action: 'Get all public photos',
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

  // ----------------------------------
  //         public_photos:create
  // ----------------------------------
  {
    displayName: 'Photo',
    name: 'photo',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['public_photos'],
        operation: ['create'],
      },
    },
    required: true,
    default: '',
    description: 'The photo file to be uploaded (must be an image)',
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
    description: 'The updated ID of the record the photo is associated with',
  },
];
