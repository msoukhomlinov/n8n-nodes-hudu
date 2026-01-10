import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';
import { createWrapResultsField } from './resources';

export const assetsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['assets'],
      },
    },
    options: [
      {
        name: 'Archive',
        value: 'archive',
        description: 'Archive an asset',
        action: 'Archive an asset',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new asset',
        action: 'Create an asset',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an asset',
        action: 'Delete an asset',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve an asset',
        action: 'Get an asset',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve many assets',
        action: 'Retrieve a list of assets',
      },
      {
        name: 'Move Layout',
        value: 'moveLayout',
        description: 'Move asset to different layout',
        action: 'Move an asset to a different layout',
      },
      {
        name: 'Unarchive',
        value: 'unarchive',
        description: 'Unarchive an asset',
        action: 'Unarchive an asset',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an asset',
        action: 'Update an asset',
      },
    ],
    default: 'getAll',
  },
];

// Shared properties for the Asset Fields resource mapper
const assetResourceMapper = {
	displayName: 'Asset Fields',
	name: 'mappedFields',
	type: 'resourceMapper' as const,
	default: {
		mappingMode: 'defineBelow',
		value: null,
	},
	typeOptions: {
		resourceMapper: {
			resourceMapperMethod: 'mapAssetLayoutFieldsForResource',
			mode: 'add' as const,
			fieldWords: {
				singular: 'field',
				plural: 'fields',
			},
			addAllFields: false,
			multiKeyMatch: false,
			supportAutoMap: false,
		},
	},
};

