import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const ipAddressOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Retrieve a list of IP addresses',
				action: 'Get all IP addresses',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new IP address',
				action: 'Create an IP address',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an IP address',
				action: 'Delete an IP address',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single IP address',
				action: 'Get an IP address',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an IP address',
				action: 'Update an IP address',
			},
		],
		default: 'getAll',
	},
];

export const ipAddressFields: INodeProperties[] = [
	// ----------------------------------
	//         ipAddresses:getAll
	// ----------------------------------
	{
		displayName: 'Return All (⚠️ Caution)',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description:
			'Whether to return all results or only up to a given limit. Use with caution - may return very high number of records',
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['getAll'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: HUDU_API_CONSTANTS.PAGE_SIZE,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['getAll'],
			},
		},
		description:
			'All filters are combined using AND logic and use exact matching unless specified otherwise',
		options: [
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'Filter by exact IP address match',
			},
			{
				displayName: 'Asset ID',
				name: 'asset_id',
				type: 'number',
				default: 0,
				description: 'Filter by asset ID',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'Filter by company ID',
			},
			{
				displayName: 'Created At',
				name: 'created_at',
				type: 'string',
				default: '',
				description:
					'Filter by creation date (ISO 8601 format). Format: "start_datetime,end_datetime" for range, "exact_datetime" for exact match',
			},
			{
				displayName: 'FQDN',
				name: 'fqdn',
				type: 'string',
				default: '',
				description: 'Filter by exact FQDN match',
			},
			{
				displayName: 'Network ID',
				name: 'network_id',
				type: 'number',
				default: 0,
				description: 'Filter by network ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: [
					{
						name: 'Unassigned',
						value: 'unassigned',
					},
					{
						name: 'Assigned',
						value: 'assigned',
					},
					{
						name: 'Reserved',
						value: 'reserved',
					},
					{
						name: 'Deprecated',
						value: 'deprecated',
					},
					{
						name: 'DHCP',
						value: 'dhcp',
					},
					{
						name: 'SLAAC',
						value: 'slaac',
					},
				],
				description: 'Filter by IP address status',
			},
			{
				displayName: 'Updated At',
				name: 'updated_at',
				type: 'string',
				default: '',
				description:
					'Filter by last update date (ISO 8601 format). Format: "start_datetime,end_datetime" for range, "exact_datetime" for exact match',
			},
		],
	},

	// ----------------------------------
	//         ipAddresses:create
	// ----------------------------------
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['create'],
			},
		},
		description: 'The IP address',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		default: 'unassigned',
		options: [
			{
				name: 'Unassigned',
				value: 'unassigned',
			},
			{
				name: 'Assigned',
				value: 'assigned',
			},
			{
				name: 'Reserved',
				value: 'reserved',
			},
			{
				name: 'Deprecated',
				value: 'deprecated',
			},
			{
				name: 'DHCP',
				value: 'dhcp',
			},
			{
				name: 'SLAAC',
				value: 'slaac',
			},
		],
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['create'],
			},
		},
		description: 'The status of the IP address',
	},
	{
		displayName: 'Company ID',
		name: 'company_id',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['create'],
			},
		},
		description: 'The identifier of the company that owns this IP address',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'FQDN',
				name: 'fqdn',
				type: 'string',
				default: '',
				description: 'The Fully Qualified Domain Name associated with the IP address',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A brief description of the IP address',
			},
			{
				displayName: 'Comments',
				name: 'comments',
				type: 'string',
				default: '',
				description: 'Additional comments about the IP address',
			},
			{
				displayName: 'Asset ID',
				name: 'asset_id',
				type: 'number',
				default: 0,
				description: 'The identifier of the asset associated with this IP address',
			},
			{
				displayName: 'Network ID',
				name: 'network_id',
				type: 'number',
				default: 0,
				description: 'The identifier of the network to which this IP address belongs',
			},
		],
	},

	// ----------------------------------
	//         ipAddresses:delete
	// ----------------------------------
	{
		displayName: 'IP Address ID',
		name: 'id',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['delete', 'get'],
			},
		},
		default: 0,
		required: true,
		description: 'ID of the IP address',
	},

	// ----------------------------------
	//         ipAddresses:update
	// ----------------------------------
	{
		displayName: 'IP Address ID',
		name: 'id',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['update'],
			},
		},
		default: 0,
		required: true,
		description: 'ID of the IP address to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['ipAddresses'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				description: 'The IP address',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: [
					{
						name: 'Unassigned',
						value: 'unassigned',
					},
					{
						name: 'Assigned',
						value: 'assigned',
					},
					{
						name: 'Reserved',
						value: 'reserved',
					},
					{
						name: 'Deprecated',
						value: 'deprecated',
					},
					{
						name: 'DHCP',
						value: 'dhcp',
					},
					{
						name: 'SLAAC',
						value: 'slaac',
					},
				],
				description: 'The status of the IP address',
			},
			{
				displayName: 'FQDN',
				name: 'fqdn',
				type: 'string',
				default: '',
				description: 'The Fully Qualified Domain Name associated with the IP address',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A brief description of the IP address',
			},
			{
				displayName: 'Comments',
				name: 'comments',
				type: 'string',
				default: '',
				description: 'Additional comments about the IP address',
			},
			{
				displayName: 'Asset ID',
				name: 'asset_id',
				type: 'number',
				default: 0,
				description: 'The identifier of the asset associated with this IP address',
			},
			{
				displayName: 'Network ID',
				name: 'network_id',
				type: 'number',
				default: 0,
				description: 'The identifier of the network to which this IP address belongs',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'The identifier of the company that owns this IP address',
			},
		],
	},
];
