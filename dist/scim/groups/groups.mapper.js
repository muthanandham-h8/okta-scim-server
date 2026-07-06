"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toScimGroup = toScimGroup;
const scim_constants_1 = require("../common/scim.constants");
function toScimGroup(group, baseUrl) {
    var _a;
    return {
        schemas: [scim_constants_1.SCIM_GROUP_SCHEMA],
        id: group.id,
        externalId: (_a = group.externalId) !== null && _a !== void 0 ? _a : undefined,
        displayName: group.displayName,
        members: group.members.map((m) => ({
            value: m.user.id,
            display: m.user.userName,
        })),
        meta: {
            resourceType: 'Group',
            created: group.createdAt.toISOString(),
            lastModified: group.updatedAt.toISOString(),
            location: `${baseUrl}/scim/v2/Groups/${group.id}`,
        },
    };
}
//# sourceMappingURL=groups.mapper.js.map