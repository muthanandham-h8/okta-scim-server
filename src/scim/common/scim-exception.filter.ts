import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { SCIM_ERROR_SCHEMA } from './scim.constants';

interface ScimError {
  status: number;
  detail: string;
  scimType?: string;
}

/**
 * Catches everything (not just HttpException) so that Prisma errors surface as
 * spec-compliant SCIM responses instead of a generic 500. Okta's conformance
 * suite exercises negative cases (missing id, duplicate userName), and a 500
 * where a 404/409 is expected fails those checks.
 */
@Catch()
export class ScimExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ScimExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const { status, detail, scimType } = this.toScimError(exception);

    res
      .status(status)
      .type('application/scim+json')
      .json({
        schemas: [SCIM_ERROR_SCHEMA],
        status: String(status),
        ...(scimType ? { scimType } : {}),
        detail,
      });
  }

  private toScimError(exception: unknown): ScimError {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const rawDetail =
        typeof body === 'string'
          ? body
          : ((body as Record<string, unknown>).message ?? exception.message);
      const detail = Array.isArray(rawDetail) ? rawDetail.join(', ') : String(rawDetail);
      // A 409 from our own code is always a uniqueness conflict (duplicate
      // userName / displayName), which Okta keys off via scimType.
      const scimType = status === HttpStatus.CONFLICT ? 'uniqueness' : undefined;
      return { status, detail, scimType };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaError(exception);
    }

    this.logger.error(
      `Unhandled exception: ${exception instanceof Error ? exception.stack : String(exception)}`,
    );
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'Internal server error',
    };
  }

  private mapPrismaError(exception: Prisma.PrismaClientKnownRequestError): ScimError {
    switch (exception.code) {
      // Unique constraint failed (e.g. duplicate userName/displayName).
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          detail: 'A resource with the same unique attribute already exists',
          scimType: 'uniqueness',
        };
      // Record required for the operation was not found (update/delete).
      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, detail: 'Resource not found' };
      // Malformed value for a column, e.g. a non-UUID id in the path.
      case 'P2023':
        return { status: HttpStatus.NOT_FOUND, detail: 'Resource not found' };
      // Foreign key constraint failed (e.g. group member references a
      // non-existent user).
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          detail: 'Referenced resource does not exist',
          scimType: 'invalidValue',
        };
      default:
        this.logger.error(`Unmapped Prisma error ${exception.code}: ${exception.message}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          detail: 'Internal server error',
        };
    }
  }
}
