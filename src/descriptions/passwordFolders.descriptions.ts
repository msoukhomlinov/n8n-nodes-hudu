import { INodeProperties } from 'n8n-workflow';

export const passwordFoldersOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['password_folders'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a password folder by ID',
				action: 'Get a password folder',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all password folders',
				action: 'Get all password folders',
			},
		],
		default: 'getAll',
	},
];

export const passwordFoldersFields: INodeProperties[] = [
	{
		displayName: 'Password Folder ID',
		name: 'id',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['password_folders'],
				operation: ['get'],
			},
		},
		default: 0,
		description: 'The ID of the password folder to retrieve',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['password_folders'],
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
				resource: ['password_folders'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 25,
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
				resource: ['password_folders'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'Filter folders by company ID',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter folders by name',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Filter by search query',
			},
		],
	},
]; 