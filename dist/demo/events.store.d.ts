export interface DemoEvent {
    seq: number;
    ts: string;
    source: 'okta' | 'keycloak' | 'scim';
    actor: string;
    kind: 'request' | 'response';
    method?: string;
    path?: string;
    status?: number;
    headers?: Record<string, string>;
    payload?: unknown;
}
export declare class EventsStore {
    private events;
    private seq;
    private readonly cap;
    add(e: Omit<DemoEvent, 'seq'>): DemoEvent;
    list(): DemoEvent[];
    clear(): void;
}
