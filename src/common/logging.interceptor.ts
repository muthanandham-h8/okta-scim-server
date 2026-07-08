import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { JWTPayload } from 'jose';

const REDACT_KEYS = new Set(['password', 'client_secret', 'secret', 'authorization']);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACT_KEYS.has(k.toLowerCase()) ? '***' : redact(v);
    }
    return out;
  }
  return value;
}

/**
 * Logs every HTTP request that passes the guards: method, path, the calling
 * client, the (redacted) request body, then the response status + duration.
 * Auth failures are logged by JwtAuthGuard before this runs.
 */
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl } = req;
    const started = Date.now();

    const auth = (req as Request & { auth?: JWTPayload }).auth;
    const actor =
      (req as Request & { oauthClientId?: string }).oauthClientId ??
      (auth?.azp as string) ??
      'anonymous';

    const hasBody = req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0;
    const bodyStr = hasBody ? ` body=${JSON.stringify(redact(req.body))}` : '';

    this.logger.log(`--> ${method} ${originalUrl} | client=${actor}${bodyStr}`);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`<-- ${method} ${originalUrl} ${res.statusCode} (${Date.now() - started}ms)`);
      }),
      catchError((err: unknown) => {
        const status =
          (err as { status?: number })?.status ??
          (err as { getStatus?: () => number })?.getStatus?.() ??
          500;
        const message = (err as Error)?.message ?? String(err);
        this.logger.warn(
          `<-- ${method} ${originalUrl} ${status} (${Date.now() - started}ms) | error: ${message}`,
        );
        return throwError(() => err);
      }),
    );
  }
}
