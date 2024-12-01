import { INodeProperties } from 'n8n-workflow';

export const apiInfoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['api_info'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve API information',
				action: 'Get API information',
			},
		],
		default: 'get',
	},
];

export const apiInfoFields: INodeProperties[] = []; 