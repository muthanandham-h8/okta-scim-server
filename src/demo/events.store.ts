import { Injectable } from '@nestjs/common';

export interface DemoEvent {
  seq: number;
  ts: string;
  /** Who originated this message — drives the colour in the UI. */
  source: 'okta' | 'keycloak' | 'scim';
  /** Human-readable direction, e.g. "Okta → Keycloak". */
  actor: string;
  kind: 'request' | 'response';
  method?: string;
  path?: string;
  status?: number;
  headers?: Record<string, string>;
  payload?: unknown;
}

/**
 * In-memory ring buffer of demo traffic events, fed by the edge-proxy and read
 * by the /demo dashboard. Demo-only: not persisted, capped, cleared on restart.
 */
@Injectable()
export class EventsStore {
  private events: DemoEvent[] = [];
  private seq = 0;
  private readonly cap = 300;

  add(e: Omit<DemoEvent, 'seq'>): DemoEvent {
    const evt: DemoEvent = { ...e, seq: ++this.seq };
    this.events.push(evt);
    if (this.events.length > this.cap) {
      this.events.splice(0, this.events.length - this.cap);
    }
    return evt;
  }

  list(): DemoEvent[] {
    return this.events;
  }

  clear(): void {
    this.events = [];
  }
}
