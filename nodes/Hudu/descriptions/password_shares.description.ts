import type { INodeProperties } from 'n8n-workflow';
import { createWrapResultsField } from './resources';

export const passwordSharesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['password_shares'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a sharing link for a password',
        action: 'Create a password share',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a sharing link',
        action: 'Delete a password share',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a sharing link by ID',
        action: 'Get a password share',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get sharing links for a password',
        action: 'Get many password shares',
      },
    ],
    default: 'getAll',
  },
];

export const passwordSharesFields: INodeProperties[] = [
  {
    displayName: 'Asset Password ID',
    name: 'asset_password_id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['password_shares'],
        operation: ['getAll', 'get', 'create', 'delete'],
      },
    },
    default: 0,
    description: 'The ID of the password to share. Obtain from a prior Asset Password get or get many result.',
  },

  // ----------------------------------
  //         password_shares:getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['password_shares'],
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
        resource: ['password_shares'],
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
  createWrapResultsField('password_shares'),

  // ----------------------------------
  //         password_shares:get / delete
  // ----------------------------------
  {
    displayName: 'Share ID',
    name: 'shareId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['password_shares'],
        operation: ['get', 'delete'],
      },
    },
    default: 0,
    description: 'The unique ID of the sharing link',
  },

  // ----------------------------------
  //         password_shares:create
  // ----------------------------------
  {
    displayName: 'Expire In (Seconds)',
    name: 'expire_in',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['password_shares'],
        operation: ['create'],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    default: 86400,
    description: 'Number of seconds until the link expires. Must be greater than 0. Never-expire links are not permitted.',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['password_shares'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Include Notes',
        name: 'include_notes',
        type: 'boolean',
        default: false,
        description: 'Whether to show the password description on the sharing page',
      },
      {
        displayName: 'Include OTP',
        name: 'include_otp',
        type: 'boolean',
        default: false,
        description: 'Whether to show the one-time password code on the sharing page',
      },
      {
        displayName: 'Include URL',
        name: 'include_url',
        type: 'boolean',
        default: false,
        description: 'Whether to show the password URL on the sharing page',
      },
      {
        displayName: 'Include Username',
        name: 'include_username',
        type: 'boolean',
        default: false,
        description: 'Whether to show the username on the sharing page',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Message displayed to the recipient on the sharing page',
      },
      {
        displayName: 'One-Time Expire',
        name: 'one_time_expire',
        type: 'boolean',
        default: false,
        description: 'Whether the link expires after it has been viewed once',
      },
    ],
  },
];
