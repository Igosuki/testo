import styled from '@emotion/styled';
import NxWelcome from './nx-welcome';
import { Box, Grommet, ResponsiveContext } from 'grommet';
import { Route, Link, Routes } from 'react-router-dom';
import { NewBooking } from '../components/booking/NewBooking';
import { ConfirmBooking } from '../components/booking/ConfirmBooking';
import { Yay } from '../components/booking/Yay';

const theme = {
  global: {
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
};

export function App() {
  return (
    <Grommet theme={theme} full>
      <ResponsiveContext.Consumer>
        {(size) => (
          <Box fill>
            <Box flex align="center" justify="center">
              <Routes>
                <Route path="/" element={<NewBooking />} />
                <Route path="/confirm" element={<ConfirmBooking />} />
                <Route path="/yay" element={<Yay />} />
              </Routes>
            </Box>
          </Box>
        )}
      </ResponsiveContext.Consumer>
    </Grommet>
  );
}

export default App;
