import { MailerTransportFactory } from '@nestjs-modules/mailer';
import { TransportType } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import * as nodemailerMock from 'nodemailer-mock';
import MailMessage from 'nodemailer/lib/mailer/mail-message';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class TestTransportFactory implements MailerTransportFactory {
  createTransport(options?: TransportType) {
    return nodemailerMock.createTransport({ host: 'localhost', port: -100 });
  }
}

/**
 * Common testing code for spying on the SMTPTransport's send() implementation
 */
export function spyOnSmtpSend(onMail: (mail: MailMessage) => void) {
  return jest
    .spyOn(SMTPTransport.prototype, 'send')
    .mockImplementation(function (
      mail: MailMessage,
      callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void
    ): void {
      onMail(mail);
      callback(null, {
        envelope: {
          from: mail.data.from as string,
          to: [mail.data.to as string],
        },
        messageId: 'ABCD',
        accepted: [],
        rejected: [],
        pending: [],
        response: 'ok',
      });
    });
}

describe('Mailer', () => {
  it('should be defined', () => {
    expect(0).toBeDefined();
  });
});
