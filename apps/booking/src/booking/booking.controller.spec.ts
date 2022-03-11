import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BAD_EMAIL, BOOKING_OK, BOOKING_REQUEST_OK } from './booking.fixtures';
import { BookingsRepo } from './booking.repo';
import { getModelToken } from '@nestjs/mongoose';
import * as nodemailerMock from 'nodemailer-mock';
import * as mockingoose from 'mockingoose';
import {
  Booking,
  BookingDocument,
  BookingRequest,
  BookingRequestDocument,
  BookingRequestSchema,
  BookingSchema,
} from './booking.schema';
import mongoose, { Model, model } from 'mongoose';
import {
  MAILER_OPTIONS,
  MAILER_TRANSPORT_FACTORY,
  MailerService,
} from '@nestjs-modules/mailer';
import { spyOnSmtpSend, TestTransportFactory } from '../test_util/mailer.spec';
import { environment } from '../environments/environment';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { defaultMailerOptions } from '../mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import MailMessage from 'nodemailer/lib/mailer/mail-message';

describe('BookingController', () => {
  let controller: BookingController;
  let bookingRepo: BookingsRepo;
  const bookingModel = model(Booking.name, BookingSchema);
  const bookingRequestModel = model(BookingRequest.name, BookingRequestSchema);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        BookingsRepo,
        {
          provide: getModelToken(Booking.name),
          useValue: model(Booking.name, BookingSchema),
        },
        {
          provide: getModelToken(BookingRequest.name),
          useValue: model(BookingRequest.name, BookingRequestSchema),
        },
        MailerService,
        {
          name: MAILER_OPTIONS,
          provide: MAILER_OPTIONS,
          useValue: {
            ...defaultMailerOptions,
            transport: new SMTPTransport({}),
          },
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    bookingRepo = module.get<BookingsRepo>(BookingsRepo);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('newBooking', () => {
    it('should return created and send mail', async () => {
      jest
        .spyOn(bookingRepo, 'hasBooking')
        .mockImplementation(() => Promise.resolve(false));
      jest
        .spyOn(bookingRepo, 'tableCount')
        .mockImplementation(() => Promise.resolve(0));
      const successRequest = {
        ...BOOKING_OK,
        createdAt: new Date(Date.now()),
        code: '123456',
      };
      jest
        .spyOn(bookingRepo, 'createBookingRequest')
        .mockImplementation(() => Promise.resolve(successRequest));
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });

      expect(await controller.newBooking(BOOKING_OK)).toMatchObject(
        successRequest
      );
      expect(send).toHaveBeenCalled();
      expect(lastMail.data.from).toBe(environment.noreplyAddress);
      expect(lastMail.data.to).toBe(BOOKING_OK.email);
      expect(lastMail.data.subject).toBe('Booking confirmation code');
      expect(lastMail.data['context']).toMatchObject({
        bookingDateStr: 'Sat Feb 01 2020',
        code: '123456',
        email: 'itsme@me.com',
        confirmationUrl: 'https://bookings.com/confirm?token=token',
      });
    });
  });

  describe('confirmCode', () => {
    it('should return created and send mail', async () => {
      const requestOk = BOOKING_REQUEST_OK;

      jest.spyOn(bookingRepo, 'findRequestByEmail').mockImplementation(() =>
        Promise.resolve([
          new bookingRequestModel({
            ...requestOk,
            _id: 'id_booking_req',
          }) as BookingRequestDocument,
        ])
      );
      jest.spyOn(bookingRepo, 'createBooking').mockImplementation(() =>
        Promise.resolve(
          new bookingModel({
            ...requestOk,
            _id: 'id_booking',
          }) as BookingDocument
        )
      );
      jest
        .spyOn(bookingRepo, 'deleteRequest')
        .mockImplementation(() => Promise.resolve(undefined));
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });
      await controller.confirmCode(
        BOOKING_REQUEST_OK.email,
        BOOKING_REQUEST_OK.code
      );
      expect(send).toHaveBeenCalled();
      expect(lastMail.data.from).toBe(environment.noreplyAddress);
      expect(lastMail.data.to).toBe(BOOKING_OK.email);
      expect(lastMail.data.subject).toBe('Booking confirmation');
      expect(lastMail.data['context']).toMatchObject({
        bookingDateStr: 'Sat Feb 01 2020',
        email: 'itsme@me.com',
        cancellationUrl: 'https://bookings.com/cancel?token=token',
      });
    });
  });

  describe('confirmToken', () => {
    it('should return created and send mail', async () => {
      const requestOk = BOOKING_REQUEST_OK;

      jest.spyOn(bookingRepo, 'findRequestByEmail').mockImplementation(() =>
        Promise.resolve([
          new bookingRequestModel({
            ...requestOk,
            _id: 'id_booking_req',
          }) as BookingRequestDocument,
        ])
      );
      jest.spyOn(bookingRepo, 'createBooking').mockImplementation(() =>
        Promise.resolve(
          new bookingModel({
            ...requestOk,
            _id: 'id_booking',
          }) as BookingDocument
        )
      );
      jest
        .spyOn(bookingRepo, 'deleteRequest')
        .mockImplementation(() => Promise.resolve(undefined));
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });
      await controller.confirmToken(BOOKING_REQUEST_OK.email);
      expect(send).toHaveBeenCalled();
      expect(lastMail.data.from).toBe(environment.noreplyAddress);
      expect(lastMail.data.to).toBe(BOOKING_OK.email);
      expect(lastMail.data.subject).toBe('Booking confirmation');
      expect(lastMail.data['context']).toMatchObject({
        bookingDateStr: 'Sat Feb 01 2020',
        email: 'itsme@me.com',
        cancellationUrl: 'https://bookings.com/cancel?token=token',
      });
    });
  });

  describe('cancel', () => {
    it('should return ok and send confirmation mail', async () => {
      const requestOk = BOOKING_REQUEST_OK;

      jest.spyOn(bookingRepo, 'findBookingByToken').mockImplementation(() =>
        Promise.resolve(
          new bookingModel({
            ...requestOk,
            _id: 'id_booking',
          }) as BookingDocument
        )
      );
      jest
        .spyOn(bookingRepo, 'deleteBooking')
        .mockImplementation(() => Promise.resolve(undefined));
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });
      await controller.cancel(BOOKING_REQUEST_OK.token);
      expect(send).toHaveBeenCalled();
      expect(lastMail.data.from).toBe(environment.noreplyAddress);
      expect(lastMail.data.to).toBe(BOOKING_OK.email);
      expect(lastMail.data.subject).toBe('Booking canceled !');
      expect(lastMail.data['context']).toMatchObject({
        bookingDateStr: 'Sat Feb 01 2020',
        email: 'itsme@me.com',
      });
    });
  });
});
