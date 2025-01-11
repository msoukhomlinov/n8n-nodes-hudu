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
        name: 'Get Many',
        value: 'getAll',
        description: '⚠️ Retrieve many networks (no pagination support - may return large datasets)',
        action: 'Get many networks',
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
        description: 'Filter by company. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
												default: '',
												description: 'The specific date to filter by',
											},
											{
												displayName: 'End Date',
												name: 'end',
												type: 'dateTime',
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
												default: '',
												description: 'Start date of the range',
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
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'The network address (e.g., CIDR notation)',
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
        description: 'The company to associate with the network. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A brief description of the network',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: undefined,
        description: 'The ID of the location associated with this network',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the network',
      },
      {
        displayName: 'Network Type',
        name: 'network_type',
        type: 'number',
        default: undefined,
        description: 'The type of network',
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
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'The network address (e.g., CIDR notation)',
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
        description: 'The company to associate with the network. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A brief description of the network',
      },
      {
        displayName: 'Location ID',
        name: 'location_id',
        type: 'number',
        default: undefined,
        description: 'The ID of the location associated with this network',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the network',
      },
      {
        displayName: 'Network Type',
        name: 'network_type',
        type: 'number',
        default: undefined,
        description: 'The type of network',
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
