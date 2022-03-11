export const environment = {
  production: false,
  mongodbUrl:
    process.env.BOOKING_MONGO_URL ||
    'mongodb://bookings:password@localhost:27017/',
  mailerUrl:
    process.env.BOOKING_MAILER_URL ||
    'smtps://220ddf17873b35@mailtrap.io:617423f3260bb2@smtp.mailtrap.io:2525',
  noreplyAddress: 'noreply@bookings.com',
};
