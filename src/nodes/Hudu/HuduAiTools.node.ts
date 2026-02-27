import {
    NodeOperationError,
} from 'n8n-workflow';
import type {
    NodeConnectionType,
    IDataObject,
    IExecuteFunctions,
    ILoadOptionsFunctions,
    INodeType,
    INodeTypeDescription,
    INodePropertyOptions,
    INodeExecutionData,
    ISupplyDataFunctions,
    SupplyData,
} from 'n8n-workflow';
import { DynamicStructuredTool } from '@langchain/core/tools';
import type { z } from 'zod';

import { HUDU_RESOURCE_CONFIG, WRITE_OPERATIONS } from './ai-tools/resource-config';
import type { HuduOperation } from './ai-tools/resource-config';
import { normaliseToolInputSchema } from './ai-tools/schema-normalizer';
import { executeHuduAiTool } from './ai-tools/tool-executor';
import {
    buildGetDescription,
    buildGetAllDescription,
    buildCreateDescription,
    buildUpdateDescription,
    buildDeleteDescription,
    buildArchiveDescription,
} from './ai-tools/description-builders';
import {
    getGetSchema,
    getDeleteSchema,
    getDeleteWithCompanySchema,
    getArchiveSchema,
    getArchiveWithCompanySchema,
    getCompaniesGetAllSchema,
    getArticlesGetAllSchema,
    getAssetsGetAllSchema,
    getWebsitesGetAllSchema,
    getUsersGetAllSchema,
    getAssetPasswordsGetAllSchema,
    getProceduresGetAllSchema,
    getActivityLogsGetAllSchema,
    getFoldersGetAllSchema,
    getNetworksGetAllSchema,
    getIpAddressesGetAllSchema,
    getAssetLayoutsGetAllSchema,
    getRelationsGetAllSchema,
    getExpirationsGetAllSchema,
    getGroupsGetAllSchema,
    getVlansGetAllSchema,
    getVlanZonesGetAllSchema,
    getMatchersGetAllSchema,
    getCompaniesCreateSchema,
    getArticlesCreateSchema,
    getAssetsCreateSchema,
    getWebsitesCreateSchema,
    getAssetPasswordsCreateSchema,
    getProceduresCreateSchema,
    getFoldersCreateSchema,
    getNetworksCreateSchema,
    getIpAddressesCreateSchema,
    getRelationsCreateSchema,
    getVlansCreateSchema,
    getVlanZonesCreateSchema,
    getCompaniesUpdateSchema,
    getArticlesUpdateSchema,
    getAssetsUpdateSchema,
    getWebsitesUpdateSchema,
    getAssetPasswordsUpdateSchema,
    getProceduresUpdateSchema,
    getFoldersUpdateSchema,
    getNetworksUpdateSchema,
    getIpAddressesUpdateSchema,
    getExpirationsUpdateSchema,
    getVlansUpdateSchema,
    getVlanZonesUpdateSchema,
    getMatchersUpdateSchema,
} from './ai-tools/schema-generator';

