import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const cardsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['cards'],
			},
		},
		options: [
			{
				name: 'Lookup',
				value: 'lookup',
				description: 'Lookup cards with external integration details',
				action: 'Lookup cards with external integration details',
			},
			{
				name: 'Jump',
				value: 'jump',
				description: 'Jump to an asset with integration details',
				action: 'Jump to an asset with integration details',
			},
		],
		default: 'lookup',
	},
];

export const cardsFields: INodeProperties[] = [
	// Fields for Lookup operation
	{
		displayName: 'Integration Slug',
		name: 'integration_slug',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['cards'],
				operation: ['lookup'],
			},
		},
		default: '',
		description: 'Name of the external integration type (e.g. autotask)',
	},
	{
		displayName: 'Return All (⚠️ Caution)',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['cards'],
				operation: ['lookup'],
			},
		},
		default: false,
		description:
			'Whether to return all results or only up to a given limit. Use with caution - may return very high number of records',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['cards'],
				operation: ['lookup'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: HUDU_API_CONSTANTS.PAGE_SIZE,
		description: 'Max number of results to return (max: 500, it returns large amount of data!)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['cards'],
				operation: ['lookup'],
			},
		},
		options: [
			{
				displayName: 'Integration ID',
				name: 'integration_id',
				type: 'string',
				default: '',
				description:
					'ID in the external integration. Must be present unless Integration Identifier is set',
			},
			{
				displayName: 'Integration Identifier',
				name: 'integration_identifier',
				type: 'string',
				default: '',
				description: 'Identifier in the external integration (used if Integration ID is not set)',
			},
		],
	},

	// Fields for Jump operation
	{
		displayName: 'Integration Type',
		name: 'integration_type',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['cards'],
				operation: ['jump'],
			},
		},
		default: '',
		description:
			'Type of card. Contact support@usehudu.com for a list of types for specific integrations.',
	},
	{
		displayName: 'Integration Slug',
		name: 'integration_slug',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['cards'],
				operation: ['jump'],
			},
		},
		default: '',
		description: 'Identifier of the external integration.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['cards'],
				operation: ['jump'],
			},
		},
		options: [
			{
				displayName: 'Integration ID',
				name: 'integration_id',
				type: 'string',
				default: '',
				description: 'ID of the entity in the external integration.',
			},
			{
				displayName: 'Integration Identifier',
				name: 'integration_identifier',
				type: 'string',
				default: '',
				description:
					'Identifier of the entity in the external integration (if integration_id is not set).',
			},
		],
	},
];
