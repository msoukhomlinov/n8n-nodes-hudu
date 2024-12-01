import { INodeProperties } from 'n8n-workflow';

export const rackStorageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['rack_storages'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all rack storages',
				action: 'Get all rack storages',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a rack storage',
				action: 'Get a rack storage',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a rack storage',
				action: 'Create a rack storage',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a rack storage',
				action: 'Update a rack storage',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a rack storage',
				action: 'Delete a rack storage',
			},
		],
		default: 'getAll',
	},
];

export const rackStorageFields: INodeProperties[] = [
	// ----------------------------------
	//         shared
	// ----------------------------------
	{
		displayName: 'Rack Storage ID',
		name: 'id',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['rack_storages'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: 0,
		required: true,
		description: 'The ID of the rack storage',
	},

	// ----------------------------------
	//         create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['rack_storages'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'The name of the rack storage',
	},
	{
		displayName: 'Location ID',
		name: 'locationId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['rack_storages'],
				operation: ['create'],
			},
		},
		default: 0,
		required: true,
		description: 'The ID of the location where the rack storage is located',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['rack_storages'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the rack storage',
			},
			{
				displayName: 'Max Wattage',
				name: 'max_wattage',
				type: 'number',
				default: 0,
				description: 'The maximum wattage the rack storage can handle',
			},
			{
				displayName: 'Starting Unit',
				name: 'starting_unit',
				type: 'number',
				default: 0,
				description: 'The starting unit of the rack storage',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 0,
				description: 'The height of the rack storage',
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 0,
				description: 'The width of the rack storage',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'The ID of the company that owns the rack storage',
			},
		],
	},

	// ----------------------------------
	//         update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['rack_storages'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the rack storage',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'number',
				default: 0,
				description: 'The ID of the location where the rack storage is located',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the rack storage',
			},
			{
				displayName: 'Max Wattage',
				name: 'max_wattage',
				type: 'number',
				default: 0,
				description: 'The maximum wattage the rack storage can handle',
			},
			{
				displayName: 'Starting Unit',
				name: 'starting_unit',
				type: 'number',
				default: 0,
				description: 'The starting unit of the rack storage',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 0,
				description: 'The height of the rack storage',
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 0,
				description: 'The width of the rack storage',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'The ID of the company that owns the rack storage',
			},
		],
	},

	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['rack_storages'],
				operation: ['getAll'],
			},
		},
		description: 'All filters are combined using AND logic and use exact matching unless specified otherwise',
		options: [
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'Filter by company ID',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'number',
				default: 0,
				description: 'Filter by location ID',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 0,
				description: 'Filter by rack height',
			},
			{
				displayName: 'Min Width',
				name: 'min_width',
				type: 'number',
				default: 0,
				description: 'Filter by minimum rack width',
			},
			{
				displayName: 'Max Width',
				name: 'max_width',
				type: 'number',
				default: 0,
				description: 'Filter by maximum rack width',
			},
			{
				displayName: 'Created At',
				name: 'created_at',
				type: 'string',
				default: '',
				description: 'Filter rack storages created within a range or at an exact time. Format: "start_datetime,end_datetime" for range, "exact_datetime" for exact match.',
			},
			{
				displayName: 'Updated At',
				name: 'updated_at',
				type: 'string',
				default: '',
				description: 'Filter rack storages updated within a range or at an exact time. Format: "start_datetime,end_datetime" for range, "exact_datetime" for exact match.',
			},
		],
	},
]; 