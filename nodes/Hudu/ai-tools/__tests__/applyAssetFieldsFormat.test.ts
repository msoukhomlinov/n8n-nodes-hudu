import { describe, it, expect } from 'vitest';
import { applyAssetFieldsFormat } from '../tool-executor';

describe('applyAssetFieldsFormat', () => {
  it('converts markdown string values in custom_fields to HTML and strips fields_format', () => {
    const result = applyAssetFieldsFormat({
      fields_format: 'markdown',
      custom_fields: [
        { asset_layout_field_id: '1', value: '**bold**' },
        { asset_layout_field_id: '2', value: 'plain text' },
      ],
    });

    const fields = result.custom_fields as Record<string, unknown>[];
    expect(fields).toHaveLength(2);
    expect(fields[0].value).toContain('<strong>');
    expect(fields[1].value).toBe('<p>plain text</p>\n');
    expect(result).not.toHaveProperty('fields_format');
  });

  it('leaves custom_fields unchanged when fields_format is html, but strips the flag', () => {
    const result = applyAssetFieldsFormat({
      fields_format: 'html',
      custom_fields: [{ asset_layout_field_id: '1', value: '<p>hi</p>' }],
    });

    const fields = result.custom_fields as Record<string, unknown>[];
    expect(fields[0].value).toBe('<p>hi</p>');
    expect(result).not.toHaveProperty('fields_format');
  });

  it('leaves custom_fields unchanged when fields_format is absent, but strips the flag', () => {
    const result = applyAssetFieldsFormat({
      custom_fields: [{ asset_layout_field_id: '1', value: '<p>hi</p>' }],
    });

    const fields = result.custom_fields as Record<string, unknown>[];
    expect(fields[0].value).toBe('<p>hi</p>');
    expect(result).not.toHaveProperty('fields_format');
  });

  it('skips non-string values in custom_fields', () => {
    const result = applyAssetFieldsFormat({
      fields_format: 'markdown',
      custom_fields: [
        { asset_layout_field_id: '1', value: 42 },
        { asset_layout_field_id: '2', value: null },
      ],
    });

    const fields = result.custom_fields as Record<string, unknown>[];
    expect(fields[0].value).toBe(42);
    expect(fields[1].value).toBeNull();
  });

  it('does not convert the asset_layout_field_id key', () => {
    const result = applyAssetFieldsFormat({
      fields_format: 'markdown',
      custom_fields: [{ asset_layout_field_id: '**1**', value: 'test' }],
    });

    const fields = result.custom_fields as Record<string, unknown>[];
    expect(fields[0].asset_layout_field_id).toBe('**1**');
  });

  it('returns params unchanged (minus fields_format) when custom_fields is absent', () => {
    const result = applyAssetFieldsFormat({
      fields_format: 'markdown',
      name: 'Test Asset',
    });

    expect(result).toEqual({ name: 'Test Asset' });
    expect(result).not.toHaveProperty('fields_format');
  });
});
