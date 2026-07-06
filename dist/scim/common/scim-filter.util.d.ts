export interface ParsedFilter {
    attribute: string;
    value: string;
}
export declare function parseEqFilter(filter?: string): ParsedFilter | null;
export interface Pagination {
    startIndex: number;
    count: number;
}
export declare function parsePagination(startIndex?: string, count?: string): Pagination;
