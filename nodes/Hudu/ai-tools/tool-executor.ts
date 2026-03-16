import type { IDataObject, IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import {
  handleGetOperation,
  handleGetAllOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../utils/operations';
import { HUDU_RESOURCE_CONFIG } from './resource-config';
import {
  wrapSuccess,
  wrapError,
  ERROR_TYPES,
  formatMissingIdError,
  formatApiError,
  formatNotFoundError,
  formatNoResultsFound,
} from './error-formatter';
import { relationFilterMapping } from '../resources/relations/relations.types';

const EXCLUDED_FILTER_FIELDS = new Set(['limit', 'resource', 'operation']);

// Resources that do NOT support the 'search' parameter in getAll
const NO_SEARCH_RESOURCES = new Set([
  'procedures', 'activity_logs', 'folders', 'networks', 'ip_addresses',
  'asset_layouts', 'relations', 'expirations', 'vlans', 'vlan_zones', 'matchers',
]);
const NUMERIC_FIELDS = new Set([
  'id',
  'limit',
  'page',
  'company_id',
  'asset_id',
  'asset_layout_id',
  'folder_id',
  'network_id',
  'vlan_zone_id',
  'user_id',
  'resource_id',
  'parent_company_id',
  'parent_folder_id',
  'location_id',
  'integration_id',
  'fromable_id',
  'toable_id',
  'passwordable_id',
  'password_folder_id',
  'potential_company_id',
  'status_list_item_id',
  'role_list_item_id',
  'vlan_id',
]);

/**
 * n8n framework injects these fields into every DynamicStructuredTool call.
 * They must be stripped before forwarding params to the Hudu API.
 */
const N8N_METADATA_FIELDS = new Set([
  'sessionId',
  'action',
  'chatInput',
  'root', // n8n canvas root node UUID — collides with some API params (e.g. organisation root filter)
  'tool',
  'toolName',
  'toolCallId',
  'operation',
]);

/**
 * Strip non-filter params that should not be forwarded as query parameters.
 * Also excludes 'resource' and 'operation' which are executor routing fields,
 * not API filter fields (defence-in-depth for the execute() test path).
 */
function buildFilters(params: Record<string, unknown>): IDataObject {
  const filters: IDataObject = {};
  for (const [key, value] of Object.entries(params)) {
    if (EXCLUDED_FILTER_FIELDS.has(key)) continue;
    if (value === undefined || value === null || value === '') continue;
    filters[key] = value as IDataObject[string];
  }
  return filters;
}

function getWriteEndpointAndFields(
  params: Record<string, unknown>,
  endpoint: string,
  requiresCompanyEndpoint?: boolean,
): { endpoint: string; fields: Record<string, unknown> } {
  if (!requiresCompanyEndpoint) {
    return { endpoint, fields: params };
  }

  const { company_id, ...fields } = params;
  return {
    endpoint: company_id ? `/companies/${company_id}/assets` : endpoint,
    fields,
  };
}

export async function executeHuduAiTool(
  context: ISupplyDataFunctions,
  resource: string,
  operation: string,
  rawParams: Record<string, unknown>,
): Promise<string> {
  // Strip n8n framework metadata injected into every DynamicStructuredTool call
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (!N8N_METADATA_FIELDS.has(key)) params[key] = value;
  }

  // Coerce numeric strings to numbers for known integer fields
  // (LLMs occasionally pass "10" instead of 10)
  for (const key of NUMERIC_FIELDS) {
    if (key in params && typeof params[key] === 'string' && /^\d+$/.test(params[key] as string)) {
      params[key] = parseInt(params[key] as string, 10);
    }
  }

  const config = HUDU_RESOURCE_CONFIG[resource];
  if (!config) {
    return JSON.stringify(wrapError(
      resource, operation, ERROR_TYPES.UNKNOWN_RESOURCE,
      `Unknown resource: ${resource}`,
      'Check that the resource name is valid.',
    ));
  }

  const supportsSearch = !NO_SEARCH_RESOURCES.has(resource);

  try {
    switch (operation) {
      case 'get': {
        if (!params.id) {
          return JSON.stringify(formatMissingIdError(resource, operation, supportsSearch));
        }
        const data = await handleGetOperation.call(
          context as unknown as IExecuteFunctions,
          config.endpoint,
          params.id as number,
          config.singularKey ?? undefined,
        );
        const isMissingData =
          data === null ||
          data === undefined ||
          (Array.isArray(data) && data.length === 0) ||
          (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);
        if (isMissingData) {
          return JSON.stringify(formatNotFoundError(resource, operation, params.id as number, supportsSearch));
        }
        return JSON.stringify(wrapSuccess(resource, operation, data));
      }

      case 'getAll': {
        const { limit = 25, ...filterParams } = params;
        const effectiveLimit = limit as number;
        const filters = buildFilters(filterParams);
        const hasFilters = Object.keys(filters).length > 0;
        let records: IDataObject[];
        // Relations use client-side post-process filtering, not query params
        if (resource === 'relations') {
          records = await handleGetAllOperation.call(
            context as unknown as IExecuteFunctions,
            config.endpoint,
            config.pluralKey ?? undefined,
            {},
            false,
            effectiveLimit,
            filters as IDataObject,
            relationFilterMapping,
          );
        } else {
          records = await handleGetAllOperation.call(
            context as unknown as IExecuteFunctions,
            config.endpoint,
            config.pluralKey ?? undefined,
            filters,
            false,
            effectiveLimit,
          );
        }
        if (records.length === 0 && hasFilters) {
          return JSON.stringify(
            formatNoResultsFound(resource, operation, filters as Record<string, unknown>),
          );
        }
        const resultPayload: Record<string, unknown> = { items: records, count: records.length };
        if (records.length >= effectiveLimit) {
          resultPayload.truncated = true;
          resultPayload.note = `Results capped at ${effectiveLimit}. Use filters to narrow the search or increase 'limit' (max 100).`;
        }
        return JSON.stringify(wrapSuccess(resource, operation, resultPayload));
      }

      case 'create': {
        // For company-endpoint resources (assets), strip company_id from body and
        // use it for endpoint routing instead. For all other resources, company_id
        // must remain in the body as a regular API field.
        const { endpoint, fields } = getWriteEndpointAndFields(
          params,
          config.endpoint,
          config.requiresCompanyEndpoint,
        );
        const body: IDataObject = config.bodyKey
          ? { [config.bodyKey]: fields as IDataObject }
          : (fields as IDataObject);
        const data = await handleCreateOperation.call(
          context as unknown as IExecuteFunctions,
          endpoint,
          body,
        );
        const entity =
          config.singularKey && !Array.isArray(data)
            ? ((data as IDataObject)[config.singularKey] ?? data)
            : data;
        return JSON.stringify(wrapSuccess(resource, operation, {
          id: (entity as IDataObject)?.id,
          ...entity as IDataObject,
        }));
      }

      case 'update': {
        if (!params.id) {
          return JSON.stringify(formatMissingIdError(resource, operation, supportsSearch));
        }
        // id is always removed from body (it's the URL param).
        // company_id is only stripped from body for company-endpoint resources (assets),
        // where it is used for endpoint routing. For all other resources, company_id
        // belongs in the request body as a regular API field.
        const { id, ...withoutId } = params;
        const { endpoint: baseEndpoint, fields } = getWriteEndpointAndFields(
          withoutId,
          config.endpoint,
          config.requiresCompanyEndpoint,
        );
        const body: IDataObject = config.bodyKey
          ? { [config.bodyKey]: fields as IDataObject }
          : (fields as IDataObject);
        const data = await handleUpdateOperation.call(
          context as unknown as IExecuteFunctions,
          baseEndpoint,
          id as number,
          body,
        );
        // Unwrap singularKey for consistency with create (e.g. { company: {...} } → {...})
        const entity =
          config.singularKey && !Array.isArray(data)
            ? ((data as IDataObject)[config.singularKey] ?? data)
            : data;
        return JSON.stringify(wrapSuccess(resource, operation, {
          id,
          ...entity as IDataObject,
        }));
      }

      case 'delete': {
        if (!params.id) {
          return JSON.stringify(formatMissingIdError(resource, operation, supportsSearch));
        }
        const companyId = config.requiresCompanyEndpoint
          ? (params.company_id as number | undefined)
          : undefined;
        await handleDeleteOperation.call(
          context as unknown as IExecuteFunctions,
          config.endpoint,
          params.id as number,
          companyId,
        );
        return JSON.stringify(wrapSuccess(resource, operation, { id: params.id, deleted: true }));
      }

      case 'archive':
      case 'unarchive': {
        if (!params.id) {
          return JSON.stringify(formatMissingIdError(resource, operation, supportsSearch));
        }
        const companyId = config.requiresCompanyEndpoint
          ? (params.company_id as number | undefined)
          : undefined;
        await handleArchiveOperation.call(
          context as unknown as IExecuteFunctions,
          config.endpoint,
          params.id as number,
          operation === 'archive',
          companyId,
        );
        return JSON.stringify(wrapSuccess(resource, operation, {
          id: params.id,
          archived: operation === 'archive',
        }));
      }

      default:
        return JSON.stringify(wrapError(
          resource, operation, ERROR_TYPES.INVALID_OPERATION,
          `Unsupported operation: ${operation}`,
          'Check available operations for this resource.',
        ));
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return JSON.stringify(formatApiError(msg, resource, operation, supportsSearch));
  }
}
