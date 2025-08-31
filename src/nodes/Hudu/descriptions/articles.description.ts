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
        name: 'Archive',
        value: 'archive',
        description: 'Archive article',
        action: 'Archive article',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create article',
        action: 'Create article',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete article',
        action: 'Delete article',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get article',
        action: 'Get article',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many articles',
        action: 'Get many articles',
      },
      {
        name: 'Get Version History',
        value: 'getVersionHistory',
        description: 'Get the creation and update history of an article',
        action: 'Get version history',
      },
      {
        name: 'Unarchive',
        value: 'unarchive',
        description: 'Unarchive article',
        action: 'Unarchive article',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update article',
        action: 'Update article',
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
        operation: ['get', 'update', 'delete', 'archive', 'unarchive', 'getVersionHistory'],
      },
    },
    default: '',
    description: 'The unique ID of the article',
  },

  // Include Markdown Content option for get operation
  {
    displayName: 'Include Markdown Content',
    name: 'includeMarkdownContent',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['get'],
      },
    },
    default: false,
    description: 'Whether to include the article content converted to markdown format. Useful for AI tooling and text processing workflows.',
  },

  // Optional filters for getVersionHistory operation
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['getVersionHistory'],
      },
    },
    options: [
      {
        displayName: 'Date Range',
        name: 'start_date',
        type: 'fixedCollection',
        placeholder: 'Add Date Range',
        default: {},
        description: 'Filter history entries by date range',
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
                description: 'End date of the range (inclusive)',
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
                    name: 'Last 14 Days',
                    value: 'last14d',
                    description: 'Updates in the past 14 days',
                  },
                  {
                    name: 'Last 24 Hours',
                    value: 'last24h',
                    description: 'Updates in the past 24 hours',
                  },
                  {
                    name: 'Last 30 Days',
                    value: 'last30d',
                    description: 'Updates in the past 30 days',
                  },
                  {
                    name: 'Last 48 Hours',
                    value: 'last48h',
                    description: 'Updates in the past 48 hours',
                  },
                  {
                    name: 'Last 60 Days',
                    value: 'last60d',
                    description: 'Updates in the past 60 days',
                  },
                  {
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Updates in the past 7 days',
                  },
                  {
                    name: 'Last 90 Days',
                    value: 'last90d',
                    description: 'Updates in the past 90 days',
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
                description: 'Start date of the range (inclusive)',
              },
            ],
          },
        ],
      },
    ],
  },

  // Fields for Create operation
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Article name',
  },
  {
    displayName: 'Content',
    name: 'content',
    type: 'string',
    typeOptions: {
      rows: 3,
    },
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Article content',
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
        resource: ['articles'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Used to associate article with a company. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Enable Sharing',
    name: 'enable_sharing',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['create'],
      },
    },
    default: false,
    description: 'Whether the article should have a public URL for non-authenticated users to view',
  },
  {
    displayName: 'Folder ID',
    name: 'folder_id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['create'],
      },
    },
    default: undefined,
    description: 'Used to associate article with a folder',
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

  // Include Markdown Content option for getAll operation
  {
    displayName: 'Include Markdown Content',
    name: 'includeMarkdownContent',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['articles'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to include article content converted to markdown format for each article. Useful for AI tooling and text processing workflows.',
  },

  // Additional Fields for Create and Update operations
  {
    displayName: 'Article Update Fields',
    name: 'articleUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['articles'],
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
        displayName: 'Content',
        name: 'content',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'The HTML content of the article',
      },
      {
        displayName: 'Enable Sharing',
        name: 'enable_sharing',
        type: 'boolean',
        default: false,
        description: 'Whether the article should have a public URL for non-authenticated users to view',
      },
      {
        displayName: 'Folder ID',
        name: 'folder_id',
        type: 'number',
        default: undefined,
        description: 'Used to associate article with a folder',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the article',
      },
    ],
  },

  // Filters for GetAll operation
  {
    displayName: 'Filter Name or ID',
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
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
        displayName: 'Draft',
        name: 'draft',
        type: 'boolean',
        default: false,
        description: 'Whether to filter by draft status',
      },
      {
        displayName: 'Enable Sharing',
        name: 'enable_sharing',
        type: 'boolean',
        default: false,
        description: 'Whether to filter by shareable articles',
      },
      {
        displayName: 'Folder ID 🐌',
        name: 'folder_id',
        type: 'number',
        default: undefined,
        description: 'Filter by folder ID (Filtering applied client-side, may impact performance)',
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
            preset: 'last7d',
          },
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
                description: 'End date of the range (inclusive)',
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
                    name: 'Last 14 Days',
                    value: 'last14d',
                    description: 'Updates in the past 14 days',
                  },
                  {
                    name: 'Last 24 Hours',
                    value: 'last24h',
                    description: 'Updates in the past 24 hours',
                  },
                  {
                    name: 'Last 30 Days',
                    value: 'last30d',
                    description: 'Updates in the past 30 days',
                  },
                  {
                    name: 'Last 48 Hours',
                    value: 'last48h',
                    description: 'Updates in the past 48 hours',
                  },
                  {
                    name: 'Last 60 Days',
                    value: 'last60d',
                    description: 'Updates in the past 60 days',
                  },
                  {
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Updates in the past 7 days',
                  },
                  {
                    name: 'Last 90 Days',
                    value: 'last90d',
                    description: 'Updates in the past 90 days',
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
                description: 'Start date of the range (inclusive)',
              },
            ],
          },
        ],
      },
    ],
  },
];
