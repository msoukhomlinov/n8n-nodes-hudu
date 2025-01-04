import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS, RESOURCE_TYPES } from '../utils/constants';

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
        name: 'Get All',
        value: 'getAll',
        description: 'Get all expirations',
        action: 'Get all expirations',
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
        displayName: 'Company ID',
        name: 'company_id',
        type: 'number',
        default: undefined,
        description: 'Filter expirations by company ID',
      },
      {
        displayName: 'Expiration Type',
        name: 'expiration_type',
        type: 'options',
        options: [
          {
            name: 'Undeclared',
            value: 'undeclared',
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
            name: 'Warranty',
            value: 'warranty',
          },
          {
            name: 'Asset Field',
            value: 'asset_field',
          },
          {
            name: 'Article Expiration',
            value: 'article_expiration',
          },
        ],
        default: '',
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
        options: RESOURCE_TYPES.map(type => ({
          name: type,
          value: type,
        })),
        default: '',
        description: 'Filter logs by resource type; must be coupled with resource ID',
      },
    ],
  },
];
