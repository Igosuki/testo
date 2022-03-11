import { environment } from './environments/environment';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

export const defaultMailerOptions = {
  transport: environment.mailerUrl,
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
