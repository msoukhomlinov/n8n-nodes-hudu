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
 * Tree 1 — n8n/node_modules/                       : top-level (canonical zod, @n8n/ai-utilities)
 * Tree 2 — @langchain/classic/node_modules/        : DynamicStructuredTool, @langchain/core
 * Tree 3 — @n8n/n8n-nodes-langchain/node_modules/  : separate @langchain/core copy
 *
 * A wrong-tree copy of `zod` causes a SILENT failure: n8n's normalizeToolSchema does
 * `tool.schema instanceof ZodType`; a foreign ZodType class identity fails that check,
 * the schema degrades to raw JSON Schema, and tools surface as "object schema missing
 * properties" with no error in the logs. So the copy we hand n8n must be n8n's own.
 *
 * Resolution order (symmetric for zod and DynamicStructuredTool):
 *   1. require.main anchor — createRequire(require.main.filename). Guarded: if
 *      require.main is undefined (ESM-launched n8n, queue-mode / worker_threads) we do
 *      NOT fall back to __filename, because that self-resolves our OWN bundled copy —
 *      exactly the wrong-identity copy we are trying to avoid.
 *   2. filesystem anchor (@langchain/classic) — for DynamicStructuredTool on hoisted
 *      npm installs where require.resolve can walk into Tree 2.
 *   3. requireFromCachedTree — positive anchor for pnpm-strict-isolated installs
 *      (n8n v2.29.x+) where this package lives outside n8n's node_modules and no
 *      filesystem require.resolve() from here can reach Tree 2/3. It finds an
 *      already-cached module belonging to an n8n-OWNED package (which community nodes
 *      never bundle) and createRequire()s the dependency from THAT module — tying the
 *      resolved copy to n8n's real dependency graph by package identity, independent of
 *      require.cache order and of pnpm's flat virtual-store realpaths.
 *
 * If none of these resolve, we fail CLEAN: the Proxy throws a diagnostic error rather
 * than guessing another community node's bundled copy (which was the residual
 * correctness gap of the old blind require.cache path-scan).
 */

/** Our own package name — used only as a belt-and-braces self-exclusion, never as the
 * primary identity guard (the anchor-package identity is the guard). */
const OWN_PACKAGE_NAME = 'n8n-nodes-hudu';

/** Filesystem anchor candidates for DynamicStructuredTool on hoisted installs. */
const ANCHOR_CANDIDATES = ['@langchain/classic/agents', 'langchain/agents'] as const;

/**
 * n8n-owned packages to anchor DynamicStructuredTool resolution against, in order.
 * @n8n/n8n-nodes-langchain is first: it runs normalizeToolSchema's instanceof checks
 * and is always resident in require.cache by the time supplyData() executes.
 */
const LANGCHAIN_TREE_PATTERNS = ['@n8n/n8n-nodes-langchain', '@langchain/classic'] as const;

/**
 * n8n-owned packages to anchor zod (and logWrapper) resolution against, in order.
 * @n8n/n8n-nodes-langchain first (same reasoning), then n8n-workflow, then n8n-core —
 * all guaranteed to resolve the SAME top-level zod n8n's instanceof ZodType uses.
 */
const ZOD_TREE_PATTERNS = ['@n8n/n8n-nodes-langchain', 'n8n-workflow', 'n8n-core'] as const;

// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports, @typescript-eslint/no-require-imports
const { createRequire } = require('module') as {
  createRequire: (filename: string) => RuntimeRequire;
};

/** Build a cross-platform require.cache-key matcher for a package name. */
function packageKeyPattern(pkg: string): RegExp {
  const parts = pkg.split('/').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`[\\\\/]${parts.join('[\\\\/]')}[\\\\/]`);
}

/**
 * Positive-anchor resolver. Finds an already-cached module whose path belongs to one of
 * `patterns` (n8n-owned packages), then createRequire()s `id` from that module's
 * location. Patterns are tried in order; the first cached anchor that resolves `id`
 * wins. Returns undefined if none resolve it — the caller then fails clean.
 *
 * Must be called lazily (not at module load): n8n registers node files before any
 * workflow runs, i.e. before its langchain nodes are loaded into require.cache.
 */
function requireFromCachedTree(patterns: readonly string[], id: string): unknown {
  const cache = require.cache;
  if (!cache) return undefined;
  const keys = Object.keys(cache);
  for (const pkg of patterns) {
    const anchorPattern = packageKeyPattern(pkg);
    for (const key of keys) {
      // Belt-and-braces only: never anchor from our own package's cached files.
      if (key.includes(OWN_PACKAGE_NAME)) continue;
      if (!anchorPattern.test(key)) continue;
      try {
        const anchorReq = createRequire(key);
        const resolved = anchorReq(id);
        if (resolved) return resolved;
      } catch (_) {
        // This cached module can't reach `id`; try the next cached key / pattern.
      }
    }
  }
  return undefined;
}

