import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS } from '../utils/constants';

export const websitesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['websites'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new website',
        action: 'Create a new website',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a website',
        action: 'Delete a website',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a website by ID',
        action: 'Get a website by ID',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many websites',
        action: 'Get many websites',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a website',
        action: 'Update a website',
      },
    ],
    default: 'getAll',
  },
];

export const websitesFields: INodeProperties[] = [
  // ----------------------------------
  //         websites:getAll
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['websites'],
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
        resource: ['websites'],
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
        resource: ['websites'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Created At',
        name: 'created_at',
        type: 'fixedCollection',
        default: {},
        description: 'Filter by creation date',
        options: [
          {
            displayName: 'Date Range',
            name: 'range',
            values: [
											{
												displayName: 'End Date',
												name: 'end',
												type: 'dateTime',
												default: '',
												description: 'End date of the range (inclusive)',
											},
											{
												displayName: 'Exact Date',
												name: 'exact',
												type: 'dateTime',
												default: '',
												description: 'The exact date to match',
											},
											{
												displayName: 'Mode',
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
												displayName: 'Preset Range',
												name: 'preset',
												type: 'options',
												options: [
													{
														name: 'Last 14 Days',
														value: 'last14d',
														description: 'Created in the last 14 days',
													},
													{
														name: 'Last 24 Hours',
														value: 'last24h',
														description: 'Created in the last 24 hours',
													},
													{
														name: 'Last 30 Days',
														value: 'last30d',
														description: 'Created in the last 30 days',
													},
													{
														name: 'Last 48 Hours',
														value: 'last48h',
														description: 'Created in the last 48 hours',
													},
													{
														name: 'Last 60 Days',
														value: 'last60d',
														description: 'Created in the last 60 days',
													},
													{
														name: 'Last 7 Days',
														value: 'last7d',
														description: 'Created in the last 7 days',
													},
													{
														name: 'Last 90 Days',
														value: 'last90d',
														description: 'Created in the last 90 days',
													},
													{
														name: 'Last Month',
														value: 'lastMonth',
														description: 'Created last month',
													},
													{
														name: 'Last Week',
														value: 'lastWeek',
														description: 'Created last week',
													},
													{
														name: 'Last Year',
														value: 'lastYear',
														description: 'Created last year',
													},
													{
														name: 'This Month',
														value: 'thisMonth',
														description: 'Created this month',
													},
													{
														name: 'This Week',
														value: 'thisWeek',
														description: 'Created this week',
													},
													{
														name: 'This Year',
														value: 'thisYear',
														description: 'Created this year',
													},
													{
														name: 'Today',
														value: 'today',
														description: 'Created today',
													},
													{
														name: 'Yesterday',
														value: 'yesterday',
														description: 'Created yesterday',
													},
													],
												default: 'today',
												description: 'The preset range to match',
											},
											{
												displayName: 'Start Date',
												name: 'start',
												type: 'dateTime',
												default: '',
												description: 'Start date of the range (inclusive)',
											},
									],
          },
        ],
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter websites by name',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Filter by search query',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'Filter by URL slug',
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
                displayName: 'Mode',
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
        description: 'Filter websites updated within a range or at an exact time',
      },
    ],
  },

  // ----------------------------------
  //         websites:get
  // ----------------------------------
  {
    displayName: 'Website ID',
    name: 'id',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['get', 'update', 'delete'],
      },
    },
    default: 0,
    required: true,
    description: 'ID of the website',
  },

  // ----------------------------------
  //         websites:create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['create'],
      },
    },
    default: '',
    required: true,
    description: 'The URL of the website',
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
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['create'],
      },
    },
    required: true,
    default: '',
    description: 'The company to associate with the website. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Account ID',
        name: 'account_id',
        type: 'number',
        default: 0,
        description: 'The ID of the associated account',
      },
      {
        displayName: 'Asset Field ID',
        name: 'asset_field_id',
        type: 'number',
        default: 0,
        description: 'The ID of the related asset field',
      },
      {
        displayName: 'Asset Type',
        name: 'asset_type',
        type: 'string',
        default: '',
        description: 'The type of the asset, in this case, \'Website\'',
      },
      {
        displayName: 'Code',
        name: 'code',
        type: 'number',
        default: 0,
        description: 'The HTTP response code of the website',
      },
      {
        displayName: 'Company Name',
        name: 'company_name',
        type: 'string',
        default: '',
        description: 'The name of the associated company',
      },
      {
        displayName: 'Disable DNS',
        name: 'disable_dns',
        type: 'boolean',
        default: false,
        description: 'Whether DNS monitoring is disabled',
      },
      {
        displayName: 'Disable SSL',
        name: 'disable_ssl',
        type: 'boolean',
        default: false,
        description: 'Whether SSL certificate monitoring is disabled',
      },
      {
        displayName: 'Disable WHOIS',
        name: 'disable_whois',
        type: 'boolean',
        default: false,
        description: 'Whether WHOIS monitoring is disabled',
      },
      {
        displayName: 'Discarded At',
        name: 'discarded_at',
        type: 'dateTime',
        default: '',
        description: 'The timestamp when the website was discarded',
      },
      {
        displayName: 'Enable DKIM Tracking',
        name: 'enable_dkim_tracking',
        type: 'boolean',
        default: false,
        description: 'Whether DKIM checks are enabled for the website',
      },
      {
        displayName: 'Enable DMARC Tracking',
        name: 'enable_dmarc_tracking',
        type: 'boolean',
        default: false,
        description: 'Whether DMARC checks are enabled for the website',
      },
      {
        displayName: 'Enable SPF Tracking',
        name: 'enable_spf_tracking',
        type: 'boolean',
        default: false,
        description: 'Whether SPF checks are enabled for the website',
      },
      {
        displayName: 'Headers',
        name: 'headers',
        type: 'json',
        default: '',
        description: 'HTTP headers associated with the website',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string',
        default: '',
        description: 'The FontAwesome icon related to the website',
      },
      {
        displayName: 'Keyword',
        name: 'keyword',
        type: 'string',
        default: '',
        description: 'A keyword associated with the website',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
        description: 'A message related to the website\'s status',
      },
      {
        displayName: 'Monitor Type',
        name: 'monitor_type',
        type: 'number',
        default: 0,
        description: 'The type of monitoring performed on the website',
      },
      {
        displayName: 'Monitored At',
        name: 'monitored_at',
        type: 'dateTime',
        default: '',
        description: 'The timestamp when the website was last monitored',
      },
      {
        displayName: 'Monitoring Status',
        name: 'monitoring_status',
        type: 'string',
        default: '',
        description: 'The monitoring status of the website (e.g., \'up\', \'down\')',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Additional notes about the website',
      },
      {
        displayName: 'Paused',
        name: 'paused',
        type: 'boolean',
        default: false,
        description: 'Whether website monitoring is paused',
      },
      {
        displayName: 'Refreshed At',
        name: 'refreshed_at',
        type: 'dateTime',
        default: '',
        description: 'The timestamp when the website was last refreshed',
      },
      {
        displayName: 'Sent Notifications',
        name: 'sent_notifications',
        type: 'boolean',
        default: false,
        description: 'Whether notifications related to the website have been sent',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'The URL slug for the website',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'The URL path of the website within the application',
      },
    ],
  },

  // ----------------------------------
  //         websites:update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['websites'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Account ID',
        name: 'account_id',
        type: 'number',
        default: 0,
        description: 'The ID of the associated account',
      },
      {
        displayName: 'Asset Field ID',
        name: 'asset_field_id',
        type: 'number',
        default: 0,
        description: 'The ID of the related asset field',
      },
      {
        displayName: 'Asset Type',
        name: 'asset_type',
        type: 'string',
        default: '',
        description: 'The type of the asset, in this case, \'Website\'',
      },
      {
        displayName: 'Code',
        name: 'code',
        type: 'number',
        default: 0,
        description: 'The HTTP response code of the website',
      },
      {
        displayName: 'Company Name',
        name: 'company_name',
        type: 'string',
        default: '',
        description: 'The name of the associated company',
      },
      {
        displayName: 'Disable DNS',
        name: 'disable_dns',
        type: 'boolean',
        default: false,
        description: 'Whether DNS monitoring is disabled',
      },
      {
        displayName: 'Disable SSL',
        name: 'disable_ssl',
        type: 'boolean',
        default: false,
        description: 'Whether SSL certificate monitoring is disabled',
      },
      {
        displayName: 'Disable WHOIS',
        name: 'disable_whois',
        type: 'boolean',
        default: false,
        description: 'Whether WHOIS monitoring is disabled',
      },
      {
        displayName: 'Discarded At',
        name: 'discarded_at',
        type: 'dateTime',
        default: '',
        description: 'The timestamp when the website was discarded',
      },
      {
        displayName: 'Enable DKIM Tracking',
        name: 'enable_dkim_tracking',
        type: 'boolean',
        default: false,
        description: 'Whether DKIM checks are enabled for the website',
      },
      {
        displayName: 'Enable DMARC Tracking',
        name: 'enable_dmarc_tracking',
        type: 'boolean',
        default: false,
        description: 'Whether DMARC checks are enabled for the website',
      },
      {
        displayName: 'Enable SPF Tracking',
        name: 'enable_spf_tracking',
        type: 'boolean',
        default: false,
        description: 'Whether SPF checks are enabled for the website',
      },
      {
        displayName: 'Headers',
        name: 'headers',
        type: 'json',
        default: '',
        description: 'HTTP headers associated with the website',
      },
      {
        displayName: 'Icon',
        name: 'icon',
        type: 'string',
        default: '',
        description: 'The FontAwesome icon related to the website',
      },
      {
        displayName: 'Keyword',
        name: 'keyword',
        type: 'string',
        default: '',
        description: 'A keyword associated with the website',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
        description: 'A message related to the website\'s status',
      },
      {
        displayName: 'Monitor Type',
        name: 'monitor_type',
        type: 'number',
        default: 0,
        description: 'The type of monitoring performed on the website',
      },
      {
        displayName: 'Monitored At',
        name: 'monitored_at',
        type: 'dateTime',
        default: '',
        description: 'The timestamp when the website was last monitored',
      },
      {
        displayName: 'Monitoring Status',
        name: 'monitoring_status',
        type: 'string',
        default: '',
        description: 'The monitoring status of the website (e.g., \'up\', \'down\')',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The URL of the website',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Additional notes about the website',
      },
      {
        displayName: 'Paused',
        name: 'paused',
        type: 'boolean',
        default: false,
        description: 'Whether website monitoring is paused',
      },
      {
        displayName: 'Refreshed At',
        name: 'refreshed_at',
        type: 'dateTime',
        default: '',
        description: 'The timestamp when the website was last refreshed',
      },
      {
        displayName: 'Sent Notifications',
        name: 'sent_notifications',
        type: 'boolean',
        default: false,
        description: 'Whether notifications related to the website have been sent',
      },
      {
        displayName: 'Slug',
        name: 'slug',
        type: 'string',
        default: '',
        description: 'The URL slug for the website',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'The URL path of the website within the application',
      },
    ],
  },
];
