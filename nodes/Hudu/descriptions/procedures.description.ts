import type { INodeProperties } from 'n8n-workflow';
import {
  HUDU_API_CONSTANTS,
  PROCEDURE_TYPES,
  PROCEDURE_SCOPES,
} from '../utils/constants';
import { createWrapResultsField } from './resources';

export const proceduresOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new procedure',
        action: 'Create a procedure',
      },
      {
        name: 'Create From Template',
        value: 'createFromTemplate',
        description: 'Create a procedure from a template',
        action: 'Create a procedure from template',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a procedure',
        action: 'Delete a procedure',
      },
      {
        name: 'Duplicate',
        value: 'duplicate',
        description: 'Duplicate an existing procedure',
        action: 'Duplicate a procedure',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a procedure',
        action: 'Get a procedure',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve many procedures',
        action: 'Get many procedures',
      },
      {
        name: 'Kickoff',
        value: 'kickoff',
        description: 'Start a process from a company process',
        action: 'Kickoff a procedure',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a procedure',
        action: 'Update a procedure',
      },
    ],
    default: 'getAll',
  },
];

export const proceduresFields: INodeProperties[] = [
  // Get All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  // eslint-disable-next-line n8n-nodes-base/node-param-default-missing
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['procedures'],
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
  createWrapResultsField('procedures'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether to show only archived processes/runs. Default is non-archived only.',
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
                displayName: 'End Datetime',
                name: 'end',
                type: 'dateTime',
                default: '',
                displayOptions: {
                  show: { mode: ['range'] },
                },
              },
              {
                displayName: 'Exact Datetime',
                name: 'exact',
                type: 'dateTime',
                default: '',
                displayOptions: {
                  show: { mode: ['exact'] },
                },
              },
              {
                displayName: 'Mode',
                name: 'mode',
                type: 'options',
                options: [
                  { name: 'Exact', value: 'exact' },
                  { name: 'Preset', value: 'preset' },
                  { name: 'Range', value: 'range' },
                ],
                default: 'preset',
              },
              {
                displayName: 'Preset',
                name: 'preset',
                type: 'options',
                options: [
                  { name: 'Last 24 Hours', value: 'last24h' },
                  { name: 'Last 7 Days', value: 'last7d' },
                  { name: 'Last 30 Days', value: 'last30d' },
                ],
                default: 'last7d',
                displayOptions: {
                  show: { mode: ['preset'] },
                },
              },
              {
                displayName: 'Start Datetime',
                name: 'start',
                type: 'dateTime',
                default: '',
                displayOptions: {
                  show: { mode: ['range'] },
                },
              },
            ],
          },
        ],
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by name (case-insensitive exact match)',
      },
      {
        displayName: 'Parent Process ID',
        name: 'parent_process_id',
        type: 'number',
        default: 0,
        description: 'Filter runs by their parent process ID',
      },
      {
        displayName: 'Process Scope',
        name: 'process_scope',
        type: 'options',
        options: PROCEDURE_SCOPES.map((s) => ({ name: s.charAt(0).toUpperCase() + s.slice(1), value: s })),
        default: '',
        description: 'Filter processes by scope: global (all companies) or company-specific. Only applies when filtering processes.',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter by the URL slug',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: PROCEDURE_TYPES.map((t) => ({
          name: t.charAt(0).toUpperCase() + t.slice(1),
          value: t,
        })),
        default: 'all',
        description: 'Filter by type: process (templates only), run (active instances only), or all',
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
                displayName: 'End Datetime',
                name: 'end',
                type: 'dateTime',
                default: '',
                displayOptions: {
                  show: { mode: ['range'] },
                },
              },
              {
                displayName: 'Exact Datetime',
                name: 'exact',
                type: 'dateTime',
                default: '',
                displayOptions: {
                  show: { mode: ['exact'] },
                },
              },
              {
                displayName: 'Mode',
                name: 'mode',
                type: 'options',
                options: [
                  { name: 'Exact', value: 'exact' },
                  { name: 'Preset', value: 'preset' },
                  { name: 'Range', value: 'range' },
                ],
                default: 'preset',
              },
              {
                displayName: 'Preset',
                name: 'preset',
                type: 'options',
                options: [
                  { name: 'Last 24 Hours', value: 'last24h' },
                  { name: 'Last 7 Days', value: 'last7d' },
                  { name: 'Last 30 Days', value: 'last30d' },
                ],
                default: 'last7d',
                displayOptions: {
                  show: { mode: ['preset'] },
                },
              },
              {
                displayName: 'Start Datetime',
                name: 'start',
                type: 'dateTime',
                default: '',
                displayOptions: {
                  show: { mode: ['range'] },
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // Get, Delete, Update
  // Identifier Type toggle for get operation
  {
    displayName: 'Identifier Type',
    name: 'identifierType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['get'],
      },
    },
    options: [
      {
        name: 'ID',
        value: 'id',
        description: 'Use numeric procedure ID',
      },
      {
        name: 'Slug',
        value: 'slug',
        description: 'Use procedure URL slug',
      },
    ],
    default: 'id',
    description: 'Whether to retrieve the procedure by numeric ID or slug identifier',
  },

  // Procedure ID field for operations that need it
  {
    displayName: 'Procedure ID',
    name: 'procedureId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['get', 'delete', 'update'],
      },
    },
    default: '',
    description: 'The unique ID or slug of the procedure',
  },

  // Create
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Name of the procedure',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the procedure',
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
        description: 'The company for this process. Leave empty/null for a global template. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
    ],
  },

  // Update
  {
    displayName: 'Procedure Update Fields',
    name: 'procedureUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether to archive the process. Only company processes can be archived — global templates and runs cannot.',
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
        description: 'The company for this process. Set to null for a global template. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'The new description for the process or run',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The new name for the process or run',
      },
    ],
  },

  // Create From Template
  {
    displayName: 'Template ID',
    name: 'template_id',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['createFromTemplate'],
      },
    },
    default: '',
    description: 'The ID of the template procedure to duplicate',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['createFromTemplate'],
      },
    },
    options: [
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
        description: 'The company for the new procedure. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The new name for the procedure',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'The new description for the procedure',
      },
    ],
  },

  // Duplicate
  {
    displayName: 'Procedure ID',
    name: 'id',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['duplicate'],
      },
    },
    default: '',
    description: 'The ID of the procedure to duplicate',
  },
  {
    displayName: 'Company Name or ID',
    name: 'companyId',
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
        resource: ['procedures'],
        operation: ['duplicate'],
      },
    },
    description: 'The company for the new duplicated procedure. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['duplicate'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The new name for the duplicated procedure',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'The new description for the duplicated procedure',
      },
    ],
  },

  // Kickoff
  {
    displayName: 'Procedure ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['kickoff'],
      },
    },
    default: 0,
    description: 'The ID of the procedure to kickoff',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['kickoff'],
      },
    },
    options: [
      {
        displayName: 'Asset ID',
        name: 'asset_id',
        type: 'number',
        default: 0,
        description: 'The ID of the asset to attach the process to',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The new name for the procedure',
      },
    ],
  },

];
