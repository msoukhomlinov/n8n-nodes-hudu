import { describe, expect, it } from 'vitest';

import {
  HUDU_RESOURCE_CONFIG,
  filterEnabledOperations,
  type HuduResourceConfig,
} from '../resource-config';

const companiesConfig = HUDU_RESOURCE_CONFIG['companies'];

// Minimal synthetic config: only `ops` drives the filter, but HuduResourceConfig
// requires the full shape.
const minimalConfig: HuduResourceConfig = {
  endpoint: '/fake',
  pluralKey: null,
  singularKey: null,
  bodyKey: null,
  ops: ['get', 'getAll', 'help'],
  supportsPagination: false,
  label: 'Fake',
};

describe('filterEnabledOperations', () => {
  it('lets read ops registered in config.ops pass through, preserving order', () => {
    const result = filterEnabledOperations(
      ['getAll', 'get', 'help', 'getIdByName'],
      companiesConfig,
      false,
    );
    expect(result).toEqual(['getAll', 'get', 'help', 'getIdByName']);
  });

  it('excludes write ops when allowWriteOperations is false', () => {
    const result = filterEnabledOperations(
      ['get', 'create', 'update', 'delete'],
      companiesConfig,
      false,
    );
    expect(result).toEqual(['get']);
  });

  it('includes write ops when allowWriteOperations is true', () => {
    const result = filterEnabledOperations(
      ['get', 'create', 'update', 'delete', 'archive', 'unarchive'],
      companiesConfig,
      true,
    );
    expect(result).toEqual(['get', 'create', 'update', 'delete', 'archive', 'unarchive']);
  });

  it('regression: excludes ops present in operations but not registered in config.ops', () => {
    // Issue #46: the old execute() filter only applied the write-op gate, so 'delete'
    // survived even though this resource never registers it.
    const result = filterEnabledOperations(['getAll', 'delete'], minimalConfig, true);
    expect(result).toEqual(['getAll']);
  });

  it('excludes unknown / never-registered op strings', () => {
    const result = filterEnabledOperations(
      ['get', 'frobnicate', 'getByLayout'],
      companiesConfig,
      true,
    );
    expect(result).toEqual(['get']);
  });

  it('excludes a write op not registered for a real resource even when writes are allowed', () => {
    // 'move' and 'getByLayout' are only registered for assets; companies never gets
    // them even with writes enabled.
    const result = filterEnabledOperations(
      ['get', 'move', 'getByLayout'],
      companiesConfig,
      true,
    );
    expect(result).toEqual(['get']);

    // And for the resource that does register 'move', it passes.
    const assetsResult = filterEnabledOperations(['move'], HUDU_RESOURCE_CONFIG['assets'], true);
    expect(assetsResult).toEqual(['move']);
  });
});
