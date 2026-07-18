import { describe, it, expect } from 'vitest';
import { convertHtmlToMarkdown } from '../htmlToMarkdown';

describe('convertHtmlToMarkdown', () => {
  it('returns empty string for empty/invalid input', () => {
    expect(convertHtmlToMarkdown('')).toBe('');
    // @ts-expect-error testing runtime guard
    expect(convertHtmlToMarkdown(null)).toBe('');
  });

  it('converts headings, bold, and links', () => {
    const md = convertHtmlToMarkdown('<h1>Title</h1><p>a <strong>b</strong> <a href="https://x.com">c</a></p>');
    expect(md).toContain('# Title');
    expect(md).toContain('**b**');
    expect(md).toContain('[c](https://x.com)');
  });

  it('converts GFM tables', () => {
    const html = '<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table>';
    const md = convertHtmlToMarkdown(html);
    expect(md).toContain('| H1 | H2 |');
    expect(md).toContain('| --- | --- |');
  });

  it('converts task lists and strikethrough', () => {
    expect(convertHtmlToMarkdown('<ul><li><input type="checkbox" checked>done</li></ul>')).toContain('[x]');
    expect(convertHtmlToMarkdown('<del>gone</del>')).toContain('~~gone~~');
  });
});
