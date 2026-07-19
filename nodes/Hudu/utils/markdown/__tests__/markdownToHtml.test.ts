import { describe, it, expect } from 'vitest';
import { convertMarkdownToHtml } from '../markdownToHtml';
import { convertHtmlToMarkdown } from '../htmlToMarkdown';

describe('convertMarkdownToHtml', () => {
  it('returns empty string for empty/invalid input', () => {
    expect(convertMarkdownToHtml('')).toBe('');
  });

  it('converts headings and emphasis to HTML', () => {
    const html = convertMarkdownToHtml('# Title\n\nsome **bold** text');
    expect(html).toContain('<h1');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('round-trips heading + bold + link', () => {
    const md = '# Title\n\na **b** [c](https://x.com)';
    const back = convertHtmlToMarkdown(convertMarkdownToHtml(md));
    expect(back).toContain('# Title');
    expect(back).toContain('**b**');
    expect(back).toContain('[c](https://x.com)');
  });
});
