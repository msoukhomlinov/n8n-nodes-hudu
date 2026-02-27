import { z } from 'zod';

// ---------------------------------------------------------------------------
// Common base schemas
// ---------------------------------------------------------------------------

const idSchema = z.number().int().positive().describe('Numeric record ID');
const optionalIdSchema = z.number().int().positive().optional().describe('Numeric record ID');
const limitSchema = z.number().int().min(1).max(100).optional().default(25).describe('Maximum records to return (default 25, max 100)');
const companyIdSchema = z.number().int().positive().describe('Numeric company ID');
const optionalCompanyIdSchema = z.number().int().positive().optional().describe('Filter by company ID');
const archivedSchema = z.boolean().optional().describe('Filter by archived status (true = archived only, false = active only, omit = all)');
const nameSchema = z.string().min(1).describe('Name');
const optionalNameSchema = z.string().optional().describe(
    'Exact full-name match only. Avoid unless you need a precise match — use search instead'
);

// ---------------------------------------------------------------------------
// Get by ID
// ---------------------------------------------------------------------------

export function getGetSchema() {
    return z.object({
        id: idSchema,
    });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export function getDeleteSchema() {
    return z.object({
        id: idSchema,
    });
}

export function getDeleteWithCompanySchema() {
    return z.object({
        id: idSchema,
        company_id: companyIdSchema.describe('Company ID that owns this asset'),
    });
}

// ---------------------------------------------------------------------------
// Archive / Unarchive
// ---------------------------------------------------------------------------

export function getArchiveSchema() {
    return z.object({
        id: idSchema,
    });
}

export function getArchiveWithCompanySchema() {
    return z.object({
        id: idSchema,
        company_id: companyIdSchema.describe('Company ID that owns this asset'),
    });
}

// ---------------------------------------------------------------------------
// Resource-specific getAll schemas
// ---------------------------------------------------------------------------

export function getCompaniesGetAllSchema() {
    return z.object({
        search: z.string().optional().describe('Search across name and other text fields — prefer this over name'),
        name: optionalNameSchema,
        slug: z.string().optional().describe('Filter by URL slug'),
        id_in_integration: z.string().optional().describe('Filter by integration ID'),
        city: z.string().optional().describe('Filter by city'),
        state: z.string().optional().describe('Filter by state/region'),
        phone_number: z.string().optional().describe('Filter by phone number'),
        website: z.string().optional().describe('Filter by website URL'),
        archived: archivedSchema,
        limit: limitSchema,
    });
}

export function getArticlesGetAllSchema() {
    return z.object({
        search: z.string().optional().describe('Search across name and other fields — prefer this over name'),
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        slug: z.string().optional().describe('Filter by URL slug'),
        draft: z.boolean().optional().describe('Filter by draft status'),
        folder_id: z.number().int().positive().optional().describe('Filter by folder ID'),
        archived: archivedSchema,
        limit: limitSchema,
    });
}

export function getAssetsGetAllSchema() {
    return z.object({
        search: z.string().optional().describe('Search across name and other fields — prefer this over name'),
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        asset_layout_id: z.number().int().positive().optional().describe('Filter by asset layout ID'),
        primary_serial: z.string().optional().describe('Filter by primary serial number'),
        slug: z.string().optional().describe('Filter by URL slug'),
        archived: archivedSchema,
        limit: limitSchema,
    });
}

export function getWebsitesGetAllSchema() {
    return z.object({
        search: z.string().optional().describe('Search across name and other fields — prefer this over name'),
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        slug: z.string().optional().describe('Filter by URL slug'),
        archived: archivedSchema,
        limit: limitSchema,
    });
}

export function getUsersGetAllSchema() {
    return z.object({
        search: z.string().optional().describe('Search by first name, last name, or other text — prefer this for name lookups'),
        first_name: z.string().optional().describe('Filter by exact first name'),
        last_name: z.string().optional().describe('Filter by exact last name'),
        email: z.string().email().optional().describe('Filter by email address'),
        limit: limitSchema,
    });
}

export function getAssetPasswordsGetAllSchema() {
    return z.object({
        search: z.string().optional().describe('Search across name and other fields — prefer this over name'),
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        slug: z.string().optional().describe('Filter by URL slug'),
        archived: archivedSchema,
        limit: limitSchema,
    });
}

export function getProceduresGetAllSchema() {
    return z.object({
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        slug: z.string().optional().describe('Filter by URL slug'),
        archived: archivedSchema,
        limit: limitSchema,
    });
}

export function getActivityLogsGetAllSchema() {
    return z.object({
        user_id: z.number().int().positive().optional().describe('Filter by user ID'),
        user_email: z.string().optional().describe('Filter by user email'),
        resource_id: z.number().int().positive().optional().describe('Filter by resource ID (use with resource_type)'),
        resource_type: z.string().optional().describe('Filter by resource type: Article, Asset, AssetPassword, Company, etc. (use with resource_id)'),
        action_message: z.string().optional().describe('Filter by action performed'),
        start_date: z.string().optional().describe('Filter logs from this date (ISO 8601, e.g. 2024-01-01)'),
        end_date: z.string().optional().describe('Filter logs until this date (ISO 8601, e.g. 2024-12-31)'),
        limit: limitSchema,
    });
}

export function getFoldersGetAllSchema() {
    return z.object({
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        parent_folder_id: z.number().int().positive().optional().describe('Filter by parent folder ID'),
        limit: limitSchema,
    });
}

export function getNetworksGetAllSchema() {
    return z.object({
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        archived: archivedSchema,
        location_id: z.number().int().positive().optional().describe('Filter by location ID'),
        network_type: z.number().int().optional().describe('Filter by network type'),
        limit: limitSchema,
    });
}

export function getIpAddressesGetAllSchema() {
    return z.object({
        address: z.string().optional().describe('Filter by IP address'),
        company_id: optionalCompanyIdSchema,
        network_id: z.number().int().positive().optional().describe('Filter by network ID'),
        status: z.enum(['unassigned', 'assigned', 'reserved', 'deprecated', 'dhcp', 'slaac']).optional().describe('Filter by IP address status'),
        fqdn: z.string().optional().describe('Filter by FQDN (exact match)'),
        asset_id: z.number().int().positive().optional().describe('Filter by asset ID'),
        limit: limitSchema,
    });
}

export function getAssetLayoutsGetAllSchema() {
    return z.object({
        name: optionalNameSchema,
        limit: limitSchema,
    });
}

export function getRelationsGetAllSchema() {
    return z.object({
        id: optionalIdSchema.describe('Filter by relation ID'),
        froable_id: z.number().int().positive().optional().describe('From-record ID'),
        froable_type: z.string().optional().describe('From-record type'),
        toable_id: z.number().int().positive().optional().describe('To-record ID'),
        toable_type: z.string().optional().describe('To-record type'),
        limit: limitSchema,
    });
}

export function getExpirationsGetAllSchema() {
    return z.object({
        company_id: optionalCompanyIdSchema,
        resource_type: z.string().optional().describe('Filter by resource type'),
        limit: limitSchema,
    });
}

export function getGroupsGetAllSchema() {
    return z.object({
        search: z.string().optional().describe('Search across group names — prefer this over name'),
        name: optionalNameSchema,
        limit: limitSchema,
    });
}

export function getVlansGetAllSchema() {
    return z.object({
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        vlan_zone_id: z.number().int().positive().optional().describe('Filter by VLAN zone ID'),
        limit: limitSchema,
    });
}

export function getVlanZonesGetAllSchema() {
    return z.object({
        name: optionalNameSchema,
        company_id: optionalCompanyIdSchema,
        limit: limitSchema,
    });
}

export function getMatchersGetAllSchema() {
    return z.object({
        integration_id: z.number().int().positive().describe('Integration ID — filters matchers to a specific integration (required)'),
        limit: limitSchema,
    });
}

// ---------------------------------------------------------------------------
// Resource-specific create schemas
// ---------------------------------------------------------------------------

export function getCompaniesCreateSchema() {
    return z.object({
        name: nameSchema.describe('Company name'),
        company_type: z.string().optional().describe('Company type (e.g. Customer, Prospect, Vendor, Partner, Reseller, Internal)'),
        nickname: z.string().optional().describe('Short name or nickname'),
        phone_number: z.string().optional().describe('Phone number'),
        address_line_1: z.string().optional().describe('Address line 1'),
        address_line_2: z.string().optional().describe('Address line 2'),
        city: z.string().optional().describe('City'),
        state: z.string().optional().describe('State or region'),
        zip: z.string().optional().describe('ZIP / postal code'),
        country_name: z.string().optional().describe('Country name'),
        website: z.string().url().optional().describe('Company website URL'),
        notes: z.string().optional().describe('Notes'),
        fax_number: z.string().optional().describe('Fax number'),
        parent_company_id: z.number().int().positive().optional().describe('Parent company ID'),
    });
}

export function getArticlesCreateSchema() {
    return z.object({
        name: nameSchema.describe('Article title'),
        content: z.string().optional().describe('Article content (HTML or Markdown)'),
        company_id: optionalCompanyIdSchema,
        folder_id: z.number().int().positive().optional().describe('Folder ID to place the article in'),
        enable_sharing: z.boolean().optional().describe('Whether to enable public sharing'),
    });
}

export function getAssetsCreateSchema() {
    return z.object({
        company_id: companyIdSchema,
        asset_layout_id: z.number().int().positive().describe('Asset layout ID that defines the fields for this asset'),
        name: nameSchema.describe('Asset name'),
        primary_serial: z.string().optional().describe('Primary serial number'),
        primary_mail: z.string().optional().describe('Primary email address'),
        primary_model: z.string().optional().describe('Primary model'),
        primary_manufacturer: z.string().optional().describe('Primary manufacturer'),
        custom_fields: z.array(z.record(z.string(), z.unknown())).optional().describe('Custom field values as array of {field_name: value} objects'),
    });
}

export function getWebsitesCreateSchema() {
    return z.object({
        name: nameSchema.describe('Website name'),
        company_id: companyIdSchema,
        notes: z.string().optional().describe('Notes'),
        keyword: z.string().optional().describe('Keyword to monitor on the page'),
        monitor_type: z.number().int().optional().describe('Monitor type'),
        disable_dns: z.boolean().optional().describe('Whether to disable DNS checks'),
        disable_ssl: z.boolean().optional().describe('Whether to disable SSL checks'),
        disable_whois: z.boolean().optional().describe('Whether to disable WHOIS checks'),
        enable_dmarc_tracking: z.boolean().optional().describe('Whether to enable DMARC tracking'),
        enable_dkim_tracking: z.boolean().optional().describe('Whether to enable DKIM tracking'),
        enable_spf_tracking: z.boolean().optional().describe('Whether to enable SPF tracking'),
    });
}

export function getAssetPasswordsCreateSchema() {
    return z.object({
        name: nameSchema.describe('Password entry name'),
        company_id: companyIdSchema,
        password: z.string().describe('The password value'),
        username: z.string().optional().describe('Username'),
        url: z.string().optional().describe('Related URL'),
        description: z.string().optional().describe('Description'),
        asset_id: z.number().int().positive().optional().describe('Asset ID to associate with'),
        passwordable_type: z.string().optional().describe('Resource type this password belongs to'),
        passwordable_id: z.number().int().positive().optional().describe('Resource ID this password belongs to'),
        password_type: z.string().optional().describe('Password type'),
        password_folder_id: z.number().int().positive().optional().describe('Password folder ID'),
        login_url: z.string().optional().describe('Login URL'),
        in_portal: z.boolean().optional().describe('Whether visible in portal'),
        otp_secret: z.string().optional().describe('OTP secret for 2FA'),
    });
}

export function getProceduresCreateSchema() {
    return z.object({
        name: nameSchema.describe('Procedure name'),
        company_id: optionalCompanyIdSchema,
        description: z.string().optional().describe('Procedure description'),
    });
}

export function getFoldersCreateSchema() {
    return z.object({
        name: nameSchema.describe('Folder name'),
        company_id: optionalCompanyIdSchema,
        description: z.string().optional().describe('Folder description'),
        parent_folder_id: z.number().int().positive().optional().describe('Parent folder ID'),
        icon: z.string().optional().describe('Icon name'),
    });
}

export function getNetworksCreateSchema() {
    return z.object({
        name: nameSchema.describe('Network name'),
        company_id: companyIdSchema,
        network_type: z.number().int().optional().describe('Network type'),
        address: z.string().describe('Network address (CIDR notation, e.g. 192.168.1.0/24)'),
        description: z.string().optional().describe('Description'),
        location_id: z.number().int().positive().optional().describe('Location ID'),
        notes: z.string().optional().describe('Notes (rich text)'),
        status_list_item_id: z.number().int().positive().optional().describe('Status list item ID'),
        role_list_item_id: z.number().int().positive().optional().describe('Role list item ID'),
    });
}

export function getIpAddressesCreateSchema() {
    return z.object({
        address: z.string().describe('IP address'),
        company_id: companyIdSchema,
        status: z.enum(['unassigned', 'assigned', 'reserved', 'deprecated', 'dhcp', 'slaac']).describe('IP address status'),
        network_id: z.number().int().positive().optional().describe('Network ID this IP belongs to'),
        description: z.string().optional().describe('Description'),
        fqdn: z.string().optional().describe('Fully qualified domain name'),
        asset_id: z.number().int().positive().optional().describe('Asset ID to associate with'),
        skip_dns_validation: z.boolean().optional().describe('Whether to skip DNS validation'),
    });
}

export function getRelationsCreateSchema() {
    return z.object({
        froable_id: z.number().int().positive().describe('ID of the from-record'),
        froable_type: z.string().describe('Type of the from-record (e.g. Asset, Company, Article)'),
        toable_id: z.number().int().positive().describe('ID of the to-record'),
        toable_type: z.string().describe('Type of the to-record (e.g. Asset, Company, Article)'),
        is_inverse: z.boolean().optional().describe('Whether this is an inverse relation'),
        description: z.string().optional().describe('Relation description'),
    });
}

export function getVlansCreateSchema() {
    return z.object({
        name: nameSchema.describe('VLAN name'),
        company_id: companyIdSchema,
        vlan_id: z.number().int().min(1).max(4094).optional().describe('VLAN ID (1–4094)'),
        vlan_zone_id: z.number().int().positive().optional().describe('VLAN zone ID'),
        description: z.string().optional().describe('Description'),
        notes: z.string().optional().describe('Notes (rich text)'),
        status_list_item_id: z.number().int().positive().optional().describe('Status list item ID'),
        role_list_item_id: z.number().int().positive().optional().describe('Role list item ID'),
    });
}

export function getVlanZonesCreateSchema() {
    return z.object({
        name: nameSchema.describe('VLAN zone name'),
        company_id: optionalCompanyIdSchema,
        vlan_id_ranges: z.string().describe('Comma-separated VLAN ID ranges (e.g. "100-500,1000-1500")'),
        description: z.string().optional().describe('Description'),
    });
}

// ---------------------------------------------------------------------------
// Resource-specific update schemas (same fields as create, all optional except id)
// ---------------------------------------------------------------------------

export function getCompaniesUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('Company name'),
        company_type: z.string().optional().describe('Company type (e.g. Customer, Prospect, Vendor, Partner, Reseller, Internal)'),
        nickname: z.string().optional().describe('Short name or nickname'),
        phone_number: z.string().optional().describe('Phone number'),
        address_line_1: z.string().optional().describe('Address line 1'),
        address_line_2: z.string().optional().describe('Address line 2'),
        city: z.string().optional().describe('City'),
        state: z.string().optional().describe('State or region'),
        zip: z.string().optional().describe('ZIP / postal code'),
        country_name: z.string().optional().describe('Country name'),
        website: z.string().url().optional().describe('Company website URL'),
        notes: z.string().optional().describe('Notes'),
        fax_number: z.string().optional().describe('Fax number'),
        parent_company_id: z.number().int().positive().optional().describe('Parent company ID'),
    });
}

