import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsRepo } from './booking.repo';
import {
  Booking,
  BookingRequest,
  BookingRequestDocument,
  MAX_GUESTS,
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

  @Get('/tables')
  async tableCount(): Promise<any> {
    const count = await this.repo.tableCount(new Date(Date.now()));
    return { tableCount: count };
  }

  @Get('/fulldates')
  async fullDates(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number
  ): Promise<string[]> {
    const dt = DateTime.local(year, month, 1, { zone: 'Europe/Paris' });
    const from: Date = dt.toJSDate();
    const to: Date = dt.plus({ month: 1 }).toJSDate();
    return this.repo.fullDates(from, to, MAX_GUESTS);
  }

  @Post()
  async newBooking(@Body() booking: Booking) {
    checkNotAfterHours(new Date(Date.now()));
    const dt = DateTime.fromJSDate(booking.date).setZone('Europe/Paris');
    if (dt.hour != 20) {
      throw new BadRequestException({ message: 'validation.afterhours' });
    }
    const tableCount = await this.repo.tableCount(booking.date);
    if (tableCount * TABLE_SIZE > MAX_GUESTS) {
      throw new BadRequestException({ message: 'validation.bookingsfull' });
    }
    if (
      (await this.repo.hasBooking(booking.email, booking.date)) ||
      (await this.repo.hasBookingRequest(booking.email, booking.date))
    ) {
      throw new BadRequestException({ message: 'validation.sameday' });
    }
    const pendingRequest: BookingRequest = BookingRequest.fromBooking(booking);
    const created = await this.repo.createBookingRequest(pendingRequest);
    await this.mailer.sendMail({
      to: created.email,
      from: environment.noreplyAddress,
      subject: 'Booking confirmation code',
      template: 'code_confirm',
      context: {
        confirmationUrl: `${environment.siteUrl}/confirm?email=${created.email}`,
        tokenConfirmationUrl: `${environment.siteUrl}/confirm_token?token=${created.token}`,
        email: created.email,
        code: created.code,
        bookingDateStr: created.date.toDateString(),
      },
    });
  }

  @Post('/code')
  async confirmCode(
    @Query('email') email: string,
    @Query('code') code: string
  ) {
    const pending = await this.repo.findRequestByEmail(email);
    const matchingRequest = pending.find((pr) => pr.code === code);
    if (!matchingRequest) {
      return new NotFoundException();
    }
    checkNotAfterHours(new Date(Date.now()));
    await this.confirmRequest(matchingRequest);
  }

  async confirmRequest(req: BookingRequestDocument) {
    const booking: Booking = Booking.fromRequest(req);
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
        cancellationUrl: `${environment.siteUrl}/cancel?token=${created.token}`,
      },
    });
  }

  @Post('/token')
  async confirmToken(@Query('token') token: string) {
    const matchingRequest = await this.repo.findRequestByToken(token);
    if (!matchingRequest) {
      return new NotFoundException();
    }
    checkNotAfterHours(new Date(Date.now()));
    await this.confirmRequest(matchingRequest);
  }

  @Delete()
  async cancel(@Query('token') token: string) {
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
