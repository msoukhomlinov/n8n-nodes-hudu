import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const articlesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['articles'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all articles',
				action: 'Get all articles',
			},
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive an article',
				action: 'Archive an article',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new article',
				action: 'Create an article',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an article',
				action: 'Delete an article',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific article',
				action: 'Get an article',
			},
			{
				name: 'Unarchive',
				value: 'unarchive',
				description: 'Unarchive an article',
				action: 'Unarchive an article',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an article',
				action: 'Update an article',
			},
		],
		default: 'getAll',
	},
];

export const articlesFields: INodeProperties[] = [
	// Article ID field for operations that need it
	{
		displayName: 'Article ID',
		name: 'articleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['articles'],
				operation: ['get', 'update', 'delete', 'archive', 'unarchive'],
			},
		},
		default: '',
		description: 'The unique ID of the article',
	},

	// Fields for Create and Update operations
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['articles'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The name of the article',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['articles'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The HTML content of the article',
	},

	// Return All option for GetAll operation
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['articles'],
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
				resource: ['articles'],
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

	// Additional Fields for Create and Update operations
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['articles'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Draft',
				name: 'draft',
				type: 'boolean',
				default: false,
				description: 'Whether the article is a draft',
			},
			{
				displayName: 'Enable Sharing',
				name: 'enable_sharing',
				type: 'boolean',
				default: false,
				description: 'Whether the article is shareable',
			},
			{
				displayName: 'Folder ID',
				name: 'folder_id',
				type: 'number',
				default: undefined,
				description: 'The unique folder ID where the article lives',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: undefined,
				description: 'The unique company ID for non-global articles',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'The URL slug of the article',
			},
		],
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
				resource: ['articles'],
				operation: ['getAll'],
			},
		},
		description: 'All filters are combined using AND logic with the search parameter',
		options: [
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: undefined,
				description: 'Filter by company ID',
			},
			{
				displayName: 'Draft',
				name: 'draft',
				type: 'boolean',
				default: undefined,
				description: 'Filter by draft status',
			},
			{
				displayName: 'Enable Sharing',
				name: 'enable_sharing',
				type: 'boolean',
				default: undefined,
				description: 'Filter by shareable articles',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by exact article name match',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Fuzzy search query to filter articles',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'Filter by exact URL slug match',
			},
			{
				displayName: 'Updated At',
				name: 'updated_at',
				type: 'string',
				default: '',
				description:
					'Filter articles updated within a range or at an exact time. Format: "start_datetime,end_datetime" for range, "exact_datetime" for exact match. Both "start_datetime" and "end_datetime" should be in ISO 8601 format.',
			},
		],
	},
];
