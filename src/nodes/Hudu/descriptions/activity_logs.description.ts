import type { INodeProperties } from 'n8n-workflow';
import { HUDU_API_CONSTANTS, ACTIVITY_LOG_ACTIONS, RESOURCE_TYPES } from '../utils/constants';

export const activityLogsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['activity_logs'],
      },
    },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve a list of activity logs',
        action: 'Get many activity logs',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete activity logs',
        action: 'Delete activity logs',
      },
    ],
    default: 'getAll',
  },
];

export const activityLogsFields: INodeProperties[] = [
  // Fields for getAll operation
  {
    displayName: 'Return All ⚠️',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description:
      'Whether to return all results or only up to a given limit. Use with caution - may return very high number of records.',
    displayOptions: {
      show: {
        resource: ['activity_logs'],
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
        resource: ['activity_logs'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['activity_logs'],
        operation: ['getAll'],
      },
    },
    description: 'All filters are combined using AND logic',
    options: [
      {
        displayName: 'Action Message',
        name: 'action_message',
        type: 'options',
        options: ACTIVITY_LOG_ACTIONS.map((action) => ({
          name: action,
          value: action,
        })),
        default: '',
        description: 'Filter by exact action message match',
      },
      {
        displayName: 'Resource ID',
        name: 'resource_id',
        type: 'number',
        default: 0,
        description: 'Filter by resource ID (must be used together with Resource Type)',
      },
      {
        displayName: 'Resource Type',
        name: 'resource_type',
        type: 'options',
        options: RESOURCE_TYPES.map((type) => ({
          name: type,
          value: type,
        })),
        default: '',
        description: 'Filter by resource type (must be used together with Resource ID)',
      },
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        description: 'Filter logs starting from this date (ISO 8601 format)',
      },
      {
        displayName: 'User Email',
        name: 'user_email',
        type: 'string',
        default: '',
        description: 'Filter by exact user email match',
      },
      {
        displayName: 'User Name or ID',
        name: 'user_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
    ],
  },

  // Fields for delete operation
  {
    displayName: 'Datetime',
    name: 'datetime',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'Starting datetime from which logs will be deleted (ISO 8601 format)',
    displayOptions: {
      show: {
        resource: ['activity_logs'],
        operation: ['delete'],
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['activity_logs'],
        operation: ['delete'],
      },
    },
    options: [
      {
        displayName: 'Delete Unassigned Logs Only',
        name: 'delete_unassigned_logs',
        type: 'boolean',
        default: false,
        description: 'Whether to only delete logs where user_id is nil',
      },
    ],
  },
];
