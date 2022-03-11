import { Test } from '@nestjs/testing';

import { BookingsRepo } from './booking.repo';
import { BOOKING_OK } from './booking.fixtures';
import { getModelToken } from '@nestjs/mongoose';
import {
  Booking,
  BookingRequest,
  BookingRequestSchema,
  BookingSchema,
} from './booking.schema';
import { model } from 'mongoose';
import * as mockingoose from 'mockingoose';

describe('BookingsRepo', () => {
  let service: BookingsRepo;
  const bookingModel = model(Booking.name, BookingSchema);
  const bookingRequestModel = model(BookingRequest.name, BookingRequestSchema);

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        BookingsRepo,
        {
          provide: getModelToken(Booking.name),
          useValue: bookingModel,
        },
        {
          provide: getModelToken(BookingRequest.name),
          useValue: bookingRequestModel,
        },
      ],
    }).compile();

    service = app.get<BookingsRepo>(BookingsRepo);
  });

  describe('create', () => {
    const _doc = {
      ...BOOKING_OK,
      date: BOOKING_OK.date.toISOString(),
      _id: '622905580b78bd2584941ed7',
    };

    mockingoose(bookingModel).toReturn(_doc, 'save');

    it('should return created email', async () => {
      expect(
        JSON.parse(JSON.stringify(await service.createBooking(BOOKING_OK)))
      ).toMatchObject(_doc);
    });
  });

  describe('findbyEmail', () => {
    const _doc = {
      ...BOOKING_OK,
      date: BOOKING_OK.date.toISOString(),
      _id: '622905580b78bd2584941ed7',
    };

    const docs = [_doc, { ..._doc, _id: '622905580b78bd2584941ed8' }];

    mockingoose(bookingModel).toReturn((query) => {
      const queryEmail = query.getQuery().email;
      return docs.filter((doc) => doc.email === queryEmail.$eq);
    }, 'find');

    it('should return existing bookings for email', async () => {
      const finds = await service.findByEmail(BOOKING_OK.email);
      expect(JSON.parse(JSON.stringify(finds))).toMatchObject(docs);
    });

    it('should return nothing if there are no bookings', async () => {
      const finds = await service.findByEmail('wrongmail@wrong.com');
      expect(JSON.parse(JSON.stringify(finds))).toMatchObject([]);
    });
  });

  describe('tableCount', () => {
    mockingoose(bookingModel).toReturn([{ tableCount: 2 }], 'aggregate');
    mockingoose(bookingRequestModel).toReturn([{ tableCount: 2 }], 'aggregate');

    it('should return the table count', async () => {
      const tableCount = await service.tableCount(new Date());
      expect(tableCount).toEqual(4);
    });
  });

  describe('hasBooking', () => {
    const _doc = {
      ...BOOKING_OK,
      _id: '622905580b78bd2584941ed7',
    };

    const docs = [_doc, { ..._doc, _id: '622905580b78bd2584941ed8' }];

    mockingoose(bookingModel).toReturn((query) => {
      const concrete = query.getQuery();
      return docs.find(
        (doc) =>
          doc.email === concrete.email.$eq &&
          doc.date < concrete.date.$lt &&
          doc.date >= concrete.date.$gte
      );
    }, 'findOne');

    it('should return true if there is a booking', async () => {
      const hasBooking = await service.hasBooking(
        BOOKING_OK.email,
        BOOKING_OK.date
      );
      expect(hasBooking).toBe(true);
    });
    it('should return false if there is no booking for the date', async () => {
      const futureDate = new Date(BOOKING_OK.date.getTime());
      futureDate.setDate(futureDate.getDate() + 1);
      const hasBooking = await service.hasBooking(BOOKING_OK.email, futureDate);
      expect(hasBooking).toBe(false);
    });
    it('should return false if there is no booking for the email', async () => {
      const hasBooking = await service.hasBooking(
        'wrongemail@wrong.com',
        BOOKING_OK.date
      );
      expect(hasBooking).toBe(false);
    });
  });
});
