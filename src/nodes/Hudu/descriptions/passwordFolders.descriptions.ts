import type { INodeProperties } from 'n8n-workflow';

export const passwordFoldersOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['password_folders'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create password folder',
        action: 'Create password folder',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete password folder',
        action: 'Delete password folder',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get password folder',
        action: 'Get password folder',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many password folders',
        action: 'Get many password folders',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update password folder',
        action: 'Update password folder',
      },
    ],
    default: 'getAll',
  },
];

export const passwordFoldersFields: INodeProperties[] = [
  {
    displayName: 'Password Folder ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['password_folders'],
        operation: ['get'],
      },
    },
    default: 0,
    description: 'The ID of the password folder to retrieve',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['password_folders'],
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
        resource: ['password_folders'],
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
        resource: ['password_folders'],
        operation: ['getAll'],
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
        description: 'The company to associate with the password folder. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter folders by name',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Filter by search query',
      },
    ],
  },
  // Create fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['password_folders'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the password folder',
  },
  {
    displayName: 'Security',
    name: 'security',
    type: 'options',
    options: [
      { name: 'All Users', value: 'all_users' },
      { name: 'Specific Groups', value: 'specific' },
    ],
    required: true,
    displayOptions: {
      show: {
        resource: ['password_folders'],
        operation: ['create'],
      },
    },
    default: 'all_users',
    description: 'Who has permission to see the folder',
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
    displayOptions: {
      show: {
        resource: ['password_folders'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['password_folders'],
        operation: ['create'],
      },
    },
    default: '',
  },
  {
    displayName: 'Group Names or IDs',
    name: 'allowed_groups',
    type: 'multiOptions',
    typeOptions: {
      loadOptionsMethod: 'getGroups',
      loadOptionsParameters: {
        includeBlank: true,
      },
    },
    displayOptions: {
      show: {
        resource: ['password_folders'],
        operation: ['create'],
        security: ['specific'],
      },
    },
    default: [],
    description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },

  // Update fields
  {
    displayName: 'Password Folder ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['password_folders'],
        operation: ['update', 'delete'],
      },
    },
    default: 0,
    description: 'ID of the password folder',
  },
  {
    displayName: 'Password Folder Update Fields',
    name: 'passwordFolderUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['password_folders'],
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
      },
      {
        displayName: 'Group Names or IDs',
        name: 'allowed_groups',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getGroups',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: [],
        description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Security',
        name: 'security',
        type: 'options',
        options: [
          { name: 'All Users', value: 'all_users' },
          { name: 'Specific Groups', value: 'specific' },
        ],
        default: 'all_users',
      },
    ],
  },
];
