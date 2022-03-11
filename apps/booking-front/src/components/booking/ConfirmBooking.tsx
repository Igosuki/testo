import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Calendar, Select, TextInput } from 'grommet';
import { DateTime } from 'luxon';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactCodeInput from 'react-verification-code-input';
import { environment } from '../../environments/environment';

export function ConfirmBooking() {
  const navigate = useNavigate();
  const [inputEnabled, setInputEnabled] = React.useState(true);
  const [codeError, setCodeError] = React.useState<null | string>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const verifyCode = async (code: string) => {
    setInputEnabled(false);
    const email = searchParams.get('email');
    const resp = await axios.post(
      `${environment.apiUrl}/api/bookings/code?email=${email}&code=${code}`
    );
    if (resp.status === 201) {
      navigate('/yay');
    } else if (resp.status % 400 > 0) {
      setCodeError(resp.data.message);
    } else {
      setCodeError('something went wrong');
    }
  };

  return (
    <Box>
      <Box key="code">
        <ReactCodeInput
          disabled={!inputEnabled}
          fields={6}
          type={'number'}
          onComplete={(code) => verifyCode(code)}
        />
        {codeError !== null ? (
          <span>Failed to confirm code : {codeError}</span>
        ) : (
          <></>
        )}
      </Box>
      <br />
    </Box>
  );
}
