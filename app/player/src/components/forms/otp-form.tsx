import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { Turnstile } from "@marsidev/react-turnstile";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";

const OTP_CODE_LENGTH = 8;

interface OTPFormProps {
  onSubmit: (otp: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  handleVerifyError: () => void;
  verifyCallback: (token: string) => void;
}

export function OTPForm({ onSubmit, onBack, isLoading, verifyCallback, handleVerifyError }: OTPFormProps) {
  const initialOtpState = Array(OTP_CODE_LENGTH).fill('');
  const [otp, setOtp] = useState<string[]>(initialOtpState);

  // Focus first OTP input when component mounts
  useEffect(() => {
    setTimeout(() => (document.getElementById('otp-0') as HTMLInputElement | null)?.focus(), 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const oneTimePass = otp.join('');
    if (oneTimePass.length !== OTP_CODE_LENGTH) {
      return;
    }
    try {
      await onSubmit(oneTimePass);
    } catch {
      // Reset OTP on error
      setOtp(initialOtpState);
      (document.getElementById('otp-0') as HTMLInputElement | null)?.focus();
    }
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^[0-9a-zA-Z]+$/.test(pastedData) || pastedData.length !== OTP_CODE_LENGTH) {
      return;
    }
    const newOtp = pastedData.split('').slice(0, OTP_CODE_LENGTH);
    setOtp(newOtp);
    document.getElementById(`otp-${OTP_CODE_LENGTH - 1}`)?.focus();
  };

  const handleBackClick = () => {
    setOtp(initialOtpState);
    onBack();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>One-time password</Label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otp.map((character, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={character}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold"
                autoComplete="off"
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || otp.join('').length !== OTP_CODE_LENGTH}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            'Login'
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={handleBackClick}
        >
          Back to email
        </Button>
      </form>
      <Turnstile siteKey={env.VITE_TURNSTILE_SITE_KEY} onSuccess={verifyCallback} onError={handleVerifyError} className="flex justify-center pt-2" />
    </>
  );
}
