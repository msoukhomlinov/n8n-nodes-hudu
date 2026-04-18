/**
 * Word-overlap title scoring. Only called when name param was provided.
 * Empty token list (all-delimiter query) = score 0 = stable no-op.
 */
export function sortByTitleMatch<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  nameField = 'name',
): T[] {
  const tokens = query.toLowerCase().split(/[\s\-_/]+/).filter(Boolean);
  if (tokens.length === 0) return items;
  const score = (item: T) =>
    tokens.filter((t) => String(item[nameField] ?? '').toLowerCase().includes(t)).length;
  return [...items].sort((a, b) => score(b) - score(a)); // stable (ES2019 / Node 12+)
}

/**
 * Strip the content field from results unless explicitly requested.
 */
export function stripContentField<T extends Record<string, unknown>>(
  items: T[],
  includeContent: boolean,
  contentField = 'content',
): T[] {
  if (includeContent) return items;
  return items.map((item) => {
    const result = { ...item };
    delete result[contentField];
    return result;
  });
}
