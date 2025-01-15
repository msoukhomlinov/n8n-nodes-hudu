import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const assetsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['assets'],
      },
    },
    options: [
      {
        name: 'Archive',
        value: 'archive',
        description: 'Archive an asset',
        action: 'Archive an asset',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create an asset',
        action: 'Create an asset',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an asset',
        action: 'Delete an asset',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get an asset by ID',
        action: 'Get an asset',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve a list of assets',
        action: 'Retrieve a list of assets',
      },
      {
        name: 'Unarchive',
        value: 'unarchive',
        description: 'Unarchive an asset',
        action: 'Unarchive an asset',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an asset',
        action: 'Update an asset',
      },
    ],
    default: 'getAll',
  },
];

export const assetsFields: INodeProperties[] = [
  // ----------------------------------
  //         assets:create
  // ----------------------------------
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
    default: '',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Asset Layout Name or ID',
    name: 'asset_layout_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getAssetLayouts',
      loadOptionsParameters: {
        includeBlank: true,
      },
    },
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
    },
    description: 'The name of the new asset',
  },

  // ----------------------------------
  //         assets:getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['assets'],
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
        resource: ['assets'],
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

  // ----------------------------------
  //         assets:single operations
  // ----------------------------------
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
    default: '',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['get', 'update', 'delete', 'archive', 'unarchive'],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Asset ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['get', 'update', 'delete', 'archive', 'unarchive'],
      },
    },
    default: 0,
    description: 'The ID of the asset to operate on',
  },

  // ----------------------------------
  //         assets:filters
  // ----------------------------------
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['assets'],
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
        displayName: 'Asset Layout Name or ID',
        name: 'asset_layout_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getAssetLayouts',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
        description: 'Filter assets by name',
      },
      {
        displayName: 'Primary Serial',
        name: 'primary_serial',
        type: 'string',
        default: '',
        description: 'Filter assets by their primary serial number',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Filter assets using a search query',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter assets by their URL slug',
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
        description: 'Filter assets updated within a range or at an exact time',
      },
    ],
  },

  // ----------------------------------
  //         assets:create/update fields
  // ----------------------------------
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'Custom Fields',
        name: 'customFields',
        placeholder: 'Add Custom Field',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        options: [
          {
            name: 'field',
            displayName: 'Field',
            values: [
              {
                displayName: 'Field Label',
                name: 'label',
                type: 'string',
                default: '',
                description: 'Label of the asset layout field (needs to be exact)',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value for the custom field',
              },
            ],
          },
        ],
        description: 'Custom fields for the asset',
      },
      {
        displayName: 'Primary Mail',
        name: 'primary_mail',
        type: 'string',
        default: '',
        description: 'The primary email associated with the asset',
      },
      {
        displayName: 'Primary Manufacturer',
        name: 'primary_manufacturer',
        type: 'string',
        default: '',
        description: 'The primary manufacturer of the asset',
      },
      {
        displayName: 'Primary Model',
        name: 'primary_model',
        type: 'string',
        default: '',
        description: 'The primary model of the asset',
      },
      {
        displayName: 'Primary Serial',
        name: 'primary_serial',
        type: 'string',
        default: '',
        description: 'The primary serial number of the asset',
      },
    ],
  },
];

