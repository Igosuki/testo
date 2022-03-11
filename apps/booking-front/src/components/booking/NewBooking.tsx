import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { environment } from '../../environments/environment';
import { Box, Button, Calendar, Select, TextInput } from 'grommet';
import { DateTime } from 'luxon';

const minBookingDate = () => {
  const dt = DateTime.now().setZone('Europe/Paris').set({ hour: 20 });

  return dt;
};

type BookingParams = {
  date?: Date;
  numguests?: number;
  fullname?: string;
  email?: string;
};

export function NewBooking() {
  const [bookingDate, setBookingDate] = React.useState(minBookingDate());
  const [fullname, setFullname] = React.useState<undefined | string>(undefined);
  const [email, setEmail] = React.useState<undefined | string>(undefined);
  const [numguests, setNumGuests] = React.useState(1);
  const [bookingDates, setBookingDates] = React.useState([]);
  const [bookingError, setBookingError] = React.useState<null | string>(null);
  const navigate = useNavigate();
  React.useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(
          `${environment.apiUrl}/api/bookings/available`,
          {}
        );
        setBookingDates(data);
      } catch {
        navigate('/');
      }
    }
    fetchData();
  }, [navigate]);

  const handleNewBooking = async (booking: BookingParams) => {
    const { data } = await axios.post(
      `${environment.apiUrl}/api/bookings`,
      booking
    );
    if (data.status === 201) {
    } else if (data.status === 400) {
      setBookingError(data.message);
    } else {
      setBookingError('something went wrong');
    }
  };

  const minDate = minBookingDate();
  const maxDate = minDate.plus({ year: 3 });
  return (
    <Box>
      <Box key="email">
        <TextInput
          placeholder="Your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Box>
      <br />
      <Box key="fullname">
        <TextInput
          placeholder="Your full name"
          value={fullname}
          onChange={(event) => setFullname(event.target.value)}
        />
      </Box>
      <br />
      <Box key="numguests">
        <Select
          options={['1', '2', '3', '4']}
          value={numguests.toString()}
          onChange={({ option }) => setNumGuests(parseInt(option))}
        />
      </Box>
      <br />
      <Box key="cal">
        <Calendar
          size="small"
          locale={'fr-FR'}
          daysOfWeek
          bounds={[minDate.toISO(), maxDate.toISO()]}
          date={bookingDate.toISO()}
          onSelect={(newDate) => {
            if (typeof newDate == 'string') {
              const d = DateTime.fromISO(newDate).set({ hour: 20 });
              console.log(d.toISO());
              setBookingDate(d);
            }
          }}
        />
      </Box>
      <br />
      <Box key="submit">
        <Button
          style={{ padding: 10 }}
          primary
          onClick={() =>
            handleNewBooking({
              date: bookingDate.toJSDate(),
              email: email,
              fullname: fullname,
              numguests: numguests,
            })
          }
        >
          Book for&nbsp;
          {bookingDate.toFormat('dd LLL yyyy')}
        </Button>
        <p>N.B.: there is a single catering at 8pm</p>
      </Box>
    </Box>
  );
}
