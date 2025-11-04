import type { INodeProperties } from 'n8n-workflow';

export const exportsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['exports'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Initiate a company export',
        action: 'Initiate export',
      },
    ],
    default: 'create',
  },
];

export const exportsFields: INodeProperties[] = [
  // Create
  {
    displayName: 'Company ID',
    name: 'companyId',
    type: 'number',
    default: 0,
    description: 'Specify the company to export',
    displayOptions: {
      show: {
        resource: ['exports'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Format',
    name: 'format',
    type: 'options',
    options: [
      { name: 'PDF', value: 'pdf' },
      { name: 'CSV', value: 'csv' },
      { name: 'S3', value: 's3' },
    ],
    default: 'pdf',
    description: 'Export format',
    displayOptions: {
      show: {
        resource: ['exports'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Include Websites',
    name: 'includeWebsites',
    type: 'boolean',
    default: false,
    description: 'Whether to include websites in the export',
    displayOptions: {
      show: {
        resource: ['exports'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Include Passwords',
    name: 'includePasswords',
    type: 'boolean',
    default: false,
    description: 'Whether to include passwords in the export',
    displayOptions: {
      show: {
        resource: ['exports'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Asset Layout IDs',
    name: 'assetLayoutIds',
    type: 'number',
    typeOptions: {
      multipleValues: true,
      multipleValueButtonText: 'Add Asset Layout ID',
    },
    default: [],
    description: 'Asset layout IDs to include',
    displayOptions: {
      show: {
        resource: ['exports'],
        operation: ['create'],
      },
    },
  },
];


