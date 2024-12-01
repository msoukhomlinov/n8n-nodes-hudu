import { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const uploadsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['uploads'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all uploads',
				action: 'Get all uploads',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific upload',
				action: 'Get an upload',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an upload',
				action: 'Delete an upload',
			},
		],
		default: 'getAll',
	},
];

export const uploadsFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['uploads'],
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
				resource: ['uploads'],
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

	// ----------------------------------
	//         get/delete
	// ----------------------------------
	{
		displayName: 'Upload ID',
		name: 'id',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['uploads'],
				operation: ['get', 'delete'],
			},
		},
		default: 0,
		required: true,
		description: 'ID of the upload',
	},
]; 