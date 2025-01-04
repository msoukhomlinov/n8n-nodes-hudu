import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const matchersOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['matchers'],
      },
    },
    options: [
      {
        name: 'Get All',
        value: 'getAll',
        description: 'Get all matchers for an integration',
        action: 'Get all matchers',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a matcher',
        action: 'Update a matcher',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a matcher',
        action: 'Delete a matcher',
      },
    ],
    default: 'getAll',
  },
];

export const matchersFields: INodeProperties[] = [
  // ----------------------------------
  //         getAll
  // ----------------------------------
  {
    displayName: 'Integration ID',
    name: 'integrationId',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['matchers'],
        operation: ['getAll'],
      },
    },
    default: 0,
    description:
      'The ID of the integration, which can be found in the URL when editing an integration',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['matchers'],
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
        resource: ['matchers'],
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
        resource: ['matchers'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: undefined,
        description: 'Filter by company ID',
      },
      {
        displayName: 'Identifier',
        name: 'identifier',
        type: 'string',
        default: '',
        description:
          "Filter by the identifier in the integration (used if the integration's ID is a string)",
      },
      {
        displayName: 'Matched',
        name: 'matched',
        type: 'boolean',
        default: undefined,
        description: 'Filter by whether the company has already been matched',
      },
      {
        displayName: 'Sync ID',
        name: 'sync_id',
        type: 'number',
        default: undefined,
        description:
          "Filter by the ID of the record in the integration (used if the integration's ID is an integer)",
      },
    ],
  },

  // ----------------------------------
  //         update
  // ----------------------------------
  {
    displayName: 'Matcher ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['matchers'],
        operation: ['update', 'delete'],
      },
    },
    default: 0,
    description: 'The ID of the matcher',
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['matchers'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: undefined,
        description: 'The updated company ID',
      },
      {
        displayName: 'Identifier',
        name: 'identifier',
        type: 'string',
        default: '',
        description: 'The updated identifier',
      },
      {
        displayName: 'Potential Company ID',
        name: 'potential_company_id',
        type: 'number',
        default: undefined,
        description: 'The updated potential company ID',
      },
      {
        displayName: 'Sync ID',
        name: 'sync_id',
        type: 'number',
        default: undefined,
        description: 'The updated sync ID',
      },
    ],
  },
];
