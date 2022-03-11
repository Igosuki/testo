import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MongoError } from 'mongodb';
import { HttpAdapterHost } from '@nestjs/core';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private i18n: I18nService
  ) {}
  async catch(exception: HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionMessage = (exception) =>
      exception instanceof MongoError
        ? exception?.message
        : exception?.response?.message;

    const translatedMessages = [];
    const msgs = exceptionMessage(exception);
    if (msgs.isArray) {
      const translations = await Promise.all(
        msgs.map((msg) => {
          try {
            return this.i18n.translate(msg);
          } catch (e) {
            return msg;
          }
        })
      );
      translatedMessages.push(...translations.filter((t) => t));
    } else {
      try {
        translatedMessages.push(await this.i18n.translate(msgs));
      } catch (e) {
        translatedMessages.push(msgs);
      }
    }
    console.log(msgs, translatedMessages);

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      messages: translatedMessages,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
