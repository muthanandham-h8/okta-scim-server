export interface DemoConfig {
    scimBase: string;
    authEndpoint: string;
    tokenEndpoint: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    configGuideUrl: string;
    keycloakAdmin: string;
    buildId: string;
}
export declare function renderDemoPage(cfg: DemoConfig): string;
