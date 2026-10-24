import { describe, it, expect, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { handleAssetLayoutFieldOperation } from '../asset_layout_fields.handler';

const node = { name: 'Hudu', type: 'hudu', typeVersion: 1, position: [0, 0], parameters: {} } as never;

const LAYOUT_FIELDS = [
  { id: 11, label: 'First Field', field_type: 'Text', show_in_list: true, required: false, position: 1 },
  { id: 22, label: 'Monthly Cost', field_type: 'Number', number_type: 'currency', currency_code: 'USD', show_in_list: true, required: false, position: 2 },
];

function makeContext(params: IDataObject) {
  // The handler GETs the layout first, then PUTs the modified fields array;
  // both requests get the same response shape.
  const request = vi.fn(async () => ({ asset_layout: { id: 7, name: 'Layout', fields: LAYOUT_FIELDS } }));
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

function putWireFields(request: { mock: { calls: unknown[][] } }): IDataObject[] {
  const put = request.mock.calls.find(([, opts]) => (opts as IDataObject).method === 'PUT')?.[1] as IDataObject;
  expect(put.url).toBe('https://demo.hudu.example/api/v1/asset_layouts/7');
  return (put.body.asset_layout as IDataObject).fields as IDataObject[];
}

async function run(operation: 'create' | 'update', params: IDataObject) {
  const { ctx, request } = makeContext(params);
  await handleAssetLayoutFieldOperation.call(ctx, operation, 0);
  return putWireFields(request);
}

describe('asset_layout_fields update: located field identity is pinned', () => {
  it('does not let an updateFields id retarget the PUT to a foreign field', async () => {
    const fields = await run('update', {
      asset_layout_id: '7',
      field_id: '11',
      assetLayoutFieldUpdateFields: { label: 'Renamed', id: 22 },
    });
    expect(fields).toHaveLength(2);
    expect(fields[0]).toEqual({ id: 11, label: 'Renamed', field_type: 'Text', show_in_list: true, required: false, position: 1 });
    // the untouched second field keeps its own identity
    expect(fields[1].id).toBe(22);
    expect(fields[1].label).toBe('Monthly Cost');
  });
});

describe('asset_layout_fields create: declared parameters win', () => {
  it('drops a client-chosen id from additionalFields (vendor create contract has no id)', async () => {
    const fields = await run('create', {
      asset_layout_id: '7',
      field_type: 'Text',
      label: 'New Field',
      additionalFields: { id: 99, required: true },
    });
    const created = fields[fields.length - 1];
    expect(created.label).toBe('New Field');
    expect(created.field_type).toBe('Text');
    expect(created.id).toBeUndefined();
    // genuinely extra keys still pass through
    expect(created.required).toBe(true);
  });

  it('does not let additionalFields override the declared label or field_type', async () => {
    const fields = await run('create', {
      asset_layout_id: '7',
      field_type: 'Number',
      label: 'Declared Label',
      additionalFields: { label: 'Overridden', field_type: 'Text', number_type: 'currency', currency_code: 'USD' },
    });
    const created = fields[fields.length - 1];
    expect(created.label).toBe('Declared Label');
    expect(created.field_type).toBe('Number');
    expect(created.number_type).toBe('currency');
    expect(created.currency_code).toBe('USD');
  });
});
