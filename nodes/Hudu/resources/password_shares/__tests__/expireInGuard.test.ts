import { describe, it, expect, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handlePasswordSharesOperation } from '../password_shares.handler';

const node = { name: 'Hudu', type: 'hudu', typeVersion: 1, position: [0, 0], parameters: {} } as never;
const BASE = 'https://demo.hudu.example/api/v1';

function makeContext(params: IDataObject) {
  const request = vi.fn(async () => ({
    share: { id: 99, url: 'https://demo.hudu.example/pwshare/ABC', password: 'hunter2' },
  }));
  const ctx = {
    getNode: () => node,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    getCredentials: async () => ({ baseUrl: 'https://demo.hudu.example' }),
    helpers: {
      httpRequestWithAuthentication: request,
    },
  };
  return { ctx: ctx as unknown as IExecuteFunctions, request };
}

async function createShare(params: IDataObject) {
  const { ctx, request } = makeContext(params);
  await handlePasswordSharesOperation.call(ctx, 'create', 0);
  const opts = request.mock.calls[0][1] as IDataObject;
  return { request, wire: opts.body.share as IDataObject, method: opts.method, url: opts.url };
}

describe('password_shares create: expire_in guard', () => {
  it('does not let additionalFields expire_in 315360000 overwrite the validated value', async () => {
    const { wire, method, url } = await createShare({
      asset_password_id: 42,
      expire_in: 3600,
      additionalFields: { expire_in: 315360000 },
    });
    expect(method).toBe('POST');
    expect(url).toBe(`${BASE}/asset_passwords/42/shares`);
    expect(wire.expire_in).toBe(3600);
  });

  it('does not let additionalFields expire_in 0 (never-expire) reach the wire', async () => {
    const { wire } = await createShare({
      asset_password_id: 42,
      expire_in: 3600,
      additionalFields: { expire_in: 0 },
    });
    expect(wire.expire_in).toBe(3600);
  });

  it('still forwards declared additional fields while skipping expire_in', async () => {
    const { wire } = await createShare({
      asset_password_id: 42,
      expire_in: 3600,
      additionalFields: { notes: 'n', one_time_expire: true, include_otp: false, expire_in: 315360000 },
    });
    expect(wire).toEqual({ expire_in: 3600, notes: 'n', one_time_expire: true, include_otp: false });
  });

  it.each([
    ['zero', 0],
    ['negative value', -5],
    ['fractional value', 1.5],
    ['non-numeric value', Number.NaN],
  ])('rejects direct expire_in %s before any request', async (_label, bad) => {
    const { ctx, request } = makeContext({ asset_password_id: 42, expire_in: bad, additionalFields: {} });
    await expect(handlePasswordSharesOperation.call(ctx, 'create', 0)).rejects.toThrow(/positive integer/);
    expect(request).not.toHaveBeenCalled();
  });

  it('rejects expire_in above the 1-year maximum (31536001) before any request', async () => {
    const { ctx, request } = makeContext({ asset_password_id: 42, expire_in: 31536001, additionalFields: {} });
    await expect(handlePasswordSharesOperation.call(ctx, 'create', 0)).rejects.toThrow(/1 and 31536000/);
    expect(request).not.toHaveBeenCalled();
  });

  it('accepts expire_in at the 1-year maximum (31536000 boundary)', async () => {
    const { wire } = await createShare({ asset_password_id: 42, expire_in: 31536000, additionalFields: {} });
    expect(wire.expire_in).toBe(31536000);
  });

  it('still accepts expire_in: 1', async () => {
    const { wire } = await createShare({ asset_password_id: 42, expire_in: 1, additionalFields: {} });
    expect(wire.expire_in).toBe(1);
  });
});
