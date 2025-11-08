import type { INodeProperties } from 'n8n-workflow';

export const vlansOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['vlans'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create VLAN',
        action: 'Create VLAN',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete VLAN',
        action: 'Delete VLAN',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get VLAN',
        action: 'Get VLAN',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many VLANs',
        action: 'Get many VLANS',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update VLAN',
        action: 'Update VLAN',
      },
    ],
    default: 'getAll',
  },
];

export const vlansFields: INodeProperties[] = [
  // getAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['vlans'],
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
        resource: ['vlans'],
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
        resource: ['vlans'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description:
          'Whether to filter by archived status (true = archived only, false = active only)',
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
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter VLANs by name',
      },
      {
        displayName: 'VLAN ID',
        name: 'vlan_id',
        type: 'number',
        default: 0,
        description: 'Filter by VLAN numeric ID',
      },
      {
        displayName: 'VLAN Zone Name or ID',
        name: 'vlan_zone_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getVlanZones',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description:
          'Filter by VLAN Zone. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
    ],
  },
  // Identifier Type toggle for get operation
  {
    displayName: 'Identifier Type',
    name: 'identifierType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['vlans'],
        operation: ['get'],
      },
    },
    options: [
      {
        name: 'ID',
        value: 'id',
        description: 'Use numeric VLAN ID',
      },
      {
        name: 'Slug',
        value: 'slug',
        description: 'Use VLAN URL slug',
      },
    ],
    default: 'id',
    description: 'Whether to retrieve the VLAN by numeric ID or slug identifier',
  },
  // get operation
  {
    displayName: 'VLAN ID',
    name: 'id',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['vlans'],
        operation: ['get'],
      },
    },
    default: '',
    required: true,
    description: 'The unique ID or slug of the VLAN',
  },
  // update, delete
  {
    displayName: 'VLAN ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['vlans'],
        operation: ['update', 'delete'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the VLAN',
  },
  // create
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['vlans'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'Human-readable VLAN name',
  },
  {
    displayName: 'VLAN ID',
    name: 'vlan_id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['vlans'],
        operation: ['create'],
      },
    },
    default: 0,
    required: true,
    description: 'Numeric VLAN (1-4094)',
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
        resource: ['vlans'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The company to associate with the VLAN. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['vlans'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether the VLAN is archived (true) or active (false)',
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
        description: 'Human-readable VLAN name',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Rich-text notes',
      },
      {
        displayName: 'Role List Item ID',
        name: 'role_list_item_id',
        type: 'number',
        default: 0,
        description: 'The role list item ID for this VLAN',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'URL-friendly identifier',
      },
      {
        displayName: 'Status List Item Name or ID',
        name: 'status_list_item_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getLists',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'VLAN Zone Name or ID',
        name: 'vlan_zone_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getVlanZones',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
    ],
  },
  // update
  {
    displayName: 'VLAN Update Fields',
    name: 'vlanUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['vlans'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether the VLAN is archived (set to true to archive, false to activate)',
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
        description:
          'Change VLAN company. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
        description: 'Human-readable VLAN name',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Rich-text notes',
      },
      {
        displayName: 'Role List Item ID',
        name: 'role_list_item_id',
        type: 'number',
        default: 0,
        description: 'The role list item ID for this VLAN',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'URL-friendly identifier',
      },
      {
        displayName: 'Status List Item Name or ID',
        name: 'status_list_item_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getLists',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'VLAN ID',
        name: 'vlan_id',
        type: 'number',
        default: 0,
        description: 'Numeric VLAN (1-4094)',
      },
      {
        displayName: 'VLAN Zone Name or ID',
        name: 'vlan_zone_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getVlanZones',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
    ],
  },
]; 