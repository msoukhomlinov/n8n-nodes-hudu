import { describe, it, expect } from 'vitest';
import { applyAssetFieldsFormat } from '../tool-executor';
import type { IAssetLayoutFieldEntity } from '../../resources/asset_layout_fields/asset_layout_fields.types';

// Minimal layout field factory — only the properties applyAssetFieldsFormat reads.
function field(id: number, label: string, fieldType: string): IAssetLayoutFieldEntity {
  return { id, label, field_type: fieldType } as unknown as IAssetLayoutFieldEntity;
}

const layout: IAssetLayoutFieldEntity[] = [
  field(1, 'Notes', 'RichText'),
  field(2, 'Serial Number', 'Text'),
  field(3, 'OAuth Token', 'RichText'),
];

describe('applyAssetFieldsFormat', () => {
  describe('{ asset_layout_field_id, value } shape → rewritten to label-keyed', () => {
    it('rewrites to snake_case label keys and converts only RichText values (markdown)', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [
            { asset_layout_field_id: 1, value: '**bold**' },
            { asset_layout_field_id: 2, value: 'ABC-123' },
          ],
        },
        layout,
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields).toHaveLength(2);
      // RichText → converted, keyed by snake_case label; no asset_layout_field_id/value keys remain
      expect(fields[0]).not.toHaveProperty('asset_layout_field_id');
      expect(fields[0].notes).toContain('<strong>');
      // Non-RichText → value preserved, still rewritten to label key
      expect(fields[1].serial_number).toBe('ABC-123');
      expect(result).not.toHaveProperty('fields_format');
    });

    it('rewrites to label-keyed even when not markdown (Hudu shape requirement)', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'html',
          custom_fields: [{ asset_layout_field_id: 1, value: '<p>hi</p>' }],
        },
        layout,
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].notes).toBe('<p>hi</p>');
      expect(fields[0]).not.toHaveProperty('asset_layout_field_id');
    });

    it('uses the API snake_case transform for acronym/digit labels', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [{ asset_layout_field_id: 3, value: '# Title' }],
        },
        layout,
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].oauth_token).toContain('<h1');
    });

    it('leaves an entry untouched when its id is unknown to the layout', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [{ asset_layout_field_id: 99, value: '**bold**' }],
        },
        layout,
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].asset_layout_field_id).toBe(99);
      expect(fields[0].value).toBe('**bold**');
    });
  });

  describe('label / snake_case-keyed shape (already Hudu-shaped)', () => {
    it('converts RichText values in place when markdown', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'markdown',
          custom_fields: [{ notes: '**bold**' }, { serial_number: 'ABC-123' }],
        },
        layout,
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].notes).toContain('<strong>');
      expect(fields[1].serial_number).toBe('ABC-123');
    });

    it('leaves values untouched when not markdown', () => {
      const result = applyAssetFieldsFormat(
        {
          fields_format: 'html',
          custom_fields: [{ notes: '**bold**' }],
        },
        layout,
      );

      const fields = result.custom_fields as Record<string, unknown>[];
      expect(fields[0].notes).toBe('**bold**');
    });
  });

  it('returns params unchanged (minus fields_format) when custom_fields is absent', () => {
    const result = applyAssetFieldsFormat(
      { fields_format: 'markdown', name: 'Test Asset' },
      layout,
    );

    expect(result).toEqual({ name: 'Test Asset' });
    expect(result).not.toHaveProperty('fields_format');
  });
});
