import { describe, it, expect } from 'vitest';
import { applyContentFormat } from '../tool-executor';

describe('applyContentFormat', () => {
  it('converts markdown content to HTML and strips content_format', () => {
    const result = applyContentFormat({ content_format: 'markdown', content: '**bold**' });
    expect(result.content).toContain('<strong>');
    expect(result).not.toHaveProperty('content_format');
  });

  it('leaves content unchanged when content_format is html or absent, but strips the flag', () => {
    const result = applyContentFormat({ content_format: 'html', content: '<p>hi</p>' });
    expect(result.content).toBe('<p>hi</p>');
    expect(result).not.toHaveProperty('content_format');

    const resultAbsent = applyContentFormat({ content: '<p>hi</p>' });
    expect(resultAbsent.content).toBe('<p>hi</p>');
    expect(resultAbsent).not.toHaveProperty('content_format');
  });

  it('returns params unchanged (minus content_format) when content is absent', () => {
    const result = applyContentFormat({ content_format: 'markdown', name: 'Test' });
    expect(result).toEqual({ name: 'Test' });
    expect(result).not.toHaveProperty('content_format');
  });
});
