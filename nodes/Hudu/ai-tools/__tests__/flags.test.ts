import { describe, expect, it } from 'vitest';

import { HUDU_RESOURCE_CONFIG } from '../resource-config';
import { getFlagTypesCreateSchema, getFlagsCreateSchema } from '../schema-generator';

describe('flags / flag_types resources', () => {
  it('registers both resources with the API body keys', () => {
    expect(HUDU_RESOURCE_CONFIG['flags'].bodyKey).toBe('flag');
    expect(HUDU_RESOURCE_CONFIG['flag_types'].bodyKey).toBe('flag_type');
  });

  it('flag type create accepts named colors only', () => {
    const schema = getFlagTypesCreateSchema();
    expect(schema.safeParse({ name: 'Urgent', color: 'LightBlue' }).success).toBe(true);
    expect(schema.safeParse({ name: 'Urgent', color: '#ff0000' }).success).toBe(false);
  });

  it('flag create requires flagable fields and validates flagable_type', () => {
    const schema = getFlagsCreateSchema();
    expect(
      schema.safeParse({ flag_type_id: 1, flagable_type: 'Company', flagable_id: 2 }).success,
    ).toBe(true);
    expect(schema.safeParse({ flag_type_id: 1, flagable_type: 'Bogus', flagable_id: 2 }).success).toBe(false);
    expect(schema.safeParse({ flag_type_id: 1 }).success).toBe(false);
  });
});
