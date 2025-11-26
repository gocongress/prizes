import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ This is a placeholder privacy policy. You should replace this with your actual privacy policy that complies with applicable laws and regulations.
            </p>
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-6 mb-4">1. Introduction</h2>
            <p>
              This Privacy Policy describes how we collect, use, and protect your personal information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address (for authentication)</li>
              <li>Prize preferences and selections</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authenticate and verify your identity</li>
              <li>Process your prize preferences and awards</li>
              <li>Improve our services</li>
              <li>Communicate important updates</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">4. Cookies and Tracking</h2>
            <p>We use cookies for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for authentication and basic site functionality (always enabled)
              </li>
              <li>
                <strong>Functional Cookies:</strong> Remember your preferences like sidebar state (requires consent)
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how you use our service (requires consent)
              </li>
            </ul>
            <p className="mt-4">
              You can manage your cookie preferences through our cookie consent banner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit (HTTPS)</li>
              <li>Secure authentication mechanisms (JWT tokens)</li>
              <li>HttpOnly and Secure cookie flags</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">7. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">8. Third-Party Services</h2>
            <p>
              We do not currently use third-party analytics or tracking services. If this changes, we will update this policy and obtain your consent where required.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mt-2">
              <strong>[Your Company Name]</strong><br />
              Email: [privacy@yourcompany.com]<br />
              Address: [Your Company Address]
            </p>
          </section>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-8">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This is a template privacy policy. Please consult with legal counsel to ensure your privacy policy complies with all applicable laws including GDPR, CCPA, and other data protection regulations relevant to your jurisdiction and user base.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
