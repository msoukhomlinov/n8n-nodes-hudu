import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const articlesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['articles'],
      },
    },
    options: [
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Get all articles',
        action: 'Get all articles',
      },
      {
        name: 'Archive',
        value: 'archive',
        description: 'Archive an article',
        action: 'Archive an article',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new article',
        action: 'Create an article',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an article',
        action: 'Delete an article',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific article',
        action: 'Get an article',
      },
      {
        name: 'Unarchive',
        value: 'unarchive',
        description: 'Unarchive an article',
        action: 'Unarchive an article',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an article',
        action: 'Update an article',
      },
    ],
    default: 'getAll',
  },
];

export const articlesFields: INodeProperties[] = [
  // Article ID field for operations that need it
  {
    displayName: 'Article ID',
    name: 'articleId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['get', 'update', 'delete', 'archive', 'unarchive'],
      },
    },
    default: '',
    description: 'The unique ID of the article',
  },

  // Fields for Create and Update operations
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'The name of the article',
  },
  {
    displayName: 'Content',
    name: 'content',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'The HTML content of the article',
  },

  // Return All option for GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['articles'],
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
        resource: ['articles'],
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

  // Additional Fields for Create and Update operations
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'Draft',
        name: 'draft',
        type: 'boolean',
        default: false,
        description: 'Whether the article is a draft',
      },
      {
        displayName: 'Enable Sharing',
        name: 'enable_sharing',
        type: 'boolean',
        default: false,
        description: 'Whether the article is shareable',
      },
      {
        displayName: 'Folder ID',
        name: 'folder_id',
        type: 'number',
        default: undefined,
        description: 'The unique folder ID where the article lives',
      },
      {
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the article',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'The URL slug of the article',
      },
    ],
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
        resource: ['articles'],
        operation: ['getAll'],
      },
    },
    description: 'All filters are combined using AND logic with the search parameter',
    options: [
      {
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the article',
      },
      {
        displayName: 'Draft',
        name: 'draft',
        type: 'boolean',
        default: undefined,
        description: 'Filter by draft status',
      },
      {
        displayName: 'Enable Sharing',
        name: 'enable_sharing',
        type: 'boolean',
        default: undefined,
        description: 'Filter by shareable articles',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by exact article name match',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Fuzzy search query to filter articles',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter by exact URL slug match',
      },
      {
        displayName: 'Updated At',
        name: 'updated_at',
        type: 'fixedCollection',
        placeholder: 'Add Date Range',
        default: {
          range: {
            mode: 'preset',
            preset: 'last7d'
          }
        },
        description: 'Filter articles updated within a range or at an exact time',
        typeOptions: {
          multipleValues: false,
        },
        options: [
          {
            name: 'range',
            displayName: 'Date Range',
            values: [
              {
                displayName: 'Filter Type',
                name: 'mode',
                type: 'options',
                options: [
                  {
                    name: 'Specific Date',
                    value: 'exact',
                  },
                  {
                    name: 'Custom Range',
                    value: 'range',
                  },
                  {
                    name: 'Quick Select',
                    value: 'preset',
                  },
                ],
                default: 'preset',
                description: 'Choose how to filter by date',
              },
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
                    description: 'Updates from today',
                  },
                  {
                    name: 'Yesterday',
                    value: 'yesterday',
                    description: 'Updates from yesterday',
                  },
                  {
                    name: 'Last 24 Hours',
                    value: 'last24h',
                    description: 'Updates in the past 24 hours',
                  },
                  {
                    name: 'Last 48 Hours',
                    value: 'last48h',
                    description: 'Updates in the past 48 hours',
                  },
                  {
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Updates in the past 7 days',
                  },
                  {
                    name: 'Last 14 Days',
                    value: 'last14d',
                    description: 'Updates in the past 14 days',
                  },
                  {
                    name: 'Last 30 Days',
                    value: 'last30d',
                    description: 'Updates in the past 30 days',
                  },
                  {
                    name: 'Last 60 Days',
                    value: 'last60d',
                    description: 'Updates in the past 60 days',
                  },
                  {
                    name: 'Last 90 Days',
                    value: 'last90d',
                    description: 'Updates in the past 90 days',
                  },
                  {
                    name: 'This Week',
                    value: 'thisWeek',
                    description: 'Updates since the start of this week',
                  },
                  {
                    name: 'Last Week',
                    value: 'lastWeek',
                    description: 'Updates during last week',
                  },
                  {
                    name: 'This Month',
                    value: 'thisMonth',
                    description: 'Updates since the start of this month',
                  },
                  {
                    name: 'Last Month',
                    value: 'lastMonth',
                    description: 'Updates during last month',
                  },
                  {
                    name: 'This Year',
                    value: 'thisYear',
                    description: 'Updates since the start of this year',
                  },
                  {
                    name: 'Last Year',
                    value: 'lastYear',
                    description: 'Updates during last year',
                  },
                ],
                default: 'last7d',
                description: 'Choose from common date ranges',
              },
            ],
          },
        ],
      },
    ],
  },
];

