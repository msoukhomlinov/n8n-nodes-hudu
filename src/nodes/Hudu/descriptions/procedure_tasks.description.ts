import { INodeProperties } from 'n8n-workflow';

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
        name: 'Get All',
        value: 'getAll',
        description: 'Get all procedure tasks',
        action: 'Get all procedure tasks',
      },
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
    default: 25,
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
        resource: ['procedure_tasks'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Procedure ID',
        name: 'procedure_id',
        type: 'number',
        default: undefined,
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
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: undefined,
        description: 'Filter by the company ID',
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
    default: undefined,
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
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A detailed description of the task',
      },
      {
        displayName: 'Position',
        name: 'position',
        type: 'number',
        default: undefined,
        description: 'The position of the task in the procedure',
      },
      {
        displayName: 'User ID',
        name: 'user_id',
        type: 'number',
        default: undefined,
        description: 'The ID of the user assigned to the task',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'The due date for the task',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          {
            name: 'Unsure',
            value: 'unsure',
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
            name: 'High',
            value: 'high',
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
        displayName: 'Assigned Users',
        name: 'assigned_users',
        type: 'string',
        default: '',
        description: 'Comma-separated list of user IDs assigned to the task',
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
    displayName: 'Update Fields',
    name: 'updateFields',
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
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the task',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'A detailed description of the task',
      },
      {
        displayName: 'Completed',
        name: 'completed',
        type: 'boolean',
        default: false,
        description: 'When true, marks the task as completed',
      },
      {
        displayName: 'Procedure ID',
        name: 'procedure_id',
        type: 'number',
        default: undefined,
        description: 'The ID of the procedure this task belongs to',
      },
      {
        displayName: 'Position',
        name: 'position',
        type: 'number',
        default: undefined,
        description: 'The position of the task in the procedure',
      },
      {
        displayName: 'User ID',
        name: 'user_id',
        type: 'number',
        default: undefined,
        description: 'The ID of the user assigned to the task',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'The due date for the task',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          {
            name: 'Unsure',
            value: 'unsure',
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
            name: 'High',
            value: 'high',
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
        displayName: 'Assigned Users',
        name: 'assigned_users',
        type: 'string',
        default: '',
        description: 'Comma-separated list of user IDs assigned to the task',
      },
    ],
  },
];

