import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
export declare class ScimExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void;
}
