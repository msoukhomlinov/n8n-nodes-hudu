import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ISupplyDataFunctions } from 'n8n-workflow';
import {
  getMagicDashGetSchema,
  getMagicDashGetAllSchema,
  getMagicDashCreateOrUpdateSchema,
  buildUnifiedSchema,
} from '../schema-generator';
import { addMagicDashMarkdown } from '../result-processor';
import { HUDU_RESOURCE_CONFIG, WRITE_OPERATIONS } from '../resource-config';

vi.mock('../../utils/operations', () => ({
  handleGetOperation: vi.fn(),
  handleCreateOperation: vi.fn(),
}));
vi.mock('../../utils/operations/magic_dash', () => ({
  handleMagicDashGetAllOperation: vi.fn(),
}));

import { runMagicDash } from '../magic-dash-executor';
import { handleGetOperation, handleCreateOperation } from '../../utils/operations';
import { handleMagicDashGetAllOperation } from '../../utils/operations/magic_dash';

const mockGet = vi.mocked(handleGetOperation);
const mockCreate = vi.mocked(handleCreateOperation);
const mockGetAll = vi.mocked(handleMagicDashGetAllOperation);

describe('magic_dash resource registration', () => {
  it('is registered with get/getAll/createOrUpdate operations', () => {
    const cfg = HUDU_RESOURCE_CONFIG.magic_dash;
    expect(cfg).toBeDefined();
    expect(cfg.endpoint).toBe('/magic_dash');
    expect(cfg.ops).toEqual(['get', 'getAll', 'createOrUpdate']);
  });

  it('gates createOrUpdate behind write operations', () => {
    expect(WRITE_OPERATIONS).toContain('createOrUpdate');
  });
});

describe('magic_dash schemas', () => {
  it('createOrUpdate requires title, company_id, and message', () => {
    const schema = getMagicDashCreateOrUpdateSchema();
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ title: 'T', company_id: 5 }).success).toBe(false);
    expect(schema.safeParse({ title: 'T', company_id: 5, message: 'M' }).success).toBe(true);
  });

  it('createOrUpdate accepts content_format markdown and optional header fields', () => {
    const schema = getMagicDashCreateOrUpdateSchema();
    const res = schema.safeParse({
      title: 'T',
      company_id: 5,
      message: 'M',
      content: '# Heading',
      content_format: 'markdown',
      icon: 'fa-home',
      content_link: 'https://example.com',
    });
    expect(res.success).toBe(true);
  });

  it('getAll exposes company_id/title filters and markdown flags but no search', () => {
    const shape = getMagicDashGetAllSchema().shape;
    expect('search' in shape).toBe(false);
    expect('company_id' in shape).toBe(true);
    expect('title' in shape).toBe(true);
    expect('output_markdown' in shape).toBe(true);
    expect('include_frontmatter' in shape).toBe(true);
  });

  it('get exposes id and markdown flags', () => {
    const shape = getMagicDashGetSchema().shape;
    expect('id' in shape).toBe(true);
    expect('output_markdown' in shape).toBe(true);
    expect('include_frontmatter' in shape).toBe(true);
  });

  it('unified schema accepts createOrUpdate as an operation and rejects unknown ops', () => {
    const schema = buildUnifiedSchema(
      'magic_dash',
      ['get', 'getAll', 'createOrUpdate'],
      HUDU_RESOURCE_CONFIG.magic_dash,
    );
    expect('message' in schema.shape).toBe(true);
    expect('content_format' in schema.shape).toBe(true);
    expect(schema.safeParse({ operation: 'createOrUpdate' }).success).toBe(true);
    expect(schema.safeParse({ operation: 'delete' }).success).toBe(false);
  });
});

