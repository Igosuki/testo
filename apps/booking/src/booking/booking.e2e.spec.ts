import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BAD_EMAIL, BOOKING_OK, BOOKING_REQUEST_OK } from './booking.fixtures';
import { BAD_INPUT_EMAIL } from '../messages';
import { BookingsRepo } from './booking.repo';
import { getModelToken } from '@nestjs/mongoose';
import { Booking, BookingRequest } from './booking.schema';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { defaultMailerOptions } from '../mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

describe('Booking', () => {
  let app: INestApplication;
  let controller: BookingController;

  beforeAll(async () => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2020, 3, 1, 12));
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        MailerService,
        {
          name: MAILER_OPTIONS,
          provide: MAILER_OPTIONS,
          useValue: {
            ...defaultMailerOptions,
            transport: new SMTPTransport({}),
          },
        },
        BookingsRepo,
        {
          provide: getModelToken(Booking.name),
          useValue: BOOKING_OK,
        },
        {
          provide: getModelToken(BookingRequest.name),
          useValue: BOOKING_REQUEST_OK,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        disableErrorMessages: false,
      })
    );
    await app.init();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // TODO: mock time
  // it(`/POST bookings`, () => {
  //   const DateReal = global.Date;
  //   const mockDate = new Date(2020, 3, 1, 12);
  //   const spy = jest.spyOn(global, 'Date').mockImplementation((...args) => {
  //     if (args.length) {
  //       return new DateReal(...args);
  //     }
  //     return mockDate;
  //   });
  //
  //   return request(app.getHttpServer())
  //     .post('/bookings')
  //     .send({ ...BOOKING_OK, date: mockDate })
  //     .expect({});
  //
  //   spy.mockRestore();
  // });

  it(`/POST bookings bad`, () => {
    return request(app.getHttpServer())
      .post('/bookings')
      .send(BAD_EMAIL)
      .expect(400)
      .expect((res) => res.body.message == [BAD_INPUT_EMAIL]);
  });

  afterAll(async () => {
    await app?.close();
  });
});
