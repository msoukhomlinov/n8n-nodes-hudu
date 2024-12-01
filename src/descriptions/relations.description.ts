import { INodeProperties } from 'n8n-workflow';

export const relationsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['relations'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all relations',
				action: 'Get all relations',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new relation',
				action: 'Create a relation',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a relation',
				action: 'Delete a relation',
			},
		],
		default: 'getAll',
	},
];

export const relationsFields: INodeProperties[] = [
	// ----------------------------------
	//         relations:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['relations'],
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
				resource: ['relations'],
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

	// ----------------------------------
	//         relations:create
	// ----------------------------------
	{
		displayName: 'To Entity ID',
		name: 'toable_id',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['relations'],
				operation: ['create'],
			},
		},
		description: 'The ID of the destination entity in the relation',
	},
	{
		displayName: 'To Entity Type',
		name: 'toable_type',
		type: 'options',
		required: true,
		default: 'Asset',
		options: [
			{
				name: 'Asset',
				value: 'Asset',
			},
			{
				name: 'Asset Password',
				value: 'AssetPassword',
			},
			{
				name: 'Article',
				value: 'Article',
			},
			{
				name: 'Company',
				value: 'Company',
			},
			{
				name: 'Procedure',
				value: 'Procedure',
			},
			{
				name: 'Website',
				value: 'Website',
			},
		],
		displayOptions: {
			show: {
				resource: ['relations'],
				operation: ['create'],
			},
		},
		description: 'The type of the destination entity in the relation',
	},
	{
		displayName: 'From Entity ID',
		name: 'fromable_id',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['relations'],
				operation: ['create'],
			},
		},
		description: 'The ID of the origin entity in the relation',
	},
	{
		displayName: 'From Entity Type',
		name: 'fromable_type',
		type: 'options',
		required: true,
		default: 'Asset',
		options: [
			{
				name: 'Asset',
				value: 'Asset',
			},
			{
				name: 'Asset Password',
				value: 'AssetPassword',
			},
			{
				name: 'Article',
				value: 'Article',
			},
			{
				name: 'Company',
				value: 'Company',
			},
			{
				name: 'Procedure',
				value: 'Procedure',
			},
			{
				name: 'Website',
				value: 'Website',
			},
		],
		displayOptions: {
			show: {
				resource: ['relations'],
				operation: ['create'],
			},
		},
		description: 'The type of the origin entity in the relation',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['relations'],
				operation: ['create'],
			},
		},
		description:
			'Provide a description for the relation to explain the relationship between the two entities',
	},
	{
		displayName: 'Is Inverse',
		name: 'is_inverse',
		type: 'boolean',
		required: true,
		default: false,
		displayOptions: {
			show: {
				resource: ['relations'],
				operation: ['create'],
			},
		},
		description:
			'When a relation is created, it will also create another relation that is the inverse. When this is true, this relation is the inverse',
	},

	// ----------------------------------
	//         relations:delete
	// ----------------------------------
	{
		displayName: 'Relation ID',
		name: 'id',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['relations'],
				operation: ['delete'],
			},
		},
		default: 0,
		required: true,
		description: 'ID of the relation to delete',
	},
];
