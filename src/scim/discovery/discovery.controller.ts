import { Controller, Get } from '@nestjs/common';

// These metadata endpoints are intentionally left unauthenticated, per common
// SCIM server practice: Okta (and other clients) probe them while validating
// a connection, sometimes before the OAuth token exchange completes.
@Controller('scim/v2')
export class DiscoveryController {
  @Get('ServiceProviderConfig')
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

  @Get('ResourceTypes')
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

  @Get('Schemas')
  schemas() {
    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: 2,
      Resources: [USER_SCHEMA, GROUP_SCHEMA],
    };
  }
}

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
