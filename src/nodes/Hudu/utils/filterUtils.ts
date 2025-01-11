/**
 * Filter utilities for Hudu API responses
 * 
 * Provides functionality for:
 * - Post-processing API response data
 * - Type-safe filter function mapping
 * - Custom filter application to result sets
 * - Flexible filter chaining and composition
 */

import type { IDataObject } from 'n8n-workflow';

/**
 * Type for filter mapping functions
 */
export type FilterFunction<T> = (item: IDataObject, value: T) => boolean;

/**
 * Type for filter mappings object
 */
export type FilterMapping<T> = {
  [P in keyof T]: FilterFunction<T[P]>;
};

/**
 * Apply post-processing filters to results
 */
export function applyPostFilters<T extends IDataObject>(
  items: T[],
  filters: Record<string, unknown>,
  filterMapping: Record<string, (item: T, value: unknown) => boolean>,
): T[] {
  if (!filters || !filterMapping) return items;

  return items.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null) return true;
      const filterFn = filterMapping[key];
      return filterFn ? filterFn(item, value) : true;
    });
  });
} 