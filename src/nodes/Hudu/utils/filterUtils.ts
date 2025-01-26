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
import { DEBUG_CONFIG, debugLog } from './debugConfig';

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
  results: IDataObject[],
  filters: T,
  filterMapping: Record<string, (item: IDataObject, value: unknown) => boolean>,
): IDataObject[] {
  if (DEBUG_CONFIG.UTIL_FILTERS) {
    debugLog('Filter Processing - Input', {
      resultCount: results.length,
      filters,
      availableFilters: Object.keys(filterMapping),
    });
  }

  try {
    // Apply each filter in sequence
    let filteredResults = [...results];

    for (const [key, value] of Object.entries(filters)) {
      const filterFn = filterMapping[key];
      if (filterFn && value !== undefined && value !== '') {
        if (DEBUG_CONFIG.UTIL_FILTERS) {
          debugLog('Filter Processing - Applying Filter', {
            filter: key,
            value,
            resultCountBefore: filteredResults.length,
          });
        }

        filteredResults = filteredResults.filter(item => filterFn(item, value));

        if (DEBUG_CONFIG.UTIL_FILTERS) {
          debugLog('Filter Processing - Filter Applied', {
            filter: key,
            resultCountAfter: filteredResults.length,
          });
        }
      }
    }

    if (DEBUG_CONFIG.UTIL_FILTERS) {
      debugLog('Filter Processing - Final Results', {
        initialCount: results.length,
        finalCount: filteredResults.length,
      });
    }

    return filteredResults;
  } catch (error) {
    if (DEBUG_CONFIG.UTIL_FILTERS) {
      debugLog('Filter Processing - Error', {
        error,
        message: error instanceof Error ? error.message : String(error),
        level: 'error',
      });
    }
    return results;
  }
} 