import styled from '@emotion/styled';
import NxWelcome from './nx-welcome';
import { Box, Grommet, ResponsiveContext } from 'grommet';
import { Route, Link, Routes } from 'react-router-dom';
import { NewBooking } from '../components/booking/NewBooking';

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
      {/*<div role="navigation">*/}
      {/*  <ul>*/}
      {/*    <li>*/}
      {/*      <Link to="/">Home</Link>*/}
      {/*    </li>*/}
      {/*    <li>*/}
      {/*      <Link to="/booking">Book</Link>*/}
      {/*    </li>*/}
      {/*  </ul>*/}
      {/*</div>*/}
      <ResponsiveContext.Consumer>
        {(size) => (
          <Box fill>
            <Box flex align="center" justify="center">
              <Routes>
                <Route path="/" element={<NewBooking />} />
              </Routes>
            </Box>
          </Box>
        )}
      </ResponsiveContext.Consumer>
    </Grommet>
  );
}

export default App;
