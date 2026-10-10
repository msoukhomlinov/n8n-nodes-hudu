/**
 * Validation utilities for Hudu integration
 * 
 * Provides functionality for:
 * - Input validation for common fields
 * - Type checking and conversion
 * - Standardised error messages
 */

import type { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Coerces a record ID (or any other path/body ID) to a positive integer.
 * Accepts a positive safe integer, or a string of digits (surrounding whitespace ignored).
 * Rejects anything else ("12abc", "../x", "-1", "1.5", "1e3", "0x10", "1?x=y") so a
 * malformed value can never reach a request path. Throws before any request is made.
 */
export function coercePositiveInt(
  value: unknown,
  node: INode,
  fieldName: string = 'ID',
  itemIndex?: number,
): number {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  const num =
    typeof trimmed === 'number'
      ? trimmed
      : typeof trimmed === 'string' && /^[0-9]+$/.test(trimmed)
        ? Number(trimmed)
        : Number.NaN;
  if (!Number.isSafeInteger(num) || num < 1) {
    throw new NodeOperationError(
      node,
      `Invalid ${fieldName}: ${JSON.stringify(value) ?? String(value)}. Expected a positive integer. If you are using expressions, make sure to reference the ID field.`,
      itemIndex === undefined ? {} : { itemIndex },
    );
  }
  return num;
}

/**
 * Type guard to check if a value is a valid company ID
 */
export function isValidCompanyId(value: unknown): value is number {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return false;
  }
  
  const numValue = Number(value);
  return !isNaN(numValue) && Number.isInteger(numValue) && numValue > 0;
} 