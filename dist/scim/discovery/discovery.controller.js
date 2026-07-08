"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let DiscoveryController = class DiscoveryController {
    serviceProviderConfig() {
        return {
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
            patch: { supported: true },
            bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
            filter: { supported: true, maxResults: 200 },
            changePassword: { supported: true },
            sort: { supported: false },
            etag: { supported: false },
            authenticationSchemes: [
                {
                    type: 'oauth2',
                    name: 'OAuth 2.0',
                    description: 'Authentication via OAuth 2.0 authorization code grant with refresh tokens',
                    specUri: 'https://www.rfc-editor.org/info/rfc6749',
                },
            ],
            meta: { resourceType: 'ServiceProviderConfig' },
        };
    }
    resourceTypes() {
        return {
            schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
            totalResults: 2,
            Resources: [
                {
                    schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
                    id: 'User',
                    name: 'User',
                    endpoint: '/Users',
                    schema: 'urn:ietf:params:scim:schemas:core:2.0:User',
                    meta: { resourceType: 'ResourceType', location: '/scim/v2/ResourceTypes/User' },
                },
                {
                    schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
                    id: 'Group',
                    name: 'Group',
                    endpoint: '/Groups',
                    schema: 'urn:ietf:params:scim:schemas:core:2.0:Group',
                    meta: { resourceType: 'ResourceType', location: '/scim/v2/ResourceTypes/Group' },
                },
            ],
        };
    }
    schemas() {
        return {
            schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
            totalResults: 2,
            Resources: [USER_SCHEMA, GROUP_SCHEMA],
        };
    }
};
exports.DiscoveryController = DiscoveryController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'ServiceProviderConfig — advertised SCIM capabilities' }),
    (0, common_1.Get)('ServiceProviderConfig'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "serviceProviderConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'ResourceTypes — User and Group resource definitions' }),
    (0, common_1.Get)('ResourceTypes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "resourceTypes", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Schemas — User and Group attribute schemas' }),
    (0, common_1.Get)('Schemas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiscoveryController.prototype, "schemas", null);
exports.DiscoveryController = DiscoveryController = __decorate([
    (0, swagger_1.ApiTags)('SCIM Discovery'),
    (0, common_1.Controller)('scim/v2')
], DiscoveryController);
const USER_SCHEMA = {
    id: 'urn:ietf:params:scim:schemas:core:2.0:User',
    name: 'User',
    description: 'User Account',
    attributes: [
        { name: 'userName', type: 'string', multiValued: false, required: true, uniqueness: 'server' },
        {
            name: 'name',
            type: 'complex',
            multiValued: false,
            subAttributes: [
                { name: 'givenName', type: 'string' },
                { name: 'familyName', type: 'string' },
            ],
        },
        {
            name: 'emails',
            type: 'complex',
            multiValued: true,
            subAttributes: [
                { name: 'value', type: 'string' },
                { name: 'primary', type: 'boolean' },
            ],
        },
        { name: 'active', type: 'boolean', multiValued: false, required: false },
    ],
    meta: { resourceType: 'Schema', location: '/scim/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:User' },
};
const GROUP_SCHEMA = {
    id: 'urn:ietf:params:scim:schemas:core:2.0:Group',
    name: 'Group',
    description: 'Group',
    attributes: [
        { name: 'displayName', type: 'string', multiValued: false, required: true, uniqueness: 'server' },
        {
            name: 'members',
            type: 'complex',
            multiValued: true,
            subAttributes: [
                { name: 'value', type: 'string' },
                { name: 'display', type: 'string' },
            ],
        },
    ],
    meta: { resourceType: 'Schema', location: '/scim/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:Group' },
};
//# sourceMappingURL=discovery.controller.js.map