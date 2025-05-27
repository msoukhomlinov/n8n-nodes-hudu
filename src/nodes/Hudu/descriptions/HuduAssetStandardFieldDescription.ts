import { INodeProperties } from 'n8n-workflow';

export const assetStandardFieldDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['assetStandardField'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve the value of a specific standard field from a Hudu asset',
				action: 'Get an asset standard field value',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Modify the value of a specific standard field for a Hudu asset',
				action: 'Update an asset standard field value',
			},
		],
		default: 'get',
	},
	{
		displayName: 'Asset Name or ID',
		name: 'assetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['assetStandardField'],
			},
		},
		default: '',
		description: 'Enter the Asset ID. This is a plain input field.',
	},
	{
		displayName: 'Field Identifier Name or ID',
		name: 'fieldIdentifier',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['assetStandardField'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getStandardAssetFields',
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '',
		description: 'The new value to assign to the selected standard field. This is only applicable for the Update operation. Ensure the value is compatible with the field\'s expected data type (e.g., true/false for Archived, a number for numeric fields).',
		displayOptions: {
			show: {
				resource: ['assetStandardField'],
				operation: ['update'],
			},
		},
	},
]; 