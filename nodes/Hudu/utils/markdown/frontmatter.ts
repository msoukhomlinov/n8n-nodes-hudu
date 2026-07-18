/**
 * Builds a YAML frontmatter block. No js-yaml dependency: string scalars are
 * always double-quoted with backslash/quote escaped and newlines collapsed,
 * which is safe for the small, known field sets used here.
 */
export function buildFrontmatter(fields: Record<string, string | number | null>): string {
  const lines: string[] = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else {
      const escaped = String(value)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/[\r\n]+/g, ' ');
      lines.push(`${key}: "${escaped}"`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}
