import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BAD_EMAIL, BOOKING_OK } from './booking.fixtures';
import { BAD_INPUT_EMAIL } from '../messages';
import { BookingsRepo } from './booking.repo';
import { getModelToken } from '@nestjs/mongoose';
import { Booking } from './booking.schema';

describe('Booking', () => {
  let app: INestApplication;
  let controller: BookingController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        BookingsRepo,
        {
          provide: getModelToken(Booking.name),
          useValue: BOOKING_OK,
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

  it(`/POST bookings`, () => {
    return request(app.getHttpServer())
      .post('/bookings')
      .send(BOOKING_OK)
      .expect(201)
      .expect({});
  });

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
