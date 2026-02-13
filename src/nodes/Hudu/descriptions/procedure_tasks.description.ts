import type { INodeProperties } from 'n8n-workflow';
import { createWrapResultsField } from './resources';

export const procedureTasksOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new procedure task',
        action: 'Create a procedure task',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a procedure task',
        action: 'Delete a procedure task',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a procedure task by ID',
        action: 'Get a procedure task',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many procedure tasks',
        action: 'Get many procedure tasks',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a procedure task',
        action: 'Update a procedure task',
      },
    ],
    default: 'getAll',
  },
];

export const procedureTasksFields: INodeProperties[] = [
  // ----------------------------------
  //         procedure_tasks:getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
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
        resource: ['procedure_tasks'],
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
  createWrapResultsField('procedure_tasks'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Procedure ID',
        name: 'procedure_id',
        type: 'number',
        default: 0,
        description: 'Filter by the procedure ID',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by the name of the task',
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
        description: 'Filter by the company. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
    ],
  },

  // ----------------------------------
  //         procedure_tasks:create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
        operation: ['create'],
      },
    },
    required: true,
    description: 'The name of the task',
  },
  {
    displayName: 'Procedure ID',
    name: 'procedure_id',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
        operation: ['create'],
      },
    },
    required: true,
    description: 'The ID of the procedure this task belongs to',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Assigned User Names or IDs',
        name: 'assigned_users',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getUsers',
          loadOptionsDependencies: ['includeBlank'],
          loadOptionsParameters: {
            includeBlank: false,
          },
        },
        default: [],
        description: 'The users assigned to the task. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A detailed description of the task',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'The due date for the task',
      },
      {
        displayName: 'Position',
        name: 'position',
        type: 'number',
        default: 0,
        description: 'The position of the task in the procedure',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          {
            name: 'High',
            value: 'high',
          },
          {
            name: 'Low',
            value: 'low',
          },
          {
            name: 'Normal',
            value: 'normal',
          },
          {
            name: 'Unsure',
            value: 'unsure',
          },
          {
            name: 'Urgent',
            value: 'urgent',
          },
        ],
        default: 'normal',
        description: 'The priority level of the task',
      },
      {
        displayName: 'User Name or ID',
        name: 'user_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'The user assigned to the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
    ],
  },

  // ----------------------------------
  //         procedure_tasks:delete
  // ----------------------------------
  {
    displayName: 'Task ID',
    name: 'taskId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
        operation: ['delete', 'get'],
      },
    },
    default: 0,
    required: true,
    description: 'The ID of the procedure task',
  },

  // ----------------------------------
  //         procedure_tasks:update
  // ----------------------------------
  {
    displayName: 'Task ID',
    name: 'taskId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
        operation: ['update'],
      },
    },
    default: 0,
    required: true,
    description: 'The ID of the procedure task to update',
  },
  {
    displayName: 'Procedure Task Update Fields',
    name: 'procedureTaskUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['procedure_tasks'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Assigned User Names or IDs',
        name: 'assigned_users',
        type: 'multiOptions',
        typeOptions: {
          loadOptionsMethod: 'getUsers',
          loadOptionsDependencies: ['includeBlank'],
          loadOptionsParameters: {
            includeBlank: false,
          },
        },
        default: [],
        description: 'The users assigned to the task. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'Completed',
        name: 'completed',
        type: 'boolean',
        default: false,
        description: 'Whether the task is marked as completed',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A detailed description of the task',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'The due date for the task',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the task',
      },
      {
        displayName: 'Position',
        name: 'position',
        type: 'number',
        default: 0,
        description: 'The position of the task in the procedure',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          {
            name: 'High',
            value: 'high',
          },
          {
            name: 'Low',
            value: 'low',
          },
          {
            name: 'Normal',
            value: 'normal',
          },
          {
            name: 'Unsure',
            value: 'unsure',
          },
          {
            name: 'Urgent',
            value: 'urgent',
          },
        ],
        default: 'normal',
        description: 'The priority level of the task',
      },
      {
        displayName: 'Procedure ID',
        name: 'procedure_id',
        type: 'number',
        default: 0,
        description: 'The ID of the procedure this task belongs to',
      },
      {
        displayName: 'User Name or ID',
        name: 'user_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'The user assigned to the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
    ],
  },
];
