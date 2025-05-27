import { INodeProperties } from 'n8n-workflow';

export const assetLinkFieldProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['assetLinkField'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve the linked asset(s) for a specific asset link field on a Hudu asset',
				action: 'Get an asset link field value',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Modify the linked asset(s) for a specific asset link field on a Hudu asset',
				action: 'Update an asset link field value',
			},
		],
		default: 'get',
	},
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'number',
		required: true,
		default: undefined,
		placeholder: 'Enter the Asset ID',
		description: 'The numeric ID of the asset. You can use an <a href="https://docs.n8n.io/code/expressions/">expression</a> to specify this dynamically.',
		displayOptions: {
			show: {
				resource: ['assetLinkField'],
			},
		},		
	},
	{
		displayName: 'Link Field Identifier Name or ID',
		name: 'fieldIdentifier',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['assetLinkField'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getAssetLinkFields',
			loadOptionsDependsOn: ['assetId'],
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Linked Asset ID(s)',
		name: 'value',
		type: 'string',
		default: '',
		description: 'A comma-separated string of asset IDs to link (e.g., \'123,456\'). You can use an <a href="https://docs.n8n.io/code/expressions/">expression</a> to dynamically set linked assets.',
		displayOptions: {
			show: {
				resource: ['assetLinkField'],
				operation: ['update'],
			},
		},
		placeholder: 'e.g., 101,202,303',
	},
]; 