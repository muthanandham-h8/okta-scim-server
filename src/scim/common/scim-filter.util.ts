/**
 * Minimal SCIM filter parser. Okta's SCIM connector only ever sends single
 * `attribute eq "value"` filters (e.g. checking whether a user/group already
 * exists), so we only support that subset of RFC7644 section 3.4.2.2.
 */
export interface ParsedFilter {
  attribute: string;
  value: string;
}

export function parseEqFilter(filter?: string): ParsedFilter | null {
  if (!filter) return null;
  const match = filter.match(/^(\w+(?:\.\w+)?)\s+eq\s+"(.*)"$/i);
  if (!match) return null;
  return { attribute: match[1], value: match[2] };
}

export interface Pagination {
  startIndex: number;
  count: number;
}

export function parsePagination(startIndex?: string, count?: string): Pagination {
  const parsedStart = Number(startIndex);
  const parsedCount = Number(count);
  return {
    startIndex: Number.isFinite(parsedStart) && parsedStart >= 1 ? parsedStart : 1,
    count: Number.isFinite(parsedCount) && parsedCount >= 0 ? parsedCount : 100,
  };
}
