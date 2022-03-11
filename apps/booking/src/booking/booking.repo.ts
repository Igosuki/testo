import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  Booking,
  BookingDocument,
  BookingRequest,
  BookingRequestDocument,
  MAX_TABLES,
  TABLE_SIZE,
} from './booking.schema';

const dateClause = (date: Date) => {
  const midnight = new Date(date.getTime());
  midnight.setHours(0, 0, 0, 0);
  const tonight = new Date(date.getTime());
  tonight.setHours(23, 59, 59, 999);
  return { $gte: midnight, $lt: tonight };
};

@Injectable()
export class BookingsRepo {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<BookingDocument>,
    @InjectModel(BookingRequest.name)
    private bookingRequestModel: Model<BookingRequestDocument>
  ) {}

  /**
   * Create a pending booking request
   * @param bookingRequest the booking request
   */
  async createBookingRequest(
    bookingRequest: BookingRequest
  ): Promise<BookingRequest> {
    const createdBooking = new this.bookingRequestModel(bookingRequest);
    return createdBooking.save();
  }

  /**
   * Create a booking
   * @param bookingRequest the booking request
   */
  async createBooking(bookingRequest: Booking): Promise<BookingDocument> {
    const createdBooking = new this.bookingModel(bookingRequest);
    return createdBooking.save();
  }

  /**
   * Delete a booking request
   * @param the object id of the booking request
   */
  async deleteRequest(id: string): Promise<number> {
    const result = await this.bookingRequestModel
      .deleteOne({ _id: { $eq: id } })
      .exec();
    return result.deletedCount;
  }

  /**
   * For a day, return the number of guests.
   * @param date the day for which to count tables
   */
  async tableCount(date: Date): Promise<any> {
    const query = [
      { $match: { date: dateClause(date) } },
      {
        $project: {
          numguestsadjusted: {
            $ceil: { $divide: ['$numguests', TABLE_SIZE] },
          },
        },
      },
      {
        $group: {
          _id: null,
          tableCount: { $sum: '$numguestsadjusted' },
        },
      },
    ];
    return Promise.all([
      this.bookingModel.aggregate(query).exec(),
      this.bookingRequestModel.aggregate(query).exec(),
    ]).then((counts) => {
      counts
        .map((v) => v['tableCount'])
        .reduce((a, b) => {
          console.log(a, b);
          a + b;
        }, 0);
    });
  }

  /**
   * Return dates with less than n numguests between two dates
   * @param from the start date
   * @param to the end date
   */
  async availableDates(from: Date, to: Date, n: number): Promise<any> {
    const agg = [
      { $match: { date: { $gte: from, $lte: to } } },
      {
        $project: {
          day: {
            $dateToString: { format: '%Y-%m-%d:', date: '$date' },
          },
        },
      },
      {
        $group: {
          _id: '$day',
          count: { $sum: '$numguests' },
        },
      },
    ];
    const bookingsCounts = await this.bookingModel.aggregate(agg);
    const requestsCounts = await this.bookingRequestModel.aggregate(agg);
    console.log(bookingsCounts);
    console.log(requestsCounts);
    const counts: Map<string, number> = new Map();
    bookingsCounts.forEach((r) => {
      counts[r._id] = counts[r._id] ? counts[r._id] + r.count : r.count;
    });
    requestsCounts.forEach((r) => {
      counts[r._id] = counts[r._id] ? counts[r._id] + r.count : r.count;
    });
    return Array.from(counts.entries()).filter(
      ([day, count]) => count <= n - TABLE_SIZE
    );
  }

  /**
   * Find all existing booking requests for this email
   * @param email the email used for registration
   */
  async findByEmail(email: string): Promise<BookingDocument[]> {
    return this.bookingModel.find({ email: { $eq: email } }).exec();
  }

  /**
   * Find all pending booking requests for this email
   * @param email the email used for registration
   */
  async findRequestByEmail(email: string): Promise<BookingRequestDocument[]> {
    return this.bookingRequestModel.find({ email: { $eq: email } }).exec();
  }

  /**
   * Find the corresponding request for this token
   * @param token the request token
   */
  async findRequestByToken(token: string): Promise<BookingRequestDocument> {
    return this.bookingRequestModel.findOne({ token: { $eq: token } }).exec();
  }

  /**
   * Find the corresponding booking for this token
   * @param token the original request token
   */
  async findBookingByToken(token: string): Promise<BookingDocument> {
    return this.bookingModel.findOne({ token: { $eq: token } }).exec();
  }

  /**
   * Check wether or not a booking exists for the given email and date
   * @param email the email used for registration
   * @param date the date to check bookings for
   */
  async hasBooking(email: string, date: Date): Promise<boolean> {
    return this.bookingModel
      .findOne({ email: { $eq: email }, date: dateClause(date) })
      .exec()
      .then((v) => v != undefined);
  }

  /**
   * Cancel a booking
   * @param token the token generated at the time of booking
   */
  async deleteBooking(token: string): Promise<number> {
    const result = await this.bookingModel
      .deleteOne({ token: { $eq: token } })
      .exec();
    return result.deletedCount;
  }
}
