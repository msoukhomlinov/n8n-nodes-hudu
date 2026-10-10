import { describe, it, expect, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { assertSafeEndpoint } from '../requestUtils';
import { coercePositiveInt } from '../validation';
import { handleLabelTypesOperation } from '../../resources/label_types/label_types.handler';
import { handleWebsitesOperation } from '../../resources/websites/websites.handler';
import { handleRelationsOperation } from '../../resources/relations/relations.handler';
import { handleArticlesOperation } from '../../resources/articles/articles.handler';
import { handleAssetsOperation } from '../../resources/assets/assets.handler';
import { handleProceduresOperation } from '../../resources/procedures/procedures.handler';
import { handlePhotoOperation } from '../../resources/photos/photos.handler';
import { handlePublicPhotoOperation } from '../../resources/public_photos/public_photos.handler';
import { handleUploadOperation } from '../../resources/uploads/uploads.handler';
import { handleListOptionsOperation } from '../../resources/list_options/list_options.handler';
import { handleFlagsOperation } from '../../resources/flags/flags.handler';
import { getAssetLayoutFields } from '../../optionLoaders/asset_layouts/getAssetLayoutFields';

const BASE = 'https://hudu.example/api/v1';
const MALFORMED: unknown[] = ['12abc', '../x', -1, 1.5, '1?x=y#z'];
const node = { name: 'Hudu', type: 'hudu', typeVersion: 1, position: [0, 0], parameters: {} } as never;

function makeContext(params: IDataObject) {
  const request = vi.fn(async (_cred: string, opts: IDataObject) => {
    if (opts.returnFullResponse) {
      return { statusCode: 200, body: Buffer.from('x'), headers: { 'content-type': 'image/png' } };
    }
    if (opts.url === `${BASE}/assets`) return { assets: [{ company_id: '7' }] };
    return { id: 1 };
  });
  const ctx = {
    getNode: () => node,
    getNodeParameter: (name: string, _i: number, fallback?: unknown, options?: IDataObject) => {
      const value = name in params ? params[name] : fallback;
      if (options?.extractValue && value && typeof value === 'object' && '__rl' in value) {
        return (value as IDataObject).value;
      }
      return value;
    },
    getCredentials: async () => ({ baseUrl: 'https://hudu.example' }),
    helpers: {
      httpRequestWithAuthentication: request,
      prepareBinaryData: async () => ({ data: 'x', mimeType: 'image/png' }),
    },
  };
  return { ctx: ctx as unknown as IExecuteFunctions, request };
}

type Case = {
  name: string;
  run: (ctx: IExecuteFunctions) => Promise<unknown>;
  params: (id: unknown) => IDataObject;
  method: string;
  url: string;
};

const cases: Case[] = [
  {
    name: 'get helper (label_types get)',
    run: (c) => handleLabelTypesOperation.call(c, 'get', 0),
    params: (id) => ({ id }),
    method: 'GET',
    url: '/label_types/12',
  },
  {
    name: 'update helper (websites update)',
    run: (c) => handleWebsitesOperation.call(c, 'update', 0),
    params: (id) => ({ websiteId: id, websiteUpdateFields: {} }),
    method: 'PUT',
    url: '/websites/12',
  },
  {
    name: 'delete helper (relations delete)',
    run: (c) => handleRelationsOperation.call(c, 'delete', 0),
    params: (id) => ({ id }),
    method: 'DELETE',
    url: '/relations/12',
  },
  {
    name: 'archive helper (articles archive)',
    run: (c) => handleArticlesOperation.call(c, 'archive', 0),
    params: (id) => ({ articleId: id }),
    method: 'PUT',
    url: '/articles/12/archive',
  },
  {
    name: 'company-scoped delete helper (assets delete)',
    run: (c) => handleAssetsOperation.call(c, 'delete', 0),
    params: (id) => ({ assetId: id }),
    method: 'DELETE',
    url: '/companies/7/assets/12',
  },
  {
    name: 'procedures helper (kickoff)',
    run: (c) => handleProceduresOperation.call(c, 'kickoff', 0),
    params: (id) => ({ id, additionalFields: {} }),
    method: 'POST',
    url: '/procedures/12/kickoff',
  },
  {
    name: 'direct caller: procedures createFromTemplate',
    run: (c) => handleProceduresOperation.call(c, 'createFromTemplate', 0),
    params: (id) => ({ template_id: id, additionalFields: {} }),
    method: 'POST',
    url: '/procedures/12/create_from_template',
  },
  {
    name: 'direct caller: procedures duplicate',
    run: (c) => handleProceduresOperation.call(c, 'duplicate', 0),
    params: (id) => ({ id, companyId: 3, additionalFields: {} }),
    method: 'POST',
    url: '/procedures/12/duplicate',
  },
  {
    name: 'direct caller: assets moveLayout',
    run: (c) => handleAssetsOperation.call(c, 'moveLayout', 0),
    params: (id) => ({ assetId: id, target_asset_layout_id: 4 }),
    method: 'PUT',
    url: '/companies/7/assets/12/move_layout',
  },
  {
    name: 'direct caller: photos update',
    run: (c) => handlePhotoOperation.call(c, 'update', 0),
    params: (id) => ({ photoId: id, photoUpdateFields: {} }),
    method: 'PUT',
    url: '/photos/12',
  },
  {
    name: 'direct caller: photos download',
    run: (c) => handlePhotoOperation.call(c, 'get', 0),
    params: (id) => ({ photoId: id, download: true }),
    method: 'GET',
    url: '/photos/12',
  },
  {
    name: 'direct caller: public_photos get',
    run: (c) => handlePublicPhotoOperation.call(c, 'get', 0),
    params: (id) => ({ id, download: false }),
    method: 'GET',
    url: '/public_photos/12',
  },
  {
    name: 'direct caller: public_photos download',
    run: (c) => handlePublicPhotoOperation.call(c, 'get', 0),
    params: (id) => ({ id, download: true }),
    method: 'GET',
    url: '/public_photos/12',
  },
  {
    name: 'direct caller: public_photos update',
    run: (c) => handlePublicPhotoOperation.call(c, 'update', 0),
    params: (id) => ({ id, record_type: 'Asset', record_id: 5 }),
    method: 'PUT',
    url: '/public_photos/12',
  },
  {
    name: 'direct caller: uploads get',
    run: (c) => handleUploadOperation.call(c, 'get', 0),
    params: (id) => ({ id, download: false }),
    method: 'GET',
    url: '/uploads/12',
  },
  {
    name: 'direct caller: uploads download',
    run: (c) => handleUploadOperation.call(c, 'get', 0),
    params: (id) => ({ id, download: true }),
    method: 'GET',
    url: '/uploads/12',
  },
  {
    name: 'direct caller: uploads delete',
    run: (c) => handleUploadOperation.call(c, 'delete', 0),
    params: (id) => ({ id }),
    method: 'DELETE',
    url: '/uploads/12',
  },
  {
    name: 'list_options get (resource locator value)',
    run: (c) => handleListOptionsOperation.call(c, 'get', 0),
    params: (id) => ({ list_id: { __rl: true, mode: 'id', value: id } }),
    method: 'GET',
    url: '/lists/12',
  },
  {
    name: 'flags get (shared coercion)',
    run: (c) => handleFlagsOperation.call(c, 'get', 0),
    params: (id) => ({ id }),
    method: 'GET',
    url: '/flags/12',
  },
  {
    name: 'option loader: getAssetLayoutFields',
    run: (c) => getAssetLayoutFields.call(c as unknown as ILoadOptionsFunctions),
    params: (id) => ({ asset_layout_id: id }),
    method: 'GET',
    url: '/asset_layouts/12',
  },
];

describe('record IDs are validated before building request paths', () => {
  for (const c of cases) {
    describe(c.name, () => {
      it.each(MALFORMED)('rejects %j before any request', async (bad) => {
        const { ctx, request } = makeContext(c.params(bad));
        await expect(c.run(ctx)).rejects.toThrow();
        expect(request).not.toHaveBeenCalled();
      });

      it.each([12, '12', ' 12 '])('keeps the same URL for valid id %j', async (good) => {
        const { ctx, request } = makeContext(c.params(good));
        await c.run(ctx).catch(() => undefined);
        const last = request.mock.calls.at(-1)?.[1] as IDataObject;
        expect(last.method).toBe(c.method);
        expect(last.url).toBe(`${BASE}${c.url}`);
      });
    });
  }
});

describe('coercePositiveInt', () => {
  it.each([[12, 12], ['12', 12], [' 7 ', 7]])('accepts %j', (input, expected) => {
    expect(coercePositiveInt(input, node)).toBe(expected);
  });

  it.each([...MALFORMED, 0, '', ' ', null, undefined, '1e3', '0x10', true, Number.NaN, 2 ** 53, {}])(
    'rejects %j',
    (input) => {
      expect(() => coercePositiveInt(input, node, 'Test ID')).toThrow(/Invalid Test ID/);
    },
  );
});

describe('assertSafeEndpoint', () => {
  it.each(['/companies', '/companies/7/assets/12/move_layout', '/api_info'])('allows %s', (endpoint) => {
    expect(() => assertSafeEndpoint(node, endpoint)).not.toThrow();
  });

  it.each(['', '/', 'companies', '/assets/../users', '/assets/1?x=y', '/assets/1#z', '/assets//1', '/assets/1%2F2', '/assets/1.5', '/assets/ 1'])(
    'rejects %j',
    (endpoint) => {
      expect(() => assertSafeEndpoint(node, endpoint)).toThrow(/invalid request path/);
    },
  );
});
