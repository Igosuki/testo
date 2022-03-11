import { environment } from './environments/environment';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

export const defaultMailerOptions = {
  transport: {
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: environment.mailerUser,
      pass: environment.mailerPass,
    },
  },
  defaults: {
    from: `"bookings" <${environment.noreplyAddress}>"`,
  },
  template: {
    dir: __dirname + '/templates/mail',
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
};
