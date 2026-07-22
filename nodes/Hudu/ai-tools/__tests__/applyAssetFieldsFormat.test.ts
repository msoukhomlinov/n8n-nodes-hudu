import { describe, it, expect } from 'vitest';
import { applyAssetFieldsFormat } from '../tool-executor';

describe('applyAssetFieldsFormat', () => {
  describe('{ asset_layout_field_id, value } shape', () => {
    it('converts markdown only for RichText field IDs and strips fields_format', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [
            { asset_layout_field_id: 1, value: '**bold**' },
            { asset_layout_field_id: 2, value: 'plain text' },
          ],
        },
        new Set(['1']),
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields).toHaveLength(2);
      expect(fields[0].value).toContain('<strong>');
      // Field 2 is not RichText → left untouched
      expect(fields[1].value).toBe('plain text');
      expect(result).not.toHaveProperty('fields_format');
    });

    it('matches asset_layout_field_id supplied as a string', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [{ asset_layout_field_id: '5', value: '# Title' }],
        },
        new Set(['5']),
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].value).toContain('<h1');
    });

    it('skips non-string values on RichText fields', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [
            { asset_layout_field_id: 1, value: 42 },
            { asset_layout_field_id: 2, value: null },
          ],
        },
        new Set(['1', '2']),
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].value).toBe(42);
      expect(fields[1].value).toBeNull();
    });
  });

  describe('label / snake_case-keyed shape', () => {
    it('converts a RichText value keyed by snake_case label', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [
            { notes: '**bold**' },
            { serial_number: 'ABC-123' },
          ],
        },
        new Set(['notes']),
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].notes).toContain('<strong>');
      // serial_number is not RichText → untouched
      expect(fields[1].serial_number).toBe('ABC-123');
    });

    it('converts a RichText value keyed by raw label', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [{ Notes: '# Heading' }],
        },
        new Set(['Notes']),
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].Notes).toContain('<h1');
    });
  });

  it('leaves all custom_fields untouched when the RichText key set is empty', () => {
    const result = applyAssetFieldsFormat(
      {
        fields_format: 'markdown',
        custom_fields: [
          { asset_layout_field_id: 1, value: '**bold**' },
          { notes: '**bold**' },
        ],
      },
      new Set(),
    );

    const fields = result.custom_fields as Record<string, unknown>[];
    expect(fields[0].value).toBe('**bold**');
    expect(fields[1].notes).toBe('**bold**');
    expect(result).not.toHaveProperty('fields_format');
  });

  it('leaves custom_fields unchanged when fields_format is html, but strips the flag', () => {
    const result = applyAssetFieldsFormat(
      {
        fields_format: 'html',
        custom_fields: [{ asset_layout_field_id: 1, value: '<p>hi</p>' }],
      },
      new Set(['1']),
    );

    const fields = result.custom_fields as Record<string, unknown>[];
    expect(fields[0].value).toBe('<p>hi</p>');
    expect(result).not.toHaveProperty('fields_format');
  });

  it('leaves custom_fields unchanged when fields_format is absent, but strips the flag', () => {
    const result = applyAssetFieldsFormat(
      {
        custom_fields: [{ notes: '**bold**' }],
      },
      new Set(['notes']),
    );

    const fields = result.custom_fields as Record<string, unknown>[];
    expect(fields[0].notes).toBe('**bold**');
    expect(result).not.toHaveProperty('fields_format');
  });

  it('returns params unchanged (minus fields_format) when custom_fields is absent', () => {
    const result = applyAssetFieldsFormat(
      {
        fields_format: 'markdown',
        name: 'Test Asset',
      },
      new Set(['1']),
    );

    expect(result).toEqual({ name: 'Test Asset' });
    expect(result).not.toHaveProperty('fields_format');
  });
});
