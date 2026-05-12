import type { IDataObject, IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { huduApiRequest } from '../utils/requestUtils';

export interface PaginatedPostFilterResult<T> {
  /** Matched records up to `limit`. */
  items: T[];
  /** Number of pages fetched (1..maxPages). */
  pagesScanned: number;
  /** Total records inspected across all pages. */
  recordsScanned: number;
  /** True when the scan stopped because maxPages was reached AND the last page was full
   *  AND fewer than `limit` matches were found — i.e. more matches may exist beyond the cap. */
  capHit: boolean;
  /** True when the upstream returned fewer than pageSize records on the last page (no more pages). */
  exhausted: boolean;
}

/**
 * Bounded pagination + client-side post-filter for Hudu list endpoints that do NOT support
 * a particular filter as a query param (e.g. /articles?folder_id=...). Pages through the
 * upstream until either `limit` matches are collected, the upstream is exhausted, or
 * `maxPages` is reached. Returns scan stats so callers can emit accurate warnings.
 *
 * Defaults: maxPages=20, pageSize=100 → max 2000 records scanned per invocation.
 * At Hudu's 300 req/min rate limit this leaves ample headroom for sequential usage.
 */
export async function paginatedPostFilter<T extends IDataObject>(
  context: ISupplyDataFunctions,
  endpoint: string,
  pluralKey: string,
  baseFilters: IDataObject,
  predicate: (item: T) => boolean,
  limit: number,
  maxPages = 20,
  pageSize = 100,
): Promise<PaginatedPostFilterResult<T>> {
  const matched: T[] = [];
  let pagesScanned = 0;
  let recordsScanned = 0;
  let lastPageFull = false;

  for (let page = 1; page <= maxPages; page++) {
    const qs: IDataObject = { ...baseFilters, page, page_size: pageSize };
    const response = await huduApiRequest.call(
      context as unknown as IExecuteFunctions,
      'GET',
      endpoint,
      {},
      qs,
      pluralKey,
    );
    const records = Array.isArray(response) ? (response as T[]) : [];
    pagesScanned = page;
    recordsScanned += records.length;
    lastPageFull = records.length === pageSize;

    for (const record of records) {
      if (predicate(record)) {
        matched.push(record);
      }
    }

    if (matched.length >= limit) break;
    if (!lastPageFull) break;
  }

  const exhausted = !lastPageFull;
  const capHit = pagesScanned === maxPages && lastPageFull && matched.length < limit;

  return {
    items: matched.slice(0, limit),
    pagesScanned,
    recordsScanned,
    capHit,
    exhausted,
  };
}
