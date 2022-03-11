import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsRepo } from './booking.repo';
import {
  Booking,
  BookingRequest,
  BookingRequestSchema,
  BookingSchema,
} from './booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    MongooseModule.forFeature([
      { name: BookingRequest.name, schema: BookingRequestSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingsRepo],
})
export class BookingModule {}
