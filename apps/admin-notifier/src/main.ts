import { Handler, Context } from 'aws-lambda';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Booking,
  BookingSchema,
  ClientScore,
  ClientScoreSchema,
} from '../../booking/src/booking/booking.schema';
import mongoose from 'mongoose';

main().catch((err) => console.log(err));

/// This AWS lambda sends an email to the admin with the table layout
async function main() {
  await mongoose.connect('mongodb://localhost:27017/test');

  const booking = mongoose.model(Booking.name, BookingSchema);
  const clientScore = mongoose.model(ClientScore.name, ClientScoreSchema);
  /// get today's bookings
  /// sort clients by score asc, this is today's mapping, if no score, use random value
  /// update client score with today's bookings, computing: sum(score + table number / number of bookings)
}