// ---------------------------------------------------------------------------
// Build a toolkit class that the n8n AI Agent recognises.
//
// The agent checks `toolOrToolkit instanceof <ToolkitBase>` to decide whether
// to call .getTools() and flatten the tools array. We MUST extend the EXACT
// same constructor that the host process uses for this check, so instanceof passes.
//
// n8n version compatibility:
//   - n8n >= 2.9  exports StructuredToolkit from n8n-core — use that.
//   - Older n8n   uses Toolkit from @langchain/classic/agents — fall back to that.
//
// Community nodes share n8n-core's require VM context, so require() here
// resolves from n8n's module cache and returns the same cached class the agent holds.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let LangChainToolkitBase: new (...args: any[]) => { tools?: DynamicStructuredTool[]; getTools?(): DynamicStructuredTool[] };
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const nCore = require('n8n-core') as Record<string, unknown>;
    const StructuredToolkit = nCore['StructuredToolkit'];
    if (typeof StructuredToolkit !== 'function') throw new Error('StructuredToolkit not found in n8n-core');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LangChainToolkitBase = StructuredToolkit as any;
} catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    ({ Toolkit: LangChainToolkitBase } = require('@langchain/classic/agents') as {
        Toolkit: typeof LangChainToolkitBase;
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class HuduToolkit extends (LangChainToolkitBase as any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    declare tools: any[];
    constructor(toolList: DynamicStructuredTool[]) {
        super();
        this.tools = toolList;
    }
    getTools(): DynamicStructuredTool[] {
        return this.tools as DynamicStructuredTool[];
    }
}

const OPERATION_LABELS: Record<string, string> = {
    get: 'Get by ID',
    getAll: 'Get many (with filters)',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    archive: 'Archive',
    unarchive: 'Unarchive',
};

function getGetAllSchema(resource: string): z.ZodObject<z.ZodRawShape> {
    switch (resource) {
        case 'companies': return getCompaniesGetAllSchema();
        case 'articles': return getArticlesGetAllSchema();
        case 'assets': return getAssetsGetAllSchema();
        case 'websites': return getWebsitesGetAllSchema();
        case 'users': return getUsersGetAllSchema();
        case 'asset_passwords': return getAssetPasswordsGetAllSchema();
        case 'procedures': return getProceduresGetAllSchema();
        case 'activity_logs': return getActivityLogsGetAllSchema();
        case 'folders': return getFoldersGetAllSchema();
        case 'networks': return getNetworksGetAllSchema();
        case 'ip_addresses': return getIpAddressesGetAllSchema();
        case 'asset_layouts': return getAssetLayoutsGetAllSchema();
        case 'relations': return getRelationsGetAllSchema();
        case 'expirations': return getExpirationsGetAllSchema();
        case 'groups': return getGroupsGetAllSchema();
        case 'vlans': return getVlansGetAllSchema();
        case 'vlan_zones': return getVlanZonesGetAllSchema();
        case 'matchers': return getMatchersGetAllSchema();
        default: return getAssetLayoutsGetAllSchema(); // fallback: name + limit
    }
}

function getCreateSchema(resource: string): z.ZodObject<z.ZodRawShape> {
    switch (resource) {
        case 'companies': return getCompaniesCreateSchema();
        case 'articles': return getArticlesCreateSchema();
        case 'assets': return getAssetsCreateSchema();
        case 'websites': return getWebsitesCreateSchema();
        case 'asset_passwords': return getAssetPasswordsCreateSchema();
        case 'procedures': return getProceduresCreateSchema();
        case 'folders': return getFoldersCreateSchema();
        case 'networks': return getNetworksCreateSchema();
        case 'ip_addresses': return getIpAddressesCreateSchema();
        case 'relations': return getRelationsCreateSchema();
        case 'vlans': return getVlansCreateSchema();
        case 'vlan_zones': return getVlanZonesCreateSchema();
        default: return getCompaniesCreateSchema();
    }
}

function getUpdateSchema(resource: string): z.ZodObject<z.ZodRawShape> {
    switch (resource) {
        case 'companies': return getCompaniesUpdateSchema();
        case 'articles': return getArticlesUpdateSchema();
        case 'assets': return getAssetsUpdateSchema();
        case 'websites': return getWebsitesUpdateSchema();
        case 'asset_passwords': return getAssetPasswordsUpdateSchema();
        case 'procedures': return getProceduresUpdateSchema();
        case 'folders': return getFoldersUpdateSchema();
        case 'networks': return getNetworksUpdateSchema();
        case 'ip_addresses': return getIpAddressesUpdateSchema();
        case 'expirations': return getExpirationsUpdateSchema();
        case 'vlans': return getVlansUpdateSchema();
        case 'vlan_zones': return getVlanZonesUpdateSchema();
        case 'matchers': return getMatchersUpdateSchema();
        default: return getCompaniesUpdateSchema();
    }
}

function getRequiredFields(resource: string): string[] {
    const required: Record<string, string[]> = {
        companies: ['name'],
        articles: ['name'],
        assets: ['company_id', 'asset_layout_id', 'name'],
        websites: ['name', 'company_id'],
        asset_passwords: ['name', 'company_id', 'password'],
        procedures: ['name'],
        folders: ['name'],
        networks: ['name', 'company_id', 'address'],
        ip_addresses: ['address', 'status', 'company_id'],
        relations: ['froable_id', 'froable_type', 'toable_id', 'toable_type'],
        expirations: ['resource_id', 'resource_type', 'expiration_date'],
        vlans: ['name', 'company_id'],
        vlan_zones: ['name', 'vlan_id_ranges'],
    };
    return required[resource] ?? [];
}

// ---------------------------------------------------------------------------
// Node class
// ---------------------------------------------------------------------------

export class HuduAiTools implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Hudu AI Tools',
        name: 'huduAiTools',
        icon: 'file:hudu.svg',
        group: ['output'],
        version: 1,
        description: 'Expose Hudu operations as individual AI tools for the AI Agent',
        defaults: {
            name: 'Hudu AI Tools',
        },
        inputs: [],
        outputs: [{ type: 'ai_tool' as NodeConnectionType, displayName: 'Tools' }],
        credentials: [{ name: 'huduApi', required: true }],
        properties: [
            {
                displayName: 'Resource Name or ID',
                name: 'resource',
                type: 'options',
                required: true,
                noDataExpression: true,
                typeOptions: { loadOptionsMethod: 'getToolResources' },
                default: '',
                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            },
            {
                displayName: 'Operations Names or IDs',
                name: 'operations',
                type: 'multiOptions',
                required: true,
                typeOptions: {
                    loadOptionsMethod: 'getToolResourceOperations',
                    loadOptionsDependsOn: ['resource', 'allowWriteOperations'],
                },
                default: [],
                description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            },
            {
                displayName: 'Allow Write Operations',
                name: 'allowWriteOperations',
                type: 'boolean',
                default: false,
                description: 'Whether to enable mutating tools (create, update, delete, archive, unarchive). Disabled = read-only.',
            },
        ],
    };

    methods = {
        loadOptions: {
            getToolResources,
            getToolResourceOperations,
        },
    };

    async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
        const resource = this.getNodeParameter('resource', itemIndex) as string;
        const operations = this.getNodeParameter('operations', itemIndex) as string[];
        const allowWriteOperations = this.getNodeParameter('allowWriteOperations', itemIndex, false) as boolean;

        if (!resource) {
            throw new NodeOperationError(this.getNode(), 'Resource is required');
        }
        if (!operations?.length) {
            throw new NodeOperationError(this.getNode(), 'At least one operation must be selected');
        }

        const config = HUDU_RESOURCE_CONFIG[resource];
        if (!config) {
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        const resourceLabel = config.label;
        const tools: DynamicStructuredTool[] = [];
        const supplyDataContext = this;

        const referenceUtc = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

        for (const operation of operations) {
            const typedOp = operation as HuduOperation;

            if (WRITE_OPERATIONS.includes(typedOp) && !allowWriteOperations) {
                continue;
            }

            if (!config.ops.includes(typedOp)) {
                continue;
            }

            const toolSuffix = operation === 'get' ? 'getById' : operation;
            const toolName = `hudu_${resource}_${toolSuffix}`;
            let schema: z.ZodObject<z.ZodRawShape>;
            let description: string;

            switch (operation) {
                case 'get':
                    schema = getGetSchema();
                    description = buildGetDescription(resourceLabel, resource);
                    break;

                case 'getAll': {
                    schema = getGetAllSchema(resource);
                    const supportsSearch = 'search' in schema.shape;
                    description = buildGetAllDescription(resourceLabel, resource, referenceUtc, supportsSearch);
                    break;
                }

                case 'create':
                    schema = getCreateSchema(resource);
                    description = buildCreateDescription(resourceLabel, resource, getRequiredFields(resource), referenceUtc);
                    break;

                case 'update':
                    schema = getUpdateSchema(resource);
                    description = buildUpdateDescription(resourceLabel, resource);
                    break;

                case 'delete':
                    schema = config.requiresCompanyEndpoint ? getDeleteWithCompanySchema() : getDeleteSchema();
                    description = buildDeleteDescription(resourceLabel);
                    break;

                case 'archive':
                case 'unarchive':
                    schema = config.requiresCompanyEndpoint ? getArchiveWithCompanySchema() : getArchiveSchema();
                    description = buildArchiveDescription(resourceLabel, operation);
                    break;

                default:
                    continue;
            }

            const tool = new DynamicStructuredTool({
                name: toolName,
                description,
                schema: normaliseToolInputSchema(schema),
                func: async (params: Record<string, unknown>) => {
                    return executeHuduAiTool(
                        supplyDataContext,
                        resource,
                        operation,
                        params,
                    );
                },
            });
            tools.push(tool as any);
        }

        if (tools.length === 0) {
            throw new NodeOperationError(
                this.getNode(),
                'No tools to expose. Select operations and enable "Allow Write Operations" if you need mutating operations.',
            );
        }

        const toolkit = new HuduToolkit(tools);
        return { response: toolkit };
    }

    /**
     * execute() is required so that n8n 2.8+ does not fall through to the
     * declarative RoutingNode test path. When an AI Agent invokes a tool, the
     * call goes through supplyData — execute() is only called on direct "Test step".
     */
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const resource = this.getNodeParameter('resource', 0) as string;
        const operations = this.getNodeParameter('operations', 0) as string[];
        const allowWriteOperations = this.getNodeParameter('allowWriteOperations', 0, false) as boolean;

        if (!resource || !operations?.length) {
            throw new NodeOperationError(
                this.getNode(),
                'Resource and at least one operation must be configured.',
            );
        }

        const config = HUDU_RESOURCE_CONFIG[resource];
        if (!config) {
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        const effectiveOps = operations.filter(
            (op) => !WRITE_OPERATIONS.includes(op as HuduOperation) || allowWriteOperations,
        );

        if (effectiveOps.length === 0) {
            throw new NodeOperationError(
                this.getNode(),
                'No permitted operations. Enable "Allow Write Operations" if needed.',
            );
        }

        const items = this.getInputData();
        const response: INodeExecutionData[] = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const item = items[itemIndex];
            if (!item) continue;

            const requestedOp = item.json.operation as string | undefined;
            // When an AI agent calls execute() (e.g. via Test Step), the tool name is passed
            // in item.json.tool (e.g. "hudu_companies_update"). Extract the operation suffix
            // so the correct operation is used rather than defaulting to getAll.
            const toolNameOp = (() => {
                const toolField = item.json.tool as string | undefined;
                if (!toolField) return undefined;
                // Tool name format: "hudu_{resource}_{operation}" — take the last segment.
                // "getById" is the display suffix for the "get" operation.
                const parts = toolField.split('_');
                const raw = parts[parts.length - 1];
                const candidate = raw === 'getById' ? 'get' : raw;
                return (candidate && effectiveOps.includes(candidate)) ? candidate : undefined;
            })();
            // Prefer getAll over get as default when no operation is specified —
            // avoids routing to 'get' (which requires an id) when both are configured.
            const defaultOp = effectiveOps.includes('getAll') ? 'getAll'
                : effectiveOps.includes('get') ? 'get'
                : effectiveOps[0] ?? '';
            const effectiveOp = (requestedOp && effectiveOps.includes(requestedOp))
                ? requestedOp
                : (toolNameOp ?? defaultOp);

            try {
                // Exclude routing/metadata fields — passed as separate arguments, not API params.
                const { resource: _r, operation: _o, tool: _t, toolName: _tn, toolCallId: _tc,
                    sessionId: _s, action: _a, chatInput: _ci, ...inputFields } = item.json as Record<string, unknown>;
                const params: Record<string, unknown> = { ...inputFields };

                const resultJson = await executeHuduAiTool(
                    this as unknown as ISupplyDataFunctions,
                    resource,
                    effectiveOp,
                    params,
                );

                let parsed: IDataObject;
                try {
                    parsed = JSON.parse(resultJson);
                } catch {
                    parsed = { error: resultJson };
                }

                response.push({
                    json: parsed,
                    pairedItem: { item: itemIndex },
                });
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                throw new NodeOperationError(this.getNode(), msg, { itemIndex });
            }
        }

        return [response];
    }
}

// ---------------------------------------------------------------------------
// loadOptions handlers
// ---------------------------------------------------------------------------

async function getToolResources(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const options: INodePropertyOptions[] = [];
    for (const [value, config] of Object.entries(HUDU_RESOURCE_CONFIG)) {
        options.push({
            name: config.label,
            value,
            description: `${config.label} resource`,
        });
    }
    return options.sort((a, b) => a.name.localeCompare(b.name));
}

async function getToolResourceOperations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const resource = this.getCurrentNodeParameter('resource') as string;
    const allowWriteOperations = (this.getCurrentNodeParameter('allowWriteOperations') ?? false) as boolean;

    if (!resource) return [];

    const config = HUDU_RESOURCE_CONFIG[resource];
    if (!config) return [];

    const options: INodePropertyOptions[] = [];
    for (const op of config.ops) {
        if (WRITE_OPERATIONS.includes(op) && !allowWriteOperations) continue;
        options.push({
            name: OPERATION_LABELS[op] ?? op,
            value: op,
            description: `${op} operation for ${config.label}`,
        });
    }
    return options;
}
