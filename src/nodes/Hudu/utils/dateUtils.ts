/**
 * Date utilities for Hudu integration
 * 
 * Provides functionality for:
 * - Date range processing (exact dates, ranges, and presets)
 * - ISO 8601 date validation and formatting
 * - Common date range presets (today, yesterday, last N days, etc.)
 * - Date range error handling and validation
 * - Date format conversion (ISO datetime to date-only YYYY-MM-DD)
 */

import { DEBUG_CONFIG, debugLog } from './debugConfig';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last24h'
  | 'last48h'
  | 'last7d'
  | 'last14d'
  | 'last30d'
  | 'last60d'
  | 'last90d'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear';

export interface IDateRange {
  range?: {
    mode: 'exact' | 'range' | 'preset';
    exact?: string;
    start?: string;
    end?: string;
    preset?: DateRangePreset;
  };
}

/**
 * Validate ISO 8601 date string
 */
function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:?\d{2}|Z)?$/.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return date instanceof Date && !Number.isNaN(date.getTime());
}

/**
 * Format date to ISO 8601 with timezone
 */
function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Process date range parameters for filtering
 */
export function processDateRange(dateRange: IDateRange): string | undefined {
  if (!dateRange.range) {
    return undefined;
  }

  if (DEBUG_CONFIG.UTIL_DATE_PROCESSING) {
    debugLog('Date Processing - Input', dateRange);
  }

  try {
    const now = new Date();
    const startDate = new Date();

    switch (dateRange.range.mode) {
      case 'exact':
        if (!dateRange.range.exact) return undefined;
        if (!isValidISODate(dateRange.range.exact)) {
          throw new Error('Invalid exact date format. Expected ISO 8601 format.');
        }
        return dateRange.range.exact;

      case 'range':
        // Handle partial ranges - if either start or end is provided
        if (dateRange.range.start || dateRange.range.end) {
          if (dateRange.range.start && !isValidISODate(dateRange.range.start)) {
            throw new Error('Invalid start date format. Expected ISO 8601 format.');
          }
          if (dateRange.range.end && !isValidISODate(dateRange.range.end)) {
            throw new Error('Invalid end date format. Expected ISO 8601 format.');
          }
          return `${dateRange.range.start || ''},${dateRange.range.end || ''}`;
        }
        break;

      case 'preset':
        switch (dateRange.range.preset) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'yesterday': {
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            return `${formatDate(startDate)},${formatDate(endDate)}`;
          }

          case 'last24h':
            startDate.setHours(startDate.getHours() - 24);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'last48h':
            startDate.setHours(startDate.getHours() - 48);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'last7d':
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'last14d':
            startDate.setDate(startDate.getDate() - 14);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'last30d':
            startDate.setDate(startDate.getDate() - 30);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'last60d':
            startDate.setDate(startDate.getDate() - 60);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'last90d':
            startDate.setDate(startDate.getDate() - 90);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'thisWeek':
            startDate.setDate(startDate.getDate() - startDate.getDay());
            startDate.setHours(0, 0, 0, 0);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'lastWeek': {
            startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            return `${formatDate(startDate)},${formatDate(endDate)}`;
          }

          case 'thisMonth':
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'lastMonth': {
            startDate.setMonth(startDate.getMonth() - 1);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            endDate.setHours(23, 59, 59, 999);
            return `${formatDate(startDate)},${formatDate(endDate)}`;
          }

          case 'thisYear':
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
            return `${formatDate(startDate)},${formatDate(now)}`;

          case 'lastYear': {
            startDate.setFullYear(startDate.getFullYear() - 1);
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setMonth(11, 31);
            endDate.setHours(23, 59, 59, 999);
            return `${formatDate(startDate)},${formatDate(endDate)}`;
          }
        }
    }

    if (DEBUG_CONFIG.UTIL_DATE_PROCESSING) {
      debugLog('Date Processing - Result', { result: undefined });
    }

  } catch (error) {
    if (DEBUG_CONFIG.UTIL_DATE_PROCESSING) {
      debugLog('Date Processing - Error', {
        error,
        message: error instanceof Error ? error.message : String(error),
        level: 'error',
      });
    }
    if (error instanceof Error) {
      throw new Error(`Date range processing error: ${error.message}`);
    }
    throw new Error('Unknown error processing date range');
  }

  return undefined;
}

/**
 * Parse a date value from various formats
 * @param value - Date value (can be ISO datetime string, date string, Date object, or number)
 * @returns Date object or null if parsing fails
 */
function parseDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  // If already a Date object, return it
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // If it's a number (timestamp), create Date from it
  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  // If it's a string, try parsing it
  if (typeof value === 'string') {
    // If already in YYYY-MM-DD format, parse it directly to avoid timezone issues
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parts = value.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }

    // Try parsing as ISO string or other formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Format a Date object to YYYY-MM-DD format using local time
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert dateTime value to date-only format (YYYY-MM-DD) as required by Hudu API
 * This function is lenient and handles various input formats including ISO datetime strings
 * from n8n's dateTime picker. Returns undefined for empty/invalid values (suitable for optional fields).
 * Preserves the date portion for ISO datetime strings to avoid shifts.
 * 
 * @param value - Date value (can be ISO datetime string, date string, or empty)
 * @returns Date string in YYYY-MM-DD format, undefined if empty/invalid, or original value if parsing fails
 */
export function convertToDateOnlyFormat(value: any): string | undefined {
  if (!value || value === '') {
    return undefined;
  }

  // If already in YYYY-MM-DD format, return as-is
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Try parsing the date
  const date = parseDate(value);
  if (date) {
    // For ISO strings, extract the date part from the original string if possible
    if (typeof value === 'string' && value.includes('T')) {
      // ISO datetime string - extract date part before 'T' to preserve original date
      const datePart = value.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
      }
    }
    // Fallback to local date formatting
    return formatDateToYYYYMMDD(date);
  }

  // If all parsing fails, return original value (will be validated by API)
  return value;
} 