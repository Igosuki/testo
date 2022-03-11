import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Calendar, Select, Spinner, TextInput } from 'grommet';
import { DateTime } from 'luxon';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactCodeInput from 'react-verification-code-input';
import { environment } from '../../environments/environment';

export function ConfirmTokenBooking() {
  const navigate = useNavigate();
  const [tokenError, setTokenError] = React.useState<null | string>(null);
  const [tokenLoading, setTokenLoading] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const verifyToken = async () => {
    const token = searchParams.get('token');
    setTokenLoading(true);
    const resp = await axios.post(
      `${environment.apiUrl}/api/bookings/token?token=${token}`
    );
    setTokenLoading(false);
    if (resp.status === 201) {
      navigate('/yay');
    } else if (resp.status % 400 > 0) {
      setTokenError(resp.data.message);
    } else {
      setTokenError('something went wrong');
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <Box>
      <Box key="token">
        {tokenLoading ? <Spinner /> : <></>}
        {tokenError !== null ? (
          <>
            <span>Failed to confirm token : {tokenError}</span>
            <Link to={'/'}>Click here to nake another reservation</Link>
          </>
        ) : (
          <></>
        )}
      </Box>
      <br />
    </Box>
  );
}
