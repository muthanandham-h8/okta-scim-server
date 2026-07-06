export declare class DiscoveryController {
    serviceProviderConfig(): {
        schemas: string[];
        patch: {
            supported: boolean;
        };
        bulk: {
            supported: boolean;
            maxOperations: number;
            maxPayloadSize: number;
        };
        filter: {
            supported: boolean;
            maxResults: number;
        };
        changePassword: {
            supported: boolean;
        };
        sort: {
            supported: boolean;
        };
        etag: {
            supported: boolean;
        };
        authenticationSchemes: {
            type: string;
            name: string;
            description: string;
            specUri: string;
        }[];
        meta: {
            resourceType: string;
        };
    };
    resourceTypes(): {
        schemas: string[];
        totalResults: number;
        Resources: {
            schemas: string[];
            id: string;
            name: string;
            endpoint: string;
            schema: string;
            meta: {
                resourceType: string;
                location: string;
            };
        }[];
    };
    schemas(): {
        schemas: string[];
        totalResults: number;
        Resources: {
            id: string;
            name: string;
            description: string;
            attributes: ({
                name: string;
                type: string;
                multiValued: boolean;
                required: boolean;
                uniqueness: string;
                subAttributes?: undefined;
            } | {
                name: string;
                type: string;
                multiValued: boolean;
                subAttributes: {
                    name: string;
                    type: string;
                }[];
                required?: undefined;
                uniqueness?: undefined;
            } | {
                name: string;
                type: string;
                multiValued: boolean;
                required: boolean;
                uniqueness?: undefined;
                subAttributes?: undefined;
            })[];
            meta: {
                resourceType: string;
                location: string;
            };
        }[];
    };
}
