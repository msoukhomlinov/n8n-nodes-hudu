import { describe, it, expect } from 'vitest';
import { looksLikeHtml } from '../htmlToMarkdown';

describe('looksLikeHtml', () => {
  it('detects real HTML markup', () => {
    expect(looksLikeHtml('<p>hello</p>')).toBe(true);
    expect(looksLikeHtml('a <strong>b</strong>')).toBe(true);
  });
  it('does not flag plain text', () => {
    expect(looksLikeHtml('just a sentence.')).toBe(false);
    expect(looksLikeHtml('2 < 3 and 5 > 4')).toBe(false); // bare comparisons, no tag
  });
});
