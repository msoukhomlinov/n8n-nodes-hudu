import type { INodeProperties } from 'n8n-workflow';

export const vlanZonesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['vlan_zones'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new VLAN zone',
        action: 'Create a new VLAN zone',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a VLAN zone',
        action: 'Delete a VLAN zone',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a VLAN zone by ID',
        action: 'Get a VLAN zone by ID',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many VLAN zones',
        action: 'Get many VLAN zones',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a VLAN zone',
        action: 'Update a VLAN zone',
      },
    ],
    default: 'getAll',
  },
];

export const vlanZonesFields: INodeProperties[] = [
  // getAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['vlan_zones'],
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
        resource: ['vlan_zones'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    default: 50,
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
        resource: ['vlan_zones'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether to filter zones by archive status. Set to true to show only archived zones, false to show only non-archived zones.',
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
        type: 'string',
        default: '',
        description: 'Filter zones created within a range or at an exact time. Format: "start_datetime,end_datetime" for range, "exact_datetime" for exact match.',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter VLAN zones by name (exact match)',
      },
      {
        displayName: 'Updated At',
        name: 'updated_at',
        type: 'string',
        default: '',
        description: 'Filter zones updated within a range or at an exact time. Format: "start_datetime,end_datetime" for range, "exact_datetime" for exact match.',
      },
    ],
  },
  // get, update, delete
  {
    displayName: 'VLAN Zone ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['vlan_zones'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the VLAN zone',
  },
  // create
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['vlan_zones'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'Human-readable VLAN zone name',
  },
  {
    displayName: 'VLAN ID Ranges',
    name: 'vlan_id_ranges',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['vlan_zones'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'Comma-separated list of numeric ranges (e.g. "100-500,1000-1500"). Each range must be inside 1-4094 and start <= end.',
  },
  {
    displayName: 'Company Name or ID',
    name: 'company_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getCompanies',
    },
    displayOptions: {
      show: {
        resource: ['vlan_zones'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The company to associate with the VLAN zone. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['vlan_zones'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether the VLAN zone will be archived (set to true to archive, false to activate)',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Optional description',
      },
    ],
  },
  // update
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['vlan_zones'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether the VLAN zone will be archived (set to true to archive, false to activate)',
      },
      {
        displayName: 'Company Name or ID',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'The company to associate with the VLAN zone. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Optional description',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Human-readable VLAN zone name',
      },
      {
        displayName: 'VLAN ID Ranges',
        name: 'vlan_id_ranges',
        type: 'string',
        default: '',
        description: 'Comma-separated list of numeric ranges (e.g. "100-500,1000-1500")',
      },
    ],
  },
]; 