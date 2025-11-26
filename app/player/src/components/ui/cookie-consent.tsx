import { Button } from '@/components/ui/button';
import {
  acceptAllCookies,
  rejectAllCookies,
  shouldShowCookieBanner,
} from '@/lib/cookie-consent';
import { Link } from '@tanstack/react-router';
import { CookieIcon } from 'lucide-react';
import * as React from 'react';

function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    // Check if we should show the banner after component mounts
    setIsVisible(shouldShowCookieBanner());
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    closeBanner();
  };

  const handleRejectAll = () => {
    rejectAllCookies();
    closeBanner();
  };

  const closeBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-in-out ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
    >
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-lg">
        <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Icon and Message */}
            <div className="flex flex-1 items-start gap-4">
              <div className="text-muted-foreground mt-0.5 flex-shrink-0">
                <CookieIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  We use cookies
                </p>
                <p className="text-muted-foreground text-sm">
                  We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience.{' '}
                  <Link
                    to="/privacy"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Learn more
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="w-full sm:w-auto"
              >
                Reject All
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CookieConsent;
