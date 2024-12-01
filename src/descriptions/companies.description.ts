import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const companiesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['companies'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a company',
				action: 'Archive a company',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new company',
				action: 'Create a company',
			},
			{
				name: 'Create Asset',
				value: 'createAsset',
				description: 'Create a new asset for a company',
				action: 'Create an asset for a company',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a company',
				action: 'Delete a company',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a company',
				action: 'Get a company',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Retrieve all companies',
				action: 'Get all companies',
			},
			{
				name: 'Get Assets',
				value: 'getAssets',
				description: 'Get assets for a company',
				action: 'Get assets for a company',
			},
			{
				name: 'Jump',
				value: 'jump',
				description: 'Jump to a company with integration details',
				action: 'Jump to a company',
			},
			{
				name: 'Unarchive',
				value: 'unarchive',
				description: 'Unarchive a company',
				action: 'Unarchive a company',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a company',
				action: 'Update a company',
			},
		],
		default: 'getAll',
	},
];

export const companiesFields: INodeProperties[] = [
	// ----------------------------------
	//         companies:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['create'],
			},
		},
		description: 'The name of the company',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Address Line 1',
				name: 'address_line_1',
				type: 'string',
				default: '',
				description: 'The first line of the company\'s address',
			},
			{
				displayName: 'Address Line 2',
				name: 'address_line_2',
				type: 'string',
				default: '',
				description: 'The second line of the company\'s address',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'The city where the company is located',
			},
			{
				displayName: 'Company Type',
				name: 'company_type',
				type: 'string',
				default: '',
				description: 'The type of the company',
			},
			{
				displayName: 'Country Name',
				name: 'country_name',
				type: 'string',
				default: '',
				description: 'The country where the company is located',
			},
			{
				displayName: 'Fax Number',
				name: 'fax_number',
				type: 'string',
				default: '',
				description: 'The company\'s fax number',
			},
			{
				displayName: 'ID Number',
				name: 'id_number',
				type: 'string',
				default: '',
				description: 'The company\'s ID number',
			},
			{
				displayName: 'Nickname',
				name: 'nickname',
				type: 'string',
				default: '',
				description: 'The nickname of the company',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Additional notes about the company',
			},
			{
				displayName: 'Parent Company ID',
				name: 'parent_company_id',
				type: 'number',
				default: 0,
				description: 'The parent company\'s ID, if applicable',
			},
			{
				displayName: 'Phone Number',
				name: 'phone_number',
				type: 'string',
				default: '',
				description: 'The company\'s phone number',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'The state where the company is located',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'The company\'s website',
			},
			{
				displayName: 'ZIP',
				name: 'zip',
				type: 'string',
				default: '',
				description: 'The zip code of the company\'s location',
			},
		],
	},

	// ----------------------------------
	//         companies:get
	// ----------------------------------
	{
		displayName: 'Company ID',
		name: 'id',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['get', 'delete', 'update', 'archive', 'unarchive'],
			},
		},
		description: 'The ID of the company',
	},

	// ----------------------------------
	//         companies:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['getAll', 'getAssets'],
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
				resource: ['companies'],
				operation: ['getAll', 'getAssets'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: HUDU_API_CONSTANTS.PAGE_SIZE,
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
				resource: ['companies'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'Filter companies by city',
			},
			{
				displayName: 'ID In Integration',
				name: 'idInIntegration',
				type: 'string',
				default: '',
				description: 'Filter companies by id/identifier in PSA/RMM/outside integration',
			},
			{
				displayName: 'ID Number',
				name: 'id_number',
				type: 'string',
				default: '',
				description: 'Filter companies by id_number',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter companies by name',
			},
			{
				displayName: 'Phone Number',
				name: 'phone_number',
				type: 'string',
				default: '',
				description: 'Filter companies by phone number',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Filter companies by a search query',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'Filter companies by URL slug',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'Filter companies by state',
			},
			{
				displayName: 'Updated At',
				name: 'updatedAt',
				type: 'string',
				default: '',
				description: 'Filter companies updated within a range or at an exact time. Format: \'start_datetime,end_datetime\' for range, \'exact_datetime\' for exact match',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Filter companies by website',
			},
		],
	},

	// ----------------------------------
	//         companies:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Address Line 1',
				name: 'address_line_1',
				type: 'string',
				default: '',
				description: 'The first line of the company\'s address',
			},
			{
				displayName: 'Address Line 2',
				name: 'address_line_2',
				type: 'string',
				default: '',
				description: 'The second line of the company\'s address',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'The city where the company is located',
			},
			{
				displayName: 'Company Type',
				name: 'company_type',
				type: 'string',
				default: '',
				description: 'The type of the company',
			},
			{
				displayName: 'Country Name',
				name: 'country_name',
				type: 'string',
				default: '',
				description: 'The country where the company is located',
			},
			{
				displayName: 'Fax Number',
				name: 'fax_number',
				type: 'string',
				default: '',
				description: 'The company\'s fax number',
			},
			{
				displayName: 'ID Number',
				name: 'id_number',
				type: 'string',
				default: '',
				description: 'The company\'s ID number',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the company',
			},
			{
				displayName: 'Nickname',
				name: 'nickname',
				type: 'string',
				default: '',
				description: 'The nickname of the company',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Additional notes about the company',
			},
			{
				displayName: 'Parent Company ID',
				name: 'parent_company_id',
				type: 'number',
				default: 0,
				description: 'The parent company\'s ID, if applicable',
			},
			{
				displayName: 'Phone Number',
				name: 'phone_number',
				type: 'string',
				default: '',
				description: 'The company\'s phone number',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'The state where the company is located',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'The company\'s website',
			},
			{
				displayName: 'ZIP',
				name: 'zip',
				type: 'string',
				default: '',
				description: 'The zip code of the company\'s location',
			},
		],
	},

	// ----------------------------------
	//      companies:getAssets
	// ----------------------------------
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['getAssets', 'createAsset'],
			},
		},
		description: 'The ID of the company',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['getAssets'],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Set to true to only show archived results',
			},
		],
	},

	// ----------------------------------
	//      companies:createAsset
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['createAsset'],
			},
		},
		description: 'The name of the new asset',
	},
	{
		displayName: 'Asset Layout ID',
		name: 'assetLayoutId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['createAsset'],
			},
		},
		description: 'The identifier of the asset layout associated with the new asset',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['createAsset'],
			},
		},
		options: [
			{
				displayName: 'Primary Serial',
				name: 'primary_serial',
				type: 'string',
				default: '',
				description: 'The primary serial number of the new asset',
			},
			{
				displayName: 'Primary Mail',
				name: 'primary_mail',
				type: 'string',
				default: '',
				description: 'The primary email associated with the new asset',
			},
			{
				displayName: 'Primary Model',
				name: 'primary_model',
				type: 'string',
				default: '',
				description: 'The primary model of the new asset',
			},
			{
				displayName: 'Primary Manufacturer',
				name: 'primary_manufacturer',
				type: 'string',
				default: '',
				description: 'The primary manufacturer of the new asset',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				placeholder: 'Add Custom Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								description: 'The label of the custom field',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The value of the custom field',
							},
						],
					},
				],
			},
		],
	},

	// ----------------------------------
	//         companies:jump
	// ----------------------------------
	{
		displayName: 'Integration Slug',
		name: 'integrationSlug',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['jump'],
			},
		},
		description: 'Identifier of the external integration (e.g., \'cw_manage\')',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['companies'],
				operation: ['jump'],
			},
		},
		options: [
			{
				displayName: 'Integration ID',
				name: 'integrationId',
				type: 'string',
				default: '',
				description: 'ID of the company in the external integration',
			},
			{
				displayName: 'Integration Identifier',
				name: 'integrationIdentifier',
				type: 'string',
				default: '',
				description: 'Identifier of the company in the external integration (used if integration_id is not set)',
			},
		],
	},
];