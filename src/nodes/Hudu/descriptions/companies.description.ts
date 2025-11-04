import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS, INTEGRATION_SLUGS } from '../utils/constants';
import { formatTitleCase } from '../utils/formatters';

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
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve many companies',
        action: 'Get many companies',
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
        description: "The first line of the company's address",
      },
      {
        displayName: 'Address Line 2',
        name: 'address_line_2',
        type: 'string',
        default: '',
        description: "The second line of the company's address",
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
        description: "The company's fax number",
      },
      {
        displayName: 'ID Number',
        name: 'id_number',
        type: 'string',
        default: '',
        description: "The company's ID number",
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
        displayName: 'Parent Company Name or ID',
        name: 'parent_company_id',
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
        displayName: 'Phone Number',
        name: 'phone_number',
        type: 'string',
        default: '',
        description: "The company's phone number",
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
        description: "The company's website",
      },
      {
        displayName: 'ZIP',
        name: 'zip',
        type: 'string',
        default: '',
        description: "The zip code of the company's location",
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
        resource: ['companies'],
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
        description: 'Filter companies by ID in PSA/RMM/outside integration',
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
        description: 'Filter companies updated within a range or at an exact time',
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
    displayName: 'Company Update Fields',
    name: 'companyUpdateFields',
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
        description: "The first line of the company's address",
      },
      {
        displayName: 'Address Line 2',
        name: 'address_line_2',
        type: 'string',
        default: '',
        description: "The second line of the company's address",
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
        description: "The company's fax number",
      },
      {
        displayName: 'ID Number',
        name: 'id_number',
        type: 'string',
        default: '',
        description: "The company's ID number",
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
        displayName: 'Parent Company Name or ID',
        name: 'parent_company_id',
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
        displayName: 'Phone Number',
        name: 'phone_number',
        type: 'string',
        default: '',
        description: "The company's phone number",
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
        description: "The company's website",
      },
      {
        displayName: 'ZIP',
        name: 'zip',
        type: 'string',
        default: '',
        description: "The zip code of the company's location",
      },
    ],
  },

  // ----------------------------------
  //         companies:jump
  // ----------------------------------
  {
    displayName: 'Integration Slug',
    name: 'integrationSlug',
    type: 'options',
    required: true,
    default: '',
    description: 'The integration type to use (e.g. autotask, cw_manage)',
    options: INTEGRATION_SLUGS.map((slug) => ({
      name: formatTitleCase(slug),
      value: slug,
    })),
    displayOptions: {
      show: {
        resource: ['companies'],
        operation: ['jump'],
      },
    },
  },
];
