export const HUDU_API_CONSTANTS = {
  PAGE_SIZE: 25,
  DEFAULT_PAGE: 1,
  BASE_API_PATH: '/api/v1',
} as const;

/**
 * Comprehensive list of field types available in Hudu asset layouts
 */
export const ASSET_LAYOUT_FIELD_TYPES = {
  TEXT: 'Text',
  RICH_TEXT: 'RichText',
  HEADING: 'Heading',
  CHECKBOX: 'CheckBox',
  WEBSITE: 'Website',
  PASSWORD: 'Password',
  NUMBER: 'Number',
  DATE: 'Date',
  LIST_SELECT: 'ListSelect',
  EMBED: 'Embed',
  EMAIL: 'Email',
  PHONE: 'Phone',
  ASSET_TAG: 'AssetTag',
  RELATION: 'Relation',
  ADDRESS_DATA: 'AddressData',
  DROPDOWN: 'Dropdown',
} as const;

/**
 * Default labels for field types in Hudu asset layouts
 */
export const ASSET_LAYOUT_FIELD_LABELS = {
  [ASSET_LAYOUT_FIELD_TYPES.TEXT]: 'Text',
  [ASSET_LAYOUT_FIELD_TYPES.RICH_TEXT]: 'Rich Text',
  [ASSET_LAYOUT_FIELD_TYPES.HEADING]: 'Heading',
  [ASSET_LAYOUT_FIELD_TYPES.CHECKBOX]: 'Check Box',
  [ASSET_LAYOUT_FIELD_TYPES.WEBSITE]: 'Link',
  [ASSET_LAYOUT_FIELD_TYPES.PASSWORD]: 'Confidential Text',
  [ASSET_LAYOUT_FIELD_TYPES.NUMBER]: 'Number',
  [ASSET_LAYOUT_FIELD_TYPES.DATE]: 'Date',
  [ASSET_LAYOUT_FIELD_TYPES.LIST_SELECT]: 'List',
  [ASSET_LAYOUT_FIELD_TYPES.EMBED]: 'Embed',
  [ASSET_LAYOUT_FIELD_TYPES.EMAIL]: 'Copyable Text',
  [ASSET_LAYOUT_FIELD_TYPES.PHONE]: 'Phone',
  [ASSET_LAYOUT_FIELD_TYPES.ASSET_TAG]: 'Asset Link',
  [ASSET_LAYOUT_FIELD_TYPES.ADDRESS_DATA]: 'Address',
} as const;

/**
 * Comprehensive list of available integration slugs in Hudu
 */
export const INTEGRATION_SLUGS = [
  'office_365',
  'autotask',
  'cw_manage',
  'bms',
  'syncro',
  'domotz',
  'quickpass',
  'cloudradial',
  'auvik',
  'liongard',
  'ninja',
  'dattormm',
  'atera',
  'nsight',
  'halo',
  'pulseway_rmm',
  'repairshopr',
  'datto',
  'watchman',
  'mapbox',
  'openai',
  'superops',
  'unifi',
  'ncentral',
  'meraki',
  'addigy',
  'cloudflare',
  'level',
] as const;

/**
 * Resources that support the page_size parameter in their GET/List operations.
 * This parameter can be used in combination with pagination to control the number
 * of records returned per page (up to the default limit of 25).
 *
 * Note: For /companies endpoints, only the main listing endpoint and the nested assets endpoint
 * support pagination (i.e., /companies and /companies/{id}/assets).
 * Other nested endpoints under /companies do not support pagination.
 */
export const RESOURCES_WITH_PAGE_SIZE = [
  'activity_logs',
  'articles',
  'assets',
  'asset_layouts',
  'asset_passwords',
  'companies',
  'companies/assets',
  'expirations',
  'folders',
  'magic_dash',
  'matchers',
  'password_folders',
  'procedures',
  'public_photos',
  'relations',
  'users',
  'websites',
] as const;

/**
 * Comprehensive list of activity log actions in Hudu
 */
export const ACTIVITY_LOG_ACTIONS = [
  'archived',
  'attempted sign-in - false',
  'attempted sign-in - not allowed at time',
  'attempted sign-in - not allowed today',
  'changed sharing',
  'CheckLicensingJob failed',
  'commented',
  'completed task',
  'created',
  'created API key',
  'created integration',
  'created IP access control',
  'deleted article',
  'deleted asset',
  'deleted company',
  'deleted global process template',
  'deleted integration',
  'deleted password',
  'deleted process',
  'deleted website',
  'edited comment',
  'failed s3 export',
  'made read-only',
  'moved',
  'removed file',
  'removed IP access control',
  'removed photo',
  'reset article public token',
  'reset otp',
  'reverted',
  'set expiration date',
  'shared password',
  'signed in',
  'signed out due to deletion',
  'started export',
  'started impersonation',
  'stopped impersonation',
  'unarchived',
  'uncompleted task',
  'updated',
  'updated assignment',
  'updated completion notes',
  'updated due date',
  'updated group',
  'updated integration',
  'updated priority',
  'updated profile',
  'uploaded file',
  'uploaded photo',
  'viewed',
  'viewed confidential text',
  'viewed otp',
  'viewed password',
  'viewed PDF',
  'viewed shared article',
  'viewed shared information',
  'viewed shared link',
  'viewed shared secure note',
] as const;

/**
 * Comprehensive list of resource types in Hudu
 */
export const RESOURCE_TYPES = [
  'Article',
  'Asset',
  'AssetPassword',
  'Company',
  'Expiration',
  'Group',
  'Integrator',
  'IPAddress',
  'Network',
  'Procedure',
  'RackStorage',
  'User',
  'VaultPassword',
  'Website',
] as const;

// General date format constants
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

// Operation constants
export const OPERATION = {
  CREATE: 'create',
  DELETE: 'delete',
  GET: 'get',
  GET_ALL: 'getAll',
  GET_MANY: 'getMany',
  UPDATE: 'update',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  STATUS: {
    EXECUTING: 'running',
    SUCCEEDED: 'success',
    FAILED: 'failed',
  },
};
