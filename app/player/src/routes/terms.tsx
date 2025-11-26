import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/terms')({
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ This is a placeholder terms of service. You should replace this with your actual terms of service drafted by legal counsel.
            </p>
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mt-6 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">2. Use of Service</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">2.1 Eligibility</h3>
            <p>
              You must be authorized by your organization to use this service. By using this service, you represent and warrant that you have the authority to accept these terms.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">2.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep your authentication credentials secure</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Ensure you log out from your account at the end of each session</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.3 Acceptable Use</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to the service or related systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated means to access the service without permission</li>
              <li>Transmit any malicious code or malware</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">3. Prize Selection and Awards</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">3.1 Prize Preferences</h3>
            <p>
              You may express preferences for available prizes through the service. Prize preferences do not guarantee award allocation, which is subject to availability and organizational policies.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">3.2 Award Fulfillment</h3>
            <p>
              Prize awards are subject to the terms and conditions set by the organization administering the awards program. We are not responsible for the fulfillment of physical prizes or awards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">4. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">5. User Data and Privacy</h2>
            <p>
              Your use of the service is also governed by our Privacy Policy. Please review our Privacy Policy, which explains how we collect, use, and disclose information about you.
            </p>
            <p className="mt-2">
              <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
                View our Privacy Policy
              </Link>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">6. Disclaimers</h2>
            <h3 className="text-xl font-medium mt-4 mb-2">6.1 Service Provided "As Is"</h3>
            <p>
              The service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">6.2 No Guarantee of Availability</h3>
            <p>
              We do not guarantee that the service will be uninterrupted, timely, secure, or error-free. We reserve the right to modify or discontinue the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">7. Limitation of Liability</h2>
            <p>
              In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of or inability to access or use the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Any content obtained from the service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">8. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will provide notice of material changes by posting the new terms on this page and updating the "Last updated" date. Your continued use of the service after any such changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">9. Termination</h2>
            <p>
              We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason, including without limitation if you breach the terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">10. Governing Law</h2>
            <p>
              These terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              <strong>[Your Company Name]</strong><br />
              Email: [legal@yourcompany.com]<br />
              Address: [Your Company Address]
            </p>
          </section>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-8">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This is a template terms of service. Please consult with legal counsel to ensure your terms of service are appropriate for your specific service, jurisdiction, and business model.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
