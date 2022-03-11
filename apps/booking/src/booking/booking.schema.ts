import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsDate, IsEmail, IsNumber, Max, Min } from 'class-validator';
import { BAD_INPUT_EMAIL } from '../messages';
import { randomBytes } from 'crypto';
import { Type } from 'class-transformer';

export const MAX_TABLES = 20;

export const TABLE_SIZE = 2;

@Schema()
export class Booking {
  @Prop({ type: Date, required: true })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @Prop({ required: true })
  @Min(1)
  @Max(4)
  numguests: number;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true })
  @IsEmail({}, { message: BAD_INPUT_EMAIL })
  email: string;

  @Prop({ required: false })
  token: string;
}

export type BookingDocument = Booking & Document;

export const BookingSchema = SchemaFactory.createForClass(Booking);

@Schema()
export class BookingRequest extends Booking {
  @Prop({ type: Date, expires: 15 * 60, default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  override token: string;

  static fromBooking(booking: Booking): BookingRequest {
    let token = '0';
    randomBytes(48, function (err, buffer) {
      token = buffer.toString('hex');
    });
    return {
      ...booking,
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: new Date(Date.now()),
      token: token,
    };
  }
}

export type BookingRequestDocument = BookingRequest & Document;

export const BookingRequestSchema =
  SchemaFactory.createForClass(BookingRequest);
