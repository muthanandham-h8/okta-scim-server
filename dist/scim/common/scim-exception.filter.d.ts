import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ScimExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
    private toScimError;
    private mapPrismaError;
}
