import type { IDataObject, IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import {
  handleGetOperation,
  handleGetAllOperation,
  handleCreateOperation,
  handleUpdateOperation,
  handleDeleteOperation,
  handleArchiveOperation,
} from '../utils/operations';
import { HUDU_RESOURCE_CONFIG, type HuduResourceConfig } from './resource-config';
import {
  wrapError,
  ERROR_TYPES,
  formatMissingIdError,
  formatApiError,
  formatNotFoundError,
  formatNoResultsFound,
  buildListResponse,
  buildItemResponse,
  buildMutationResponse,
  buildDeleteResponse,
} from './error-formatter';
import { relationFilterMapping } from '../resources/relations/relations.types';
import { publicPhotoFilterMapping } from '../resources/public_photos/public_photos.types';
import {
  sortByTitleMatch,
  stripContentField,
  stripPhotosField,
  slimPhotoRecord,
  omitDefaults,
  reshapeProcedureRecord,
  reshapeProcedureTaskRecord,
  addArticleMarkdown,
  addAssetFieldMarkdown,
} from './result-processor';
import { runGetIdByName, runMoveAsset, runGetByLayout, GET_ID_BY_NAME_SUPPORTED_RESOURCES } from './enrichment-executor';
import { paginatedPostFilter, type PaginatedPostFilterResult } from './pagination-helper';
import { runHelp, HELP_ENABLED_RESOURCES } from './help-registry';
import { convertMarkdownToHtml } from '../utils/markdown/markdownToHtml';

const EXCLUDED_FILTER_FIELDS = new Set(['limit', 'resource', 'operation']);

// Resources that do NOT support the 'search' parameter in getAll
const NO_SEARCH_RESOURCES = new Set([
  'procedures', 'activity_logs', 'folders', 'networks', 'ip_addresses',
  'asset_layouts', 'relations', 'expirations', 'vlans', 'vlan_zones', 'matchers',
  'photos', 'public_photos', 'procedure_tasks', 'label_types', 'labels',
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
  'record_id',
  'target_company_id',
  'layout_id',
  'label_type_id',
  'labelable_id',
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

/**
 * Strips the client-only content_format flag and, when 'markdown', converts `content`
 * to HTML before it reaches the Hudu API. Mirrors the regular node's contentFormat
 * handling so AI-tools writes behave identically.
 */
function applyContentFormat(params: Record<string, unknown>): Record<string, unknown> {
  const { content_format, ...rest } = params;
  if (content_format === 'markdown' && typeof rest.content === 'string') {
    rest.content = convertMarkdownToHtml(rest.content as string);
  }
  return rest;
}

/**
 * Apply the full read-side shaping pipeline to a single record:
 *   content/photos strip → procedures rename + per-task assignee block
 *   → public_photos slim → omitDefaults (uniform field set per resource).
 * Called from both `get` and `getAll` paths.
 */
function postProcessRecord(
  record: IDataObject,
  resource: string,
  config: HuduResourceConfig,
  includeContent: boolean,
  includePhotos: boolean,
  outputMarkdown: boolean,
  includeFrontmatter: boolean,
): IDataObject {
  let out: IDataObject = record;
  // Markdown must be derived from the raw record BEFORE stripContentField can delete
  // `content` below — include_content and output_markdown are independent flags.
  if (outputMarkdown) {
    if (resource === 'articles') {
      out = addArticleMarkdown(out, includeFrontmatter);
    } else if (resource === 'assets') {
      out = addAssetFieldMarkdown(out);
    }
  }
  if (config.supportsContentField) {
    out = (stripContentField<IDataObject>([out], includeContent, config.contentField) as IDataObject[])[0];
  }
  if (config.supportsPhotosField) {
    out = (stripPhotosField<IDataObject>([out], includePhotos, config.photosField) as IDataObject[])[0];
  }
  if (resource === 'procedures') {
    out = reshapeProcedureRecord(out);
  } else if (resource === 'procedure_tasks') {
    out = reshapeProcedureTaskRecord(out);
  } else if (resource === 'public_photos') {
    out = slimPhotoRecord(out) as IDataObject;
  }
  return omitDefaults(out, resource);
}

async function resolveArticleCreateContext(
  params: Record<string, unknown>,
  context: ISupplyDataFunctions,
): Promise<{ resolvedParams: Record<string, unknown>; errorJson?: string }> {
  const isGlobal = params.global === true;
  const companyId = params.company_id;
  const folderId = params.folder_id;

  // Strip client-only field — never reaches Hudu API
  const rest = Object.fromEntries(
    Object.entries(params).filter(([k]) => k !== 'global'),
  ) as Record<string, unknown>;
  let resolved = rest;

  // global=true wins; strip company_id too
  if (isGlobal) {
    const withoutCompany = Object.fromEntries(
      Object.entries(resolved).filter(([k]) => k !== 'company_id'),
    ) as Record<string, unknown>;
    return { resolvedParams: withoutCompany };
  }

  // company_id present — no resolution needed
  if (companyId !== undefined && companyId !== null) {
    return { resolvedParams: resolved };
  }

  // folder_id present — resolve company_id from folder
  if (folderId !== undefined && folderId !== null) {
    try {
      const folderData = await handleGetOperation.call(
        context as unknown as IExecuteFunctions,
        '/folders',
        folderId as number,
        'folder',
      );
      const folder = folderData as Record<string, unknown>;
      if (folder.company_id !== undefined && folder.company_id !== null) {
        resolved = { ...resolved, company_id: folder.company_id };
      }
      // folder.company_id === null → global folder, proceed without company_id
      return { resolvedParams: resolved };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        resolvedParams: resolved,
        errorJson: JSON.stringify(formatApiError(
          `Folder ${folderId} lookup failed: ${msg}`,
          'articles',
          'create',
        )),
      };
    }
  }

  // No identifiers — require the LLM to provide one
  return {
    resolvedParams: resolved,
    errorJson: JSON.stringify(
      wrapError(
        'articles',
        'create',
        ERROR_TYPES.MISSING_REQUIRED_FIELD,
        'company_id, folder_id, or global=true is required to create an article.',
        'Provide a numeric company_id, a folder_id (company auto-resolved from folder), or set global=true to create a global article. Call hudu_companies_get_id_by_name to resolve a company name to its numeric ID.',
      ),
    ),
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
        // Extract include_content / include_photos before any API call — never sent to API
        const includeContent = (params.include_content as boolean) ?? false;
        const includePhotos = (params.include_photos as boolean) ?? false;
        const outputMarkdown = (params.output_markdown as boolean) ?? false;
        const includeFrontmatter = (params.include_frontmatter as boolean) ?? false;
        delete params.include_content;
        delete params.include_photos;
        delete params.output_markdown;
        delete params.include_frontmatter;

        if (!params.id) {
          return JSON.stringify(formatMissingIdError(resource, operation, supportsSearch));
        }
        // public_photos: API only accepts integer numeric_id — reject slug strings (e.g. 'a1b2c3d4')
        if (resource === 'public_photos' && typeof params.id !== 'number') {
          return JSON.stringify(wrapError(
            resource, operation, ERROR_TYPES.VALIDATION_ERROR,
            'public_photos get requires a numeric integer id (numeric_id), not a slug string.',
            "Pass the integer 'numeric_id' from the article or company response's 'public_photos' array, not the slug string 'id' field.",
          ));
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
        const processed = postProcessRecord(
          data as IDataObject,
          resource,
          config,
          includeContent,
          includePhotos,
          outputMarkdown,
          includeFrontmatter,
        );
        return JSON.stringify(buildItemResponse(processed));
      }

      case 'getAll': {
        // Step 1: capture original params for error formatting (before any translation)
        const originalParams = { ...params };

        // Step 2: extract client-only fields BEFORE params destructure — never sent to API
        const includeContent = (params.include_content as boolean) ?? false;
        const includePhotos = (params.include_photos as boolean) ?? false;
        const outputMarkdown = (params.output_markdown as boolean) ?? false;
        const includeFrontmatter = (params.include_frontmatter as boolean) ?? false;
        delete params.include_content;
        delete params.include_photos;
        delete params.output_markdown;
        delete params.include_frontmatter;

        // Step 3: date combining — no flag needed; these fields only exist on articles schema
        const updatedAtStart = params.updated_at_start as string | undefined;
        const updatedAtEnd = params.updated_at_end as string | undefined;
        delete params.updated_at_start;
        delete params.updated_at_end;
        if (updatedAtStart !== undefined || updatedAtEnd !== undefined) {
          params.updated_at = `${updatedAtStart ?? ''},${updatedAtEnd ?? ''}`;
        }

        // Step 4: name resolution — nameResolutionBaked resources only.
        // Two branches: (a) explicit `name` param → translate to upstream search, wide fetch, rerank.
        //              (b) explicit `search` param (no name) → keep search, wide fetch, rerank to
        //                  promote full-title-substring matches over generic search hits.
        let capturedName: string | undefined;
        let userLimit = 25;
        if (config.nameResolutionBaked && params.name) {
          capturedName = params.name as string;
          userLimit = (params.limit as number) ?? 25;
          delete params.search;       // name wins if both provided
          delete params.name;
          params.search = capturedName;
          params.limit = 100;         // wide candidate pool for re-ranking
        } else if (config.nameResolutionBaked && params.search && !params.name) {
          capturedName = params.search as string;
          userLimit = (params.limit as number) ?? 25;
          params.limit = 100;         // wide candidate pool for re-ranking
        }

        // Step 4a: pre-resolve folder→company for articles+folder_id calls.
        // Hudu /articles does NOT accept folder_id as a query param, so folder_id is applied
        // via bounded post-filter. When the caller did not supply company_id, look the folder
        // up once and inject its company_id as a NATIVE upstream filter — drastically narrows
        // the scan window (sparse folders no longer get lost beyond the page cap). Folders are
        // owned by a single company OR are global; only inject when non-global.
        let folderCompanyResolved: { folderId: number; companyId: number } | undefined;
        if (
          resource === 'articles' &&
          typeof params.folder_id === 'number' &&
          params.company_id === undefined
        ) {
          try {
            const folderData = await handleGetOperation.call(
              context as unknown as IExecuteFunctions,
              '/folders',
              params.folder_id as number,
              'folder',
            );
            const folder = folderData as Record<string, unknown> | null;
            const folderCompanyId = folder?.company_id;
            if (typeof folderCompanyId === 'number') {
              params.company_id = folderCompanyId;
              folderCompanyResolved = {
                folderId: params.folder_id as number,
                companyId: folderCompanyId,
              };
            }
          } catch {
            // Folder lookup failed (404, network, etc.) — fall through to unnarrowed scan.
          }
        }

        // Step 4b: strip filters that the upstream Hudu API does NOT support as query params
        // but are declared on our schemas — we apply them client-side as post-filters after fetch.
        // Map: resource → declared-but-unsupported filter names + the response-item field they match.
        const articlesFolderIdPostFilter =
          resource === 'articles' && typeof params.folder_id === 'number'
            ? (params.folder_id as number)
            : undefined;
        if (articlesFolderIdPostFilter !== undefined) {
          delete params.folder_id; // never forward — Hudu silently ignores it
        }

// Step 5: existing destructure + buildFilters + API call
        // When capturedName is set, params.limit is already 100 so effectiveLimit = 100.
        const { limit = 25, ...filterParams } = params;
        const effectiveLimit = limit as number;
        const filters = buildFilters(filterParams);
        const hasFilters = Object.keys(filters).length > 0;
        let records: IDataObject[];
        // Truncation accuracy: for the standard path, fetch effectiveLimit+1 to probe whether more
        // records existed upstream. Skip the probe for nameResolutionBaked (already fetches a wide
        // 100-candidate pool that gets re-ranked and sliced to userLimit — its truncation note is
        // already correctly suppressed by the userLimit < 100 condition) and for resources using
        // post-process filtering (relations, public_photos — slice happens inside handleListing)
        // and for bounded-pagination paths (articles+folder_id — paginatedPostFilter owns truncation).
        const wantsProbe =
          !capturedName &&
          resource !== 'relations' &&
          resource !== 'public_photos' &&
          articlesFolderIdPostFilter === undefined;
        const fetchLimit = wantsProbe ? effectiveLimit + 1 : effectiveLimit;
        let upstreamHasMore = false;
        let folderIdScanStats: PaginatedPostFilterResult<IDataObject> | undefined;
        // Relations and public_photos use client-side post-process filtering (API has no server-side filters)
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
        } else if (resource === 'public_photos') {
          records = await handleGetAllOperation.call(
            context as unknown as IExecuteFunctions,
            config.endpoint,
            config.pluralKey ?? undefined,
            {},
            false,
            effectiveLimit,
            filters as IDataObject,
            publicPhotoFilterMapping,
          );
        } else if (articlesFolderIdPostFilter !== undefined) {
          // Bounded paginated scan — articles+folder_id. Hudu /articles does NOT accept folder_id
          // as a query param; pages upstream until limit matches collected, upstream exhausted,
          // or page cap hit. Owns its own truncation signalling via scan stats.
          folderIdScanStats = await paginatedPostFilter<IDataObject>(
            context,
            config.endpoint,
            config.pluralKey ?? 'articles',
            filters,
            (item) => item.folder_id === articlesFolderIdPostFilter,
            effectiveLimit,
          );
          records = folderIdScanStats.items;
        } else {
          records = await handleGetAllOperation.call(
            context as unknown as IExecuteFunctions,
            config.endpoint,
            config.pluralKey ?? undefined,
            filters,
            false,
            fetchLimit,
          );
          if (wantsProbe && records.length > effectiveLimit) {
            upstreamHasMore = true;
            records = records.slice(0, effectiveLimit);
          }
        }

        // Step 6: title sort — nameResolutionBaked resources only.
        // Explicit generic + cast: sortByTitleMatch<T> returns T[], TS won't re-narrow to IDataObject[].
        // Truncation note naturally suppressed: records.length (≤ userLimit e.g. 25) < effectiveLimit (100).
        if (capturedName) {
          records = sortByTitleMatch<IDataObject>(records, capturedName) as IDataObject[];
          records = records.slice(0, userLimit);
        }

        // Step 6c: folder_id post-filter is now applied inside paginatedPostFilter (folderIdScanStats path) —
        // no additional client-side filter needed here.

        // Step 7: per-record shaping pipeline (content/photos strip, procedure rename, photo slim,
        // omitDefaults). Uniform application → identical field sets across same-resource records.
        records = records.map((record) =>
          postProcessRecord(
            record as IDataObject,
            resource,
            config,
            includeContent,
            includePhotos,
            outputMarkdown,
            includeFrontmatter,
          ),
        ) as IDataObject[];

        // Step 8: zero-results error — build presentation filters from originalParams so
        // the LLM sees name: "..." not the translated search: "...".
        // hasFilters is derived from post-translation filterParams (search replaces name),
        // which is consistent: if name was provided, search takes its place and hasFilters = true.
        if (records.length === 0 && hasFilters) {
          const presentationFilters = buildFilters(
            Object.fromEntries(
              Object.entries(originalParams).filter(
                ([k]) =>
                  !['include_content', 'include_photos', 'limit', 'resource', 'operation', 'updated_at_start', 'updated_at_end'].includes(k),
              ),
            ),
          );
          return JSON.stringify(
            formatNoResultsFound(resource, operation, presentationFilters as Record<string, unknown>),
          );
        }

        // Truncation signal hierarchy (`truncated: true` is the only signal — no prose note,
        // remediation is in the tool description and tool descriptions already cover increasing limit):
        //   1. paginatedPostFilter capHit (articles+folder_id path) — more matches may exist beyond the scan cap
        //   2. upstreamHasMore (+1 probe on the standard path)
        //   3. length-equals-limit heuristic (post-process-filtered paths only; nameResolutionBaked already suppresses naturally)
        const truncated =
          (folderIdScanStats?.capHit ?? false) ||
          upstreamHasMore ||
          (!wantsProbe && folderIdScanStats === undefined && records.length >= effectiveLimit);
        const warnings: string[] = [];
        if (folderCompanyResolved !== undefined) {
          warnings.push(
            `folder_id auto-resolved: Folder ${folderCompanyResolved.folderId} → company_id ${folderCompanyResolved.companyId} auto-resolved and injected as a native upstream filter.`,
          );
        }
        if (folderIdScanStats !== undefined) {
          warnings.push(
            `folder_id scan: Hudu /articles API does not accept folder_id as a query param. Matches collected via bounded pagination (${folderIdScanStats.pagesScanned} page(s), ${folderIdScanStats.recordsScanned} records scanned, ${folderIdScanStats.exhausted ? 'upstream exhausted' : folderIdScanStats.capHit ? 'cap reached — more may exist' : 'limit satisfied'}).`,
          );
        }
        return JSON.stringify(buildListResponse(records, records.length, truncated, warnings.length ? warnings : undefined));
      }

      case 'create': {
        // Articles: resolve company_id from folder_id if absent, handle global flag
        let createParams = params;
        if (resource === 'articles') {
          const { resolvedParams, errorJson } = await resolveArticleCreateContext(params, context);
          if (errorJson) return errorJson;
          createParams = applyContentFormat(resolvedParams);
        }

        // For company-endpoint resources (assets), strip company_id from body and
        // use it for endpoint routing instead. For all other resources, company_id
        // must remain in the body as a regular API field.
        const { endpoint, fields } = getWriteEndpointAndFields(
          createParams,
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
        return JSON.stringify(buildMutationResponse('created', { id: (entity as IDataObject)?.id, ...entity as IDataObject }));
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
        const updateParams = resource === 'articles' ? applyContentFormat(withoutId) : withoutId;
        const { endpoint: baseEndpoint, fields } = getWriteEndpointAndFields(
          updateParams,
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
        return JSON.stringify(buildMutationResponse('updated', { id, ...entity as IDataObject }));
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
        return JSON.stringify(buildDeleteResponse(params.id as number));
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
        return JSON.stringify(buildMutationResponse(
          operation === 'archive' ? 'archived' : 'unarchived',
          { id: params.id },
        ));
      }

      case 'getIdByName': {
        if (!GET_ID_BY_NAME_SUPPORTED_RESOURCES.includes(resource)) {
          return JSON.stringify(wrapError(
            resource, operation, ERROR_TYPES.UNKNOWN_RESOURCE,
            `getIdByName is not supported for resource: ${resource}.`,
            `Supported resources: ${GET_ID_BY_NAME_SUPPORTED_RESOURCES.join(', ')}.`,
          ));
        }
        return runGetIdByName(context, resource, params);
      }

      case 'move': {
        if (resource !== 'assets') {
          return JSON.stringify(wrapError(
            resource, operation, ERROR_TYPES.INVALID_OPERATION,
            `move is only supported for assets, not ${resource}.`,
            'Call hudu_assets with operation move.',
          ));
        }
        return runMoveAsset(context, params);
      }

      case 'getByLayout': {
        if (resource !== 'assets') {
          return JSON.stringify(wrapError(
            resource, operation, ERROR_TYPES.INVALID_OPERATION,
            `getByLayout is only supported for assets, not ${resource}.`,
            'Call hudu_assets with operation getByLayout.',
          ));
        }
        return runGetByLayout(context, params);
      }

      case 'help': {
        if (!HELP_ENABLED_RESOURCES.includes(resource)) {
          return JSON.stringify(wrapError(
            resource, operation, ERROR_TYPES.INVALID_OPERATION,
            `help is not registered for ${resource}.`,
            `Resources with help topics: ${HELP_ENABLED_RESOURCES.join(', ')}.`,
          ));
        }
        return runHelp(resource, params);
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
    if (error instanceof TypeError || error instanceof ReferenceError || error instanceof RangeError) {
      return JSON.stringify(wrapError(
        resource,
        operation,
        ERROR_TYPES.INTERNAL_ERROR,
        `Tool internal error: ${msg}`,
        'Do not retry with the same parameters — this is a bug in the tool.',
      ));
    }
    return JSON.stringify(formatApiError(msg, resource, operation, supportsSearch));
  }
}
