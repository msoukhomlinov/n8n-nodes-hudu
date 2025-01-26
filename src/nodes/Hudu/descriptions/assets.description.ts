import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

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
        description: 'Create an asset',
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
        description: 'Get an asset by ID',
        action: 'Get an asset',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve a list of assets',
        action: 'Retrieve a list of assets',
      },
      {
        name: 'Get Many as Asset Links',
        value: 'getManyAsAssetLinks',
        description: 'Get multiple assets and format them for use in Asset Link custom fields that allow multiple values',
        action: 'Get multiple assets as asset links',
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

export const assetsFields: INodeProperties[] = [
  // ----------------------------------
  //         assets:single operations (get/archive/unarchive/delete)
  // ----------------------------------
  {
    displayName: 'Asset ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['get', 'archive', 'unarchive', 'delete'],
      },
    },
    default: '',
    description: 'The ID of the asset to operate on',
  },

  // ----------------------------------
  //         assets:create
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
        operation: ['create'],
      },
    },
    default: '',
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Asset Name',
    name: 'name',
    type: 'string',
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
    description: 'The name of the asset',
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
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
      hide: {
        company_id: [''],
        name: [''],
      }
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Global Scope',
    name: 'asset_tag_scope',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
      hide: {
        asset_layout_id: [''],
        company_id: [''],
      },          
    },
    description: 'Whether to include assets from all companies in Asset Tag custom fields picklists',
    hint: 'When enabled, assets from all companies will be shown in Asset Tag field picklists. Note: This may increase load times for large datasets.',
  },
  {
    displayName: '▶️ All Custom Fields (Except Asset Link)',
    name: 'customFieldsHeader',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
      hide: {
        name: [''],
        company_id: [''],
        asset_layout_id: [''],
      },
    },
  },
  {
    displayName: 'Asset Custom Field Mappings',
    description: 'Map asset layout fields to their values',
    hint: 'Select an Asset Layout first to see its available fields',
    name: 'fieldMappings',
    type: 'resourceMapper',
    default: {
      mappingMode: 'defineBelow',
      value: null,
    },
    typeOptions: {
      loadOptionsDependsOn: ['asset_layout_id', 'asset_tag_scope'],
      resourceMapper: {
        resourceMapperMethod: 'getAssetLayoutFields',
        mode: 'add',
        fieldWords: {
          singular: 'field',
          plural: 'fields',
        },
        addAllFields: false,
        multiKeyMatch: true,
        supportAutoMap: true,
        noFieldsError: 'No fields in selected Asset Layout. Check for custom fields or select a different layout.',
        matchingFieldsLabels: {
          title: 'Asset Layout Fields',
          description: 'Select the fields from the Asset Layout to map values to',
          hint: 'Select an Asset Layout first to see its available fields',
        },
      },
    },
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
      hide: {
        name: [''],
        company_id: [''],
        asset_layout_id: [''],
      },      
    },
  },
  {
    displayName: '▶️ Asset Link Fields Only',
    name: 'assetTagFieldsHeader',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
      hide: {
        name: [''],
        company_id: [''],
        asset_layout_id: [''],
      },
    },
  },
  {
    displayName: 'Asset Tag Field Mappings',
    description: 'Map asset tag fields to their values',
    hint: 'Select an Asset Layout first to see its available tag fields',
    name: 'tagFieldMappings',
    type: 'resourceMapper',
    default: {
      mappingMode: 'defineBelow',
      value: null,
    },
    typeOptions: {
      loadOptionsDependsOn: ['asset_layout_id', 'asset_tag_scope'],
      resourceMapper: {
        resourceMapperMethod: 'getAssetTagFields',
        mode: 'add',
        fieldWords: {
          singular: 'tag field',
          plural: 'tag fields',
        },
        addAllFields: false,
        multiKeyMatch: true,
        supportAutoMap: true,
        noFieldsError: 'No Asset Link fields are available in the selected Asset Layout. Check for tag fields or select a different layout.',
        matchingFieldsLabels: {
          title: 'Asset Tag Fields',
          description: 'Select the tag fields from the Asset Layout to map values to',
          hint: 'Select an Asset Layout first to see its available tag fields',
        },
      },
    },
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
      hide: {
        name: [''],
        company_id: [''],
        asset_layout_id: [''],
      },      
    },
  },

  // ----------------------------------
  //         assets:update
  // ----------------------------------
  {
    displayName: 'Asset ID',
    name: 'id',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['update'],
      },
    },
    default: '',
    description: 'The ID of the asset to update',
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
    displayName: 'Return As Asset Links',
    name: 'returnAsAssetLinks',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to format the results for use in Asset Link custom fields',
    hint: 'When enabled, results will be formatted for use in Asset Link custom fields that allow multiple values',
  },
  {
    displayName: 'Asset Layout Name or ID',
    name: 'customFields_asset_layout_id',
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
        operation: ['getAll'],
        returnAsAssetLinks: [true],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
        name: 'filter_layout_id',
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
          loadOptionsParameters: {
            includeBlank: true,
          },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
  //         assets:create fields
  // ----------------------------------
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Primary Mail',
        name: 'primary_mail',
        type: 'string',
        default: '',
        description: 'The primary email associated with the asset',
      },
      {
        displayName: 'Primary Manufacturer',
        name: 'primary_manufacturer',
        type: 'string',
        default: '',
        description: 'The primary manufacturer of the asset',
      },
      {
        displayName: 'Primary Model',
        name: 'primary_model',
        type: 'string',
        default: '',
        description: 'The primary model of the asset',
      },
      {
        displayName: 'Primary Serial',
        name: 'primary_serial',
        type: 'string',
        default: '',
        description: 'The primary serial number of the asset',
      },
    ],
  },

  // ----------------------------------
  //         assets:update fields
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Asset Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the asset',
      },
      {
        displayName: 'Primary Mail',
        name: 'primary_mail',
        type: 'string',
        default: '',
        description: 'The primary email associated with the asset',
      },
      {
        displayName: 'Primary Manufacturer',
        name: 'primary_manufacturer',
        type: 'string',
        default: '',
        description: 'The primary manufacturer of the asset',
      },
      {
        displayName: 'Primary Model',
        name: 'primary_model',
        type: 'string',
        default: '',
        description: 'The primary model of the asset',
      },
      {
        displayName: 'Primary Serial',
        name: 'primary_serial',
        type: 'string',
        default: '',
        description: 'The primary serial number of the asset',
      },
    ],
  },

  // ----------------------------------
  //         assets:getManyAsAssetLinks
  // ----------------------------------
  {
    displayName: 'Asset Layout Name or ID',
    name: 'customFields_asset_layout_id',
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
        operation: ['getManyAsAssetLinks'],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: 'Asset Layout Fields',
    name: 'customFields_field_selections',
    type: 'fixedCollection',
    default: { fields: [] },
    typeOptions: {
      multipleValues: true,
    },
    displayOptions: {
      show: {
        resource: ['assets'],
        operation: ['getManyAsAssetLinks'],
      },
      hide: {
        customFields_asset_layout_id: [''],
      },
    },
    options: [
      {
        name: 'fields',
        displayName: 'Fields',
        values: [
          {
            displayName: 'Field Name or ID',
            name: 'field',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getCustomFieldsLayoutFields',
              loadOptionsDependsOn: ['customFields_asset_layout_id'],
            },
            default: '',
            description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
          },
        ],
      },
    ],
  },
];

