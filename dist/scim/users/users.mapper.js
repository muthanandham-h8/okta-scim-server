"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toScimUser = toScimUser;
const scim_constants_1 = require("../common/scim.constants");
function toScimUser(user, baseUrl) {
    var _a, _b, _c;
    return {
        schemas: [scim_constants_1.SCIM_USER_SCHEMA],
        id: user.id,
        externalId: (_a = user.externalId) !== null && _a !== void 0 ? _a : undefined,
        userName: user.userName,
        name: {
            givenName: (_b = user.givenName) !== null && _b !== void 0 ? _b : undefined,
            familyName: (_c = user.familyName) !== null && _c !== void 0 ? _c : undefined,
        },
        emails: user.email ? [{ value: user.email, primary: true }] : [],
        active: user.active,
        meta: {
            resourceType: 'User',
            created: user.createdAt.toISOString(),
            lastModified: user.updatedAt.toISOString(),
            location: `${baseUrl}/scim/v2/Users/${user.id}`,
        },
    };
}
//# sourceMappingURL=users.mapper.js.map