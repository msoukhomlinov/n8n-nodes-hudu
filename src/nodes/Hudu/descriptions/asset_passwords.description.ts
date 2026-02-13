import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS, RESOURCE_TYPES } from '../utils/constants';
import { createWrapResultsField } from './resources';

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
        name: 'Get Many',
        value: 'getAll',
        description: 'Get a list of passwords',
        action: 'Get a list of passwords',
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
  // Identifier Type toggle for get operation
  {
    displayName: 'Identifier Type',
    name: 'identifierType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['get'],
      },
    },
    options: [
      {
        name: 'ID',
        value: 'id',
        description: 'Use numeric asset password ID',
      },
      {
        name: 'Slug',
        value: 'slug',
        description: 'Use asset password URL slug',
      },
    ],
    default: 'id',
    description: 'Whether to retrieve the asset password by numeric ID or slug identifier',
  },

  // ID field for single operations
  {
    displayName: 'Asset Password ID',
    name: 'id',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['get', 'update', 'delete', 'archive', 'unarchive'],
      },
    },
    default: '',
    description: 'The unique ID or slug of the asset password',
  },

  // Required fields for Create operation
  {
    displayName: 'Company Name or ID',
    name: 'company_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCompanies',
      loadOptionsParameters: {
        includeBlank: true,
      },
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Name of the password',
  },
  {
    displayName: 'Password',
    name: 'password',
    type: 'string',
    required: true,
    typeOptions: {
      password: true,
    },
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The actual password string',
  },

  // Additional Fields for Create operation
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description or notes related to the password',
      },
      {
        displayName: 'In Portal',
        name: 'in_portal',
        type: 'boolean',
        default: false,
        description: 'Whether the password is accessible in the portal',
      },
      {
        displayName: 'OTP Secret',
        name: 'otp_secret',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Secret key for one-time passwords (OTP), if used',
      },
      {
        displayName: 'Password Folder ID',
        name: 'password_folder_id',
        type: 'number',
        default: 0,
        description: 'ID of the folder in which the password is stored',
      },
      {
        displayName: 'Password Type',
        name: 'password_type',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Type or category of the password',
      },
      {
        displayName: 'Passwordable ID',
        name: 'passwordable_id',
        type: 'number',
        default: 0,
        description: "ID of the related object (e.g., 'Website') for the password",
      },
      {
        displayName: 'Passwordable Type',
        name: 'passwordable_type',
        type: 'options',
        options: RESOURCE_TYPES.map(type => ({
          name: type,
          value: type,
        })),
        default: '',
        description: 'Type of the related object for the password',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'URL related to the password, if applicable',
      },
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
        description: 'Username associated with the password',
      },
    ],
  },

  // Update Fields
  {
    displayName: 'Asset Password Update Fields',
    name: 'assetPasswordUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset_passwords'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Company Name or ID',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description or notes related to the password',
      },
      {
        displayName: 'In Portal',
        name: 'in_portal',
        type: 'boolean',
        default: false,
        description: 'Whether the password is accessible in the portal',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name of the password',
      },
      {
        displayName: 'OTP Secret',
        name: 'otp_secret',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Secret key for one-time passwords (OTP), if used',
      },
      {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'The actual password string',
      },
      {
        displayName: 'Password Folder ID',
        name: 'password_folder_id',
        type: 'number',
        default: 0,
        description: 'ID of the folder in which the password is stored',
      },
      {
        displayName: 'Password Type',
        name: 'password_type',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Type or category of the password',
      },
      {
        displayName: 'Passwordable ID',
        name: 'passwordable_id',
        type: 'number',
        default: 0,
        description: "ID of the related object (e.g., 'Website') for the password",
      },
      {
        displayName: 'Passwordable Type',
        name: 'passwordable_type',
        type: 'options',
        options: RESOURCE_TYPES.map(type => ({
          name: type,
          value: type,
        })),
        default: '',
        description: 'Type of the related object for the password',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'URL related to the password, if applicable',
      },
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
        description: 'Username associated with the password',
      },
    ],
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
  createWrapResultsField('asset_passwords'),

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
        description: 'Whether to display only archived assets',
      },
      {
        displayName: 'Company Name or ID',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by name of password',
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
        description: 'Filter by URL slug',
      },
      {
        displayName: 'Updated At',
        name: 'updated_at',
        type: 'fixedCollection',
        placeholder: 'Add Date Range',
        default: {},
        typeOptions: {
          multipleValues: false,
        },
        options: [
          {
            name: 'range',
            displayName: 'Date Range',
            values: [
              {
                displayName: 'Date',
                name: 'exact',
                type: 'dateTime',
                displayOptions: {
                  show: {
                    mode: ['exact'],
                  },
                },
                default: '',
                description: 'The specific date to filter by',
              },
              {
                displayName: 'End Date',
                name: 'end',
                type: 'dateTime',
                displayOptions: {
                  show: {
                    mode: ['range'],
                  },
                },
                default: '',
                description: 'End date of the range',
              },
              {
                displayName: 'Filter Type',
                name: 'mode',
                type: 'options',
                options: [
                  {
                    name: 'Exact Date',
                    value: 'exact',
                    description: 'Match an exact date',
                  },
                  {
                    name: 'Date Range',
                    value: 'range',
                    description: 'Match a date range',
                  },
                  {
                    name: 'Preset Range',
                    value: 'preset',
                    description: 'Match a preset date range',
                  },
                ],
                default: 'preset',
                description: 'The mode to use for date filtering',
              },
              {
                displayName: 'Range',
                name: 'preset',
                type: 'options',
                displayOptions: {
                  show: {
                    mode: ['preset'],
                  },
                },
                options: [
                  {
                    name: 'Last 14 Days',
                    value: 'last14d',
                    description: 'Updates in the last 14 days',
                  },
                  {
                    name: 'Last 24 Hours',
                    value: 'last24h',
                    description: 'Updates in the last 24 hours',
                  },
                  {
                    name: 'Last 30 Days',
                    value: 'last30d',
                    description: 'Updates in the last 30 days',
                  },
                  {
                    name: 'Last 48 Hours',
                    value: 'last48h',
                    description: 'Updates in the last 48 hours',
                  },
                  {
                    name: 'Last 60 Days',
                    value: 'last60d',
                    description: 'Updates in the last 60 days',
                  },
                  {
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Updates in the last 7 days',
                  },
                  {
                    name: 'Last 90 Days',
                    value: 'last90d',
                    description: 'Updates in the last 90 days',
                  },
                  {
                    name: 'Last Month',
                    value: 'lastMonth',
                    description: 'Updates during last month',
                  },
                  {
                    name: 'Last Week',
                    value: 'lastWeek',
                    description: 'Updates during last week',
                  },
                  {
                    name: 'Last Year',
                    value: 'lastYear',
                    description: 'Updates during last year',
                  },
                  {
                    name: 'This Month',
                    value: 'thisMonth',
                    description: 'Updates since the start of this month',
                  },
                  {
                    name: 'This Week',
                    value: 'thisWeek',
                    description: 'Updates since the start of this week',
                  },
                  {
                    name: 'This Year',
                    value: 'thisYear',
                    description: 'Updates since the start of this year',
                  },
                  {
                    name: 'Today',
                    value: 'today',
                    description: 'Updates from today',
                  },
                  {
                    name: 'Yesterday',
                    value: 'yesterday',
                    description: 'Updates from yesterday',
                  },
                ],
                default: 'last7d',
                description: 'Choose from common date ranges',
              },
              {
                displayName: 'Start Date',
                name: 'start',
                type: 'dateTime',
                displayOptions: {
                  show: {
                    mode: ['range'],
                  },
                },
                default: '',
                description: 'Start date of the range',
              },
            ],
          },
        ],
        description: 'Filter asset passwords updated within a range or at an exact time',
      },
    ],
  },
];
