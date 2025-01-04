import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const websitesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['websites'],
      },
    },
    options: [
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Get all websites',
        action: 'Get all websites',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a website by ID',
        action: 'Get a website by ID',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new website',
        action: 'Create a new website',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a website',
        action: 'Update a website',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a website',
        action: 'Delete a website',
      },
    ],
    default: 'getAll',
  },
];

export const websitesFields: INodeProperties[] = [
  // ----------------------------------
  //         websites:getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['websites'],
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
        resource: ['websites'],
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
        resource: ['websites'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter websites by name',
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
        type: 'string',
        default: '',
        description:
          'Filter websites updated within a range or at an exact time. Format: "start_datetime,end_datetime" for range, "exact_datetime" for exact match.',
      },
    ],
  },

  // ----------------------------------
  //         websites:get
  // ----------------------------------
  {
    displayName: 'Website ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the website',
  },

  // ----------------------------------
  //         websites:create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The URL of the website',
  },
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the company to associate the website with',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Additional notes about the website',
      },
      {
        displayName: 'Paused',
        name: 'paused',
        type: 'boolean',
        default: false,
        description: 'Whether website monitoring is paused',
      },
      {
        displayName: 'Disable DNS',
        name: 'disable_dns',
        type: 'boolean',
        default: false,
        description: 'Whether DNS monitoring is disabled',
      },
      {
        displayName: 'Disable SSL',
        name: 'disable_ssl',
        type: 'boolean',
        default: false,
        description: 'Whether SSL certificate monitoring is disabled',
      },
      {
        displayName: 'Disable WHOIS',
        name: 'disable_whois',
        type: 'boolean',
        default: false,
        description: 'Whether WHOIS monitoring is disabled',
      },
    ],
  },

  // ----------------------------------
  //         websites:update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: 0,
        description: 'ID of the company to associate the website with',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The URL of the website',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Additional notes about the website',
      },
      {
        displayName: 'Paused',
        name: 'paused',
        type: 'boolean',
        default: false,
        description: 'Whether website monitoring is paused',
      },
      {
        displayName: 'Disable DNS',
        name: 'disable_dns',
        type: 'boolean',
        default: false,
        description: 'Whether DNS monitoring is disabled',
      },
      {
        displayName: 'Disable SSL',
        name: 'disable_ssl',
        type: 'boolean',
        default: false,
        description: 'Whether SSL certificate monitoring is disabled',
      },
      {
        displayName: 'Disable WHOIS',
        name: 'disable_whois',
        type: 'boolean',
        default: false,
        description: 'Whether WHOIS monitoring is disabled',
      },
    ],
  },
];
