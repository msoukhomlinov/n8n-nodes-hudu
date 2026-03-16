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

import { HUDU_RESOURCE_CONFIG, WRITE_OPERATIONS } from './ai-tools/resource-config';
import type { HuduOperation } from './ai-tools/resource-config';
import { executeHuduAiTool } from './ai-tools/tool-executor';
import { buildUnifiedDescription } from './ai-tools/description-builders';
import {
    getRuntimeSchemaBuilders,
} from './ai-tools/schema-generator';
import { RuntimeDynamicStructuredTool, runtimeZod } from './ai-tools/runtime';
import { wrapError, ERROR_TYPES } from './ai-tools/error-formatter';

const OPERATION_LABELS: Record<string, string> = {
    get: 'Get by ID',
    getAll: 'Get many (with filters)',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    archive: 'Archive',
    unarchive: 'Unarchive',
};

const runtimeSchemas = getRuntimeSchemaBuilders(runtimeZod);

const EXECUTE_METADATA_FIELDS = new Set([
    'resource',
    'operation',
    'tool',
    'toolName',
    'toolCallId',
    'sessionId',
    'action',
    'chatInput',
    'root', // n8n canvas root node UUID — must strip to prevent API param leakage
]);

function getDefaultOperation(operations: string[]): string {
    if (operations.includes('getAll')) {
        return 'getAll';
    }
    if (operations.includes('get')) {
        return 'get';
    }
    return operations[0] ?? '';
}

function parseToolResult(resultJson: string): IDataObject {
    try {
        return JSON.parse(resultJson) as IDataObject;
    } catch {
        return { error: resultJson };
    }
}

function stripExecuteMetadata(params: Record<string, unknown>): Record<string, unknown> {
    const cleanedParams: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
        if (!EXECUTE_METADATA_FIELDS.has(key)) {
            cleanedParams[key] = value;
        }
    }
    return cleanedParams;
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
        usableAsTool: true,
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
        const enabledOperations = operations.filter((op) => {
            const typedOp = op as HuduOperation;
            if (WRITE_OPERATIONS.includes(typedOp) && !allowWriteOperations) {
                return false;
            }
            return config.ops.includes(typedOp);
        });

        if (enabledOperations.length === 0) {
            throw new NodeOperationError(
                this.getNode(),
                'No tools to expose. Select operations and enable "Allow Write Operations" if you need mutating operations.',
            );
        }

        const getAllSchema = runtimeSchemas.buildUnifiedSchema(resource, ['getAll'], config);
        const supportsSearch = 'search' in getAllSchema.shape;
        const referenceUtc = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
        const unifiedSchema = runtimeSchemas.buildUnifiedSchema(resource, enabledOperations, config);
        const unifiedDescription = buildUnifiedDescription(
            resourceLabel,
            resource,
            enabledOperations,
            referenceUtc,
            supportsSearch,
            config,
        );

        const unifiedTool = new RuntimeDynamicStructuredTool({
            name: `hudu_${resource}`,
            description: unifiedDescription,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            schema: unifiedSchema as any,
            func: async (params: Record<string, unknown>) => {
                const operationFromArgs = params.operation;
                const operation = typeof operationFromArgs === 'string'
                    ? (operationFromArgs as HuduOperation)
                    : undefined;
                // Layer 2 write safety — re-check after schema parsing (defense-in-depth)
                if (operation && WRITE_OPERATIONS.includes(operation as HuduOperation) && !allowWriteOperations) {
                    return JSON.stringify(wrapError(
                        resource, operation, ERROR_TYPES.WRITE_OPERATION_BLOCKED,
                        'Write operations are disabled for this tool.',
                        'Enable allowWriteOperations on this node to use mutating operations.',
                    ));
                }
                if (!operation || !enabledOperations.includes(operation)) {
                    return JSON.stringify(wrapError(
                        resource, (operationFromArgs as string) ?? 'unknown',
                        ERROR_TYPES.INVALID_OPERATION,
                        'Missing or unsupported operation for this tool call.',
                        `Allowed operations: ${enabledOperations.join(', ')}.`,
                    ));
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { operation: _operation, ...operationParams } = params;
                return executeHuduAiTool(this, resource, operation, operationParams);
            },
        });

        return { response: unifiedTool };
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

            // Layer 2 write safety — execute() path
            if (requestedOp && WRITE_OPERATIONS.includes(requestedOp as HuduOperation) && !allowWriteOperations) {
                response.push({
                    json: parseToolResult(JSON.stringify(wrapError(
                        resource, requestedOp, ERROR_TYPES.WRITE_OPERATION_BLOCKED,
                        'Write operations are disabled.',
                        'Enable allowWriteOperations on this node to use mutating operations.',
                    ))),
                    pairedItem: { item: itemIndex },
                });
                continue;
            }

            // Prefer getAll over get as default when no operation is specified.
            const defaultOp = getDefaultOperation(effectiveOps);
            const effectiveOp = (requestedOp && effectiveOps.includes(requestedOp))
                ? requestedOp
                : defaultOp;

            try {
                // Exclude routing/metadata fields — passed as separate arguments, not API params.
                const params = stripExecuteMetadata(item.json as Record<string, unknown>);

                const resultJson = await executeHuduAiTool(
                    this as unknown as ISupplyDataFunctions,
                    resource,
                    effectiveOp,
                    params,
                );

                const parsed = parseToolResult(resultJson);

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
