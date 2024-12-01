import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['users'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all users',
				action: 'Get all users',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a user by ID',
				action: 'Get a user',
			},
		],
		default: 'getAll',
	},
];

export const userFields: INodeProperties[] = [
	// Return All option for GetAll operation
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['users'],
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
				resource: ['users'],
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
	// ID field for Get operation
	{
		displayName: 'User ID',
		name: 'id',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['users'],
				operation: ['get'],
			},
		},
		default: 0,
		description: 'ID of the user to retrieve',
	},
	// Filters for GetAll operation
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['users'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Filter by archived status',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Filter users by email address',
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'Filter users by first name',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Filter users by last name',
			},
			{
				displayName: 'Portal Member Company ID',
				name: 'portal_member_company_id',
				type: 'number',
				default: 0,
				description: 'Filter users by company ID (only portal members have a company ID)',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search across first name and last name',
			},
			{
				displayName: 'Security Level',
				name: 'security_level',
				type: 'options',
				options: [
					{
						name: 'Super Admin',
						value: 'super_admin',
					},
					{
						name: 'Admin',
						value: 'admin',
					},
					{
						name: 'Spectator',
						value: 'spectator',
					},
					{
						name: 'Editor',
						value: 'editor',
					},
					{
						name: 'Author',
						value: 'author',
					},
					{
						name: 'Portal Member',
						value: 'portal_member',
					},
					{
						name: 'Portal Admin',
						value: 'portal_admin',
					},
				],
				default: '',
				description: 'Filter users by security level',
			},
		],
	},
]; 