export function getArticlesUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('Article title'),
        content: z.string().optional().describe('Article content'),
        company_id: optionalCompanyIdSchema,
        folder_id: z.number().int().positive().optional().describe('Folder ID'),
        enable_sharing: z.boolean().optional().describe('Whether to enable public sharing'),
        draft: z.boolean().optional().describe('Whether the article is a draft'),
    });
}

export function getAssetsUpdateSchema() {
    return z.object({
        id: idSchema,
        company_id: companyIdSchema.describe('Company ID that owns this asset (required for routing)'),
        name: z.string().optional().describe('Asset name'),
        primary_serial: z.string().optional().describe('Primary serial number'),
        primary_mail: z.string().optional().describe('Primary email address'),
        primary_model: z.string().optional().describe('Primary model'),
        primary_manufacturer: z.string().optional().describe('Primary manufacturer'),
        custom_fields: z.array(z.record(z.string(), z.unknown())).optional().describe('Custom field values as array of {field_name: value} objects'),
    });
}

export function getWebsitesUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('Website name'),
        notes: z.string().optional().describe('Notes'),
        paused: z.boolean().optional().describe('Whether monitoring is paused'),
        keyword: z.string().optional().describe('Keyword to monitor on the page'),
        monitor_type: z.number().int().optional().describe('Monitor type'),
        disable_dns: z.boolean().optional().describe('Whether to disable DNS checks'),
        disable_ssl: z.boolean().optional().describe('Whether to disable SSL checks'),
        disable_whois: z.boolean().optional().describe('Whether to disable WHOIS checks'),
        enable_dmarc_tracking: z.boolean().optional().describe('Whether to enable DMARC tracking'),
        enable_dkim_tracking: z.boolean().optional().describe('Whether to enable DKIM tracking'),
        enable_spf_tracking: z.boolean().optional().describe('Whether to enable SPF tracking'),
    });
}

