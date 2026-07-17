import { readFileSync } from 'node:fs';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Resolve local #/definitions/... refs within a swagger doc. */
function resolveRef(doc, schema, seen = new Set()) {
  if (!schema || typeof schema !== 'object') return schema;
  if (!schema.$ref) return schema;
  const ref = schema.$ref;
  if (!ref.startsWith('#/definitions/')) return schema;
  const name = ref.slice('#/definitions/'.length);
  if (seen.has(name)) return schema;
  seen.add(name);
  return resolveRef(doc, doc.definitions?.[name], seen) || schema;
}

/**
 * Flatten schema properties into dotted paths.
 * Nested objects and array-of-object items are walked.
 */
function walkSchemaProps(doc, schema, prefix = '', out = new Map(), seenRefs = new Set()) {
  if (!schema || typeof schema !== 'object') return out;

  if (schema.$ref) {
    const ref = schema.$ref;
    if (seenRefs.has(ref)) return out;
    seenRefs.add(ref);
    return walkSchemaProps(doc, resolveRef(doc, schema), prefix, out, seenRefs);
  }

  const required = new Set(schema.required || []);
  const props = schema.properties || {};

  for (const [name, raw] of Object.entries(props)) {
    const path = prefix ? `${prefix}.${name}` : name;
    const prop = resolveRef(doc, raw);
    out.set(path, {
      path,
      type: prop?.type || (prop?.$ref ? prop.$ref : undefined),
      required: required.has(name),
      description: prop?.description || '',
      enum: Array.isArray(prop?.enum) ? prop.enum : undefined,
    });

    if (prop?.properties || prop?.$ref) {
      walkSchemaProps(doc, prop, path, out, seenRefs);
    }
    if (prop?.items) {
      const items = resolveRef(doc, prop.items);
      if (items?.properties || items?.$ref) {
        walkSchemaProps(doc, items, `${path}[]`, out, seenRefs);
      }
    }
  }

  return out;
}

function collectNonBodyParams(op) {
  const params = [];
  for (const p of op.parameters || []) {
    if (!p || !p.name || p.in === 'body') continue;
    params.push({
      key: `${p.in}:${p.name}`,
      name: p.name,
      in: p.in,
      required: !!p.required,
      type: p.type,
      description: p.description || '',
    });
  }
  params.sort((a, b) => a.key.localeCompare(b.key));
  return params;
}

function collectBodyProps(doc, op) {
  const out = new Map();
  for (const p of op.parameters || []) {
    if (!p || p.in !== 'body' || !p.schema) continue;
    walkSchemaProps(doc, p.schema, '', out);
  }
  return out;
}

function collectEndpoints(doc) {
  const result = new Map();
  for (const [path, obj] of Object.entries(doc.paths || {})) {
    for (const method of HTTP_METHODS) {
      if (!obj || !Object.prototype.hasOwnProperty.call(obj, method)) continue;
      const op = obj[method] || {};
      const key = `${method.toUpperCase()} ${path}`;
      result.set(key, {
        key,
        method: method.toUpperCase(),
        path,
        operationId: op.operationId,
        summary: op.summary,
        nonBodyParams: collectNonBodyParams(op),
        bodyProps: collectBodyProps(doc, op),
      });
    }
  }
  return result;
}

function diffSets(newSet, oldSet) {
  const added = [];
  const removed = [];
  for (const [k, v] of newSet.entries()) if (!oldSet.has(k)) added.push(v);
  for (const [k, v] of oldSet.entries()) if (!newSet.has(k)) removed.push(v);
  added.sort((a, b) => a.key.localeCompare(b.key));
  removed.sort((a, b) => a.key.localeCompare(b.key));
  return { added, removed };
}

function diffEndpointDetails(newSet, oldSet) {
  const paramChanges = [];
  const bodyPropChanges = [];
  const requiredChanges = [];

  for (const [k, neu] of newSet.entries()) {
    if (!oldSet.has(k)) continue;
    const old = oldSet.get(k);

    const oldParams = new Set(old.nonBodyParams.map((p) => p.key));
    const newParams = new Set(neu.nonBodyParams.map((p) => p.key));
    const addedParams = [...newParams].filter((p) => !oldParams.has(p)).sort();
    const removedParams = [...oldParams].filter((p) => !newParams.has(p)).sort();
    if (addedParams.length || removedParams.length) {
      paramChanges.push({ key: k, added: addedParams, removed: removedParams });
    }

    const oldBody = old.bodyProps;
    const newBody = neu.bodyProps;
    const addedBody = [...newBody.keys()].filter((p) => !oldBody.has(p)).sort();
    const removedBody = [...oldBody.keys()].filter((p) => !newBody.has(p)).sort();
    if (addedBody.length || removedBody.length) {
      bodyPropChanges.push({
        key: k,
        added: addedBody.map((p) => {
          const meta = newBody.get(p);
          return `${p}${meta?.type ? ` (${meta.type})` : ''}`;
        }),
        removed: removedBody,
      });
    }

    for (const path of newBody.keys()) {
      if (!oldBody.has(path)) continue;
      const wasReq = !!oldBody.get(path).required;
      const isReq = !!newBody.get(path).required;
      if (wasReq !== isReq) {
        requiredChanges.push({
          key: k,
          path,
          from: wasReq,
          to: isReq,
        });
      }
    }
  }

  paramChanges.sort((a, b) => a.key.localeCompare(b.key));
  bodyPropChanges.sort((a, b) => a.key.localeCompare(b.key));
  requiredChanges.sort((a, b) => a.key.localeCompare(b.key) || a.path.localeCompare(b.path));
  return { paramChanges, bodyPropChanges, requiredChanges };
}

