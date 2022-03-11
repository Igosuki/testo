import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Calendar, Select, Spinner, TextInput } from 'grommet';
import { DateTime } from 'luxon';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactCodeInput from 'react-verification-code-input';
import { environment } from '../../environments/environment';

export function CancelBooking() {
  const navigate = useNavigate();
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [cancelError, setCancelError] = React.useState<null | string>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const cancelBooking = async () => {
    const token = searchParams.get('token');
    setCancelLoading(true);
    const resp = await axios.delete(
      `${environment.apiUrl}/api/bookings?token=${token}`
    );
    setCancelLoading(false);
    if (resp.status === 200) {
      navigate('/ow');
    } else if (resp.status === 400) {
      setCancelError(resp.data.message);
    } else {
      setCancelError('something went wrong');
    }
  };

  useEffect(() => {
    cancelBooking();
  }, []);

  return (
    <Box>
      <Box key="code">
        {cancelLoading ? (
          <>
            Cancelling reservation... <Spinner />
          </>
        ) : (
          <></>
        )}
        {cancelError !== null ? (
          <span>Failed to cancel reservation : {cancelError}</span>
        ) : (
          <></>
        )}
      </Box>
      <br />
    </Box>
  );
}
