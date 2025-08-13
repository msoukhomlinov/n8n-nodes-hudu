import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS, ASSET_LAYOUT_FIELD_TYPES, ASSET_LAYOUT_FIELD_LABELS } from '../utils/constants';

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
        name: 'Get Many',
        value: 'getAll',
        description: 'Get a list of asset layouts',
        action: 'Get many asset layouts',
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
    description: 'ID of the Asset Layout to operate on',
  },

  // ----------------------------------
  //         asset_layouts:getAll
  // ----------------------------------
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
        description: 'Filter by the name of the Asset Layout',
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
        operation: ['create'],
      },
    },
    default: '',
    description: 'Name of the Asset Layout',
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
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'color',
        default: '',
        description: 'Hex code for the background color',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string',
        default: '',
        description: 'Font Awesome icon code (e.g. fa-home). Search for icons at <a href="https://fontawesome.com/search">Font Awesome</a>.',
      },
      {
        displayName: 'Icon Color',
        name: 'icon_color',
        type: 'color',
        default: '',
        description: 'Hex code for the icon color',
      },
      {
        displayName: 'Include Comments',
        name: 'include_comments',
        type: 'boolean',
        default: true,
        description: 'Whether to include comments in the Asset Layout',
      },
      {
        displayName: 'Include Files',
        name: 'include_files',
        type: 'boolean',
        default: true,
        description: 'Whether to include files in the Asset Layout',
      },
      {
        displayName: 'Include Passwords',
        name: 'include_passwords',
        type: 'boolean',
        default: true,
        description: 'Whether to include passwords in the Asset Layout',
      },
      {
        displayName: 'Include Photos',
        name: 'include_photos',
        type: 'boolean',
        default: true,
        description: 'Whether to include photos in the Asset Layout',
      },
      {
        displayName: 'Password Types',
        name: 'password_types',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'List of password types, separated with new line characters',
      },
    ],
  },
];

export const assetLayoutManageFields: INodeProperties[] = [
  {
    displayName: 'Fields to Add/Update',
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
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Field',
        name: 'field',
        values: [
          {
            displayName: 'Field Type',
            name: 'field_type',
            type: 'options',
            options: [
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.TEXT],
                value: ASSET_LAYOUT_FIELD_TYPES.TEXT,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT],
                value: ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.HEADING],
                value: ASSET_LAYOUT_FIELD_TYPES.HEADING,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.CHECKBOX],
                value: ASSET_LAYOUT_FIELD_TYPES.CHECKBOX,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.WEBSITE],
                value: ASSET_LAYOUT_FIELD_TYPES.WEBSITE,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.PASSWORD],
                value: ASSET_LAYOUT_FIELD_TYPES.PASSWORD,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.NUMBER],
                value: ASSET_LAYOUT_FIELD_TYPES.NUMBER,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.DATE],
                value: ASSET_LAYOUT_FIELD_TYPES.DATE,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT],
                value: ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.EMBED],
                value: ASSET_LAYOUT_FIELD_TYPES.EMBED,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.EMAIL],
                value: ASSET_LAYOUT_FIELD_TYPES.EMAIL,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.PHONE],
                value: ASSET_LAYOUT_FIELD_TYPES.PHONE,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG],
                value: ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG,
              },
              {
                name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA],
                value: ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA,
              },
            ],
            default: ASSET_LAYOUT_FIELD_TYPES.TEXT,
            description: 'The type of the field',
          },
          {
            displayName: 'Label',
            name: 'label',
            type: 'string',
            default: '',
            description: 'The label of the field',
          },
          {
            displayName: 'Position',
            name: 'position',
            type: 'number',
            default: 0,
            description: 'The position of the field in the layout',
          },
          {
            displayName: 'Required',
            name: 'required',
            type: 'boolean',
            default: false,
            description: 'Whether the field is required',
          },
          {
            displayName: 'Show in List',
            name: 'show_in_list',
            type: 'boolean',
            default: false,
            description: 'Whether to show this field in the list view',
          },
        ],
      },
    ],
  },
];

export const assetLayoutUpdateFields: INodeProperties[] = [
  {
    displayName: 'Update Fields',
    name: 'assetLayoutUpdateFields',
    type: 'collection',
    placeholder: 'Add Field to Update',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset_layouts'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the Asset Layout is active',
      },
      {
        displayName: 'Color',
        name: 'color',
        type: 'color',
        default: '',
        description: 'Hex code for the background color',
      },
      {
        displayName: 'Fields',
        name: 'fields',
        type: 'string',
        typeOptions: {
          multipleValues: true,
          multipleValueButtonText: 'Add Field Name',
        },
        default: [],
        description: 'An array of field names for the Asset Layout, used for reordering',
        hint: 'Enter the exact names of the fields in the order you want them to appear.',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string',
        default: '',
        description: 'Font Awesome icon code (e.g. fa-home). Search for icons at <a href="https://fontawesome.com/search">Font Awesome</a>.',
      },
      {
        displayName: 'Icon Color',
        name: 'icon_color',
        type: 'color',
        default: '',
        description: 'Hex code for the icon color',
      },
      {
        displayName: 'Include Comments',
        name: 'include_comments',
        type: 'boolean',
        default: true,
        description: 'Whether to include comments in the Asset Layout',
      },
      {
        displayName: 'Include Files',
        name: 'include_files',
        type: 'boolean',
        default: true,
        description: 'Whether to include files in the Asset Layout',
      },
      {
        displayName: 'Include Passwords',
        name: 'include_passwords',
        type: 'boolean',
        default: true,
        description: 'Whether to include passwords in the Asset Layout',
      },
      {
        displayName: 'Include Photos',
        name: 'include_photos',
        type: 'boolean',
        default: true,
        description: 'Whether to include photos in the Asset Layout',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The new name for the Asset Layout',
      },
      {
        displayName: 'Password Types',
        name: 'password_types',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'List of password types, separated with new line characters',
      },
    ],
  },
];