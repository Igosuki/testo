import styled from '@emotion/styled';
import NxWelcome from './nx-welcome';
import { Box, Grommet, ResponsiveContext } from 'grommet';
import { Route, Link, Routes } from 'react-router-dom';
import { NewBooking } from '../components/booking/NewBooking';
import { ConfirmBooking } from '../components/booking/ConfirmBooking';
import { Yay } from '../components/booking/Yay';
import { ConfirmTokenBooking } from '../components/booking/ConfirmTokenBooking';
import { CancelBooking } from '../components/booking/CancelBooking';
import { Ow } from '../components/booking/Ow';

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
                <Route
                  path="/confirm_token"
                  element={<ConfirmTokenBooking />}
                />
                <Route path="/cancel" element={<CancelBooking />} />
                <Route path="/yay" element={<Yay />} />
                <Route path="/ow" element={<Ow />} />
              </Routes>
            </Box>
          </Box>
        )}
      </ResponsiveContext.Consumer>
    </Grommet>
  );
}

export default App;