export function getAssetPasswordsUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('Password entry name'),
        password: z.string().optional().describe('The password value'),
        username: z.string().optional().describe('Username'),
        url: z.string().optional().describe('Related URL'),
        description: z.string().optional().describe('Description'),
        passwordable_type: z.string().optional().describe('Resource type this password belongs to'),
        passwordable_id: z.number().int().positive().optional().describe('Resource ID this password belongs to'),
        password_type: z.string().optional().describe('Password type'),
        password_folder_id: z.number().int().positive().optional().describe('Password folder ID'),
        login_url: z.string().optional().describe('Login URL'),
        in_portal: z.boolean().optional().describe('Whether visible in portal'),
        otp_secret: z.string().optional().describe('OTP secret for 2FA'),
    });
}

export function getProceduresUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('Procedure name'),
        description: z.string().optional().describe('Procedure description'),
        company_id: z.number().int().positive().optional().describe('Company ID'),
    });
}

export function getFoldersUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('Folder name'),
        company_id: z.number().int().positive().optional().describe('Company ID'),
        description: z.string().optional().describe('Folder description'),
        parent_folder_id: z.number().int().positive().optional().describe('Parent folder ID'),
        icon: z.string().optional().describe('Icon name'),
    });
}

export function getNetworksUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('Network name'),
        company_id: z.number().int().positive().optional().describe('Company ID'),
        network_type: z.number().int().optional().describe('Network type'),
        address: z.string().optional().describe('Network address (CIDR)'),
        description: z.string().optional().describe('Description'),
        location_id: z.number().int().positive().optional().describe('Location ID'),
        notes: z.string().optional().describe('Notes (rich text)'),
        archived: z.boolean().optional().describe('Whether the network is archived'),
        status_list_item_id: z.number().int().positive().optional().describe('Status list item ID'),
        role_list_item_id: z.number().int().positive().optional().describe('Role list item ID'),
    });
}

