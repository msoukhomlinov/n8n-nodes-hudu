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
 * n8n has THREE distinct module resolution trees that do NOT share instances:
 *
 * Tree 1 — n8n/node_modules/          : top-level (canonical zod, @n8n/ai-utilities)
 * Tree 2 — @langchain/classic/node_modules/ : DynamicStructuredTool, @langchain/core
 * Tree 3 — @n8n/n8n-nodes-langchain/node_modules/ : separate @langchain/core copy
 *
 * Getting the tree wrong causes silent instanceof failures:
 *   - DynamicStructuredTool → must come from Tree 2 (@langchain/classic anchor)
 *   - zod             → must come from Tree 1 (require.main → top-level node_modules)
 *   - logWrapper      → must come from Tree 1 (@n8n/ai-utilities via runtimeReq)
 *
 * getRuntimeRequire() resolves via require.main first (prevents devDep shadowing during
 * npm link), then falls back to ANCHOR_CANDIDATES.
 * _topLevelZodReq is resolved separately via createRequire(require.main) to ensure
 * n8n's normalizeToolSchema instanceof ZodType check uses the same zod copy.
 *
 * Under pnpm-strict-isolated n8n installs (v2.29.x+), this package lives outside n8n's
 * own node_modules tree (e.g. ~/.n8n/nodes/), so NEITHER require.main NOR
 * ANCHOR_CANDIDATES can resolve into Tree 2 at all — @langchain/classic/core are only
 * reachable from inside @n8n/n8n-nodes-langchain's isolated pnpm subtree, which no
 * filesystem-based require.resolve() from here can walk into. findCachedExports() below
 * is the fallback: n8n must load @langchain/core/tools itself (for its own Agent/MCP
 * Trigger nodes) before ever calling supplyData() on a connected tool, so by execution
 * time the module is already in Node's process-global require.cache — scanning for it
 * there works regardless of install layout and returns the exact same class identity.
 */

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

/**
 * Scans Node's process-global module cache (shared across every node_modules tree in
 * this process, regardless of who loaded what) for an already-loaded module whose
 * resolved path matches `pathPattern`, returning the first match whose exports satisfy
 * `validate`. Must be called lazily (not at module load) — n8n requires node files for
 * registration before any workflow runs, i.e. before langchain is loaded into cache.
 */
function findCachedExports<T>(
  pathPattern: RegExp,
  validate: (exports: Record<string, unknown>) => T | undefined,
): T | undefined {
  try {
    // eslint-disable-next-line @n8n/community-nodes/no-restricted-imports, @typescript-eslint/no-require-imports
    const Module = require('module') as { _cache?: Record<string, { exports: unknown }> };
    const cache = Module._cache;
    if (!cache) return undefined;
    for (const key of Object.keys(cache)) {
      if (!pathPattern.test(key)) continue;
      const result = validate(cache[key].exports as Record<string, unknown>);
      if (result !== undefined) return result;
    }
  } catch (_) {
    // best-effort — require.cache introspection is not guaranteed across Node versions
  }
  return undefined;
}

const { runtimeReq, diagnostic } = getRuntimeRequire();
let langchainResolutionDiagnostic = diagnostic;

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

function resolveDynamicStructuredTool(): DynamicStructuredToolCtor | undefined {
  if (_RuntimeDynamicStructuredTool) return _RuntimeDynamicStructuredTool;

  if (runtimeReq) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coreTools = runtimeReq('@langchain/core/tools') as Record<string, any>;
      if (typeof coreTools?.['DynamicStructuredTool'] === 'function') {
        _RuntimeDynamicStructuredTool = coreTools['DynamicStructuredTool'] as DynamicStructuredToolCtor;
        return _RuntimeDynamicStructuredTool;
      }
    } catch (e) {
      langchainLoadError = e instanceof Error ? e.message : String(e);
    }
  }

  // Fallback for pnpm-isolated installs where no filesystem anchor reaches Tree 2 at all:
  // @langchain/core/tools is loaded by n8n's own Agent/MCP Trigger machinery before our
  // supplyData() ever runs, so grab it straight out of require.cache once it's resident.
  const cached = findCachedExports(/[\\/]@langchain[\\/]core[\\/]/, (exports) =>
    typeof exports['DynamicStructuredTool'] === 'function'
      ? (exports['DynamicStructuredTool'] as DynamicStructuredToolCtor)
      : undefined,
  );
  if (cached) {
    _RuntimeDynamicStructuredTool = cached;
    langchainLoadError = null;
    langchainResolutionDiagnostic = 'resolved via require.cache scan (pnpm-isolated install)';
  }
  return _RuntimeDynamicStructuredTool;
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
      const ctor = resolveDynamicStructuredTool();
      if (!ctor) {
        throw new Error(
          'RuntimeDynamicStructuredTool: @langchain/core/tools could not be resolved from n8n\'s module tree. ' +
          'Ensure @langchain/core is installed in the n8n environment.' +
          (langchainResolutionDiagnostic ? ` Diagnostic: ${langchainResolutionDiagnostic}` : '') +
          (langchainLoadError ? ` Load error: ${langchainLoadError}` : ''),
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new (ctor as any)(...args) as object;
    },
    get(_target, prop) {
      const ctor = resolveDynamicStructuredTool();
      if (ctor) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (ctor as any)[prop];
      }
      return undefined;
    },
  },
) as DynamicStructuredToolCtor;

export const runtimeZod: RuntimeZod = new Proxy({} as RuntimeZod, {
  get(_target, prop) {
    // Guard: frameworks probe Symbol.toPrimitive, Symbol.toStringTag, .then (Promise thenable),
    // and .constructor. Throwing on these causes misleading errors during structural inspection.
    if (typeof prop === 'symbol' || prop === 'then' || prop === 'constructor') return undefined;
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

  if (!_logWrapper) {
    // Same pnpm-isolation fallback as resolveDynamicStructuredTool() above.
    _logWrapper = findCachedExports(/[\\/]@n8n[\\/]ai-utilities[\\/]/, (exports) => {
      const fn = exports['logWrapper'] ?? (exports['default'] as Record<string, unknown> | undefined)?.['logWrapper'];
      return typeof fn === 'function' ? (fn as (tool: unknown, context: unknown) => unknown) : undefined;
    });
  }

  return _logWrapper;
}
