export type HuduOperation = 'get' | 'getAll' | 'create' | 'update' | 'delete' | 'archive' | 'unarchive';

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
}

export const HUDU_RESOURCE_CONFIG: Record<string, HuduResourceConfig> = {
    companies: {
        endpoint: '/companies',
        pluralKey: 'companies',
        singularKey: 'company',
        bodyKey: 'company',
        ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive'],
        supportsPagination: true,
        label: 'Company',
    },
    articles: {
        endpoint: '/articles',
        pluralKey: 'articles',
        singularKey: 'article',
        bodyKey: 'article',
        ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive'],
        supportsPagination: true,
        label: 'Article',
    },
    assets: {
        endpoint: '/assets',
        pluralKey: 'assets',
        singularKey: 'asset',
        bodyKey: 'asset',
        ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive'],
        supportsPagination: true,
        label: 'Asset',
        requiresCompanyEndpoint: true,
    },
    websites: {
        endpoint: '/websites',
        pluralKey: 'websites',
        singularKey: 'website',
        bodyKey: 'website',
        ops: ['get', 'getAll', 'create', 'update', 'delete'],
        supportsPagination: true,
        label: 'Website',
    },
    users: {
        endpoint: '/users',
        pluralKey: 'users',
        singularKey: 'user',
        bodyKey: null,
        ops: ['get', 'getAll'],
        supportsPagination: true,
        label: 'User',
    },
    asset_passwords: {
        endpoint: '/asset_passwords',
        pluralKey: 'asset_passwords',
        singularKey: 'asset_password',
        bodyKey: 'asset_password',
        ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive'],
        supportsPagination: true,
        label: 'Asset Password',
    },
    procedures: {
        endpoint: '/procedures',
        pluralKey: 'procedures',
        singularKey: 'procedure',
        bodyKey: null,
        ops: ['get', 'getAll', 'create', 'update', 'delete', 'archive', 'unarchive'],
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
        ops: ['get', 'getAll', 'create', 'update', 'delete'],
        supportsPagination: true,
        label: 'Folder',
    },
    networks: {
        endpoint: '/networks',
        pluralKey: 'networks',
        singularKey: 'network',
        bodyKey: 'network',
        ops: ['get', 'getAll', 'create', 'update', 'delete'],
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
        ops: ['get', 'getAll'],
        supportsPagination: true,
        label: 'Asset Layout',
    },
    relations: {
        endpoint: '/relations',
        pluralKey: 'relations',
        singularKey: 'relation',
        bodyKey: 'relation',
        ops: ['getAll', 'create', 'delete'],
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
        ops: ['get', 'getAll'],
        supportsPagination: true,
        label: 'Group',
    },
    vlans: {
        endpoint: '/vlans',
        pluralKey: 'vlans',
        singularKey: 'vlan',
        bodyKey: 'vlan',
        ops: ['get', 'getAll', 'create', 'update', 'delete'],
        supportsPagination: false,
        label: 'VLAN',
    },
    vlan_zones: {
        endpoint: '/vlan_zones',
        pluralKey: 'vlan_zones',
        singularKey: 'vlan_zone',
        bodyKey: 'vlan_zone',
        ops: ['get', 'getAll', 'create', 'update', 'delete'],
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
};

export const WRITE_OPERATIONS: HuduOperation[] = ['create', 'update', 'delete', 'archive', 'unarchive'];
