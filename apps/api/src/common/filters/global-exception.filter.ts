import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request & { traceId?: string }>();
    const traceId = request.traceId ?? randomUUID();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : null;
    const object =
      typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const rawMessage =
      object.message ??
      (typeof body === 'string'
        ? body
        : status >= 500
          ? 'Internal server error'
          : 'Request failed');
    const details = Array.isArray(rawMessage) ? rawMessage : [];
    const message = Array.isArray(rawMessage) ? 'Validation failed' : String(rawMessage);
    if (status >= 500)
      this.logger.error(
        JSON.stringify({
          traceId,
          method: request.method,
          path: request.url,
          status,
          error: exception instanceof Error ? exception.message : String(exception),
        }),
      );
    response.status(status).json({
      success: false,
      message,
      code: String(object.code ?? this.code(status)),
      traceId,
      details,
    });
  }
  private code(status: number) {
    return status === 400
      ? 'BAD_REQUEST'
      : status === 404
        ? 'NOT_FOUND'
        : status === 429
          ? 'RATE_LIMITED'
          : status >= 500
            ? 'INTERNAL_ERROR'
            : 'REQUEST_FAILED';
  }
}
