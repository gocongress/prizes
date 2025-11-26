import { resetConsent } from '@/lib/cookie-consent';
import { Link } from '@tanstack/react-router';

function Footer() {
  const handleCookieSettings = () => {
    resetConsent();
    // Reload to show the cookie banner again
    window.location.reload();
  };

  return (
    <footer className="bg-sidebar">
      <div className="container mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-row-reverse gap-4 text-xs">
          <nav className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleCookieSettings}
              className="text-muted-foreground cursor-pointer hover:text-foreground underline-offset-4 hover:underline"
            >
              Cookie Settings
            </button>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
