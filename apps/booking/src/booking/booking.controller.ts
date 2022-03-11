import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { BookingsRepo } from './booking.repo';
import {
  Booking,
  BookingRequest,
  BookingRequestDocument,
  MAX_TABLES,
  TABLE_SIZE,
} from './booking.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { DateTime } from 'luxon';
import { environment } from '../environments/environment';

/**
 * Throws if the provided date is same day after hours
 * @param date the date to check
 */
const checkNotAfterHours = (date: Date) => {
  const now = new Date(Date.now());
  if (date.getDate() === now.getDate() && date.getHours() > 19) {
    throw new BadRequestException({ message: 'validation.afterhours' });
  }
};

@Controller('bookings')
export class BookingController {
  constructor(private repo: BookingsRepo, private mailer: MailerService) {}

  @Get('/available')
  async availableDates(
    @Param() month: number,
    @Param() year: number
  ): Promise<any> {
    const from: Date = new Date(year, month, 0);
    const to: Date = new Date(year, month + 1, 0);
    return this.repo.availableDates(from, to, MAX_TABLES);
  }

  @Post()
  async newBooking(@Body() booking: Booking): Promise<BookingRequest> {
    checkNotAfterHours(new Date(Date.now()));
    const dt = DateTime.fromJSDate(booking.date).setZone('Europe/Paris');
    if (dt.hour != 20) {
      throw new BadRequestException({ message: 'validation.afterhours' });
    }
    const tableCount = await this.repo.tableCount(booking.date);
    if (
      tableCount + Math.ceil(booking.numguests / TABLE_SIZE) * TABLE_SIZE >
      MAX_TABLES
    ) {
      throw new BadRequestException({ message: 'validation.bookingsfull' });
    }
    if (await this.repo.hasBooking(booking.email, booking.date)) {
      throw new BadRequestException({ message: 'validation.sameday' });
    }
    const pendingRequest: BookingRequest = BookingRequest.fromBooking(booking);
    const created = await this.repo.createBookingRequest(pendingRequest);
    let sent = await this.mailer.sendMail({
      to: created.email,
      from: environment.noreplyAddress,
      subject: 'Booking confirmation code',
      template: 'code_confirm',
      context: {
        confirmationUrl: `https://bookings.com/confirm?token=${created.token}`,
        email: created.email,
        code: created.code,
        bookingDateStr: created.date.toDateString(),
      },
    });
    return created;
  }

  @Post('/code')
  async confirmCode(@Param() email: string, @Param() code: string) {
    const pending = await this.repo.findRequestByEmail(email);
    const matchingRequest = pending.find((pr) => pr.code === code);
    if (!matchingRequest) {
      return new NotFoundException();
    }
    checkNotAfterHours(new Date(Date.now()));
    await this.confirmRequest(matchingRequest);
  }

  async confirmRequest(req: BookingRequestDocument) {
    const booking: Booking = { ...req };
    const created = await this.repo.createBooking(booking);
    await this.repo.deleteRequest(req._id);
    await this.mailer.sendMail({
      to: created.email,
      from: environment.noreplyAddress,
      subject: 'Booking confirmation',
      template: 'booking_confirm',
      context: {
        email: created.email,
        bookingDateStr: created.date.toDateString(),
        cancellationUrl: `https://bookings.com/cancel?token=${created.token}`,
      },
    });
  }

  @Post('/token')
  async confirmToken(@Param() token: string) {
    const matchingRequest = await this.repo.findRequestByToken(token);
    if (!matchingRequest) {
      return new NotFoundException();
    }
    checkNotAfterHours(new Date(Date.now()));
    await this.confirmRequest(matchingRequest);
  }

  @Delete()
  async cancel(@Param() token: string) {
    const matchingBooking = await this.repo.findBookingByToken(token);
    if (!matchingBooking) {
      return new NotFoundException();
    }
    checkNotAfterHours(new Date(Date.now()));
    await this.repo.deleteBooking(token);
    await this.mailer.sendMail({
      to: matchingBooking.email,
      from: environment.noreplyAddress,
      subject: 'Booking canceled !',
      template: 'cancel_confirm',
      context: {
        email: matchingBooking.email,
        bookingDateStr: matchingBooking.date.toDateString(),
      },
    });
  }
}

/// send email at 7pm with room setup
/// compute a score with based on previous seating based on email, and rank each table group
