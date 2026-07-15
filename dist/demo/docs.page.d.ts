export interface DocsConfig {
    scimBase: string;
    tokenEndpoint: string;
    authEndpoint: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    buildId: string;
}
export declare function renderDocsIndex(cfg: DocsConfig): string;
type Method = 'saml' | 'swa' | 'oin' | 'private';
export declare const METHOD_SLUGS: Method[];
export declare function renderMethodPage(method: Method, cfg: DocsConfig): string;
export {};
