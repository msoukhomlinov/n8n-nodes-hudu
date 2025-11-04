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
        name: 'Create or Update',
        value: 'createOrUpdate',
        description: 'Create or update item',
        action: 'Create or update item',
      },
      {
        name: 'Delete',
        value: 'deleteById',
        description: 'Delete item',
        action: 'Delete item',
      },
      {
        name: 'Delete by Title',
        value: 'deleteByTitle',
        description: 'Delete item by title and company name',
        action: 'Delete item by title',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get item',
        action: 'Get item',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many items',
        action: 'Get many items',
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
  //         createOrUpdate
  // ----------------------------------
  {
    displayName: 'Message',
    name: 'message',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['createOrUpdate'],
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
        operation: ['createOrUpdate'],
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
        operation: ['createOrUpdate'],
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
        operation: ['createOrUpdate'],
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
        operation: ['createOrUpdate'],
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
  //         deleteByTitle
  // ----------------------------------
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['deleteByTitle'],
      },
    },
    default: '',
    description: 'The title of the Magic Dash item to delete',
  },
  {
    displayName: 'Company Name',
    name: 'companyName',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['magic_dash'],
        operation: ['deleteByTitle'],
      },
    },
    default: '',
    description: 'The company name for the Magic Dash item to delete',
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