export function getIpAddressesUpdateSchema() {
    return z.object({
        id: idSchema,
        address: z.string().optional().describe('IP address'),
        company_id: z.number().int().positive().optional().describe('Company ID'),
        network_id: z.number().int().positive().optional().describe('Network ID this IP belongs to'),
        status: z.enum(['unassigned', 'assigned', 'reserved', 'deprecated', 'dhcp', 'slaac']).optional().describe('IP address status'),
        description: z.string().optional().describe('Description'),
        fqdn: z.string().optional().describe('Fully qualified domain name'),
        asset_id: z.number().int().positive().optional().describe('Asset ID to associate with'),
        skip_dns_validation: z.boolean().optional().describe('Whether to skip DNS validation'),
    });
}

export function getExpirationsUpdateSchema() {
    return z.object({
        id: idSchema,
        expiration_date: z.string().optional().describe('Expiration date (ISO 8601)'),
        expiration_type: z.string().optional().describe('Type of expiration'),
        notes: z.string().optional().describe('Notes'),
    });
}

export function getVlansUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('VLAN name'),
        company_id: z.number().int().positive().optional().describe('Company ID'),
        vlan_id: z.number().int().min(1).max(4094).optional().describe('VLAN ID (1–4094)'),
        vlan_zone_id: z.number().int().positive().optional().describe('VLAN zone ID'),
        description: z.string().optional().describe('Description'),
        notes: z.string().optional().describe('Notes (rich text)'),
        status_list_item_id: z.number().int().positive().optional().describe('Status list item ID'),
        role_list_item_id: z.number().int().positive().optional().describe('Role list item ID'),
    });
}

export function getVlanZonesUpdateSchema() {
    return z.object({
        id: idSchema,
        name: z.string().optional().describe('VLAN zone name'),
        description: z.string().optional().describe('Description'),
        vlan_id_ranges: z.string().optional().describe('Comma-separated VLAN ID ranges'),
        archived: z.boolean().optional().describe('Whether this zone is archived'),
    });
}

export function getMatchersUpdateSchema() {
    return z.object({
        id: idSchema,
        company_id: z.number().int().positive().optional().describe('Company ID to map this matcher to'),
        potential_company_id: z.number().int().positive().optional().describe('Potential company ID'),
        sync_id: z.number().int().positive().optional().describe('Sync ID'),
        identifier: z.string().optional().describe('Identifier string'),
    });
}
