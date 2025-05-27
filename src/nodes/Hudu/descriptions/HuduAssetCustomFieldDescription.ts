import { INodeProperties } from 'n8n-workflow';

export const assetCustomFieldProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['assetCustomField'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve the value of a specific custom field on a Hudu asset',
				action: 'Get an asset custom field value',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Modify the value of a specific custom field on a Hudu asset',
				action: 'Update an asset custom field value',
			},
		],
		default: 'get',
	},
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['assetCustomField'],
			},
		},
		default: '',
		description: 'The ID of the asset',
	},
	{
		displayName: 'Custom Field Name or ID',
		name: 'fieldIdentifier',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['assetCustomField'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getAssetCustomFields',
			loadOptionsDependsOn: ['assetId'],
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '',
		description: 'The value to set for this field',
		displayOptions: {
			show: {
				resource: ['assetCustomField'],
				operation: ['update'],
			},
		},
	},
]; 