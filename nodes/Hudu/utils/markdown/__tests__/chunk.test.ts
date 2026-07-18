import { describe, it, expect } from 'vitest';
import { chunkByHeading } from '../chunk';

describe('chunkByHeading', () => {
  it('returns a single preamble chunk when there are no headings', () => {
    const c = chunkByHeading('just some text\nmore text');
    expect(c).toHaveLength(1);
    expect(c[0].heading).toBeNull();
    expect(c[0].level).toBe(0);
  });

  it('emits a preamble chunk before the first heading', () => {
    const c = chunkByHeading('intro line\n\n# First\n\nbody');
    expect(c[0].heading).toBeNull();
    expect(c[1].heading).toBe('First');
    expect(c[1].level).toBe(1);
  });

  it('does NOT split on a # inside a fenced code block', () => {
    const md = '# Real\n\n```\n# not a heading\n```\n\nafter';
    const c = chunkByHeading(md);
    expect(c).toHaveLength(1);
    expect(c[0].content).toContain('# not a heading');
  });

  it('splits multiple headings and preserves the heading line in content', () => {
    const c = chunkByHeading('# A\n\naaa\n\n## B\n\nbbb');
    expect(c.map((x) => x.heading)).toEqual(['A', 'B']);
    expect(c[0].content.startsWith('# A')).toBe(true);
  });
});
