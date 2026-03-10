import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorPayload {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  requestId?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.resolveError(exception);

    const payload: ErrorPayload = {
      statusCode,
      error: HttpStatus[statusCode] ?? 'INTERNAL_SERVER_ERROR',
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `[${request.method}] ${request.url} → ${statusCode}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json(payload);
  }

  private resolveError(exception: unknown): { statusCode: number; message: string } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? Array.isArray((res as { message: unknown }).message)
            ? ((res as { message: string[] }).message).join('; ')
            : String((res as { message: unknown }).message)
          : exception.message;
      return { statusCode: exception.getStatus(), message };
    }

    // AI generation failures — surface a clean message, never raw stack traces
    if (exception instanceof Error) {
      const aiPatterns = [
        { test: /rate.?limit/i, message: 'The AI generation service is temporarily rate-limited. Please try again in a moment.' },
        { test: /context.?length|token/i, message: 'The research abstract is too long to process. Please try a different paper.' },
        { test: /timeout|ECONNRESET|ETIMEDOUT/i, message: 'A downstream service timed out. Our pipeline is retrying — please wait.' },
        { test: /invalid.?api.?key|authentication/i, message: 'A service authentication error occurred. Please contact support.' },
      ];

      for (const { test, message } of aiPatterns) {
        if (test.test(exception.message)) {
          return { statusCode: HttpStatus.BAD_GATEWAY, message };
        }
      }

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred in the ResearchReels pipeline.',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred.',
    };
  }
}
