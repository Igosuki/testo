export const environment = {
  production: false,
  siteUrl: process.env.BOOKING_SITE_URL || 'http://localhost:4200',
  mongodbUrl:
    process.env.BOOKING_MONGO_URL ||
    'mongodb://bookings:password@localhost:27017/',
  mailerUser: process.env.BOOKING_MAILER_USER || '220ddf17873b35',
  mailerPass: process.env.BOOKING_MAILER_PASSWORD || '617423f3260bb2',
  noreplyAddress: 'noreply@bookings.com',
};
