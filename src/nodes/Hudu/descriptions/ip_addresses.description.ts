import type { INodeProperties } from 'n8n-workflow';
import { createWrapResultsField } from './resources';

export const ipAddressOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create IP address',
        action: 'Create IP address',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an IP address',
        action: 'Delete an IP address',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get IP address',
        action: 'Get IP address',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many IP addresses (no pagination support - may return large datasets)',
        action: 'Get many IP addresses',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update IP address',
        action: 'Update IP address',
      },
    ],
    default: 'getAll',
  },
];

export const ipAddressFields: INodeProperties[] = [
  // ----------------------------------
  //         ipAddresses:getAll
  // ----------------------------------
  createWrapResultsField('ipAddresses'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['getAll'],
      },
    },
    description:
      'All filters are combined using AND logic and use exact matching unless specified otherwise. This resource does not support pagination; be careful as broad queries can return very large datasets. Use filters to narrow results.',
    options: [
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'Filter by exact IP address match',
      },
      {
        displayName: 'Asset ID',
        name: 'asset_id',
        type: 'number',
        default: 0,
        description: 'Filter by asset ID',
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
        displayName: 'Created At',
        name: 'created_at',
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
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Updates in the last 7 days',
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
        description: 'Filter IP addresses created within a range or at an exact time',
      },
      {
        displayName: 'FQDN',
        name: 'fqdn',
        type: 'string',
        default: '',
        description: 'Filter by exact FQDN match',
      },
      {
        displayName: 'Network ID',
        name: 'network_id',
        type: 'string',
        default: '',
        description: 'Enter the network ID',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: 'unassigned',
        options: [
          {
            name: 'Assigned',
            value: 'assigned',
          },
          {
            name: 'Deprecated',
            value: 'deprecated',
          },
          {
            name: 'DHCP',
            value: 'dhcp',
          },
          {
            name: 'Reserved',
            value: 'reserved',
          },
          {
            name: 'SLAAC',
            value: 'slaac',
          },
          {
            name: 'Unassigned',
            value: 'unassigned',
          },
        ],
        description: 'Filter by IP address status',
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
        description: 'Filter IP addresses updated within a range or at an exact time',
      },
    ],
  },


  // ----------------------------------
  //         ipAddresses:create
  // ----------------------------------
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['create'],
      },
    },
    description: 'The IP address',
  },
  {
    displayName: 'Status',
    name: 'status',
    type: 'options',
    required: true,
    default: 'unassigned',
    options: [
      {
        name: 'Assigned',
        value: 'assigned',
      },
      {
        name: 'Deprecated',
        value: 'deprecated',
      },
      {
        name: 'DHCP',
        value: 'dhcp',
      },
      {
        name: 'Reserved',
        value: 'reserved',
      },
      {
        name: 'SLAAC',
        value: 'slaac',
      },
      {
        name: 'Unassigned',
        value: 'unassigned',
      },
    ],
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['create'],
      },
    },
    description: 'The status of the IP address',
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
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['create', 'update'],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Asset ID',
        name: 'asset_id',
        type: 'number',
        default: 0,
        description: 'The identifier of the asset associated with this IP address',
      },
      {
        displayName: 'Comments',
        name: 'comments',
        type: 'string',
        default: '',
        description: 'Additional comments about the IP address',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A brief description of the IP address',
      },
      {
        displayName: 'FQDN',
        name: 'fqdn',
        type: 'string',
        default: '',
        description: 'The Fully Qualified Domain Name associated with the IP address',
      },
      {
        displayName: 'Network ID',
        name: 'network_id',
        type: 'string',
        default: '',
        description: 'Enter the network ID',
      },
      {
        displayName: 'Skip DNS Validation',
        name: 'skip_dns_validation',
        type: 'boolean',
        default: false,
        description: 'Whether to skip verification that the FQDN resolves to the address',
      },
    ],
  },

  // ----------------------------------
  //         ipAddresses:delete
  // ----------------------------------
  {
    displayName: 'IP Address ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['delete', 'get'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the IP address',
  },

  // ----------------------------------
  //         ipAddresses:update
  // ----------------------------------
  {
    displayName: 'IP Address ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['update'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the IP address to update',
  },
  {
    displayName: 'IP Address Update Fields',
    name: 'ipAddressUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'The IP address',
      },
      {
        displayName: 'Asset ID',
        name: 'asset_id',
        type: 'number',
        default: 0,
        description: 'The identifier of the asset associated with this IP address',
      },
      {
        displayName: 'Comments',
        name: 'comments',
        type: 'string',
        default: '',
        description: 'Additional comments about the IP address',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A brief description of the IP address',
      },
      {
        displayName: 'FQDN',
        name: 'fqdn',
        type: 'string',
        default: '',
        description: 'The Fully Qualified Domain Name associated with the IP address',
      },
      {
        displayName: 'Network ID',
        name: 'network_id',
        type: 'string',
        default: '',
        description: 'Enter the network ID',
      },
      {
        displayName: 'Skip DNS Validation',
        name: 'skip_dns_validation',
        type: 'boolean',
        default: false,
        description: 'Whether to skip verification that the FQDN resolves to the address',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: 'unassigned',
        options: [
          {
            name: 'Assigned',
            value: 'assigned',
          },
          {
            name: 'Deprecated',
            value: 'deprecated',
          },
          {
            name: 'DHCP',
            value: 'dhcp',
          },
          {
            name: 'Reserved',
            value: 'reserved',
          },
          {
            name: 'SLAAC',
            value: 'slaac',
          },
          {
            name: 'Unassigned',
            value: 'unassigned',
          },
        ],
        description: 'The status of the IP address',
      },
    ],
  },
];