describe('addMagicDashMarkdown', () => {
  it('adds markdown_content converted from HTML content', () => {
    const out = addMagicDashMarkdown({ content: '<strong>hi</strong>' }, false);
    expect(out.markdown_content).toContain('hi');
    expect(out.markdown_content).not.toContain('---');
  });

  it('prepends a frontmatter citation block when requested', () => {
    const out = addMagicDashMarkdown(
      { content: '<p>x</p>', title: 'T', company_name: 'ACME', content_link: 'https://e' },
      true,
    );
    expect(out.markdown_content).toContain('---');
    expect(out.markdown_content).toContain('title: "T"');
    expect(out.markdown_content).toContain('company_name: "ACME"');
    expect(out.markdown_content).toContain('content_link: "https://e"');
  });

  it('returns the record unchanged when there is no content', () => {
    const rec = { title: 'T' };
    expect(addMagicDashMarkdown(rec, true)).toBe(rec);
  });
});

describe('runMagicDash executor', () => {
  // context is only used as the `this` target for mocked .call() — a bare object suffices
  const ctx = {} as unknown as ISupplyDataFunctions;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('get returns the matching item with markdown_content when output_markdown', async () => {
    mockGetAll.mockResolvedValue([{ id: 1, title: 'T', content: '<p>hi</p>' }]);
    const parsed = JSON.parse(await runMagicDash(ctx, 'get', { id: 1, output_markdown: true }));
    expect(parsed.record.id).toBe(1);
    expect(parsed.record.markdown_content).toContain('hi');
  });

  it('get returns a not-found error envelope when the id is absent', async () => {
    mockGetAll.mockResolvedValue([{ id: 1 }]);
    const parsed = JSON.parse(await runMagicDash(ctx, 'get', { id: 99 }));
    expect(parsed.error).toBe(true);
  });

  it('getAll forwards company_id/title filters (probing with limit + 1) and reports records', async () => {
    mockGetAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const parsed = JSON.parse(await runMagicDash(ctx, 'getAll', { company_id: 5, title: 'T', limit: 25 }));
    expect(mockGetAll).toHaveBeenCalledWith({ company_id: 5, title: 'T' }, false, 26);
    expect(parsed.matchCount).toBe(2);
    expect(parsed.truncated).toBe(false);
  });

  it('getAll does not flag truncation for an exactly-limit result set', async () => {
    mockGetAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const parsed = JSON.parse(await runMagicDash(ctx, 'getAll', { limit: 2 }));
    expect(parsed.matchCount).toBe(2);
    expect(parsed.truncated).toBe(false);
  });

  it('getAll flags truncation and slices to limit when more than limit exist', async () => {
    mockGetAll.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const parsed = JSON.parse(await runMagicDash(ctx, 'getAll', { limit: 2 }));
    expect(parsed.matchCount).toBe(2);
    expect(parsed.truncated).toBe(true);
  });

  it('createOrUpdate resolves company_id to name, enforces exclusivity, and returns upserted', async () => {
    mockGet.mockResolvedValue({ id: 5, name: 'ACME' });
    mockCreate.mockResolvedValue({ id: 10, title: 'T' });
    const parsed = JSON.parse(
      await runMagicDash(ctx, 'createOrUpdate', {
        title: 'T',
        company_id: 5,
        message: 'M',
        content: '<p>c</p>',
        content_link: 'https://x',
        icon: 'fa-home',
        image_url: 'https://y',
      }),
    );
    const body = mockCreate.mock.calls[0][1];
    expect(body.company_name).toBe('ACME');
    expect(body.content).toBe('<p>c</p>');
    expect(body.content_link).toBeUndefined(); // content wins
    expect(body.image_url).toBeUndefined(); // icon wins
    expect(parsed.outcome).toBe('upserted');
  });

  it('createOrUpdate converts markdown content to HTML before saving', async () => {
    mockGet.mockResolvedValue({ id: 5, name: 'ACME' });
    mockCreate.mockResolvedValue({ id: 10 });
    await runMagicDash(ctx, 'createOrUpdate', {
      title: 'T',
      company_id: 5,
      message: 'M',
      content: '**bold**',
      content_format: 'markdown',
    });
    const body = mockCreate.mock.calls[0][1];
    expect(body.content).toContain('<strong>');
  });

  it('createOrUpdate rejects a missing required field with an error envelope', async () => {
    const parsed = JSON.parse(await runMagicDash(ctx, 'createOrUpdate', { title: 'T', company_id: 5 }));
    expect(parsed.error).toBe(true);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
