import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';
import { createWrapResultsField } from './resources';

export const photosOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['photos'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Upload a new photo',
				action: 'Create a photo',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a photo',
				action: 'Delete a photo',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a photo by ID',
				action: 'Get a photo',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many photos',
				action: 'Get many photos',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update photo metadata',
				action: 'Update a photo',
			},
		],
		default: 'getAll',
	},
];

export const photosFields: INodeProperties[] = [
	// ----------------------------------
	//         photos:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['photos'],
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
	createWrapResultsField('photos'),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Whether to show only archived photos. Default is non-archived only.',
			},
			{
				displayName: 'Company Name or ID',
				name: 'company_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCompanies',
					loadOptionsParameters: {
						includeBlank: true,
					},
				},
				default: '',
				description: 'Filter by company. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Created At',
				name: 'created_at',
				type: 'fixedCollection',
				placeholder: 'Add Date Range',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'range',
						displayName: 'Date Range',
						values: [
							{
								displayName: 'End Datetime',
								name: 'end',
								type: 'dateTime',
								default: '',
								displayOptions: {
									show: { mode: ['range'] },
								},
							},
							{
								displayName: 'Exact Datetime',
								name: 'exact',
								type: 'dateTime',
								default: '',
								displayOptions: {
									show: { mode: ['exact'] },
								},
							},
							{
								displayName: 'Mode',
								name: 'mode',
								type: 'options',
								options: [
									{ name: 'Exact', value: 'exact' },
									{ name: 'Preset', value: 'preset' },
									{ name: 'Range', value: 'range' },
								],
								default: 'preset',
							},
							{
								displayName: 'Preset',
								name: 'preset',
								type: 'options',
								options: [
									{ name: 'Last 24 Hours', value: 'last24h' },
									{ name: 'Last 7 Days', value: 'last7d' },
									{ name: 'Last 30 Days', value: 'last30d' },
								],
								default: 'last7d',
								displayOptions: {
									show: { mode: ['preset'] },
								},
							},
							{
								displayName: 'Start Datetime',
								name: 'start',
								type: 'dateTime',
								default: '',
								displayOptions: {
									show: { mode: ['range'] },
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Folder ID',
				name: 'folder_id',
				type: 'number',
				default: 0,
				description: 'Filter by folder ID',
			},
			{
				displayName: 'Photoable ID',
				name: 'photoable_id',
				type: 'number',
				default: 0,
				description: 'Filter by the ID of the record this photo is attached to',
			},
			{
				displayName: 'Photoable Type',
				name: 'photoable_type',
				type: 'string',
				default: '',
				description: 'Filter by the type of record (Company, Asset, Article, etc.)',
			},
			{
				displayName: 'Updated At',
				name: 'updated_at',
				type: 'fixedCollection',
				placeholder: 'Add Date Range',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'range',
						displayName: 'Date Range',
						values: [
							{
								displayName: 'End Datetime',
								name: 'end',
								type: 'dateTime',
								default: '',
								displayOptions: {
									show: { mode: ['range'] },
								},
							},
							{
								displayName: 'Exact Datetime',
								name: 'exact',
								type: 'dateTime',
								default: '',
								displayOptions: {
									show: { mode: ['exact'] },
								},
							},
							{
								displayName: 'Mode',
								name: 'mode',
								type: 'options',
								options: [
									{ name: 'Exact', value: 'exact' },
									{ name: 'Preset', value: 'preset' },
									{ name: 'Range', value: 'range' },
								],
								default: 'preset',
							},
							{
								displayName: 'Preset',
								name: 'preset',
								type: 'options',
								options: [
									{ name: 'Last 24 Hours', value: 'last24h' },
									{ name: 'Last 7 Days', value: 'last7d' },
									{ name: 'Last 30 Days', value: 'last30d' },
								],
								default: 'last7d',
								displayOptions: {
									show: { mode: ['preset'] },
								},
							},
							{
								displayName: 'Start Datetime',
								name: 'start',
								type: 'dateTime',
								default: '',
								displayOptions: {
									show: { mode: ['range'] },
								},
							},
						],
					},
				],
			},
		],
	},

	// ----------------------------------
	//         photos:create
	// ----------------------------------
	{
		displayName: 'File',
		name: 'file',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['create'],
			},
		},
		required: true,
		description: 'The name of the binary property containing the image file to upload',
	},
	{
		displayName: 'Caption',
		name: 'caption',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['create'],
			},
		},
		required: true,
		description: 'Caption/title for the photo',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Company Name or ID',
				name: 'company_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCompanies',
					loadOptionsParameters: {
						includeBlank: true,
					},
				},
				default: '',
				description: 'Company this photo belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Folder ID',
				name: 'folder_id',
				type: 'number',
				default: 0,
				description: 'ID of the folder to place the photo in',
			},
			{
				displayName: 'Photoable ID',
				name: 'photoable_id',
				type: 'number',
				default: 0,
				description: 'ID of the record to attach the photo to',
			},
			{
				displayName: 'Photoable Type',
				name: 'photoable_type',
				type: 'string',
				default: '',
				description: 'Type of record to attach the photo to (Company, Asset, Article, etc.)',
			},
			{
				displayName: 'Pinned',
				name: 'pinned',
				type: 'boolean',
				default: false,
				description: 'Whether the photo should be pinned',
			},
		],
	},

	// ----------------------------------
	//         photos:get
	// ----------------------------------
	{
		displayName: 'Photo ID',
		name: 'photoId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['get'],
			},
		},
		default: 0,
		required: true,
		description: 'The ID of the photo to retrieve',
	},
	{
		displayName: 'Download',
		name: 'download',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['get'],
			},
		},
		default: false,
		description: 'Whether to download the photo file instead of returning JSON metadata',
	},

	// ----------------------------------
	//         photos:update
	// ----------------------------------
	{
		displayName: 'Photo ID',
		name: 'photoId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['update'],
			},
		},
		default: 0,
		required: true,
		description: 'The ID of the photo to update',
	},
	{
		displayName: 'Photo Update Fields',
		name: 'photoUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Whether the photo is archived. Set to true to archive, false to unarchive.',
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
				description: 'Caption/title of the photo',
			},
			{
				displayName: 'Folder ID',
				name: 'folder_id',
				type: 'number',
				default: 0,
				description: 'ID of the folder to move the photo to',
			},
			{
				displayName: 'Photoable ID',
				name: 'photoable_id',
				type: 'number',
				default: 0,
				description: 'ID of the record to attach the photo to',
			},
			{
				displayName: 'Photoable Type',
				name: 'photoable_type',
				type: 'string',
				default: '',
				description: 'Type of record to attach the photo to (Company, Asset, Article, etc.)',
			},
			{
				displayName: 'Pinned',
				name: 'pinned',
				type: 'boolean',
				default: false,
				description: 'Whether the photo is pinned',
			},
		],
	},

	// ----------------------------------
	//         photos:delete
	// ----------------------------------
	{
		displayName: 'Photo ID',
		name: 'photoId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['photos'],
				operation: ['delete'],
			},
		},
		default: 0,
		required: true,
		description: 'The ID of the photo to permanently delete',
	},
];