export const assetsFields: INodeProperties[] = [
  // ----------------------------------
  //         assets:single operations (get/archive/unarchive/delete/update/moveLayout)
  // ----------------------------------
  // Identifier Type toggle for get operation
  {
    displayName: 'Identifier Type',
    name: 'identifierType',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['get'],
      },
    },
    options: [
      {
        name: 'ID',
        value: 'id',
        description: 'Use numeric asset ID',
      },
      {
        name: 'Slug',
        value: 'slug',
        description: 'Use asset URL slug',
      },
    ],
    default: 'id',
    description: 'Whether to retrieve the asset by numeric ID or slug identifier',
  },

  // Asset ID field for operations that need it
  {
    displayName: 'Asset ID',
    name: 'assetId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['get', 'archive', 'unarchive', 'delete', 'update', 'moveLayout'],
      },
    },
    default: '',
    description: 'The unique ID or slug of the asset to operate on',
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
    required: true,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  // ----------------------------------
  //         assets:create
  // ----------------------------------
  {
    displayName: 'Asset Layout Name or ID',
    name: 'asset_layout_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getAssetLayouts',
      loadOptionsParameters: {
        includeBlank: true,
      },
    },
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
      hide: {
        company_id: [''],
      }
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    ...assetResourceMapper,
    typeOptions: {
      ...assetResourceMapper.typeOptions,
      loadOptionsDependsOn: ['asset_layout_id'],
    },
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
      hide: {
        asset_layout_id: [''],
      },
    },
    description: 'Map all asset fields, including name, standard properties, custom fields, and asset link fields for the new asset. This allows you to set any combination of layout-specific fields during creation.',
  },

  // ----------------------------------
  //         assets:update
  // ----------------------------------
  {
    ...assetResourceMapper,
    required: true,
    typeOptions: {
      ...assetResourceMapper.typeOptions,
      loadOptionsDependsOn: ['assetId'],
    },
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['update'],
      },
    },
    description: 'Map one or more asset fields to update, including name and other standard properties. You may update a single field or multiple fields in one operation.',
  },

  // ----------------------------------
  //         assets:getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['assets'],
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
        resource: ['assets'],
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
  createWrapResultsField('assets'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether to display only archived assets',
      },
      {
        displayName: 'Asset Layout Name or ID',
        name: 'asset_layout_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getAssetLayouts',
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Company Name or ID',
        name: 'company_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getCompanies',
        },
        default: '',
        description: 'Filter assets by the parent company\'s ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
      },
      {
        displayName: 'ID',
        name: 'id',
        type: 'number',
        default: 0,
        description: 'Filter assets by their ID',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter assets by name',
      },
      {
        displayName: 'Primary Serial',
        name: 'primary_serial',
        type: 'string',
        default: '',
        description: 'Filter assets by their primary serial number',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Filter assets using a search query',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter assets by their URL slug',
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
                displayName: 'Date',
                name: 'exact',
                type: 'dateTime',
                displayOptions: {
                  show: {
                    mode: ['exact'],
                  },
                },
                default: '',
                description: 'The specific date to filter by',
              },
              {
                displayName: 'End Date',
                name: 'end',
                type: 'dateTime',
                displayOptions: {
                  show: {
                    mode: ['range'],
                  },
                },
                default: '',
                description: 'End date of the range',
              },
              {
                displayName: 'Filter Type',
                name: 'mode',
                type: 'options',
                options: [
                  {
                    name: 'Exact Date',
                    value: 'exact',
                    description: 'Match an exact date',
                  },
                  {
                    name: 'Date Range',
                    value: 'range',
                    description: 'Match a date range',
                  },
                  {
                    name: 'Preset Range',
                    value: 'preset',
                    description: 'Match a preset date range',
                  },
                ],
                default: 'preset',
                description: 'The mode to use for date filtering',
              },
              {
                displayName: 'Range',
                name: 'preset',
                type: 'options',
                displayOptions: {
                  show: {
                    mode: ['preset'],
                  },
                },
                options: [
                  {
                    name: 'Last 14 Days',
                    value: 'last14d',
                    description: 'Updates in the last 14 days',
                  },
                  {
                    name: 'Last 24 Hours',
                    value: 'last24h',
                    description: 'Updates in the last 24 hours',
                  },
                  {
                    name: 'Last 30 Days',
                    value: 'last30d',
                    description: 'Updates in the last 30 days',
                  },
                  {
                    name: 'Last 48 Hours',
                    value: 'last48h',
                    description: 'Updates in the last 48 hours',
                  },
                  {
                    name: 'Last 60 Days',
                    value: 'last60d',
                    description: 'Updates in the last 60 days',
                  },
                  {
                    name: 'Last 7 Days',
                    value: 'last7d',
                    description: 'Updates in the last 7 days',
                  },
                  {
                    name: 'Last 90 Days',
                    value: 'last90d',
                    description: 'Updates in the last 90 days',
                  },
                  {
                    name: 'Last Month',
                    value: 'lastMonth',
                    description: 'Updates during last month',
                  },
                  {
                    name: 'Last Week',
                    value: 'lastWeek',
                    description: 'Updates during last week',
                  },
                  {
                    name: 'Last Year',
                    value: 'lastYear',
                    description: 'Updates during last year',
                  },
                  {
                    name: 'This Month',
                    value: 'thisMonth',
                    description: 'Updates since the start of this month',
                  },
                  {
                    name: 'This Week',
                    value: 'thisWeek',
                    description: 'Updates since the start of this week',
                  },
                  {
                    name: 'This Year',
                    value: 'thisYear',
                    description: 'Updates since the start of this year',
                  },
                  {
                    name: 'Today',
                    value: 'today',
                    description: 'Updates from today',
                  },
                  {
                    name: 'Yesterday',
                    value: 'yesterday',
                    description: 'Updates from yesterday',
                  },
                ],
                default: 'last7d',
                description: 'Choose from common date ranges',
              },
              {
                displayName: 'Start Date',
                name: 'start',
                type: 'dateTime',
                displayOptions: {
                  show: {
                    mode: ['range'],
                  },
                },
                default: '',
                description: 'Start date of the range',
              },
            ],
          },
        ],
        description: 'Filter assets updated within a range or at an exact time',
      },
    ],
  },

  // ----------------------------------
  //         assets:moveLayout
  // ----------------------------------
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
    required: true,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['moveLayout'],
      },
      hide: {
        assetId: ['', 0],
      },      
    },
    default: '',
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Target Asset Layout Name or ID',
    name: 'target_asset_layout_id',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getAssetLayouts',
      loadOptionsParameters: {
        includeBlank: true,
      },
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['moveLayout'],
      },
      hide: {
        assetId: ['', 0],
        company_id: [''],
      },      
    },
    default: '',
    description: 'The layout to move the asset to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
];

