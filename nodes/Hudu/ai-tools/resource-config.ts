export type HuduOperation =
  | 'get'
  | 'getAll'
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'unarchive'
  | 'getIdByName'
  | 'move'
  | 'getByLayout'
  | 'help'
  | 'describeFields';

export interface HuduResourceConfig {
  /** API path, e.g. '/companies' */
  endpoint: string;
  /** Response list key; null = bare array */
  pluralKey: string | null;
  /** Response single-item key; null = bare object */
  singularKey: string | null;
  /** create/update body wrapper key; null = flat */
  bodyKey: string | null;
  /** Operations exposed to AI tools */
  ops: HuduOperation[];
  /** Mirrors RESOURCES_WITH_PAGE_SIZE from constants.ts */
  supportsPagination: boolean;
  /** Human-readable label for descriptions/errors */
  label: string;
  /** Assets: create/update/delete/archive use /companies/{id}/assets */
  requiresCompanyEndpoint?: boolean;
  /** When true: adds include_content schema field; strips content from get/getAll responses */
  supportsContentField?: boolean;
  /** Field name to strip when supportsContentField is true. Defaults to 'content'. */
  contentField?: string;
  /** When true: translates name param to search, bumps limit to 100, title-sorts results */
  nameResolutionBaked?: boolean;
  /** When true: adds include_photos schema field; strips photosField array from get/getAll responses unless include_photos=true */
  supportsPhotosField?: boolean;
  /** Field name to strip when supportsPhotosField is true. Defaults to 'public_photos'. */
  photosField?: string;
}