function collectDefinitions(doc) {
  const result = new Map();
  for (const name of Object.keys(doc.definitions || {}).sort()) {
    const def = doc.definitions[name];
    const props = walkSchemaProps(doc, def);
    result.set(name, { name, props });
  }
  return result;
}

function diffDefinitions(newDefs, oldDefs) {
  const added = [...newDefs.keys()].filter((n) => !oldDefs.has(n));
  const removed = [...oldDefs.keys()].filter((n) => !newDefs.has(n));
  const propertyChanges = [];

  for (const [name, neu] of newDefs.entries()) {
    if (!oldDefs.has(name)) continue;
    const old = oldDefs.get(name);
    const addedProps = [...neu.props.keys()].filter((p) => !old.props.has(p)).sort();
    const removedProps = [...old.props.keys()].filter((p) => !neu.props.has(p)).sort();
    const requiredFlips = [];
    for (const path of neu.props.keys()) {
      if (!old.props.has(path)) continue;
      const wasReq = !!old.props.get(path).required;
      const isReq = !!neu.props.get(path).required;
      if (wasReq !== isReq) {
        requiredFlips.push({ path, from: wasReq, to: isReq });
      }
    }
    if (addedProps.length || removedProps.length || requiredFlips.length) {
      propertyChanges.push({
        name,
        added: addedProps.map((p) => {
          const meta = neu.props.get(p);
          return `${p}${meta?.type ? ` (${meta.type})` : ''}`;
        }),
        removed: removedProps,
        requiredFlips,
      });
    }
  }

  propertyChanges.sort((a, b) => a.name.localeCompare(b.name));
  return { added, removed, propertyChanges };
}

function main() {
  const [, , oldPath, newPath] = process.argv;
  if (!oldPath || !newPath) {
    console.error('Usage: node scripts/diff-swagger.mjs <old.json> <new.json>');
    process.exit(2);
  }

  const oldDoc = loadJson(oldPath);
  const newDoc = loadJson(newPath);
  const oldEndpoints = collectEndpoints(oldDoc);
  const newEndpoints = collectEndpoints(newDoc);
  const { added, removed } = diffSets(newEndpoints, oldEndpoints);
  const { paramChanges, bodyPropChanges, requiredChanges } = diffEndpointDetails(
    newEndpoints,
    oldEndpoints,
  );
  const { added: addedDefs, removed: removedDefs, propertyChanges: defPropChanges } =
    diffDefinitions(collectDefinitions(newDoc), collectDefinitions(oldDoc));

  const sep = () => console.log('');

  console.log('=== Added Endpoints ===');
  for (const ep of added) {
    console.log(`${ep.key} | ${ep.operationId || ''} | ${ep.summary || ''}`);
  }
  sep();

  console.log('=== Removed Endpoints ===');
  for (const ep of removed) {
    console.log(`${ep.key} | ${ep.operationId || ''} | ${ep.summary || ''}`);
  }
  sep();

  console.log('=== Query/Path/Header Parameter Changes (common endpoints) ===');
  for (const ch of paramChanges) {
    console.log(`${ch.key} | + ${ch.added.join(', ')} | - ${ch.removed.join(', ')}`);
  }
  sep();

  console.log('=== Request Body Property Changes (common endpoints) ===');
  for (const ch of bodyPropChanges) {
    console.log(`${ch.key} | + ${ch.added.join(', ')} | - ${ch.removed.join(', ')}`);
  }
  sep();

  console.log('=== Request Body Required Flag Changes (common endpoints) ===');
  for (const ch of requiredChanges) {
    console.log(`${ch.key} | ${ch.path}: ${ch.from} -> ${ch.to}`);
  }
  sep();

  console.log('=== Added Definitions ===');
  console.log(addedDefs.join(', ') || '(none)');
  sep();

  console.log('=== Removed Definitions ===');
  console.log(removedDefs.join(', ') || '(none)');
  sep();

  console.log('=== Definition Property Changes (common definitions) ===');
  for (const ch of defPropChanges) {
    const bits = [];
    if (ch.added.length) bits.push(`+ ${ch.added.join(', ')}`);
    if (ch.removed.length) bits.push(`- ${ch.removed.join(', ')}`);
    for (const flip of ch.requiredFlips) {
      bits.push(`required ${flip.path}: ${flip.from} -> ${flip.to}`);
    }
    console.log(`${ch.name} | ${bits.join(' | ')}`);
  }
}

main();
