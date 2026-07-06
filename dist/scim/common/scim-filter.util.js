"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEqFilter = parseEqFilter;
exports.parsePagination = parsePagination;
function parseEqFilter(filter) {
    if (!filter)
        return null;
    const match = filter.match(/^(\w+(?:\.\w+)?)\s+eq\s+"(.*)"$/i);
    if (!match)
        return null;
    return { attribute: match[1], value: match[2] };
}
function parsePagination(startIndex, count) {
    const parsedStart = Number(startIndex);
    const parsedCount = Number(count);
    return {
        startIndex: Number.isFinite(parsedStart) && parsedStart >= 1 ? parsedStart : 1,
        count: Number.isFinite(parsedCount) && parsedCount >= 0 ? parsedCount : 100,
    };
}
//# sourceMappingURL=scim-filter.util.js.map