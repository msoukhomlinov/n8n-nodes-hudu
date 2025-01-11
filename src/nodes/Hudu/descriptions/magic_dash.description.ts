import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const magicDashOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['magic_dash'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a Magic Dash item',
        action: 'Create a magic dash item',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a Magic Dash item by title and company name',
        action: 'Delete a magic dash item by title and company name',
      },
      {
        name: 'Delete By ID',
        value: 'deleteById',
        description: 'Delete a Magic Dash item by ID',
        action: 'Delete a magic dash item by id',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a Magic Dash item by ID',
        action: 'Get a magic dash item',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many Magic Dash items',
        action: 'Get many magic dash items',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a Magic Dash item by title and company name',
        action: 'Update a magic dash item',
      },
    ],
    default: 'getAll',
  },
];

export const magicDashFields: INodeProperties[] = [
  // ----------------------------------
  //         getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['magic_dash'],
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
        resource: ['magic_dash'],
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
        resource: ['magic_dash'],
        operation: ['getAll'],
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
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Filter by title',
      },
    ],
  },

  // ----------------------------------
  //         create & update
  // ----------------------------------
  {
    displayName: 'Message',
    name: 'message',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description: 'The primary content to be displayed on the Magic Dash Item',
  },
  {
    displayName: 'Company Name',
    name: 'companyName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['create', 'update', 'delete'],
      },
    },
    default: '',
    description: 'The company name attribute used to match an existing company',
  },
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['create', 'update', 'delete'],
      },
    },
    default: '',
    description:
      'The title attribute, used for matching existing Magic Dash Items with the same title and company name',
  },
  {
    displayName: 'Content',
    name: 'content',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['create', 'update'],
      },
    },
    default: '',
    description:
      'HTML content (tables, images, videos, etc.) to be displayed in the Magic Dash Item',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['create', 'update'],
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
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Content Link',
        name: 'content_link',
        type: 'string',
        default: '',
        description: "A link to an external website associated with the Magic Dash Item's content",
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string',
        default: '',
        description: 'Font Awesome icon code (e.g. fa-home). Search for icons at <a href="https://fontawesome.com/search">Font Awesome</a>.',
      },
      {
        displayName: 'Image URL',
        name: 'image_url',
        type: 'string',
        default: '',
        description: 'A URL for an image to be used in the header of the Magic Dash Item',
      },
      {
        displayName: 'Shade',
        name: 'shade',
        type: 'color',
        default: '',
        //description: 'An optional color for the Magic Dash Item to represent different contextual states (e.g., success, danger)',
      },
    ],
  },

  // ----------------------------------
  //         deleteById
  // ----------------------------------
  {
    displayName: 'ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['deleteById'],
      },
    },
    default: 0,
    required: true,
    description: 'The ID of the Magic Dash item to delete',
  },

  // ----------------------------------
  //         get
  // ----------------------------------
  {
    displayName: 'ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['get'],
      },
    },
    default: 0,
    required: true,
    description: 'The ID of the Magic Dash item to get',
  },
];
