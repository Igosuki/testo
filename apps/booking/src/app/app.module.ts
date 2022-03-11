import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { I18nModule, I18nJsonParser } from 'nestjs-i18n';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingModule } from '../booking/booking.module';
import { environment } from '../environments/environment';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exceptions';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { defaultMailerOptions } from '../mailer';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongodbUrl),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, '/i18n'),
      },
    }),
    MailerModule.forRoot(defaultMailerOptions),
    BookingModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
  ],
})
export class AppModule {}
