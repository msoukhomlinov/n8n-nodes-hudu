import type { INodeProperties } from 'n8n-workflow';

export const listsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['lists'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new list',
        action: 'Create a list',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a list',
        action: 'Delete a list',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a specific list',
        action: 'Get a list',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many lists',
        action: 'Get many lists',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a list',
        action: 'Update a list',
      },
    ],
    default: 'getAll',
  },
];

export const listsFields: INodeProperties[] = [
  // List ID for get, update, delete
  {
    displayName: 'List ID',
    name: 'id',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: '',
    description: 'The unique ID of the list',
  },
  // Name for create
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the list',
  },
  // List items for create
  {
    displayName: 'List Items',
    name: 'list_items_attributes',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['create'],
      },
    },
    default: {},
    placeholder: 'Add List Item',
    options: [
      {
        name: 'item',
        displayName: 'Item',
        values: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            required: true,
            default: '',
            description: 'Name of the list item',
          },
        ],
      },
    ],
    description: 'Array of list items to create',
  },
  // Fields for update
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name of the list',
      },
      {
        displayName: 'List Items',
        name: 'list_items_attributes',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        placeholder: 'Add List Item',
        options: [
          {
            name: 'item',
            displayName: 'Item',
            values: [
              {
                displayName: 'Add New Item',
                name: 'addNew',
                type: 'boolean',
                default: false,
                description: 'Whether to add a new list item. Disable to update or delete an existing item by ID.',
              },
              {
                displayName: 'ID',
                name: 'id',
                type: 'number',
                default: 0,
                description: 'ID of the existing list item (required for updates or deletion)',
                displayOptions: {
                  show: {
                    addNew: [false],
                  },
                },
              },
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the list item',
              },
              {
                displayName: 'Destroy',
                name: '_destroy',
                type: 'boolean',
                default: false,
                description: 'Whether to remove this item',
                displayOptions: {
                  show: {
                    addNew: [false],
                  },
                },
              },
            ],
          },
        ],
        description: 'Array of list items to update, add, or remove',
      },
    ],
    description: 'Fields to update on the list',
  },
  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        default: '',
        description: 'Search lists by name (partial match)',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by exact list name',
      },
    ],
    description: 'Filters to apply when retrieving lists',
  },
  // Return all toggle for getAll
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to return all results or limit by a set number',
  },
  // Limit for getAll
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
    },
    displayOptions: {
      show: {
        resource: ['lists'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    default: 50,
    description: 'Max number of results to return',
  },
]; 