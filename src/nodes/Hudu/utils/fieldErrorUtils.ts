import type { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Creates a NodeOperationError for field mapping errors.
 *
 * @param fieldIdentifier The field label or ID
 * @param reason The reason for the error
 * @param context The n8n node context
 * @param itemIndex Optional item index for error context
 * @returns NodeOperationError
 */
export function createFieldMappingError(
  fieldIdentifier: string,
  reason: string,
  context: INode,
  itemIndex?: number
): NodeOperationError {
  // TODO: Implement detailed error message and logging
  return new NodeOperationError(context, `Field mapping error for '${fieldIdentifier}': ${reason}`, { itemIndex });
}

/**
 * Creates a NodeOperationError for asset not found errors.
 *
 * @param assetId The asset ID
 * @param context The n8n node context
 * @param itemIndex Optional item index for error context
 * @returns NodeOperationError
 */
export function createAssetNotFoundError(
  assetId: number,
  context: INode,
  itemIndex?: number
): NodeOperationError {
  // TODO: Implement detailed error message and logging
  return new NodeOperationError(context, `Asset with ID '${assetId}' not found.`, { itemIndex });
}

/**
 * Creates a NodeOperationError for field validation errors.
 *
 * @param fieldIdentifier The field label or ID
 * @param fieldType The type of the field
 * @param context The n8n node context
 * @param itemIndex Optional item index for error context
 * @returns NodeOperationError
 */
export function createFieldValidationError(
  fieldIdentifier: string,
  fieldType: string,
  context: INode,
  itemIndex?: number
): NodeOperationError {
  // TODO: Implement detailed error message and logging
  return new NodeOperationError(context, `Validation failed for field '${fieldIdentifier}' of type '${fieldType}'.`, { itemIndex });
} 