/**
 * createRequire bound to require.main. Returns null when require.main is undefined
 * (ESM-launched n8n, queue-mode / worker_threads). Deliberately NO __filename fallback.
 */
function getMainRequire(): RuntimeRequire | null {
  const mainFile = require.main?.filename;
  if (!mainFile) return null;
  try {
    return createRequire(mainFile);
  } catch (_) {
    return null;
  }
}

/** Filesystem anchor probe for hoisted npm installs (DynamicStructuredTool). */
function getFilesystemAnchorRequire(): { runtimeReq: RuntimeRequire | null; diagnostic: string | null } {
  const tried: string[] = [];
  for (const anchor of ANCHOR_CANDIDATES) {
    try {
      const anchorPath = require.resolve(anchor) as string;
      return {
        runtimeReq: createRequire(anchorPath),
        diagnostic: `resolved via filesystem anchor: ${anchor}`,
      };
    } catch (e) {
      tried.push(`${anchor}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return {
    runtimeReq: null,
    diagnostic:
      `[HuduAiTools] No filesystem anchor. Tried: ${ANCHOR_CANDIDATES.join(', ')}. ` +
      `Errors: ${tried.join(' | ')}`,
  };
}

const _mainReq = getMainRequire();
const { runtimeReq: _filesystemAnchorReq, diagnostic: _anchorDiagnostic } =
  getFilesystemAnchorRequire();

// Memoized resolutions + last-attempt diagnostics for Proxy error messages.
let _RuntimeDynamicStructuredTool: DynamicStructuredToolCtor | undefined;
let _runtimeZod: RuntimeZod | undefined;
let langchainResolutionDiagnostic: string | null = _anchorDiagnostic;
let zodResolutionDiagnostic: string | null = null;
let langchainLoadError: string | null = null;
let zodLoadError: string | null = null;

function extractDynamicStructuredTool(mod: unknown): DynamicStructuredToolCtor | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec = mod as Record<string, any> | undefined;
  return typeof rec?.['DynamicStructuredTool'] === 'function'
    ? (rec['DynamicStructuredTool'] as DynamicStructuredToolCtor)
    : undefined;
}

function isZodNamespace(mod: unknown): mod is RuntimeZod {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec = mod as Record<string, any> | undefined;
  // n8n's normalizeToolSchema does `instanceof ZodType`, so ZodType must be present;
  // `object` is the factory our schema-generator calls. Shape-check, not identity —
  // identity correctness comes from anchoring to an n8n-owned tree.
  return typeof rec?.['ZodType'] === 'function' && typeof rec?.['object'] === 'function';
}

function resolveDynamicStructuredTool(): DynamicStructuredToolCtor | undefined {
  if (_RuntimeDynamicStructuredTool) return _RuntimeDynamicStructuredTool;

  // 1. require.main anchor.
  if (_mainReq) {
    try {
      const ctor = extractDynamicStructuredTool(_mainReq('@langchain/core/tools'));
      if (ctor) {
        _RuntimeDynamicStructuredTool = ctor;
        langchainLoadError = null;
        langchainResolutionDiagnostic = 'resolved via require.main';
        return ctor;
      }
    } catch (e) {
      langchainLoadError = e instanceof Error ? e.message : String(e);
    }
  }

  // 2. filesystem anchor (@langchain/classic) — hoisted npm installs.
  if (_filesystemAnchorReq) {
    try {
      const ctor = extractDynamicStructuredTool(_filesystemAnchorReq('@langchain/core/tools'));
      if (ctor) {
        _RuntimeDynamicStructuredTool = ctor;
        langchainLoadError = null;
        langchainResolutionDiagnostic = _anchorDiagnostic ?? 'resolved via filesystem anchor';
        return ctor;
      }
    } catch (e) {
      langchainLoadError = e instanceof Error ? e.message : String(e);
    }
  }

  // 3. positive n8n-owned-tree anchor — pnpm-strict-isolated installs.
  try {
    const ctor = extractDynamicStructuredTool(
      requireFromCachedTree(LANGCHAIN_TREE_PATTERNS, '@langchain/core/tools'),
    );
    if (ctor) {
      _RuntimeDynamicStructuredTool = ctor;
      langchainLoadError = null;
      langchainResolutionDiagnostic = 'resolved via n8n-owned-tree anchor (pnpm-isolated install)';
      return ctor;
    }
  } catch (e) {
    langchainLoadError = e instanceof Error ? e.message : String(e);
  }

  // Fail clean — Proxy throws with the diagnostics above.
  return undefined;
}

function resolveRuntimeZod(): RuntimeZod | undefined {
  if (_runtimeZod) return _runtimeZod;

  // 1. require.main anchor, path-checked so we never accept our OWN bundled zod
  //    (wrong ZodType identity for n8n's instanceof ZodType).
  if (_mainReq) {
    try {
      const zodPath = _mainReq.resolve('zod');
      if (!zodPath.includes(OWN_PACKAGE_NAME)) {
        const mod = _mainReq('zod');
        if (isZodNamespace(mod)) {
          _runtimeZod = mod;
          zodLoadError = null;
          zodResolutionDiagnostic = 'resolved via require.main';
          return mod;
        }
      }
    } catch (e) {
      zodLoadError = e instanceof Error ? e.message : String(e);
    }
  }

  // 2. positive n8n-owned-tree anchor — pnpm-strict-isolated installs.
  try {
    const mod = requireFromCachedTree(ZOD_TREE_PATTERNS, 'zod');
    if (isZodNamespace(mod)) {
      _runtimeZod = mod;
      zodLoadError = null;
      zodResolutionDiagnostic = 'resolved via n8n-owned-tree anchor (pnpm-isolated install)';
      return mod;
    }
  } catch (e) {
    zodLoadError = e instanceof Error ? e.message : String(e);
  }

  // Fail clean — Proxy throws with the diagnostics above.
  return undefined;
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
          "RuntimeDynamicStructuredTool: @langchain/core/tools could not be resolved from n8n's module tree. " +
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
    // Guard: frameworks probe Symbol.toPrimitive, Symbol.toStringTag, .then (Promise
    // thenable), and .constructor. Throwing on these causes misleading errors during
    // structural inspection.
    if (typeof prop === 'symbol' || prop === 'then' || prop === 'constructor') return undefined;
    const zod = resolveRuntimeZod();
    if (!zod) {
      throw new Error(
        `runtimeZod: zod could not be resolved from n8n's module tree (accessing .${String(prop)}). ` +
          'Ensure zod is installed in the n8n environment.' +
          (zodResolutionDiagnostic ? ` Diagnostic: ${zodResolutionDiagnostic}` : '') +
          (zodLoadError ? ` Load error: ${zodLoadError}` : ''),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (zod as any)[prop];
  },
});

let _logWrapper: ((tool: unknown, context: unknown) => unknown) | undefined;

function extractLogWrapper(
  mod: unknown,
): ((tool: unknown, context: unknown) => unknown) | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec = mod as Record<string, any> | undefined;
  const fn = rec?.logWrapper ?? rec?.default?.logWrapper;
  return typeof fn === 'function'
    ? (fn as (tool: unknown, context: unknown) => unknown)
    : undefined;
}

