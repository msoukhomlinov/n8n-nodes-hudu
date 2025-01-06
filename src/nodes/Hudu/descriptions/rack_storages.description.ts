import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const rackStorageOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['rack_storages'],
      },
    },
    options: [
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Get all rack storages',
        action: 'Get all rack storages',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a rack storage',
        action: 'Get a rack storage',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a rack storage',
        action: 'Create a rack storage',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a rack storage',
        action: 'Update a rack storage',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a rack storage',
        action: 'Delete a rack storage',
      },
    ],
    default: 'getAll',
  },
];

export const rackStorageFields: INodeProperties[] = [
  // ----------------------------------
  //         shared
  // ----------------------------------
  {
    displayName: 'Rack Storage ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storages'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    required: true,
    description: 'The ID of the rack storage',
  },

  // ----------------------------------
  //         create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['rack_storages'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The name of the rack storage',
  },
  {
    displayName: 'Location ID',
    name: 'locationId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['rack_storages'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'The ID of the location where the rack storage is located',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['rack_storages'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'The description of the rack storage',
      },
      {
        displayName: 'Max Wattage',
        name: 'max_wattage',
        type: 'number',
        default: 0,
        description: 'The maximum wattage the rack storage can handle',
      },
      {
        displayName: 'Starting Unit',
        name: 'starting_unit',
        type: 'number',
        default: 0,
        description: 'The starting unit of the rack storage',
      },
      {
        displayName: 'Height',
        name: 'height',
        type: 'number',
        default: 0,
        description: 'The height of the rack storage',
      },
      {
        displayName: 'Width',
        name: 'width',
        type: 'number',
        default: 0,
        description: 'The width of the rack storage',
      },
      {
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the rack storage',
      },
    ],
  },

  // ----------------------------------
  //         update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['rack_storages'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the rack storage',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: 0,
        description: 'The ID of the location where the rack storage is located',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'The description of the rack storage',
      },
      {
        displayName: 'Max Wattage',
        name: 'max_wattage',
        type: 'number',
        default: 0,
        description: 'The maximum wattage the rack storage can handle',
      },
      {
        displayName: 'Starting Unit',
        name: 'starting_unit',
        type: 'number',
        default: 0,
        description: 'The starting unit of the rack storage',
      },
      {
        displayName: 'Height',
        name: 'height',
        type: 'number',
        default: 0,
        description: 'The height of the rack storage',
      },
      {
        displayName: 'Width',
        name: 'width',
        type: 'number',
        default: 0,
        description: 'The width of the rack storage',
      },
      {
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the rack storage',
      },
    ],
  },

  // ----------------------------------
  //         getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['rack_storages'],
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
        resource: ['rack_storages'],
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
        resource: ['rack_storages'],
        operation: ['getAll'],
      },
    },
    description:
      'All filters are combined using AND logic and use exact matching unless specified otherwise',
    options: [
      {
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'Filter by company',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: 0,
        description: 'Filter by location ID',
      },
      {
        displayName: 'Height',
        name: 'height',
        type: 'number',
        default: 0,
        description: 'Filter by rack height',
      },
      {
        displayName: 'Min Width',
        name: 'min_width',
        type: 'number',
        default: 0,
        description: 'Filter by minimum rack width',
      },
      {
        displayName: 'Max Width',
        name: 'max_width',
        type: 'number',
        default: 0,
        description: 'Filter by maximum rack width',
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
];
