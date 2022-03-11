import { Link, useNavigate } from 'react-router-dom';
import { Box, Heading } from 'grommet';
import React from 'react';

export function Ow() {
  return (
    <Box>
      <Heading>
        Booking Canceled ☺️ ! You can always make another reservation
        <Link to={'/'}>here</Link>{' '}
      </Heading>
      <br />
    </Box>
  );
}
