import { describe, it, expect } from 'vitest';
import { toSnakeCaseFieldLabel } from '../assetFieldUtils';

describe('toSnakeCaseFieldLabel', () => {
  it('lowercases and underscores multi-word labels', () => {
    expect(toSnakeCaseFieldLabel('Serial Number')).toBe('serial_number');
  });

  it('keeps acronyms and digits together (does not split camel/Pascal case)', () => {
    // Regular node builds Hudu keys this way; AI-tools lookups must match.
    expect(toSnakeCaseFieldLabel('OAuth Token')).toBe('oauth_token');
    expect(toSnakeCaseFieldLabel('IPv4 Notes')).toBe('ipv4_notes');
  });

  it('collapses runs of non-alphanumerics and trims edge underscores', () => {
    expect(toSnakeCaseFieldLabel('  Notes / Comments!  ')).toBe('notes_comments');
  });
});
