import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { SCIM_ERROR_SCHEMA } from './scim.constants';

@Catch(HttpException)
export class ScimExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    const detail =
      typeof body === 'string'
        ? body
        : ((body as Record<string, unknown>).message ?? exception.message);

    res
      .status(status)
      .type('application/scim+json')
      .json({
        schemas: [SCIM_ERROR_SCHEMA],
        status: String(status || HttpStatus.INTERNAL_SERVER_ERROR),
        detail: Array.isArray(detail) ? detail.join(', ') : String(detail),
      });
  }
}
