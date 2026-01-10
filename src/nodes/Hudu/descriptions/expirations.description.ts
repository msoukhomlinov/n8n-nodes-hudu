import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS, RESOURCE_TYPES } from '../utils/constants';
import { createWrapResultsField } from './resources';

export const expirationsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['expirations'],
      },
    },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many expirations',
        action: 'Get many expirations',
      },
    ],
    default: 'getAll',
  },
];

export const expirationsFields: INodeProperties[] = [
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['expirations'],
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
        resource: ['expirations'],
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
  createWrapResultsField('expirations'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['expirations'],
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
        displayName: 'Expiration Type',
        name: 'expiration_type',
        type: 'options',
        options: [
          {
            name: 'Article Expiration',
            value: 'article_expiration',
          },
          {
            name: 'Asset Field',
            value: 'asset_field',
          },
          {
            name: 'Domain',
            value: 'domain',
          },
          {
            name: 'SSL Certificate',
            value: 'ssl_certificate',
          },
          {
            name: 'Undeclared',
            value: 'undeclared',
          },
          {
            name: 'Warranty',
            value: 'warranty',
          },
        ],
        default: 'undeclared',
        description:
          'Filter expirations by expiration type (undeclared, domain, ssl_certificate, warranty, asset_field, article_expiration)',
      },
      {
        displayName: 'Resource ID',
        name: 'resource_id',
        type: 'number',
        default: undefined,
        description: 'Filter logs by resource ID; must be coupled with resource type',
      },
      {
        displayName: 'Resource Type',
        name: 'resource_type',
        type: 'options',
        options: RESOURCE_TYPES.map((type) => ({
          name: type,
          value: type,
        })),
        default: '',
        description: 'Filter logs by resource type; must be coupled with resource ID',
      },
    ],
  },
];
