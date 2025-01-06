import type { INodeProperties } from 'n8n-workflow';

export const rackStorageItemOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
      },
    },
    options: [
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Get all rack storage items',
        action: 'Get all rack storage items',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a rack storage item',
        action: 'Get a rack storage item',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a rack storage item',
        action: 'Create a rack storage item',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a rack storage item',
        action: 'Update a rack storage item',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a rack storage item',
        action: 'Delete a rack storage item',
      },
    ],
    default: 'getAll',
  },
];

export const rackStorageItemFields: INodeProperties[] = [
  // ----------------------------------
  //         rack_storage_items:getAll
  // ----------------------------------
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Asset ID',
        name: 'asset_id',
        type: 'number',
        default: undefined,
        description: 'Filter by Asset ID',
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
        displayName: 'End Unit',
        name: 'end_unit',
        type: 'number',
        default: undefined,
        description: 'Filter by End Unit',
      },
      {
        displayName: 'Rack Storage Role ID',
        name: 'rack_storage_role_id',
        type: 'number',
        default: undefined,
        description: 'Filter by Rack Storage Role ID',
      },
      {
        displayName: 'Side',
        name: 'side',
        type: 'string',
        default: '',
        description: 'Filter by Side. Front or Rear',
      },
      {
        displayName: 'Start Unit',
        name: 'start_unit',
        type: 'number',
        default: undefined,
        description: 'Filter by Start Unit',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'number',
        default: undefined,
        description: 'Filter by Status',
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
  //      rack_storage_items:get
  // ----------------------------------
  {
    displayName: 'ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['get', 'delete', 'update'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the rack storage item',
  },

  // ----------------------------------
  //      rack_storage_items:create
  // ----------------------------------
  {
    displayName: 'Rack Storage Role ID',
    name: 'rack_storage_role_id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'The unique ID of the rack storage role',
  },
  {
    displayName: 'Asset ID',
    name: 'asset_id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'The unique ID of the asset',
  },
  {
    displayName: 'Start Unit',
    name: 'start_unit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'The start unit of the rack storage item',
  },
  {
    displayName: 'End Unit',
    name: 'end_unit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'The end unit of the rack storage item',
  },
  {
    displayName: 'Status',
    name: 'status',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'The status of the rack storage item',
  },
  {
    displayName: 'Side',
    name: 'side',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'The side of the rack storage item',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Max Wattage',
        name: 'max_wattage',
        type: 'number',
        default: 0,
        description: 'The maximum wattage of the rack storage item',
      },
      {
        displayName: 'Power Draw',
        name: 'power_draw',
        type: 'number',
        default: 0,
        description: 'The power draw of the rack storage item',
      },
      {
        displayName: 'Reserved Message',
        name: 'reserved_message',
        type: 'string',
        default: '',
        description: 'The reserved message for the rack storage item',
      },
    ],
  },

  // ----------------------------------
  //      rack_storage_items:update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['rack_storage_items'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Asset ID',
        name: 'asset_id',
        type: 'number',
        default: 0,
        description: 'The unique ID of the asset',
      },
      {
        displayName: 'End Unit',
        name: 'end_unit',
        type: 'number',
        default: 0,
        description: 'The end unit of the rack storage item',
      },
      {
        displayName: 'Max Wattage',
        name: 'max_wattage',
        type: 'number',
        default: 0,
        description: 'The maximum wattage of the rack storage item',
      },
      {
        displayName: 'Power Draw',
        name: 'power_draw',
        type: 'number',
        default: 0,
        description: 'The power draw of the rack storage item',
      },
      {
        displayName: 'Rack Storage Role ID',
        name: 'rack_storage_role_id',
        type: 'number',
        default: 0,
        description: 'The unique ID of the rack storage role',
      },
      {
        displayName: 'Reserved Message',
        name: 'reserved_message',
        type: 'string',
        default: '',
        description: 'The reserved message for the rack storage item',
      },
      {
        displayName: 'Side',
        name: 'side',
        type: 'number',
        default: 0,
        description: 'The side of the rack storage item',
      },
      {
        displayName: 'Start Unit',
        name: 'start_unit',
        type: 'number',
        default: 0,
        description: 'The start unit of the rack storage item',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'number',
        default: 0,
        description: 'The status of the rack storage item',
      },
    ],
  },
];
