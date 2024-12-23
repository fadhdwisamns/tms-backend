import { ExceptionFilter, Catch, UnauthorizedException, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(UnauthorizedException)
export class UnauthorizedFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: 'Unauthorized: Token is invalid or missing',
      timestamp: new Date().toISOString(),
    });
  }
}
