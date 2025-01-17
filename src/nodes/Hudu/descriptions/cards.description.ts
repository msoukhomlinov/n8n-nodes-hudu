import type { INodeProperties } from 'n8n-workflow';
import { INTEGRATION_SLUGS } from '../utils/constants';
import { formatTitleCase } from '../utils/formatters';

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
        description: 'Jump to a card by integration ID',
        action: 'Jump to a card by integration ID',
      },
      {
        name: 'Jump By Identifier',
        value: 'jumpByIdentifier',
        description: 'Jump to a card by integration identifier',
        action: 'Jump to a card by integration identifier',
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
        resource: ['cards'],
        operation: ['lookup'],
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
          'ID in the external integration. Must be present unless Integration Identifier is set.',
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
    displayName: 'Integration Slug',
    name: 'integration_slug',
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
        resource: ['cards'],
        operation: ['jump'],
      },
    },
  },
  {
    displayName: 'Integration ID',
    name: 'integration_id',
    type: 'string',
    required: true,
    default: '',
    description: 'The integration ID to use',
    displayOptions: {
      show: {
        resource: ['cards'],
        operation: ['jump'],
      },
    },
  },
  {
    displayName: 'Integration Type',
    name: 'integration_type',
    type: 'string',
    required: true,
    default: '',
    description: 'The integration type to use',
    displayOptions: {
      show: {
        resource: ['cards'],
        operation: ['jump'],
      },
    },
  },
  {
    displayName: 'Integration Slug',
    name: 'integration_slug',
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
        resource: ['cards'],
        operation: ['jumpByIdentifier'],
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
        description: 'ID of the entity in the external integration',
      },
      {
        displayName: 'Integration Identifier',
        name: 'integration_identifier',
        type: 'string',
        default: '',
        description:
          'Identifier of the entity in the external integration (if integration_id is not set)',
      },
    ],
  },
];
