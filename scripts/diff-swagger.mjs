import { readFileSync } from 'node:fs';

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function collectEndpoints(doc) {
  const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];
  const result = new Map();
  for (const [path, obj] of Object.entries(doc.paths || {})) {
    for (const method of httpMethods) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, method)) {
        const op = obj[method] || {};
        const params = Array.isArray(op.parameters) ? op.parameters.map(p => p && p.name).filter(Boolean) : [];
        const key = `${method.toUpperCase()} ${path}`;
        result.set(key, { key, method: method.toUpperCase(), path, operationId: op.operationId, summary: op.summary, paramNames: params });
      }
    }
  }
  return result;
}

function diffSets(newSet, oldSet) {
  const added = [];
  const removed = [];
  for (const [k, v] of newSet.entries()) if (!oldSet.has(k)) added.push(v);
  for (const [k, v] of oldSet.entries()) if (!newSet.has(k)) removed.push(v);
  added.sort((a,b)=>a.key.localeCompare(b.key));
  removed.sort((a,b)=>a.key.localeCompare(b.key));
  return { added, removed };
}

function diffParamChanges(newSet, oldSet) {
  const changes = [];
  for (const [k, v] of newSet.entries()) {
    if (!oldSet.has(k)) continue;
    const old = oldSet.get(k);
    const oldParams = new Set((old.paramNames || []).map(x=>x));
    const newParams = new Set((v.paramNames || []).map(x=>x));
    const added = [...newParams].filter(p => !oldParams.has(p));
    const removed = [...oldParams].filter(p => !newParams.has(p));
    if (added.length || removed.length) {
      changes.push({ key: k, added: added.sort(), removed: removed.sort() });
    }
  }
  changes.sort((a,b)=>a.key.localeCompare(b.key));
  return changes;
}

function collectDefinitions(doc) {
  const defs = doc.definitions ? Object.keys(doc.definitions) : [];
  defs.sort();
  return defs;
}

function main() {
  const [,, oldPath, newPath] = process.argv;
  if (!oldPath || !newPath) {
    console.error('Usage: node scripts/diff-swagger.mjs <old.json> <new.json>');
    process.exit(2);
  }
  const oldDoc = loadJson(oldPath);
  const newDoc = loadJson(newPath);
  const oldEndpoints = collectEndpoints(oldDoc);
  const newEndpoints = collectEndpoints(newDoc);
  const { added, removed } = diffSets(newEndpoints, oldEndpoints);
  const paramChanges = diffParamChanges(newEndpoints, oldEndpoints);
  const oldDefs = collectDefinitions(oldDoc);
  const newDefs = collectDefinitions(newDoc);
  const addedDefs = newDefs.filter(d => !oldDefs.includes(d));
  const removedDefs = oldDefs.filter(d => !newDefs.includes(d));

  const sep = () => console.log('');
  console.log('=== Added Endpoints ===');
  for (const ep of added) console.log(`${ep.key} | ${ep.operationId || ''} | ${ep.summary || ''}`);
  sep();
  console.log('=== Removed Endpoints ===');
  for (const ep of removed) console.log(`${ep.key} | ${ep.operationId || ''} | ${ep.summary || ''}`);
  sep();
  console.log('=== Parameter Changes (common endpoints) ===');
  for (const ch of paramChanges) console.log(`${ch.key} | + ${ch.added.join(', ')} | - ${ch.removed.join(', ')}`);
  sep();
  console.log('=== Added Definitions ===');
  console.log(addedDefs.join(', '));
  sep();
  console.log('=== Removed Definitions ===');
  console.log(removedDefs.join(', '));
}

main();


