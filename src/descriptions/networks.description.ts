import { INodeProperties } from 'n8n-workflow';

export const networksOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['networks'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all networks',
				action: 'Get all networks',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new network',
				action: 'Create a network',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a network',
				action: 'Delete a network',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a network by ID',
				action: 'Get a network',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a network',
				action: 'Update a network',
			},
		],
		default: 'getAll',
	},
];

export const networksFields: INodeProperties[] = [
	// ----------------------------------
	//         networks:getAll
	// ----------------------------------
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['getAll'],
			},
		},
		description: 'Filter by network address',
	},
	{
		displayName: 'Company ID',
		name: 'company_id',
		type: 'number',
		default: undefined,
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['getAll'],
			},
		},
		description: 'Filter by company ID',
	},
	{
		displayName: 'Created At',
		name: 'created_at',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['getAll'],
			},
		},
		description: 'Filter networks created within a range or at an exact time. Format: \'start_datetime,end_datetime\' for range, \'exact_datetime\' for exact match. Both \'start_datetime\' and \'end_datetime\' should be in ISO 8601 format.',
		placeholder: '2023-06-01T12:34:56Z,2023-06-07T12:34:56Z',
	},
	{
		displayName: 'Location ID',
		name: 'location_id',
		type: 'number',
		default: undefined,
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['getAll'],
			},
		},
		description: 'Filter by location ID',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['getAll'],
			},
		},
		description: 'Filter by network name',
	},
	{
		displayName: 'Network Type',
		name: 'network_type',
		type: 'number',
		default: undefined,
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['getAll'],
			},
		},
		description: 'Filter by network type',
	},
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['getAll'],
			},
		},
		description: 'Filter by network slug',
	},
	{
		displayName: 'Updated At',
		name: 'updated_at',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['getAll'],
			},
		},
		description: 'Filter networks updated within a range or at an exact time. Format: \'start_datetime,end_datetime\' for range, \'exact_datetime\' for exact match. Both \'start_datetime\' and \'end_datetime\' should be in ISO 8601 format.',
		placeholder: '2023-06-01T12:34:56Z,2023-06-07T12:34:56Z',
	},

	// ----------------------------------
	//         networks:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['create'],
			},
		},
		description: 'The name of the network',
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['create'],
			},
		},
		description: 'The network address, typically in CIDR notation',
	},
	{
		displayName: 'Network Type',
		name: 'network_type',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['create'],
			},
		},
		description: 'The type of network',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: undefined,
				description: 'The ID of the company that owns this network',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A brief description of the network',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'number',
				default: undefined,
				description: 'The ID of the location associated with this network',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'A slug representing the network',
			},
		],
	},

	// ----------------------------------
	//         networks:delete
	// ----------------------------------
	{
		displayName: 'Network ID',
		name: 'networkId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['delete', 'get'],
			},
		},
		default: 0,
		required: true,
		description: 'The ID of the network',
	},

	// ----------------------------------
	//         networks:update
	// ----------------------------------
	{
		displayName: 'Network ID',
		name: 'networkId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['update'],
			},
		},
		default: 0,
		required: true,
		description: 'The ID of the network to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['networks'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'The network address, typically in CIDR notation',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: undefined,
				description: 'The ID of the company that owns this network',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A brief description of the network',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'number',
				default: undefined,
				description: 'The ID of the location associated with this network',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the network',
			},
			{
				displayName: 'Network Type',
				name: 'network_type',
				type: 'number',
				default: undefined,
				description: 'The type of network',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'A slug representing the network',
			},
		],
	},
];