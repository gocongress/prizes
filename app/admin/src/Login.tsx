import styles from '@/Login.module.css';
import { authProvider } from '@/providers/api/authProvider';
import { Turnstile } from '@marsidev/react-turnstile';
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { useLogin, useNotify, useRedirect } from 'react-admin';
import { OTP_CODE_LENGTH, TURNSTILE_SITE_KEY } from './config';

const LoginPage = () => {
  const initialState = Array(OTP_CODE_LENGTH).fill('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(initialState);
  const [requestOtp, setRequestOtp] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const redirect = useRedirect();

  useEffect(() => {
    if (!requestOtp) {
      // focus after DOM update
      setTimeout(() => (document.getElementById('otp-0') as HTMLInputElement | null)?.focus(), 0);
    }
  }, [requestOtp]);

  const handleOtp = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!isVerified || !token) {
      notify(
        'Site verification not completed, please refresh the page and try again before contacting support.',
        { type: 'error' },
      );
      return;
    }
    authProvider
      .getOtp({ email, verificationToken: token })
      .then((otpSent) => {
        setRequestOtp(!otpSent);
        notify('A one-time code sent to your email, use it to login to the system.');
      })
      .catch(() => {
        notify('Login failed, please contact support.');
        setOtp(initialState);
        (document.getElementById('otp-0') as HTMLInputElement | null)?.focus();
      });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!isVerified || !token) {
      notify(
        'Site verification not completed, please refresh the page and try again before contacting support.',
        { type: 'error' },
      );
      return;
    }
    const password = otp.join('');
    login({ email, password, verificationToken: token }, '/').catch((error) => {
      notify(error.message, { type: 'error' });
      // HTTP 400 (Bad Request) could be a mistyped code, while >400 are auth failures so redirect the user away
      if (error.status > 400) {
        redirect('/');
      }
      setOtp(initialState);
      (document.getElementById('otp-0') as HTMLInputElement | null)?.focus();
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_CODE_LENGTH - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: {
    preventDefault: () => void;
    clipboardData: { getData: (arg0: string) => string };
  }) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^[0-9a-zA-Z]$/.test(pastedData) && pastedData.length !== OTP_CODE_LENGTH) {
      notify(`Please paste a valid ${OTP_CODE_LENGTH}-character code (0-9, a-z).`);
      return;
    }
    const newOtp = pastedData.split('').slice(0, OTP_CODE_LENGTH);
    setOtp(newOtp);
    document.getElementById(`otp-${OTP_CODE_LENGTH - 1}`)?.focus();
  };

  const verifyCallback = useCallback((verificationToken: string) => {
    if (verificationToken) {
      setToken(verificationToken);
      setIsVerified(true);
    }
  }, []);

  const handleVerifyError = () => {
    setToken(null);
    setIsVerified(false);
  };

  return (
    <div className={styles.loginContainer}>
      {' '}
      {/* Wrap form to scope body styles */}
      <form className={styles.form} onSubmit={requestOtp ? handleOtp : handleSubmit}>
        {requestOtp ? (
          <>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={styles.emailInput}
            />
            <button type="submit" className={styles.submitButton}>
              Login with Email
            </button>
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={verifyCallback}
              onError={handleVerifyError}
              className="flex justify-center pt-2"
            />
          </>
        ) : (
          <>
            <div className={styles.otpContainer} onPaste={handlePaste}>
              {otp.map((character, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={character}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={styles.otpInput}
                />
              ))}
            </div>
            <button type="submit" className={styles.submitButton}>
              Submit Code
            </button>
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={verifyCallback}
              onError={handleVerifyError}
              className="flex justify-center pt-2"
            />
          </>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
