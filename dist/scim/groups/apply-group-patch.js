"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyGroupPatch = applyGroupPatch;
function extractMemberIdFromFilterPath(path) {
    const match = path.match(/members\[value eq "([^"]+)"\]/i);
    return match ? match[1] : null;
}
function applyGroupPatch(operations) {
    var _a, _b, _c;
    const result = { addMemberIds: [], removeMemberIds: [] };
    for (const operation of operations) {
        const op = (_a = operation.op) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const path = operation.path;
        if (op === 'add' && (path === 'members' || !path)) {
            const members = (_b = operation.value) !== null && _b !== void 0 ? _b : [];
            for (const member of members) {
                if (member === null || member === void 0 ? void 0 : member.value)
                    result.addMemberIds.push(member.value);
            }
            continue;
        }
        if (op === 'remove') {
            if (path === 'members') {
                const members = (_c = operation.value) !== null && _c !== void 0 ? _c : [];
                for (const member of members) {
                    if (member === null || member === void 0 ? void 0 : member.value)
                        result.removeMemberIds.push(member.value);
                }
            }
            else if (path) {
                const id = extractMemberIdFromFilterPath(path);
                if (id)
                    result.removeMemberIds.push(id);
            }
            continue;
        }
        if (op === 'replace') {
            if (path === 'displayName') {
                result.displayName = String(operation.value);
            }
            else if (!path && operation.value && typeof operation.value === 'object') {
                const value = operation.value;
                if ('displayName' in value)
                    result.displayName = String(value.displayName);
                if ('externalId' in value)
                    result.externalId = String(value.externalId);
            }
        }
    }
    return result;
}
//# sourceMappingURL=apply-group-patch.js.map