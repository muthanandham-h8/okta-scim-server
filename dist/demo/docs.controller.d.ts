import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
export declare class DocsController {
    private readonly config;
    constructor(config: ConfigService);
    private cfg;
    index(): string;
    method(method: string, res: Response): void;
}
