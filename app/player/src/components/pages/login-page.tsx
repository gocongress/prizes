import { EmailForm } from '@/components/forms/email-form';
import { OTPForm } from '@/components/forms/otp-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Route } from '@/routes/login';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

// ---------- Page component ----------
function LoginPage() {
  const { queryClient } = Route.useRouteContext();
  const [showOtp, setShowOtp] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const { createUser, login, createUserState, loginState } = useAuth();

  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // When the login page goes out of scope, by a redirection, invalidate the profile query
  // to cause the root router to fetch new user details
  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    };
  }, [queryClient]);

  const handleEmailSubmit = async (email: string) => {
    if (!isVerified || !token) {
      toast.error(
        'Site verification not completed, please refresh the page and try again before contacting support.',
      );
      return;
    }
    await createUser({ email, verificationToken: token });
    setSubmittedEmail(email);
    setShowOtp(true);
  };

  const handleOtpSubmit = async (otp: string) => {
    if (!isVerified || !token) {
      toast.error(
        'Site verification not completed, please refresh the page and try again before contacting support.',
      );
      return;
    }
    await login({ email: submittedEmail, oneTimePass: otp, verificationToken: token }).then(() => {
      navigate({ to: '/', replace: true, reloadDocument: true });
    });
  };

  const handleBack = () => {
    setShowOtp(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            {showOtp
              ? `Enter the one-time password sent to ${submittedEmail}`
              : 'Enter your e-mail address to continue'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!showOtp ? (
            <EmailForm
              onSubmit={handleEmailSubmit}
              isLoading={createUserState.isLoading}
              verifyCallback={verifyCallback}
              handleVerifyError={handleVerifyError}
            />
          ) : (
            <OTPForm
              onSubmit={handleOtpSubmit}
              onBack={handleBack}
              isLoading={loginState.isLoading}
              verifyCallback={verifyCallback}
              handleVerifyError={handleVerifyError}
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            By continuing you agree to our{' '}
            <a href="/terms" className="underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;
