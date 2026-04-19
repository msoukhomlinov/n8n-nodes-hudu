// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import type { DynamicStructuredTool } from '@langchain/core/tools';
import type { z as ZodNamespace } from 'zod';

type DynamicStructuredToolCtor = new (fields: {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  func: (params: Record<string, unknown>) => Promise<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}) => DynamicStructuredTool;

export type RuntimeZod = typeof ZodNamespace;
type RuntimeRequire = { (moduleId: string): unknown; resolve(id: string): string };

/**
 * Anchor candidates — packages in n8n's dependency tree that can serve as
 * a createRequire() anchor to resolve @langchain/core and zod from n8n's
 * module tree (not this package's bundled copies).
 */
const ANCHOR_CANDIDATES = ['@langchain/classic/agents', 'langchain/agents'] as const;

function getRuntimeRequire(): { runtimeReq: RuntimeRequire | null; diagnostic: string | null } {
  // eslint-disable-next-line @n8n/community-nodes/no-restricted-imports, @typescript-eslint/no-require-imports
  const { createRequire } = require('module') as {
    createRequire: (filename: string) => RuntimeRequire;
  };

  // Try require.main first (prevents devDep shadowing during npm link)
  const tried: string[] = [];
  try {
    const req = createRequire(require.main?.filename ?? __filename);
    req.resolve('@langchain/classic/agents');
    return { runtimeReq: req, diagnostic: 'resolved via require.main' };
  } catch (e) {
    tried.push(`require.main: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Fall back to ANCHOR_CANDIDATES
  for (const anchor of ANCHOR_CANDIDATES) {
    try {
      const anchorPath = require.resolve(anchor) as string;
      return { runtimeReq: createRequire(anchorPath), diagnostic: `resolved via anchor: ${anchor}` };
    } catch (e) {
      tried.push(`${anchor}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // All candidates failed — return null so the node can still register,
  // but record a diagnostic for Proxy error messages.
  const diagnostic =
    `[HuduAiTools] No runtime anchor found. Tried: ${ANCHOR_CANDIDATES.join(', ')}. ` +
    `Errors: ${tried.join(' | ')}`;
  return { runtimeReq: null, diagnostic };
}

const { runtimeReq, diagnostic } = getRuntimeRequire();

// Resolve zod SEPARATELY via require.main to get the top-level zod instance
// that n8n's normalizeToolSchema uses for `instanceof ZodType` checks.
// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports, @typescript-eslint/no-require-imports
const { createRequire: _createRequire } = require('module') as {
  createRequire: (filename: string) => RuntimeRequire;
};
let _topLevelZodReq: RuntimeRequire | null = null;
try {
  _topLevelZodReq = _createRequire(require.main?.filename ?? __filename);
} catch (_) {}

// Wrap module-level resolutions so a missing package produces a clear error at
// execution time (via NodeOperationError in supplyData) rather than a cryptic
// module-load crash that prevents node registration entirely.
let _RuntimeDynamicStructuredTool: DynamicStructuredToolCtor | undefined;
let _runtimeZod: RuntimeZod | undefined;
let langchainLoadError: string | null = null;
let zodLoadError: string | null = null;

if (runtimeReq) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coreTools = runtimeReq('@langchain/core/tools') as Record<string, any>;
    _RuntimeDynamicStructuredTool = coreTools['DynamicStructuredTool'] as DynamicStructuredToolCtor;
  } catch (e) {
    langchainLoadError = e instanceof Error ? e.message : String(e);
  }
}

// Resolve zod via require.main first (top-level copy used by n8n's instanceof check).
// Fall back to the anchor runtimeReq only if require.main is unavailable.
if (_topLevelZodReq) {
  try {
    _runtimeZod = _topLevelZodReq('zod') as RuntimeZod;
  } catch (_) {}
}
if (!_runtimeZod && runtimeReq) {
  try {
    _runtimeZod = runtimeReq('zod') as RuntimeZod;
  } catch (e) {
    zodLoadError = e instanceof Error ? e.message : String(e);
  }
}

// IMPORTANT: Proxy target MUST be `function () {}`, not `{}`.
// ECMAScript spec §10.5.13: a Proxy only has [[Construct]] if its target does.
// Plain objects lack [[Construct]], so `new Proxy({}, ...)` throws
// "is not a constructor" before the construct trap fires.
export const RuntimeDynamicStructuredTool: DynamicStructuredToolCtor = new Proxy(
  function () {} as unknown as DynamicStructuredToolCtor,
  {
    construct(_target, args) {
      if (!_RuntimeDynamicStructuredTool) {
        throw new Error(
          'RuntimeDynamicStructuredTool: @langchain/core/tools could not be resolved from n8n\'s module tree. ' +
          'Ensure @langchain/core is installed in the n8n environment.' +
          (diagnostic ? ` Diagnostic: ${diagnostic}` : '') +
          (langchainLoadError ? ` Load error: ${langchainLoadError}` : ''),
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new (_RuntimeDynamicStructuredTool as any)(...args) as object;
    },
    get(_target, prop) {
      if (_RuntimeDynamicStructuredTool) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (_RuntimeDynamicStructuredTool as any)[prop];
      }
      return undefined;
    },
  },
) as DynamicStructuredToolCtor;

export const runtimeZod: RuntimeZod = new Proxy({} as RuntimeZod, {
  get(_target, prop) {
    if (!_runtimeZod) {
      throw new Error(
        `runtimeZod: zod could not be resolved from n8n's module tree (accessing .${String(prop)}). ` +
        'Ensure zod is installed in the n8n environment.' +
        (diagnostic ? ` Diagnostic: ${diagnostic}` : '') +
        (zodLoadError ? ` Load error: ${zodLoadError}` : ''),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_runtimeZod as any)[prop];
  },
});

let _logWrapper: ((tool: unknown, context: unknown) => unknown) | undefined;
let _logWrapperResolved = false;

export function getLazyLogWrapper(): ((tool: unknown, context: unknown) => unknown) | undefined {
  if (_logWrapperResolved) return _logWrapper;
  _logWrapperResolved = true;
  try {
    if (runtimeReq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiUtilities = runtimeReq('@n8n/ai-utilities') as Record<string, any> | undefined;
      _logWrapper = aiUtilities?.logWrapper ?? aiUtilities?.default?.logWrapper;
    }
  } catch (_) {
    // best-effort — not available in all n8n versions
  }
  return _logWrapper;
}
