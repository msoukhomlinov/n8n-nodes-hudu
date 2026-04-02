import type { IDataObject, IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { RuntimeDynamicStructuredTool, runtimeZod as z } from './runtime';
import {
    handleGetOperation,
    handleGetAllOperation,
    handleCreateOperation,
    handleDeleteOperation,
} from '../utils/operations';
import { getCompanyIdForAsset } from '../utils/operations/getCompanyIdForAsset';
import { wrapSuccess, wrapError, ERROR_TYPES } from './error-formatter';

// ---------------------------------------------------------------------------
// hudu_get_id_by_name
// ---------------------------------------------------------------------------

interface GetIdByNameResourceConfig {
    endpoint: string;
    pluralKey: string;
    filterKey: 'search' | 'name';
    slimFields: string[];
}

const GET_ID_BY_NAME_CONFIG: Record<string, GetIdByNameResourceConfig> = {
    company: { endpoint: '/companies', pluralKey: 'companies', filterKey: 'search', slimFields: ['id', 'name'] },
    asset: { endpoint: '/assets', pluralKey: 'assets', filterKey: 'search', slimFields: ['id', 'name', 'company_id', 'asset_layout_id'] },
    article: { endpoint: '/articles', pluralKey: 'articles', filterKey: 'search', slimFields: ['id', 'name', 'company_id'] },
    asset_layout: { endpoint: '/asset_layouts', pluralKey: 'asset_layouts', filterKey: 'name', slimFields: ['id', 'name'] },
    folder: { endpoint: '/folders', pluralKey: 'folders', filterKey: 'name', slimFields: ['id', 'name', 'company_id', 'parent_folder_id'] },
    procedure: { endpoint: '/procedures', pluralKey: 'procedures', filterKey: 'name', slimFields: ['id', 'name'] },
    website: { endpoint: '/websites', pluralKey: 'websites', filterKey: 'search', slimFields: ['id', 'name', 'company_id'] },
    user: { endpoint: '/users', pluralKey: 'users', filterKey: 'search', slimFields: ['id', 'name', 'email'] },
};

const EXACT_MATCH_RESOURCES = new Set(['asset_layout', 'folder', 'procedure']);

export function buildGetIdByNameTool(
    context: ISupplyDataFunctions,
    referenceUtc: string,
): InstanceType<typeof RuntimeDynamicStructuredTool> {
    const schema = z.object({
        resource_type: z.enum([
            'company', 'asset', 'article', 'asset_layout', 'folder', 'procedure', 'website', 'user',
        ]).describe(
            'The resource type to search. ' +
            'Partial-match resources (company, asset, article, website, user): name is a partial/fuzzy search. ' +
            'Exact-match resources (asset_layout, folder, procedure): name must be an EXACT case-sensitive match.',
        ),
        name: z.string().min(1).describe(
            'Name or partial name to search for. ' +
            'For asset_layout, folder, and procedure this must be an EXACT case-sensitive match.',
        ),
        limit: z.number().int().min(1).max(20).optional().default(5).describe(
            'Maximum number of matching records to return (default 5, max 20).',
        ),
    });

    const description =
        `Reference: current UTC date-time when these tools were loaded is ${referenceUtc}. ` +
        'Resolve a Hudu resource name to its numeric ID in a single call. ' +
        'Use this before any operation that requires a numeric ID but you only have a name or partial text. ' +
        'Supported resource types: company, asset, article, asset_layout, folder, procedure, website, user. ' +
        'For company/asset/article/website/user: name is a partial match (search). ' +
        'For asset_layout/folder/procedure: name must be EXACT and case-sensitive. ' +
        'Returns up to [limit] matching records with id and key fields. ' +
        'Prefer this over calling hudu_{resource} with getAll just to find an ID.';

    return new RuntimeDynamicStructuredTool({
        name: 'hudu_get_id_by_name',
        description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema: schema as any,
        metadata: {
            annotations: {
                title: 'Hudu: Resolve Name to ID',
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        func: async (params: Record<string, unknown>): Promise<string> => {
            try {
                const resourceType = params.resource_type as string;
                const name = params.name as string;
                const limit = (params.limit as number | undefined) ?? 5;

                const config = GET_ID_BY_NAME_CONFIG[resourceType];
                if (!config) {
                    return JSON.stringify(wrapError(
                        'get_id_by_name', 'resolve', ERROR_TYPES.UNKNOWN_RESOURCE,
                        `Unknown resource_type: ${resourceType}`,
                        'Valid values: company, asset, article, asset_layout, folder, procedure, website, user.',
                    ));
                }

                const records = await handleGetAllOperation.call(
                    context as unknown as IExecuteFunctions,
                    config.endpoint,
                    config.pluralKey,
                    { [config.filterKey]: name },
                    false,
                    limit,
                );

                if (records.length === 0) {
                    const hint = EXACT_MATCH_RESOURCES.has(resourceType)
                        ? `No ${resourceType} found with exact name "${name}". This resource requires an EXACT case-sensitive name match.`
                        : `No ${resourceType} found matching "${name}". Try a shorter or different search term.`;
                    return JSON.stringify(wrapError(
                        'get_id_by_name', 'resolve', ERROR_TYPES.NO_RESULTS_FOUND,
                        hint,
                        'Broaden your search or verify the name exists in Hudu.',
                    ));
                }

                const items = records.map((record) => {
                    const r = record as IDataObject;
                    const slim: IDataObject = {};
                    for (const field of config.slimFields) {
                        if (r[field] !== undefined && r[field] !== null) {
                            slim[field] = r[field];
                        }
                    }
                    return slim;
                });

                return JSON.stringify(wrapSuccess('get_id_by_name', 'resolve', { items, count: items.length }));
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                return JSON.stringify(wrapError(
                    'get_id_by_name', 'resolve', ERROR_TYPES.API_ERROR,
                    msg,
                    'Verify the resource_type and name, then retry.',
                ));
            }
        },
    });
}

// ---------------------------------------------------------------------------
// hudu_move_asset
// ---------------------------------------------------------------------------

const ASSET_COPY_FIELDS = [
    'name', 'asset_layout_id', 'primary_serial', 'primary_mail',
    'primary_model', 'primary_manufacturer', 'hostname', 'notes', 'fields',
] as const;

function isMissingData(data: unknown): boolean {
    return (
        data === null ||
        data === undefined ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === 'object' && !Array.isArray(data) && Object.keys(data as object).length === 0)
    );
}

export function buildMoveAssetTool(
    context: ISupplyDataFunctions,
    referenceUtc: string,
): InstanceType<typeof RuntimeDynamicStructuredTool> {
    const schema = z.object({
        asset_id: z.number().int().positive().describe(
            'Numeric ID of the asset to move (from a prior getAll or get result).',
        ),
        target_company_id: z.number().int().positive().describe(
            'Numeric ID of the destination company. Use hudu_get_id_by_name with resource_type=\'company\' if you only have the company name.',
        ),
        delete_original: z.boolean().optional().default(true).describe(
            'If true (default), delete the original asset after successful creation at the target company. ' +
            'Set to false to create a copy without deleting the original — useful for verifying the move before committing.',
        ),
    });

    const description =
        `Reference: current UTC date-time when these tools were loaded is ${referenceUtc}. ` +
        'Move an asset from its current company to a different company. ' +
        'This recreates the asset under the target company (preserving all standard and custom field values) ' +
        'then deletes the original. There is no native Hudu API endpoint for this operation. ' +
        'IMPORTANT: Relations pointing to the original asset will NOT be automatically updated — ' +
        'use hudu_relations to re-establish them after the move if needed. ' +
        'Set delete_original=false to create a copy without removing the original (verify before committing the move). ' +
        'PREREQUISITE: confirm the correct asset_id and target_company_id before calling — this operation cannot be undone automatically if delete_original=true.';

    return new RuntimeDynamicStructuredTool({
        name: 'hudu_move_asset',
        description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema: schema as any,
        metadata: {
            annotations: {
                title: 'Hudu: Move Asset',
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: false,
                openWorldHint: false,
            },
        },
        func: async (params: Record<string, unknown>): Promise<string> => {
            const assetId = params.asset_id as number;
            const targetCompanyId = params.target_company_id as number;
            const deleteOriginal = params.delete_original !== false;

            try {
                // Step 1: Validate target company exists
                const companyData = await handleGetOperation.call(
                    context as unknown as IExecuteFunctions,
                    '/companies',
                    targetCompanyId,
                    'company',
                );
                if (isMissingData(companyData)) {
                    return JSON.stringify(wrapError(
                        'move_asset', 'move', ERROR_TYPES.ENTITY_NOT_FOUND,
                        `Target company with ID ${targetCompanyId} was not found.`,
                        "Verify the company ID using hudu_get_id_by_name with resource_type='company', then retry.",
                    ));
                }

                // Step 2: Fetch source asset and its company_id
                const { companyId: sourceCompanyId, assetObject } = await getCompanyIdForAsset(
                    context as unknown as IExecuteFunctions,
                    assetId,
                );

                // Step 3: Build create body — explicit pick, skip undefined/null
                const createBody: IDataObject = {};
                for (const field of ASSET_COPY_FIELDS) {
                    const value = (assetObject as IDataObject)[field];
                    if (value !== undefined && value !== null) {
                        createBody[field] = value;
                    }
                }

                // Step 4: Create at target company
                const createResult = await handleCreateOperation.call(
                    context as unknown as IExecuteFunctions,
                    `/companies/${targetCompanyId}/assets`,
                    { asset: createBody },
                );
                const entity = !Array.isArray(createResult)
                    ? ((createResult as IDataObject)['asset'] ?? createResult)
                    : createResult;
                const newAssetId = (entity as IDataObject)?.id as number | undefined;

                if (!newAssetId) {
                    return JSON.stringify(wrapError(
                        'move_asset', 'move', ERROR_TYPES.API_ERROR,
                        'Asset was created at target company but response did not include a new asset ID.',
                        'Check the target company assets to confirm creation, then manually delete the original if needed.',
                    ));
                }

                // Step 5: Delete original (inner try/catch — partial failure is still a success)
                let deletedOriginal = false;
                let deleteWarning: string | undefined;
                if (deleteOriginal) {
                    try {
                        await handleDeleteOperation.call(
                            context as unknown as IExecuteFunctions,
                            '/assets',
                            assetId,
                            sourceCompanyId as number,
                        );
                        deletedOriginal = true;
                    } catch (deleteErr) {
                        const deleteMsg = deleteErr instanceof Error ? deleteErr.message : String(deleteErr);
                        deleteWarning =
                            `Asset was created at target company (new ID: ${newAssetId}) but the original ` +
                            `asset (ID: ${assetId}) could not be deleted — manual cleanup required. ` +
                            `Delete error: ${deleteMsg}`;
                    }
                }

                const fieldsArray = Array.isArray((assetObject as IDataObject).fields)
                    ? ((assetObject as IDataObject).fields as unknown[])
                    : [];

                const result: IDataObject = {
                    new_asset_id: newAssetId,
                    old_asset_id: assetId,
                    source_company_id: sourceCompanyId,
                    target_company_id: targetCompanyId,
                    deleted_original: deletedOriginal,
                    fields_migrated: fieldsArray.length,
                };
                if (deleteWarning) {
                    result.delete_failed = true;
                    result.warning = deleteWarning;
                }

                return JSON.stringify(wrapSuccess('move_asset', 'move', result));
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                return JSON.stringify(wrapError(
                    'move_asset', 'move', ERROR_TYPES.API_ERROR,
                    msg,
                    'Verify asset_id and target_company_id, then retry.',
                ));
            }
        },
    });
}

// ---------------------------------------------------------------------------
// hudu_company_assets_by_layout
// ---------------------------------------------------------------------------

const STANDARD_ASSET_OUTPUT_FIELDS = [
    'id', 'name', 'asset_layout_id', 'primary_serial', 'primary_mail',
    'primary_model', 'primary_manufacturer', 'hostname', 'archived', 'created_at', 'updated_at',
] as const;

export function buildCompanyAssetsByLayoutTool(
    context: ISupplyDataFunctions,
    referenceUtc: string,
): InstanceType<typeof RuntimeDynamicStructuredTool> {
    const schema = z.object({
        company_id: z.number().int().positive().optional().describe(
            'Numeric company ID. Provide this OR company_name (not both required — if both given, company_id takes precedence).',
        ),
        company_name: z.string().min(1).optional().describe(
            'Company name (partial search). Used only when company_id is not provided.',
        ),
        layout_id: z.number().int().positive().optional().describe(
            'Numeric asset layout ID. Provide this OR layout_name.',
        ),
        layout_name: z.string().min(1).optional().describe(
            "Asset layout name — EXACT case-sensitive match. Used only when layout_id is not provided. " +
            "If unsure of the exact name, use hudu_get_id_by_name with resource_type='asset_layout' first.",
        ),
        search: z.string().optional().describe(
            'Filter assets by name, serial number, or model within the result set.',
        ),
        limit: z.number().int().min(1).max(100).optional().default(25).describe(
            'Maximum number of assets to return (default 25, max 100). Increase if you expect many assets of this type.',
        ),
        include_archived: z.boolean().optional().default(false).describe(
            'If true, include archived assets in results. Default false (active assets only).',
        ),
    });

    const description =
        `Reference: current UTC date-time when these tools were loaded is ${referenceUtc}. ` +
        'List all assets of a specific type (layout) for a company, with custom field values labelled by field name. ' +
        "Accepts company name or ID, and layout name or ID. Layout name must be an EXACT case-sensitive match — " +
        "use hudu_get_id_by_name with resource_type='asset_layout' if unsure of the exact name. " +
        'Returns assets with a labelled fields object (e.g., {"Hostname": "SRV01", "IP Address": "10.0.0.1"}) ' +
        'instead of raw numeric field IDs. ' +
        "This is the preferred tool for 'show me all [servers/switches/firewalls] for [company]' queries.";

    return new RuntimeDynamicStructuredTool({
        name: 'hudu_company_assets_by_layout',
        description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema: schema as any,
        metadata: {
            annotations: {
                title: 'Hudu: Assets by Layout',
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        func: async (params: Record<string, unknown>): Promise<string> => {
            try {
                const companyIdParam = params.company_id as number | undefined;
                const companyNameParam = params.company_name as string | undefined;
                const layoutIdParam = params.layout_id as number | undefined;
                const layoutNameParam = params.layout_name as string | undefined;
                const search = params.search as string | undefined;
                const limit = (params.limit as number | undefined) ?? 25;
                const includeArchived = params.include_archived === true;

                // Pre-flight: require at least one company identifier and one layout identifier
                if (!companyIdParam && !companyNameParam) {
                    return JSON.stringify(wrapError(
                        'company_assets_by_layout', 'getByLayout', ERROR_TYPES.MISSING_REQUIRED_FIELD,
                        'Either company_id or company_name must be provided.',
                        "Provide a numeric company_id or a company_name (partial match). Use hudu_get_id_by_name with resource_type='company' to look up the ID.",
                    ));
                }
                if (!layoutIdParam && !layoutNameParam) {
                    return JSON.stringify(wrapError(
                        'company_assets_by_layout', 'getByLayout', ERROR_TYPES.MISSING_REQUIRED_FIELD,
                        'Either layout_id or layout_name must be provided.',
                        "Provide a numeric layout_id or an EXACT layout_name. Use hudu_get_id_by_name with resource_type='asset_layout' to find the exact name.",
                    ));
                }

                // Step 1: Resolve company
                let resolvedCompanyId = companyIdParam;
                let resolvedCompanyName: string | undefined;

                if (!resolvedCompanyId) {
                    const companies = await handleGetAllOperation.call(
                        context as unknown as IExecuteFunctions,
                        '/companies', 'companies',
                        { search: companyNameParam },
                        false, 5,
                    );
                    if (companies.length === 0) {
                        return JSON.stringify(wrapError(
                            'company_assets_by_layout', 'getByLayout', ERROR_TYPES.NO_RESULTS_FOUND,
                            `No company found matching name: "${companyNameParam}".`,
                            'Check the company name spelling or provide a company_id directly.',
                        ));
                    }
                    const company = companies[0] as IDataObject;
                    resolvedCompanyId = company.id as number;
                    resolvedCompanyName = company.name as string;
                }

                // Step 2: Resolve layout
                let resolvedLayoutId = layoutIdParam;
                let resolvedLayoutName: string | undefined;

                if (!resolvedLayoutId) {
                    const layouts = await handleGetAllOperation.call(
                        context as unknown as IExecuteFunctions,
                        '/asset_layouts', 'asset_layouts',
                        { name: layoutNameParam },
                        false, 5,
                    );
                    if (layouts.length === 0) {
                        return JSON.stringify(wrapError(
                            'company_assets_by_layout', 'getByLayout', ERROR_TYPES.NO_RESULTS_FOUND,
                            `No asset layout found with exact name: "${layoutNameParam}".`,
                            "Layout name must be an EXACT case-sensitive match. Use hudu_get_id_by_name with resource_type='asset_layout' to find the correct name.",
                        ));
                    }
                    const layout = layouts[0] as IDataObject;
                    resolvedLayoutId = layout.id as number;
                    resolvedLayoutName = layout.name as string;
                }

                // Step 3: Fetch assets — must use /assets (not /companies/{id}/assets)
                // because the company-specific endpoint does not support asset_layout_id filter
                const assetFilters: IDataObject = {
                    company_id: resolvedCompanyId,
                    asset_layout_id: resolvedLayoutId,
                };
                if (search) assetFilters.search = search;
                if (!includeArchived) assetFilters.archived = false;

                const assets = await handleGetAllOperation.call(
                    context as unknown as IExecuteFunctions,
                    '/assets', 'assets',
                    assetFilters,
                    false,
                    limit,
                );

                // Step 4: Fetch layout for field label mapping
                const layoutData = await handleGetOperation.call(
                    context as unknown as IExecuteFunctions,
                    '/asset_layouts',
                    resolvedLayoutId,
                    'asset_layout',
                );
                const layoutObject = layoutData as IDataObject;
                if (!resolvedLayoutName) {
                    resolvedLayoutName = layoutObject.name as string | undefined;
                }

                const layoutFields = Array.isArray(layoutObject.fields)
                    ? (layoutObject.fields as IDataObject[])
                    : [];
                const fieldLabelMap = new Map<number, string>();
                for (const lf of layoutFields) {
                    fieldLabelMap.set(lf.id as number, lf.label as string);
                }

                // Transform assets: standard fields + labelled custom fields
                const transformedAssets = assets.map((asset) => {
                    const a = asset as IDataObject;
                    const out: IDataObject = {};
                    for (const field of STANDARD_ASSET_OUTPUT_FIELDS) {
                        if (a[field] !== undefined) out[field] = a[field];
                    }
                    const rawFields = Array.isArray(a.fields) ? (a.fields as IDataObject[]) : [];
                    const labelledFields: Record<string, unknown> = {};
                    for (const rf of rawFields) {
                        const fieldId = rf.asset_layout_field_id as number;
                        const label = fieldLabelMap.get(fieldId) ?? `field_${fieldId}`;
                        labelledFields[label] = rf.value;
                    }
                    out.fields = labelledFields;
                    return out;
                });

                const result: IDataObject = {
                    company_id: resolvedCompanyId,
                    company_name: resolvedCompanyName,
                    layout_id: resolvedLayoutId,
                    layout_name: resolvedLayoutName,
                    assets: transformedAssets,
                    count: transformedAssets.length,
                };
                if (transformedAssets.length >= limit) {
                    result.truncated = true;
                    result.note = `Results capped at ${limit}. Increase 'limit' (max 100) to retrieve more.`;
                }

                return JSON.stringify(wrapSuccess('company_assets_by_layout', 'getByLayout', result));
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                return JSON.stringify(wrapError(
                    'company_assets_by_layout', 'getByLayout', ERROR_TYPES.API_ERROR,
                    msg,
                    'Verify company and layout identifiers, then retry.',
                ));
            }
        },
    });
}
