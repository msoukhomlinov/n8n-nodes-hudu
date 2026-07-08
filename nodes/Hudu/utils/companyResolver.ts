/**
 * Company name-or-ID resolution for foreign-key company inputs.
 *
 * n8n company fields use a getCompanies dropdown whose option value is the numeric
 * company id, but users can also supply a value via expression — including a company
 * NAME. This resolver accepts either: a numeric id short-circuits with no API call; a
 * non-numeric string is treated as a company name and resolved via /companies?search=,
 * matched case-insensitively and exactly. Mirrors magic_dash's resolveCompanyName in
 * the opposite (name→id) direction.
 */

import type { IExecuteFunctions, INode, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleListing } from './requestUtils';

interface HuduCompanyLite extends IDataObject {
  id: number;
  name: string;
}

/**
 * Pure: all companies whose name equals `name` case-insensitively (trimmed).
 * Extracted for standalone testability.
 */
export function matchCompaniesByName<T extends { id: number; name?: string }>(
  companies: T[],
  name: string,
): T[] {
  const target = name.trim().toLowerCase();
  return companies.filter(
    (c) => typeof c?.name === 'string' && c.name.trim().toLowerCase() === target,
  );
}

/**
 * Resolve a company value (numeric id OR company name) to a numeric id.
 * Returns undefined for empty input (caller decides whether that is an error).
 */
export async function resolveCompanyId(
  context: IExecuteFunctions,
  value: unknown,
  node: INode,
  fieldName: string = 'Company ID',
): Promise<number | undefined> {
  // Empty → let the caller decide required-ness.
  if (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return undefined;
  }

  // Valid positive-integer id → short-circuit, no API call.
  const num = Number(value);
  if (!isNaN(num) && Number.isInteger(num) && num > 0) {
    return num;
  }

  // Numeric but invalid (0, negative, non-integer) → reject as before.
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(num))) {
    throw new NodeOperationError(
      node,
      `Invalid ${fieldName}: "${value}". Expected a positive integer or an existing company name.`,
    );
  }

  // Non-numeric string → treat as a company name and resolve via the API.
  const name = String(value).trim();
  const companies = (await handleListing.call(
    context,
    'GET',
    '/companies',
    'companies',
    {},
    { search: name },
    true,
    0,
  )) as HuduCompanyLite[];

  const matches = matchCompaniesByName(Array.isArray(companies) ? companies : [], name);

  if (matches.length === 0) {
    throw new NodeOperationError(
      node,
      `No company found with name "${name}" for ${fieldName}. Check the name, or supply the company's numeric ID.`,
    );
  }
  if (matches.length > 1) {
    throw new NodeOperationError(
      node,
      `Multiple companies match name "${name}" for ${fieldName} (IDs: ${matches
        .map((m) => m.id)
        .join(', ')}). Supply the numeric ID to disambiguate.`,
    );
  }
  return matches[0].id;
}

/**
 * Same as resolveCompanyId but throws on empty — drop-in async replacement for
 * validateCompanyId at required call sites.
 */
export async function resolveRequiredCompanyId(
  context: IExecuteFunctions,
  value: unknown,
  node: INode,
  fieldName: string = 'Company ID',
): Promise<number> {
  const resolved = await resolveCompanyId(context, value, node, fieldName);
  if (resolved === undefined) {
    throw new NodeOperationError(node, `${fieldName} cannot be empty`);
  }
  return resolved;
}
