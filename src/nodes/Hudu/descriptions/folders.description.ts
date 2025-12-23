import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const folderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['folders'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new folder',
        action: 'Create a folder',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a folder',
        action: 'Delete a folder',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a folder by ID',
        action: 'Get a folder by ID',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many folders',
        action: 'Get many folders',
      },
      {
        name: 'Get Path',
        value: 'getPath',
        description: 'Get the full path of a folder',
        action: 'Get a folder path',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a folder',
        action: 'Update a folder',
      },
    ],
    default: 'getAll',
  },
];

export const folderFields: INodeProperties[] = [
  // ----------------------------------
  //         folders: getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['folders'],
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
        resource: ['folders'],
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
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['folders'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Child Folder 🐌',
        name: 'childFolder',
        type: 'options',
        options: [
          {
            name: '- All -',
            value: '',
          },
          {
            name: 'Yes',
            value: 'yes',
          },
          {
            name: 'No',
            value: 'no',
          },
        ],
        default: '',
        description: 'Filter folders based on whether they are child folders or not (Filtering applied client-side, may impact performance)',
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
        displayName: 'In Company',
        name: 'in_company',
        type: 'boolean',
        default: false,
        description: 'Whether to only return company-specific folders. Ignored if a company filter is applied.',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter folders by name',
      },
      {
        displayName: 'Parent Folder ID 🐌',
        name: 'parent_folder_id',
        type: 'number',
        default: undefined,
        description: 'Filter by parent folder ID (Filtering applied client-side, may impact performance)',
      },
    ],
  },

  // ----------------------------------
  //         folders: get
  // ----------------------------------
  {
    displayName: 'Folder ID',
    name: 'folderId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['folders'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    required: true,
    description: 'The ID of the folder',
  },

  // ----------------------------------
  //         folders: create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['folders'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The name of the folder',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['folders'],
        operation: ['create'],
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
        description: 'Description of the folder',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string',
        default: '',
        description: 'Font Awesome icon code (e.g. fa-home). Search for icons at <a href="https://fontawesome.com/search">Font Awesome</a>.',
      },
      {
        displayName: 'Parent Folder ID',
        name: 'parent_folder_id',
        type: 'number',
        default: undefined,
        description: 'ID of the parent folder',
      },
    ],
  },

  // ----------------------------------
  //         folders: update
  // ----------------------------------
  {
    displayName: 'Folder Update Fields',
    name: 'folderUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['folders'],
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
        description: 'Description of the folder',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string',
        default: '',
        description: 'Font Awesome icon code (e.g. fa-home). Search for icons at <a href="https://fontawesome.com/search">Font Awesome</a>.',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name of the folder',
      },
      {
        displayName: 'Parent Folder ID',
        name: 'parent_folder_id',
        type: 'number',
        default: undefined,
        description: 'ID of the parent folder',
      },
    ],
  },

  // ----------------------------------
  //         folders: getPath
  // ----------------------------------
  {
    displayName: 'Folder ID',
    name: 'folderId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['folders'],
        operation: ['getPath'],
      },
    },
    default: 0,
    required: true,
    description: 'The ID of the folder to get the path for',
  },
  {
    displayName: 'Prepend Company to Folder Path',
    name: 'prependCompanyToFolderPath',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['folders'],
        operation: ['getPath'],
      },
    },
    default: false,
    description:
      'Whether to prepend the company name (or Central KB for global folders) to the path value',
  },
  {
    displayName: 'Separator',
    name: 'separator',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['folders'],
        operation: ['getPath'],
      },
    },
    options: [
      {
        name: 'Forward Slash (/)',
        value: '/',
      },
      {
        name: 'Backslash (\\)',
        value: '\\',
      },
      {
        name: 'Greater Than ( > )',
        value: ' > ',
      },
      {
        name: 'Custom',
        value: 'custom',
      },
    ],
    default: '/',
    description: 'Choose how to separate folder names in the path string',
  },
  {
    displayName: 'Custom Separator',
    name: 'customSeparator',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['folders'],
        operation: ['getPath'],
        separator: ['custom'],
      },
    },
    default: '',
    placeholder: '/',
    description: 'Custom string to use between folder names when building the path',
  },
];
