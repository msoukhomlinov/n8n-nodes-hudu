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
import { sortByTitleMatch, stripContentField } from './result-processor';

const EXCLUDED_FILTER_FIELDS = new Set(['limit', 'resource', 'operation']);

// Resources that do NOT support the 'search' parameter in getAll
const NO_SEARCH_RESOURCES = new Set([
  'procedures', 'activity_logs', 'folders', 'networks', 'ip_addresses',
  'asset_layouts', 'relations', 'expirations', 'vlans', 'vlan_zones', 'matchers',
  'photos', 'procedure_tasks',
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
  'parent_process_id',
  'photoable_id',
  'parent_task_id',
  'procedure_id',
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
 * Agent Tool Node v3 injects $fromAI()-generated keys with these prefixes (e.g. Prompt__User_Message_).
 * Strip them from execute() path params before forwarding to the Hudu API.
 */
const N8N_METADATA_PREFIXES = ['Prompt__'];

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
    if (N8N_METADATA_FIELDS.has(key)) continue;
    if (N8N_METADATA_PREFIXES.some((p) => key.startsWith(p))) continue;
    params[key] = value;
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
        // Extract include_content before any API call — never sent to API
        const includeContent = (params.include_content as boolean) ?? false;
        delete params.include_content;

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
        const result = config.supportsContentField
          ? (stripContentField<IDataObject>([data as IDataObject], includeContent) as IDataObject[])[0]
          : data;
        return JSON.stringify(wrapSuccess(resource, operation, result));
      }

      case 'getAll': {
        // Step 1: capture original params for error formatting (before any translation)
        const originalParams = { ...params };

        // Step 2: extract client-only fields BEFORE params destructure — never sent to API
        const includeContent = (params.include_content as boolean) ?? false;
        delete params.include_content;

        // Step 3: date combining — no flag needed; these fields only exist on articles schema
        const updatedAtStart = params.updated_at_start as string | undefined;
        const updatedAtEnd = params.updated_at_end as string | undefined;
        delete params.updated_at_start;
        delete params.updated_at_end;
        if (updatedAtStart !== undefined || updatedAtEnd !== undefined) {
          params.updated_at = `${updatedAtStart ?? ''},${updatedAtEnd ?? ''}`;
        }

        // Step 4: name resolution — nameResolutionBaked resources only
        let capturedName: string | undefined;
        let userLimit = 25;
        if (config.nameResolutionBaked && params.name) {
          capturedName = params.name as string;
          userLimit = (params.limit as number) ?? 25;
          delete params.search;       // name wins if both provided
          delete params.name;
          params.search = capturedName;
          params.limit = 100;         // wide candidate pool for re-ranking
        }

        // Step 5: existing destructure + buildFilters + API call
        // When capturedName is set, params.limit is already 100 so effectiveLimit = 100.
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

        // Step 6: title sort — nameResolutionBaked resources only.
        // Explicit generic + cast: sortByTitleMatch<T> returns T[], TS won't re-narrow to IDataObject[].
        // Truncation note naturally suppressed: records.length (≤ userLimit e.g. 25) < effectiveLimit (100).
        if (capturedName) {
          records = sortByTitleMatch<IDataObject>(records, capturedName) as IDataObject[];
          records = records.slice(0, userLimit);
        }

        // Step 7: content stripping — supportsContentField resources only.
        if (config.supportsContentField) {
          records = stripContentField<IDataObject>(records, includeContent) as IDataObject[];
        }

        // Step 8: zero-results error — build presentation filters from originalParams so
        // the LLM sees name: "..." not the translated search: "...".
        // hasFilters is derived from post-translation filterParams (search replaces name),
        // which is consistent: if name was provided, search takes its place and hasFilters = true.
        if (records.length === 0 && hasFilters) {
          const presentationFilters = buildFilters(
            Object.fromEntries(
              Object.entries(originalParams).filter(
                ([k]) =>
                  !['include_content', 'limit', 'resource', 'operation', 'updated_at_start', 'updated_at_end'].includes(k),
              ),
            ),
          );
          return JSON.stringify(
            formatNoResultsFound(resource, operation, presentationFilters as Record<string, unknown>),
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