/**
 * Resolves n8n's logWrapper from @n8n/ai-utilities. Routed through the same
 * require.main → filesystem-anchor → n8n-owned-tree-anchor sequence as the others for
 * consistency. NOTE: logWrapper is a plain function, never instanceof-checked, so a
 * wrong-copy match would be harmless here — it is NOT correctness-critical like
 * zod/DynamicStructuredTool. Best-effort: returns undefined if unavailable.
 */
export function getLazyLogWrapper(): ((tool: unknown, context: unknown) => unknown) | undefined {
  if (_logWrapper) return _logWrapper;

  if (_mainReq) {
    try {
      const fn = extractLogWrapper(_mainReq('@n8n/ai-utilities'));
      if (fn) return (_logWrapper = fn);
    } catch (_) {
      // best-effort — @n8n/ai-utilities is not available in all n8n versions
    }
  }

  if (_filesystemAnchorReq) {
    try {
      const fn = extractLogWrapper(_filesystemAnchorReq('@n8n/ai-utilities'));
      if (fn) return (_logWrapper = fn);
    } catch (_) {
      // best-effort — try the next resolution path
    }
  }

  try {
    const fn = extractLogWrapper(requireFromCachedTree(ZOD_TREE_PATTERNS, '@n8n/ai-utilities'));
    if (fn) return (_logWrapper = fn);
  } catch (_) {
    // best-effort — logWrapper is optional; supplyData falls back to the unwrapped tool
  }

  return _logWrapper;
}
