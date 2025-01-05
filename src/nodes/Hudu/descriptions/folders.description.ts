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
        name: 'Get All',
        value: 'getAll',
        description: 'Get all folders',
        action: 'Get all folders',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a folder by ID',
        action: 'Get a folder by ID',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new folder',
        action: 'Create a folder',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a folder',
        action: 'Update a folder',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a folder',
        action: 'Delete a folder',
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
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the folder',
      },
      {
        displayName: 'In Company',
        name: 'in_company',
        type: 'boolean',
        default: undefined,
        description: 'When true, only returns company-specific folders',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter folders by name',
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
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the folder',
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
        description: 'Icon for the folder',
      },
      {
        displayName: 'Parent Folder ID',
        name: 'parentFolderId',
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
    displayName: 'Update Fields',
    name: 'updateFields',
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
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the folder',
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
        description: 'Icon for the folder',
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
];
