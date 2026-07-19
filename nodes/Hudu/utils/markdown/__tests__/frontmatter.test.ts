import { describe, it, expect } from 'vitest';
import { buildFrontmatter } from '../frontmatter';

describe('buildFrontmatter', () => {
  it('quotes and escapes hostile string values', () => {
    const fm = buildFrontmatter({ title: 'Setup: Part "1"\nline2', company_id: 5, url: null });
    expect(fm).toContain('title: "Setup: Part \\"1\\" line2"'); // colon safe, quote escaped, newline collapsed
    expect(fm).toContain('company_id: 5');                       // numbers unquoted
    expect(fm).not.toContain('url:');                            // null omitted
    expect(fm.startsWith('---\n')).toBe(true);
    expect(fm.endsWith('---\n')).toBe(true);
  });

  it('returns just the fences for all-empty input', () => {
    expect(buildFrontmatter({ a: null, b: '' })).toBe('---\n---\n');
  });
});
