import type { INodeProperties } from 'n8n-workflow';

export const networksOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['networks'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a network',
        action: 'Create a network',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a network',
        action: 'Delete a network',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a network',
        action: 'Get a network',
      },
      {
        name: 'Get All',
        value: 'getAll',
        description: '⚠️ Retrieve all networks (no pagination support - may return large datasets)',
        action: 'Get all networks',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a network',
        action: 'Update a network',
      },
    ],
    default: 'getAll',
  },
];

export const networksFields: INodeProperties[] = [
  // ----------------------------------
  //         getAll
  // ----------------------------------
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['networks'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'Filter by network address',
      },
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
        description: 'Filter networks created within a range or at an exact time',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: undefined,
        description: 'Filter by location ID',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by network name',
      },
      {
        displayName: 'Network Type',
        name: 'network_type',
        type: 'number',
        default: undefined,
        description: 'Filter by network type',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter by network slug',
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
        description: 'Filter networks updated within a range or at an exact time',
      },
    ],
  },

  // ----------------------------------
  //         create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['networks'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the network',
  },
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['networks'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The network address (e.g., CIDR notation)',
  },
  {
    displayName: 'Network Type',
    name: 'network_type',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['networks'],
        operation: ['create'],
      },
    },
    default: 0,
    description: 'The type of network',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['networks'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the network',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: undefined,
        description: 'The ID of the location associated with this network',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A brief description of the network',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'A URL-friendly identifier for the network',
      },
    ],
  },

  // ----------------------------------
  //         get/delete
  // ----------------------------------
  {
    displayName: 'Network ID',
    name: 'networkId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['networks'],
        operation: ['get', 'delete', 'update'],
      },
    },
    default: 0,
    description: 'The ID of the network',
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
        resource: ['networks'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the network',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'The network address (e.g., CIDR notation)',
      },
      {
        displayName: 'Network Type',
        name: 'network_type',
        type: 'number',
        default: undefined,
        description: 'The type of network',
      },
      {
        displayName: 'Company',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the network',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: undefined,
        description: 'The ID of the location associated with this network',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A brief description of the network',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'A URL-friendly identifier for the network',
      },
    ],
  },
];
