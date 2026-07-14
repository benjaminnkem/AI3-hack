import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method: string }>();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: request.method === 'POST' ? 'Request completed' : 'Request successful',
        data,
      })),
    );
  }
}