export const HUDU_RESOURCE_CONFIG: Record<string, HuduResourceConfig> = {
  companies: {
    endpoint: '/companies',
    pluralKey: 'companies',
    singularKey: 'company',
    bodyKey: 'company',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive', 'getIdByName', 'help'],
    supportsPagination: true,
    label: 'Company',
  },
  articles: {
    endpoint: '/articles',
    pluralKey: 'articles',
    singularKey: 'article',
    bodyKey: 'article',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive', 'help'],
    supportsPagination: true,
    label: 'Article',
    supportsContentField: true,
    supportsPhotosField: true,
    nameResolutionBaked: true,
  },
  assets: {
    endpoint: '/assets',
    pluralKey: 'assets',
    singularKey: 'asset',
    bodyKey: 'asset',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive', 'getIdByName', 'move', 'getByLayout'],
    supportsPagination: true,
    label: 'Asset',
    requiresCompanyEndpoint: true,
  },
  websites: {
    endpoint: '/websites',
    pluralKey: 'websites',
    singularKey: 'website',
    bodyKey: 'website',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'getIdByName', 'help'],
    supportsPagination: true,
    label: 'Website',
  },
  users: {
    endpoint: '/users',
    pluralKey: 'users',
    singularKey: 'user',
    bodyKey: null,
    ops: ['get', 'getAll', 'getIdByName'],
    supportsPagination: true,
    label: 'User',
  },
  asset_passwords: {
    endpoint: '/asset_passwords',
    pluralKey: 'asset_passwords',
    singularKey: 'asset_password',
    bodyKey: 'asset_password',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive', 'getIdByName'],
    supportsPagination: true,
    label: 'Asset Password',
  },
  procedures: {
    endpoint: '/procedures',
    pluralKey: 'procedures',
    singularKey: 'procedure',
    bodyKey: null,
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive', 'getIdByName', 'help'],
    supportsPagination: true,
    label: 'Procedure',
  },
  activity_logs: {
    endpoint: '/activity_logs',
    pluralKey: 'activity_logs',
    singularKey: null,
    bodyKey: null,
    ops: ['getAll'],
    supportsPagination: true,
    label: 'Activity Log',
  },
  folders: {
    endpoint: '/folders',
    pluralKey: 'folders',
    singularKey: 'folder',
    bodyKey: 'folder',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'getIdByName', 'help'],
    supportsPagination: true,
    label: 'Folder',
  },
  photos: {
    endpoint: '/photos',
    pluralKey: 'photos',
    singularKey: 'photo',
    bodyKey: 'photo',
    ops: ['get', 'getAll'],
    supportsPagination: true,
    label: 'Photo',
  },
  public_photos: {
    endpoint: '/public_photos',
    pluralKey: 'public_photos',
    singularKey: null,
    bodyKey: null,
    ops: ['get', 'help'],
    supportsPagination: true,
    label: 'Public Photo',
  },
  procedure_tasks: {
    endpoint: '/procedure_tasks',
    pluralKey: 'procedure_tasks',
    singularKey: 'procedure_task',
    bodyKey: null,
    ops: ['get', 'getAll', 'help'],
    supportsPagination: false,
    label: 'Procedure Task',
  },
  networks: {
    endpoint: '/networks',
    pluralKey: 'networks',
    singularKey: 'network',
    bodyKey: 'network',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'getIdByName'],
    supportsPagination: false,
    label: 'Network',
  },
  ip_addresses: {
    endpoint: '/ip_addresses',
    pluralKey: 'ip_addresses',
    singularKey: 'ip_address',
    bodyKey: 'ip_address',
    ops: ['get', 'getAll', 'create', 'update', 'delete'],
    supportsPagination: false,
    label: 'IP Address',
  },
  asset_layouts: {
    endpoint: '/asset_layouts',
    pluralKey: 'asset_layouts',
    singularKey: 'asset_layout',
    bodyKey: null,
    ops: ['get', 'getAll', 'getIdByName'],
    supportsPagination: true,
    label: 'Asset Layout',
  },
  relations: {
    endpoint: '/relations',
    pluralKey: 'relations',
    singularKey: 'relation',
    bodyKey: 'relation',
    ops: ['getAll', 'create', 'delete', 'help'],
    supportsPagination: true,
    label: 'Relation',
  },
  expirations: {
    endpoint: '/expirations',
    pluralKey: null,
    singularKey: null,
    bodyKey: 'expiration',
    ops: ['getAll'],
    supportsPagination: true,
    label: 'Expiration',
  },
  groups: {
    endpoint: '/groups',
    pluralKey: null,
    singularKey: 'group',
    bodyKey: null,
    ops: ['get', 'getAll', 'getIdByName'],
    supportsPagination: true,
    label: 'Group',
  },
  vlans: {
    endpoint: '/vlans',
    pluralKey: 'vlans',
    singularKey: 'vlan',
    bodyKey: 'vlan',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'getIdByName'],
    supportsPagination: false,
    label: 'VLAN',
  },
  vlan_zones: {
    endpoint: '/vlan_zones',
    pluralKey: 'vlan_zones',
    singularKey: 'vlan_zone',
    bodyKey: 'vlan_zone',
    ops: ['get', 'getAll', 'create', 'update', 'delete', 'getIdByName'],
    supportsPagination: false,
    label: 'VLAN Zone',
  },
  matchers: {
    endpoint: '/matchers',
    pluralKey: 'matchers',
    singularKey: 'matcher',
    bodyKey: 'matcher',
    ops: ['getAll', 'update', 'delete'],
    supportsPagination: true,
    label: 'Matcher',
  },
  label_types: {
    endpoint: '/label_types',
    pluralKey: 'label_types',
    singularKey: 'label_type',
    bodyKey: 'label_type',
    ops: ['get', 'getAll', 'create', 'update', 'delete'],
    supportsPagination: true,
    label: 'Label Type',
  },
  labels: {
    endpoint: '/labels',
    pluralKey: 'labels',
    singularKey: 'label',
    bodyKey: 'label',
    ops: ['get', 'getAll', 'create', 'update', 'delete'],
    supportsPagination: true,
    label: 'Label',
  },
};

export const WRITE_OPERATIONS: HuduOperation[] = [
  'create',
  'update',
  'delete',
  'archive',
  'unarchive',
  'move',
];

/**
 * Per-resource map of field → values considered "default". Any field whose value
 * matches one of the listed defaults is omitted from the response envelope. The
 * tool description names the default once so the LLM can correctly interpret an
 * omitted field. Empty array `[]` is a sentinel that matches any zero-length array.
 *
 * Guarantees uniform field sets across same-resource records (every record runs
 * through the same default-strip) and saves the per-record null-byte cost on
 * fields that hold their default the vast majority of the time.
 */
export const DEFAULT_FIELD_VALUES: Record<string, Record<string, unknown[]>> = {
  articles: {
    enable_sharing: [null, false],
    share_url: [null, ''],
    archived: [false],
    draft: [null, false],
  },
  companies: {
    parent_company_id: [null],
    parent_company_name: [null, ''],
    archived: [false],
  },
  websites: {
    keyword: [null, ''],
    headers: [null, ''],
    cloudflare_details: [null, ''],
    discarded_at: [null],
    asset_field_id: [null],
    archived: [false],
    paused: [false],
  },
  procedures: {
    parent_procedure: [null],
    paused: [null, false],
    archived: [false],
  },
  procedure_tasks: {
    completed: [null, false],
    description: [null, ''],
    due_date: [null],
  },
};
