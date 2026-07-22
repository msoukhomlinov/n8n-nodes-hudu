import type { IDataObject, IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { handleCreateOperation, handleGetOperation } from '../utils/operations';
import {
  handleMagicDashGetAllOperation,
} from '../utils/operations/magic_dash';
import { convertMarkdownToHtml } from '../utils/markdown/markdownToHtml';
import { addMagicDashMarkdown } from './result-processor';
import {
  wrapError,
  ERROR_TYPES,
  formatMissingIdError,
  formatNotFoundError,
  formatNoResultsFound,
  buildItemResponse,
  buildListResponse,
  buildMutationResponse,
} from './error-formatter';

const MAGIC_DASH_ENDPOINT = '/magic_dash';

/**
 * Executes Magic Dash AI-tool operations. Magic Dash is not a standard CRUD
 * resource: it has no GET /magic_dash/{id} endpoint (get filters an all-fetch by
 * id), getAll returns a bare array with company_id/title filters, and writes go
 * through a single createOrUpdate keyed by title + company_name. Read operations
 * honour output_markdown / include_frontmatter; the write honours content_format.
 */
export async function runMagicDash(
  context: ISupplyDataFunctions,
  operation: string,
  params: Record<string, unknown>,
): Promise<string> {
  switch (operation) {
    case 'get': {
      const outputMarkdown = (params.output_markdown as boolean) ?? false;
      const includeFrontmatter = (params.include_frontmatter as boolean) ?? false;
      if (!params.id) {
        return JSON.stringify(formatMissingIdError('magic_dash', operation, false));
      }
      const items = await handleMagicDashGetAllOperation.call(
        context as unknown as IExecuteFunctions,
        {},
        true,
      );
      const item = items.find((it) => it.id === params.id);
      if (!item) {
        return JSON.stringify(formatNotFoundError('magic_dash', operation, params.id as number, false));
      }
      const processed = outputMarkdown ? addMagicDashMarkdown(item, includeFrontmatter) : item;
      return JSON.stringify(buildItemResponse(processed));
    }

    case 'getAll': {
      const outputMarkdown = (params.output_markdown as boolean) ?? false;
      const includeFrontmatter = (params.include_frontmatter as boolean) ?? false;
      const limit = (params.limit as number) ?? 25;

      const filters: IDataObject = {};
      if (params.company_id !== undefined && params.company_id !== null) {
        filters.company_id = params.company_id as IDataObject[string];
      }
      if (params.title !== undefined && params.title !== null && params.title !== '') {
        filters.title = params.title as IDataObject[string];
      }

      // Probe with limit + 1 so exactly-`limit` result sets are not falsely flagged as
      // truncated: the bespoke pagination already slices to its limit, so the standard
      // getAll path's +1 probe is reproduced here.
      let items = await handleMagicDashGetAllOperation.call(
        context as unknown as IExecuteFunctions,
        filters,
        false,
        (limit + 1) as 25,
      );

      if (items.length === 0 && Object.keys(filters).length > 0) {
        return JSON.stringify(
          formatNoResultsFound('magic_dash', operation, filters as Record<string, unknown>),
        );
      }

      const truncated = items.length > limit;
      if (truncated) items = items.slice(0, limit);

      if (outputMarkdown) {
        items = items.map((it) => addMagicDashMarkdown(it, includeFrontmatter));
      }

      return JSON.stringify(buildListResponse(items, items.length, truncated));
    }

    case 'createOrUpdate': {
      if (!params.title || !params.company_id || !params.message) {
        return JSON.stringify(
          wrapError(
            'magic_dash',
            operation,
            ERROR_TYPES.MISSING_REQUIRED_FIELD,
            'title, company_id, and message are all required to create or update a Magic Dash item.',
            'Provide title, a numeric company_id, and message. Use hudu_companies with operation getIdByName to resolve a company name to its ID.',
          ),
        );
      }

      const contentFormat = (params.content_format as string) ?? 'html';
      let content = params.content as string | undefined;
      if (content && contentFormat === 'markdown') {
        content = convertMarkdownToHtml(content);
      }

      // Magic Dash keys items by company_name (string), not company_id — resolve first.
      const company = (await handleGetOperation.call(
        context as unknown as IExecuteFunctions,
        '/companies',
        String(params.company_id),
        'company',
      )) as IDataObject;
      if (!company || !company.name) {
        throw new Error(`Company with ID ${params.company_id} not found`);
      }
      const companyName = company.name as string;

      const body: IDataObject = {
        message: params.message,
        company_name: companyName,
        title: params.title,
      };
      if (content) body.content = content;
      if (params.content_link) body.content_link = params.content_link;
      if (params.icon) body.icon = params.icon;
      if (params.image_url) body.image_url = params.image_url;
      if (params.shade) body.shade = params.shade;

      // Mutually exclusive fields — mirror the regular node's handling.
      if (body.content && body.content_link) delete body.content_link;
      if (body.icon && body.image_url) delete body.image_url;

      const data = await handleCreateOperation.call(
        context as unknown as IExecuteFunctions,
        MAGIC_DASH_ENDPOINT,
        body,
      );
      const entity =
        data && typeof data === 'object' && !Array.isArray(data) && (data as IDataObject).magic_dash
          ? (data as IDataObject).magic_dash
          : data;
      return JSON.stringify(buildMutationResponse('upserted', entity));
    }

    default:
      return JSON.stringify(
        wrapError(
          'magic_dash',
          operation,
          ERROR_TYPES.INVALID_OPERATION,
          `Unsupported operation for Magic Dash: ${operation}`,
          'Magic Dash supports get, getAll, and createOrUpdate.',
        ),
      );
  }
}
