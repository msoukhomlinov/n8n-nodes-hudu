import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';
import { createWrapResultsField } from './resources';

export const uploadsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['uploads'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Upload a file',
        action: 'Upload a file',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many uploads',
        action: 'Get many uploads',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific upload',
        action: 'Get an upload',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an upload',
        action: 'Delete an upload',
      },
    ],
    default: 'getAll',
  },
];

export const uploadsFields: INodeProperties[] = [
  // ----------------------------------
  //         create
  // ----------------------------------
  {
    displayName: 'File',
    name: 'file',
    type: 'string',
    default: 'data',
    required: true,
    description: 'Name of the binary property containing the file to upload',
    typeOptions: {
      loadOptionsMethod: 'getBinaryProperties',
    },
    displayOptions: {
      show: {
        resource: ['uploads'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Uploadable Type',
    name: 'uploadable_type',
    type: 'options',
    options: [
      { name: 'Article', value: 'Article' },
      { name: 'Asset', value: 'Asset' },
      { name: 'Asset Password', value: 'AssetPassword' },
      { name: 'Company', value: 'Company' },
      { name: 'Procedure', value: 'Procedure' },
      { name: 'Website', value: 'Website' },
    ],
    default: 'Asset',
    required: true,
    description: 'Type of record to be attached to',
    displayOptions: {
      show: {
        resource: ['uploads'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Uploadable ID',
    name: 'uploadable_id',
    type: 'number',
    default: 0,
    required: true,
    description: 'ID of the record to be attached to',
    displayOptions: {
      show: {
        resource: ['uploads'],
        operation: ['create'],
      },
    },
    typeOptions: {
      minValue: 1,
    },
  },
  // ----------------------------------
  //         getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['uploads'],
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
        resource: ['uploads'],
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
  createWrapResultsField('uploads'),

  // ----------------------------------
  //         get/delete
  // ----------------------------------
  {
    displayName: 'Upload ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['uploads'],
        operation: ['get', 'delete'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the upload',
  },
];
