import { Booking, BookingRequest } from './booking.schema';

export const BOOKING_OK: Booking = {
  email: 'itsme@me.com',
  numguests: 1,
  fullname: 'Me Mario',
  date: new Date(2020, 1, 1, 20),
  token: 'token',
};

export const BOOKING_REQUEST_OK: BookingRequest = {
  ...BOOKING_OK,
  code: '123456',
  createdAt: new Date(Date.now()),
};

export const BAD_EMAIL = { ...BOOKING_REQUEST_OK, email: 'itsme' };
