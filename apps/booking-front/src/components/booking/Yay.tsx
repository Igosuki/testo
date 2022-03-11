import { Link, useNavigate } from 'react-router-dom';
import { Box, Heading } from 'grommet';
import React from 'react';

export function Yay() {
  return (
    <Box>
      <Heading>
        Booking Confirmed 🎉🎉🎉 ! You can make another reservation{' '}
        <Link to={'/'}>here</Link>{' '}
      </Heading>
      <br />
    </Box>
  );
}
