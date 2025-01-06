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
        name: 'Get All',
        value: 'getAll',
        description: 'Retrieve a list of assets',
        action: 'Retrieve a list of assets',
      },
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
  // Return All option for GetAll operation
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

  // Filters for GetAll operation
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
        description: 'Set to true to display only archived assets',
      },
      {
        displayName: 'Asset Layout ID',
        name: 'asset_layout_id',
        type: 'number',
        default: undefined,
        description: "Filter assets by their associated asset layout's ID",
      },
      {
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'Filter assets by the parent company',
      },
      {
        displayName: 'ID',
        name: 'id',
        type: 'number',
        default: undefined,
        description: 'Filter assets by their ID',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter assets by their name',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: HUDU_API_CONSTANTS.DEFAULT_PAGE,
        description: 'Specify the page number of results to return',
      },
      {
        displayName: 'Page Size',
        name: 'page_size',
        type: 'number',
        default: HUDU_API_CONSTANTS.PAGE_SIZE,
        description: 'Limit the number of assets returned per page',
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
                description: 'Start date of the range',
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
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Updates in the last 7 days',
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
        description: 'Filter assets updated within a range or at an exact time',
      },
    ],
  },
];
