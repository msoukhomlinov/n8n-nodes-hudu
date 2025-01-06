import type { INodeProperties } from 'n8n-workflow';

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
        name: 'Get All',
        value: 'getAll',
        description:
          '⚠️ Retrieve all IP addresses (no pagination support - may return large datasets)',
        action: 'Get all IP addresses',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new IP address',
        action: 'Create an IP address',
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
        description: 'Retrieve a single IP address',
        action: 'Get an IP address',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an IP address',
        action: 'Update an IP address',
      },
    ],
    default: 'getAll',
  },
];

export const ipAddressFields: INodeProperties[] = [
  // ----------------------------------
  //         ipAddresses:getAll
  // ----------------------------------
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
      'All filters are combined using AND logic and use exact matching unless specified otherwise',
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
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: 0,
        description: 'Filter by company ID',
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
        type: 'number',
        default: 0,
        description: 'Filter by network ID',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        options: [
          {
            name: 'Unassigned',
            value: 'unassigned',
          },
          {
            name: 'Assigned',
            value: 'assigned',
          },
          {
            name: 'Reserved',
            value: 'reserved',
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
            name: 'SLAAC',
            value: 'slaac',
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
        name: 'Unassigned',
        value: 'unassigned',
      },
      {
        name: 'Assigned',
        value: 'assigned',
      },
      {
        name: 'Reserved',
        value: 'reserved',
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
        name: 'SLAAC',
        value: 'slaac',
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
    displayName: 'Company',
    name: 'company_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCompanies',
    },
    displayOptions: {
      show: {
        resource: ['ipAddresses'],
        operation: ['create'],
      },
    },
    required: true,
    default: '',
    description: 'The company to associate with the IP address',
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
        displayName: 'FQDN',
        name: 'fqdn',
        type: 'string',
        default: '',
        description: 'The Fully Qualified Domain Name associated with the IP address',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A brief description of the IP address',
      },
      {
        displayName: 'Comments',
        name: 'comments',
        type: 'string',
        default: '',
        description: 'Additional comments about the IP address',
      },
      {
        displayName: 'Asset ID',
        name: 'asset_id',
        type: 'number',
        default: 0,
        description: 'The identifier of the asset associated with this IP address',
      },
      {
        displayName: 'Network ID',
        name: 'network_id',
        type: 'number',
        default: 0,
        description: 'The identifier of the network to which this IP address belongs',
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
    displayName: 'Update Fields',
    name: 'updateFields',
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
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        options: [
          {
            name: 'Unassigned',
            value: 'unassigned',
          },
          {
            name: 'Assigned',
            value: 'assigned',
          },
          {
            name: 'Reserved',
            value: 'reserved',
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
            name: 'SLAAC',
            value: 'slaac',
          },
        ],
        description: 'The status of the IP address',
      },
      {
        displayName: 'FQDN',
        name: 'fqdn',
        type: 'string',
        default: '',
        description: 'The Fully Qualified Domain Name associated with the IP address',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A brief description of the IP address',
      },
      {
        displayName: 'Comments',
        name: 'comments',
        type: 'string',
        default: '',
        description: 'Additional comments about the IP address',
      },
      {
        displayName: 'Asset ID',
        name: 'asset_id',
        type: 'number',
        default: 0,
        description: 'The identifier of the asset associated with this IP address',
      },
      {
        displayName: 'Network ID',
        name: 'network_id',
        type: 'number',
        default: 0,
        description: 'The identifier of the network to which this IP address belongs',
      },
      {
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: 0,
        description: 'The identifier of the company that owns this IP address',
      },
    ],
  },
];
