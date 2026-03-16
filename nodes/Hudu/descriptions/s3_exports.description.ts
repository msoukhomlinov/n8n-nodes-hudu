import type { INodeProperties } from 'n8n-workflow';

export const s3ExportsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['s3_exports'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Initiate an S3 export',
        action: 'Initiate S3 export',
      },
    ],
    default: 'create',
  },
];

export const s3ExportsFields: INodeProperties[] = [];


