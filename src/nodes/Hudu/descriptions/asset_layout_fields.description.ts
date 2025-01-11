import type { INodeProperties } from 'n8n-workflow';
import { ASSET_LAYOUT_FIELD_TYPES, ASSET_LAYOUT_FIELD_LABELS } from '../utils/constants';

export const assetLayoutFieldOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['asset_layout_fields'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a field',
				action: 'Create a field',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a field',
				action: 'Delete a field',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a field',
				action: 'Get a field',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many fields',
				action: 'Get many fields',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a field',
				action: 'Update a field',
			},
		],
		default: 'getAll',
	},
];

export const assetLayoutFieldFields: INodeProperties[] = [
	// Asset Layout ID field for all operations
	{
		displayName: 'Asset Layout Name or ID',
		name: 'asset_layout_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAssetLayouts',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['asset_layout_fields'],
				operation: ['getAll', 'get', 'create', 'update', 'delete'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Field ID for single operations
	{
		displayName: 'Field Name or ID',
		name: 'field_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAssetLayoutFields',
			loadOptionsDependsOn: ['asset_layout_id'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['asset_layout_fields'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// Required fields for Create operation
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
					resource: ['asset_layout_fields'],
					operation: ['create'],
			},
		},
		default: '',
		description: 'The label of the field',
	},
	{
		displayName: 'Field Type',
		name: 'field_type',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset_layout_fields'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.TEXT],
				value: ASSET_LAYOUT_FIELD_TYPES.TEXT,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT],
				value: ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.HEADING],
				value: ASSET_LAYOUT_FIELD_TYPES.HEADING,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.CHECKBOX],
				value: ASSET_LAYOUT_FIELD_TYPES.CHECKBOX,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.WEBSITE],
				value: ASSET_LAYOUT_FIELD_TYPES.WEBSITE,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.PASSWORD],
				value: ASSET_LAYOUT_FIELD_TYPES.PASSWORD,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.NUMBER],
				value: ASSET_LAYOUT_FIELD_TYPES.NUMBER,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.DATE],
				value: ASSET_LAYOUT_FIELD_TYPES.DATE,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT],
				value: ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.EMBED],
				value: ASSET_LAYOUT_FIELD_TYPES.EMBED,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.EMAIL],
				value: ASSET_LAYOUT_FIELD_TYPES.EMAIL,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.PHONE],
				value: ASSET_LAYOUT_FIELD_TYPES.PHONE,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG],
				value: ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG,
			},
			{
				name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA],
				value: ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA,
			},
		],
		default: ASSET_LAYOUT_FIELD_TYPES.TEXT,
		description: 'The type of the field',
	},

	// Optional fields for Create operation
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['asset_layout_fields'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Position',
				name: 'position',
				type: 'number',
				default: 0,
				description: 'The position of the field in the layout',
			},
			{
				displayName: 'Required',
				name: 'required',
				type: 'boolean',
				default: false,
				description: 'Whether the field is required',
			},
			{
				displayName: 'Show in List',
				name: 'show_in_list',
				type: 'boolean',
				default: false,
				description: 'Whether to show this field in the list view',
			},
		],
	},

	// Fields for Update operation
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['asset_layout_fields'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Field Type',
				name: 'field_type',
				type: 'options',
				options: [
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.TEXT],
						value: ASSET_LAYOUT_FIELD_TYPES.TEXT,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT],
						value: ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.HEADING],
						value: ASSET_LAYOUT_FIELD_TYPES.HEADING,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.CHECKBOX],
						value: ASSET_LAYOUT_FIELD_TYPES.CHECKBOX,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.WEBSITE],
						value: ASSET_LAYOUT_FIELD_TYPES.WEBSITE,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.PASSWORD],
						value: ASSET_LAYOUT_FIELD_TYPES.PASSWORD,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.NUMBER],
						value: ASSET_LAYOUT_FIELD_TYPES.NUMBER,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.DATE],
						value: ASSET_LAYOUT_FIELD_TYPES.DATE,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT],
						value: ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.EMBED],
						value: ASSET_LAYOUT_FIELD_TYPES.EMBED,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.EMAIL],
						value: ASSET_LAYOUT_FIELD_TYPES.EMAIL,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.PHONE],
						value: ASSET_LAYOUT_FIELD_TYPES.PHONE,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG],
						value: ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG,
					},
					{
						name: ASSET_LAYOUT_FIELD_LABELS[ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA],
						value: ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA,
					},
				],
				default: ASSET_LAYOUT_FIELD_TYPES.TEXT,
				description: 'The type of the field',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'The label of the field',
			},
			{
				displayName: 'Position',
				name: 'position',
				type: 'number',
				default: 0,
				description: 'The position of the field in the layout',
			},
			{
				displayName: 'Required',
				name: 'required',
				type: 'boolean',
				default: false,
				description: 'Whether the field is required',
			},
			{
				displayName: 'Show in List',
				name: 'show_in_list',
				type: 'boolean',
				default: false,
				description: 'Whether to show this field in the list view',
			},
		],
	},
]; 