import { describe, it, expect } from 'vitest';
import type { IDataObject } from 'n8n-workflow';
import { sanitizeNumberFieldDisplayOptions } from '../asset_layout_fields.handler';

const node = { name: 'Hudu', type: 'hudu', typeVersion: 1, position: [0, 0], parameters: {} } as never;

describe('sanitizeNumberFieldDisplayOptions', () => {
  it.each([
    ['undefined currency_code', { currency_code: undefined }],
    ['null currency_code', { currency_code: null }],
    ['empty string currency_code', { currency_code: '' }],
    ['whitespace-only currency_code', { currency_code: '   ' }],
    ['non-string currency_code (number 840)', { currency_code: 840 }],
  ])('Number + currency: rejects %s', (_name, value) => {
    const field: IDataObject = { field_type: 'Number', number_type: 'currency', ...value };
    expect(() => sanitizeNumberFieldDisplayOptions(field, node)).toThrow(/currency_code/);
  });

  it.each([
    ['case-differing number_type "Currency"', { number_type: 'Currency' }],
    ['non-string number_type (840)', { number_type: 840 }],
  ])('Number: rejects %s', (_name, value) => {
    const field: IDataObject = { field_type: 'Number', currency_code: 'USD', ...value };
    expect(() => sanitizeNumberFieldDisplayOptions(field, node)).toThrow(/number_type/);
  });

  it('strips currency_code when number_type is number', () => {
    const field: IDataObject = { field_type: 'Number', number_type: 'number', currency_code: 'USD' };
    sanitizeNumberFieldDisplayOptions(field, node);
    expect(field.number_type).toBe('number');
    expect(field.currency_code).toBeUndefined();
  });

  it('keeps both number_type and currency_code for currency with a valid code', () => {
    const field: IDataObject = { field_type: 'Number', number_type: 'currency', currency_code: 'USD' };
    sanitizeNumberFieldDisplayOptions(field, node);
    expect(field.number_type).toBe('currency');
    expect(field.currency_code).toBe('USD');
  });

  it('strips currency_code when number_type is percentage', () => {
    const field: IDataObject = { field_type: 'Number', number_type: 'percentage', currency_code: 'USD' };
    sanitizeNumberFieldDisplayOptions(field, node);
    expect(field.number_type).toBe('percentage');
    expect(field.currency_code).toBeUndefined();
  });
});
