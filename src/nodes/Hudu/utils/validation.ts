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
 * Validates and converts a company ID value to a number
 * Throws an error if validation fails
 */
export function validateCompanyId(value: unknown, node: INode, fieldName: string = 'Company ID'): number {
  // Handle empty values
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    throw new NodeOperationError(node, `${fieldName} cannot be empty`);
  }
  
  // Convert to number and validate
  const numValue = Number(value);
  if (isNaN(numValue) || !Number.isInteger(numValue) || numValue < 1) {
    throw new NodeOperationError(
      node,
      `Invalid ${fieldName}: "${value}". Expected a positive integer. If you are using expressions, make sure to reference the ID field.`
    );
  }
  
  return numValue;
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