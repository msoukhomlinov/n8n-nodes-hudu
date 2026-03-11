import type { DynamicStructuredTool } from '@langchain/core/tools';
import type { z as ZodNamespace } from 'zod';

type ToolkitBaseCtor = new (...args: any[]) => { tools?: DynamicStructuredTool[]; getTools?(): DynamicStructuredTool[] };

type DynamicStructuredToolCtor = new (fields: {
    name: string;
    description: string;
    schema: any;
    func: (params: Record<string, unknown>) => Promise<string>;
}) => DynamicStructuredTool;

export type RuntimeZod = typeof ZodNamespace;

function getRuntimeRequire(): any {
    // Resolve from n8n runtime's tree to avoid class identity mismatch.
    try {
        const classicAgentsPath = require.resolve('@langchain/classic/agents');
        const { createRequire } = require('module') as { createRequire: (filename: string) => NodeRequire };
        return createRequire(classicAgentsPath);
    } catch {
        // Fallback for local dev/build contexts where only package-local deps exist.
        return require;
    }
}

const runtimeRequire = getRuntimeRequire();

const coreTools = runtimeRequire('@langchain/core/tools') as Record<string, any>;
export const RuntimeDynamicStructuredTool = coreTools['DynamicStructuredTool'] as DynamicStructuredToolCtor;

export const runtimeZod = runtimeRequire('zod') as RuntimeZod;

let runtimeCore = {} as Record<string, any>;
let runtimeClassic = {} as Record<string, any>;
try {
    runtimeCore = runtimeRequire('n8n-core') as Record<string, any>;
} catch {}
try {
    runtimeClassic = runtimeRequire('@langchain/classic/agents') as Record<string, any>;
} catch {}

export const RuntimeToolkitBase = (
    typeof runtimeCore['StructuredToolkit'] === 'function'
        ? runtimeCore['StructuredToolkit']
        : typeof runtimeClassic['Toolkit'] === 'function'
            ? runtimeClassic['Toolkit']
            : class FallbackToolkit {
                tools: DynamicStructuredTool[] = [];
                getTools() {
                    return this.tools;
                }
            }
) as ToolkitBaseCtor;

