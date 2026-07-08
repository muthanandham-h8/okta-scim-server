import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { DemoEvent, EventsStore } from './events.store';
export declare class DemoController {
    private readonly prisma;
    private readonly events;
    private readonly config;
    constructor(prisma: PrismaService, events: EventsStore, config: ConfigService);
    private demoConfig;
    page(): string;
    users(): Promise<{
        updatedAt: string;
        totalUsers: number;
        activeUsers: number;
        totalGroups: number;
        users: {
            id: string;
            userName: string;
            givenName: string;
            familyName: string;
            email: string;
            active: boolean;
            externalId: string;
            createdAt: Date;
            updatedAt: Date;
            groups: string[];
        }[];
    }>;
    clearData(): Promise<void>;
    listEvents(): {
        events: DemoEvent[];
    };
    clearEvents(): void;
    ingest(req: Request, body: Partial<DemoEvent>): void;
}
