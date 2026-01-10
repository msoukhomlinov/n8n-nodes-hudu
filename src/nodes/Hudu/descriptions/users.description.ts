import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';
import { createWrapResultsField } from './resources';

export const userOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['users'],
      },
    },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many users',
        action: 'Get many users',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a user by ID',
        action: 'Get a user',
      },
    ],
    default: 'getAll',
  },
];

export const userFields: INodeProperties[] = [
  // Return All option for GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['users'],
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
        resource: ['users'],
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
  createWrapResultsField('users'),
  // Identifier Type toggle for get operation
  {
    displayName: 'Identifier Type',
    name: 'identifierType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['users'],
        operation: ['get'],
      },
    },
    options: [
      {
        name: 'ID',
        value: 'id',
        description: 'Use numeric user ID',
      },
      {
        name: 'Slug',
        value: 'slug',
        description: 'Use user URL slug',
      },
    ],
    default: 'id',
    description: 'Whether to retrieve the user by numeric ID or slug identifier',
  },
  // ID field for Get operation
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['users'],
        operation: ['get'],
      },
    },
    default: '',
    description: 'The unique ID or slug of the user',
  },
  // Filters for GetAll operation
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['users'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether the user is archived',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
								placeholder: 'name@email.com',
        default: '',
        description: 'Filter users by email address',
      },
      {
        displayName: 'First Name',
        name: 'first_name',
        type: 'string',
        default: '',
        description: 'Filter users by first name',
      },
      {
        displayName: 'Last Name',
        name: 'last_name',
        type: 'string',
        default: '',
        description: 'Filter users by last name',
      },
      {
        displayName: 'Portal Member Company Name or ID',
        name: 'portal_member_company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'The company to associate with the portal member. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search across first name and last name',
      },
      {
        displayName: 'Security Level',
        name: 'security_level',
        type: 'options',
        options: [
          {
            name: 'Admin',
            value: 'admin',
          },
          {
            name: 'Author',
            value: 'author',
          },
          {
            name: 'Editor',
            value: 'editor',
          },
          {
            name: 'Portal Admin',
            value: 'portal_admin',
          },
          {
            name: 'Portal Member',
            value: 'portal_member',
          },
          {
            name: 'Spectator',
            value: 'spectator',
          },
          {
            name: 'Super Admin',
            value: 'super_admin',
          },
        ],
        default: 'super_admin',
        description: 'Filter users by security level',
      },
    ],
  },
];
