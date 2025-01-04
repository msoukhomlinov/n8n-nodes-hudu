import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

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
        name: 'Delete',
        value: 'delete',
        description: 'Delete a procedure',
        action: 'Delete a procedure',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a procedure',
        action: 'Get a procedure',
      },
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Retrieve many procedures',
        action: 'Get many procedures',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a procedure',
        action: 'Update a procedure',
      },
      {
        name: 'Create From Template',
        value: 'createFromTemplate',
        description: 'Create a procedure from a template',
        action: 'Create a procedure from template',
      },
      {
        name: 'Duplicate',
        value: 'duplicate',
        description: 'Duplicate an existing procedure',
        action: 'Duplicate a procedure',
      },
      {
        name: 'Kickoff',
        value: 'kickoff',
        description: 'Start a process from a company process',
        action: 'Kickoff a procedure',
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
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by the name of the procedure',
      },
      {
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: '',
        description: 'Filter by the associated company ID',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter by the URL slug of the procedure',
      },
      {
        displayName: 'Global Template',
        name: 'global_template',
        type: 'boolean',
        default: false,
        description: 'Filter for global templates',
      },
      {
        displayName: 'Company Template',
        name: 'company_template',
        type: 'number',
        default: '',
        description: 'Filter for company-specific templates',
      },
      {
        displayName: 'Parent Procedure ID',
        name: 'parent_procedure_id',
        type: 'number',
        default: '',
        description: 'Filter for child procedures of a specific parent procedure',
      },
    ],
  },

  // Get, Delete, Update
  {
    displayName: 'Procedure ID',
    name: 'id',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['get', 'delete', 'update'],
      },
    },
    default: '',
    description: 'The ID of the procedure',
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
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: '',
        description: 'The ID of the company this procedure should be transferred to',
      },
      {
        displayName: 'Company Template',
        name: 'company_template',
        type: 'boolean',
        default: false,
        description: 'When true, sets both template and remove_completion_ability to true',
      },
    ],
  },

  // Update
  {
    displayName: 'Update Fields',
    name: 'updateFields',
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
      {
        displayName: 'Company Template',
        name: 'company_template',
        type: 'boolean',
        default: false,
        description: 'When true, sets both template and remove_completion_ability to true',
      },
      {
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: '',
        description: 'The ID of the company this procedure should be transferred to',
      },
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'When true, archives the procedure',
      },
    ],
  },

  // Create From Template
  {
    displayName: 'Template ID',
    name: 'templateId',
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
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: '',
        description: 'The ID of the company for the new procedure',
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
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['duplicate'],
      },
    },
    default: 0,
    description: 'The ID of the company for the new duplicated procedure',
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
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['procedures'],
        operation: ['kickoff'],
      },
    },
    default: '',
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
        default: '',
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
