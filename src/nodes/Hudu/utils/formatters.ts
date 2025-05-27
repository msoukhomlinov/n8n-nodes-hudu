import { IDataObject } from 'n8n-workflow';

/**
 * String formatting utilities
 */

/**
 * Formats a string to title case and replaces underscores with spaces
 * Example: "hello_world_test" -> "Hello World Test"
 */
export function formatTitleCase(str: string): string {
  // First split by underscores
  return str
    .split('_')
    // Then split any camelCase words
    .map(word => {
      return word
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .trim() // Remove leading space from first word
        .split(' ') // Split into array of words
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) // Capitalize each word
        .join(' '); // Join back with spaces
    })
    .join(' ');
}

export function toSnakeCase(str: string): string {
	if (!str) return '';
	return str
		.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) // Handle camelCase, PascalCase, and spaces
		?.map(x => x.toLowerCase())
		.join('_') || '';
}

/**
 * Extract field value from an asset's fields array by field label
 * @param fields Array of fields from asset response
 * @param fieldLabel The label of the field to find
 * @returns The field value or null if not found
 */
export function extractFieldValue(fields: IDataObject[], fieldLabel: string): any {
  if (!Array.isArray(fields)) return null;
  
  const field = fields.find(f => f.label === fieldLabel);
  return field ? field.value : null;
}

/**
 * Format custom fields for API payload according to Hudu API requirements
 * @param fields Object with field name/value pairs
 * @returns Array of single-key objects in the format required by Hudu API
 */
export function formatCustomFields(fields: Record<string, any>): IDataObject[] {
  return Object.entries(fields)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({ [toSnakeCase(key)]: value }));
}