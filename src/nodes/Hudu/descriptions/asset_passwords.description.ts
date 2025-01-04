import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const assetPasswordOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
      },
    },
    options: [
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Get a list of passwords',
        action: 'Get a list of passwords',
      },
      {
        name: 'Archive',
        value: 'archive',
        description: 'Archive a password',
        action: 'Archive a password',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a password',
        action: 'Create a password',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a password',
        action: 'Delete a password',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a password by ID',
        action: 'Get a password',
      },
      {
        name: 'Unarchive',
        value: 'unarchive',
        description: 'Unarchive a password',
        action: 'Unarchive a password',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a password',
        action: 'Update a password',
      },
    ],
    default: 'getAll',
  },
];

export const assetPasswordFields: INodeProperties[] = [
  // ID field for single operations
  {
    displayName: 'Asset Password ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['get', 'update', 'delete', 'archive', 'unarchive'],
      },
    },
    default: 0,
    description: 'ID of the requested password',
  },

  // Required fields for Create and Update operations
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Name of the password',
  },
  {
    displayName: 'Username',
    name: 'username',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Username associated with the password',
  },
  {
    displayName: 'Password',
    name: 'password',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'The actual password string',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Description or notes related to the password',
  },
  {
    displayName: 'Company ID',
    name: 'company_id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    default: 0,
    description: 'Identifier of the company to which the password belongs',
  },
  {
    displayName: 'Passwordable Type',
    name: 'passwordable_type',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: "Type of the related object for the password (e.g., 'Asset', 'Website')",
  },
  {
    displayName: 'OTP Secret',
    name: 'otp_secret',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'Secret key for one-time passwords (OTP), if used',
  },
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'URL related to the password, if applicable',
  },

  // Return All option for GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
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
        resource: ['asset_passwords'],
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

  // Filters for GetAll operation
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Set to true to display only archived assets',
      },
      {
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: undefined,
        description: 'Filter by company ID',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by name of password',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: HUDU_API_CONSTANTS.DEFAULT_PAGE,
        description: 'Get current page of results',
      },
      {
        displayName: 'Page Size',
        name: 'page_size',
        type: 'number',
        default: HUDU_API_CONSTANTS.PAGE_SIZE,
        description: 'Number of results to return',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Filter by search query',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter by url slug',
      },
      {
        displayName: 'Updated At',
        name: 'updated_at',
        type: 'string',
        default: '',
        description:
          "Filter asset passwords updated within a range or at an exact time. Format: 'start_datetime,end_datetime' for range, 'exact_datetime' for exact match. Both 'start_datetime' and 'end_datetime' should be in ISO 8601 format.",
      },
    ],
  },

  // Additional Fields
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'In Portal',
        name: 'in_portal',
        type: 'boolean',
        default: false,
        description: 'Whether the password is accessible in the portal',
      },
      {
        displayName: 'Login URL',
        name: 'login_url',
        type: 'string',
        default: '',
        description: 'URL for the login page associated with the password',
      },
      {
        displayName: 'Password Folder ID',
        name: 'password_folder_id',
        type: 'number',
        default: undefined,
        description: 'ID of the folder in which the password is stored',
      },
      {
        displayName: 'Password Type',
        name: 'password_type',
        type: 'string',
        default: '',
        description: 'Type or category of the password',
      },
      {
        displayName: 'Passwordable ID',
        name: 'passwordable_id',
        type: 'number',
        default: undefined,
        description: "ID of the related object (e.g., 'Website') for the password",
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'URL-friendly identifier for the password',
      },
    ],
  },
];
