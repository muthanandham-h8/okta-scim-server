"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyUserPatch = applyUserPatch;
function applyValueForPath(fields, path, value) {
    var _a;
    switch (path) {
        case 'active':
            fields.active = Boolean(value);
            break;
        case 'userName':
            fields.userName = String(value);
            break;
        case 'name.givenName':
            fields.givenName = String(value);
            break;
        case 'name.familyName':
            fields.familyName = String(value);
            break;
        case 'externalId':
            fields.externalId = String(value);
            break;
        case 'emails':
        case 'emails[primary eq true].value':
            if (Array.isArray(value) && value.length > 0) {
                fields.email = String((_a = value[0].value) !== null && _a !== void 0 ? _a : value[0]);
            }
            else if (typeof value === 'string') {
                fields.email = value;
            }
            break;
        default:
            break;
    }
}
function applyValueObject(fields, value) {
    if ('active' in value)
        fields.active = Boolean(value.active);
    if ('userName' in value)
        fields.userName = String(value.userName);
    if ('externalId' in value)
        fields.externalId = String(value.externalId);
    const name = value.name;
    if ((name === null || name === void 0 ? void 0 : name.givenName) !== undefined)
        fields.givenName = name.givenName;
    if ((name === null || name === void 0 ? void 0 : name.familyName) !== undefined)
        fields.familyName = name.familyName;
    const emails = value.emails;
    if (Array.isArray(emails) && emails.length > 0) {
        fields.email = emails[0].value;
    }
}
function applyUserPatch(operations) {
    var _a;
    const fields = {};
    for (const operation of operations) {
        const op = (_a = operation.op) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (op !== 'replace' && op !== 'add')
            continue;
        if (operation.path) {
            applyValueForPath(fields, operation.path, operation.value);
        }
        else if (operation.value && typeof operation.value === 'object') {
            applyValueObject(fields, operation.value);
        }
    }
    return fields;
}
//# sourceMappingURL=apply-user-patch.js.map