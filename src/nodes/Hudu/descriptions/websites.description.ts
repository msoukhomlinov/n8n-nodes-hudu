import type { INodeProperties } from 'n8n-workflow';
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
        displayName: 'Created At',
        name: 'created_at',
        type: 'fixedCollection',
        default: {},
        description: 'Filter by creation date',
        options: [
          {
            displayName: 'Date Range',
            name: 'range',
            values: [
              {
                displayName: 'Mode',
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
                default: 'range',
                description: 'The mode to use for date filtering',
              },
              {
                displayName: 'Exact Date',
                name: 'exact',
                type: 'dateTime',
                displayOptions: {
                  show: {
                    mode: ['exact'],
                  },
                },
                default: '',
                description: 'The exact date to match',
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
                description: 'Start date of the range (inclusive)',
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
                description: 'End date of the range (inclusive)',
              },
              {
                displayName: 'Preset Range',
                name: 'preset',
                type: 'options',
                displayOptions: {
                  show: {
                    mode: ['preset'],
                  },
                },
                options: [
                  {
                    name: 'Today',
                    value: 'today',
                    description: 'Created today',
                  },
                  {
                    name: 'Yesterday',
                    value: 'yesterday',
                    description: 'Created yesterday',
                  },
                  {
                    name: 'Last 24 Hours',
                    value: 'last24h',
                    description: 'Created in the last 24 hours',
                  },
                  {
                    name: 'Last 48 Hours',
                    value: 'last48h',
                    description: 'Created in the last 48 hours',
                  },
                  {
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Created in the last 7 days',
                  },
                  {
                    name: 'Last 14 Days',
                    value: 'last14d',
                    description: 'Created in the last 14 days',
                  },
                  {
                    name: 'Last 30 Days',
                    value: 'last30d',
                    description: 'Created in the last 30 days',
                  },
                  {
                    name: 'Last 60 Days',
                    value: 'last60d',
                    description: 'Created in the last 60 days',
                  },
                  {
                    name: 'Last 90 Days',
                    value: 'last90d',
                    description: 'Created in the last 90 days',
                  },
                  {
                    name: 'This Week',
                    value: 'thisWeek',
                    description: 'Created this week',
                  },
                  {
                    name: 'Last Week',
                    value: 'lastWeek',
                    description: 'Created last week',
                  },
                  {
                    name: 'This Month',
                    value: 'thisMonth',
                    description: 'Created this month',
                  },
                  {
                    name: 'Last Month',
                    value: 'lastMonth',
                    description: 'Created last month',
                  },
                  {
                    name: 'This Year',
                    value: 'thisYear',
                    description: 'Created this year',
                  },
                  {
                    name: 'Last Year',
                    value: 'lastYear',
                    description: 'Created last year',
                  },
                ],
                default: 'today',
                description: 'The preset range to match',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Updated At',
        name: 'updated_at',
        type: 'fixedCollection',
        default: {},
        description: 'Filter by update date',
        options: [
          {
            displayName: 'Date Range',
            name: 'range',
            values: [
              {
                displayName: 'Mode',
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
                default: 'range',
                description: 'The mode to use for date filtering',
              },
              {
                displayName: 'Exact Date',
                name: 'exact',
                type: 'dateTime',
                displayOptions: {
                  show: {
                    mode: ['exact'],
                  },
                },
                default: '',
                description: 'The exact date to match',
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
                description: 'Start date of the range (inclusive)',
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
                description: 'End date of the range (inclusive)',
              },
              {
                displayName: 'Preset Range',
                name: 'preset',
                type: 'options',
                displayOptions: {
                  show: {
                    mode: ['preset'],
                  },
                },
                options: [
                  {
                    name: 'Today',
                    value: 'today',
                    description: 'Updated today',
                  },
                  {
                    name: 'Yesterday',
                    value: 'yesterday',
                    description: 'Updated yesterday',
                  },
                  {
                    name: 'Last 24 Hours',
                    value: 'last24h',
                    description: 'Updated in the last 24 hours',
                  },
                  {
                    name: 'Last 48 Hours',
                    value: 'last48h',
                    description: 'Updated in the last 48 hours',
                  },
                  {
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Updated in the last 7 days',
                  },
                  {
                    name: 'Last 14 Days',
                    value: 'last14d',
                    description: 'Updated in the last 14 days',
                  },
                  {
                    name: 'Last 30 Days',
                    value: 'last30d',
                    description: 'Updated in the last 30 days',
                  },
                  {
                    name: 'Last 60 Days',
                    value: 'last60d',
                    description: 'Updated in the last 60 days',
                  },
                  {
                    name: 'Last 90 Days',
                    value: 'last90d',
                    description: 'Updated in the last 90 days',
                  },
                  {
                    name: 'This Week',
                    value: 'thisWeek',
                    description: 'Updated this week',
                  },
                  {
                    name: 'Last Week',
                    value: 'lastWeek',
                    description: 'Updated last week',
                  },
                  {
                    name: 'This Month',
                    value: 'thisMonth',
                    description: 'Updated this month',
                  },
                  {
                    name: 'Last Month',
                    value: 'lastMonth',
                    description: 'Updated last month',
                  },
                  {
                    name: 'This Year',
                    value: 'thisYear',
                    description: 'Updated this year',
                  },
                  {
                    name: 'Last Year',
                    value: 'lastYear',
                    description: 'Updated last year',
                  },
                ],
                default: 'today',
                description: 'The preset range to match',
              },
            ],
          },
        ],
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
    displayName: 'Company',
    name: 'company_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCompanies',
    },
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['create'],
      },
    },
    required: true,
    default: '',
    description: 'The company to associate with the website',
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
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the website',
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
