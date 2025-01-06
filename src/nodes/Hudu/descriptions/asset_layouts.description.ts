import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const assetLayoutOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['asset_layouts'],
      },
    },
    options: [
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Get a list of asset layouts',
        action: 'Get a list of asset layouts',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create an asset layout',
        action: 'Create an asset layout',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get an asset layout',
        action: 'Get an asset layout',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an asset layout',
        action: 'Update an asset layout',
      },
    ],
    default: 'getAll',
  },
];

export const assetLayoutFields: INodeProperties[] = [
  // ID field for single operations
  {
    displayName: 'Asset Layout ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_layouts'],
        operation: ['get', 'update'],
      },
    },
    default: 0,
    description: 'The unique identifier for the layout',
  },

  // Return All option for GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['asset_layouts'],
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
        resource: ['asset_layouts'],
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
        resource: ['asset_layouts'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by layout name',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: undefined,
        description: 'Filter by active status',
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
        description: 'Filter asset layouts updated within a range or at an exact time',
      },
    ],
  },

  // Fields for Create and Update operations
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['asset_layouts'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'The name of the layout',
  },

  // Additional Fields
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset_layouts'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the layout is active',
      },
      {
        displayName: 'Color',
        name: 'color',
        type: 'string',
        default: '',
        description: 'The color for the layout',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string',
        default: '',
        description: 'The icon for the layout',
      },
      {
        displayName: 'Icon Color',
        name: 'icon_color',
        type: 'string',
        default: '',
        description: 'The icon color for the layout',
      },
      {
        displayName: 'Include Comments',
        name: 'include_comments',
        type: 'boolean',
        default: true,
        description: 'Whether to include comments section',
      },
      {
        displayName: 'Include Files',
        name: 'include_files',
        type: 'boolean',
        default: true,
        description: 'Whether to include files section',
      },
      {
        displayName: 'Include Passwords',
        name: 'include_passwords',
        type: 'boolean',
        default: true,
        description: 'Whether to include passwords section',
      },
      {
        displayName: 'Include Photos',
        name: 'include_photos',
        type: 'boolean',
        default: true,
        description: 'Whether to include photos section',
      },
      {
        displayName: 'Sidebar Folder ID',
        name: 'sidebar_folder_id',
        type: 'number',
        default: undefined,
        description: 'The folder ID for the sidebar',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'The URL slug for the layout',
      },
    ],
  },

  // Fields for Create and Update operations
  {
    displayName: 'Fields',
    name: 'fields',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset_layouts'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'Field',
        name: 'field',
        values: [
          {
            displayName: 'Label',
            name: 'label',
            type: 'string',
            default: '',
            description: 'The label of the field',
          },
          {
            displayName: 'Field Type',
            name: 'field_type',
            type: 'string',
            default: '',
            description: 'The type of the field',
          },
          {
            displayName: 'Show in List',
            name: 'show_in_list',
            type: 'boolean',
            default: false,
            description: 'Whether to show this field in the list view',
          },
          {
            displayName: 'Required',
            name: 'required',
            type: 'boolean',
            default: false,
            description: 'Whether the field is required',
          },
          {
            displayName: 'Hint',
            name: 'hint',
            type: 'string',
            default: '',
            description: 'Help text for the field',
          },
          {
            displayName: 'Position',
            name: 'position',
            type: 'number',
            default: 0,
            description: 'The position of the field in the layout',
          },
          {
            displayName: 'Expiration',
            name: 'expiration',
            type: 'boolean',
            default: false,
            description: 'Whether this field represents an expiration date',
          },
        ],
      },
    ],
  },
];
