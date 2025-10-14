import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <CardDescription className="text-base">
              Last Updated: October 14, 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to AutoPrep Team Dashboard (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our calendar integration and pre-sales automation platform.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                By using AutoPrep Team Dashboard, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We collect the following personal information when you create a profile:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Name</li>
                <li>Email address</li>
                <li>Job title</li>
                <li>Company information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Calendar Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                When you connect your Google or Outlook calendar, we access and store:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Calendar event titles</li>
                <li>Event descriptions</li>
                <li>Event start and end times</li>
                <li>Attendee information</li>
                <li>Meeting locations (if applicable)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 OAuth Tokens</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We securely store OAuth access tokens and refresh tokens to maintain your calendar connections. These tokens are encrypted and stored in our secure database.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Usage Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We automatically collect certain information about your use of the platform:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Token usage for AI operations</li>
                <li>Feature usage statistics</li>
                <li>Error logs and diagnostic data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li><strong>Calendar Synchronization:</strong> To sync and display your calendar events within the dashboard</li>
                <li><strong>Pre-Sales Automation:</strong> To generate pre-sales reports and presentation materials based on your calendar events</li>
                <li><strong>AI Processing:</strong> To analyze meeting information and create relevant content using AI agents</li>
                <li><strong>Service Improvement:</strong> To understand usage patterns and improve our platform</li>
                <li><strong>Communication:</strong> To send you important updates about your account and our services</li>
                <li><strong>Support:</strong> To provide customer support and respond to your inquiries</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Third-Party Services</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We share your information with the following third-party services:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li><strong>Google Calendar API:</strong> To access and sync your Google calendar events</li>
                <li><strong>Microsoft Outlook API:</strong> To access and sync your Outlook calendar events</li>
                <li><strong>AI Service Providers:</strong> To process calendar data and generate reports (data is anonymized where possible)</li>
                <li><strong>Vercel:</strong> Our hosting provider for application infrastructure</li>
                <li><strong>Vercel Postgres:</strong> Our database provider for secure data storage</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Legal Requirements</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may disclose your information if required by law, court order, or governmental regulation, or if we believe such action is necessary to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Comply with legal obligations</li>
                <li>Protect and defend our rights or property</li>
                <li>Prevent fraud or security issues</li>
                <li>Protect the safety of our users or the public</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 No Sale of Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li><strong>Encryption:</strong> All data is encrypted in transit using HTTPS/TLS and at rest in our database</li>
                <li><strong>OAuth 2.0:</strong> We use secure OAuth 2.0 authentication for calendar connections</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can access your data</li>
                <li><strong>Regular Security Audits:</strong> We regularly review and update our security practices</li>
                <li><strong>Secure Infrastructure:</strong> Our application is hosted on Vercel&apos;s secure infrastructure</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Access and Update</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You can access and update your profile information at any time through your dashboard settings.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Disconnect Calendar</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You can disconnect your Google or Outlook calendar at any time. This will revoke our access to your calendar data and delete stored OAuth tokens.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Data Deletion</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the right to request deletion of your account and all associated data. Contact us at the email below to request account deletion.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.4 Data Portability</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the right to request a copy of your data in a portable format.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li><strong>Profile Data:</strong> Retained while your account is active</li>
                <li><strong>Calendar Events:</strong> Retained for the duration of your account or until you disconnect your calendar</li>
                <li><strong>OAuth Tokens:</strong> Retained until you disconnect your calendar or delete your account</li>
                <li><strong>Usage Logs:</strong> Retained for up to 90 days for operational purposes</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Upon account deletion, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                AutoPrep Team Dashboard is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our service, you consent to the transfer of your information to our facilities and third-party service providers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Your continued use of AutoPrep Team Dashboard after any modifications to this Privacy Policy constitutes your acceptance of the changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Google API Services User Data Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                AutoPrep Team Dashboard&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                <a 
                  href="https://developers.google.com/terms/api-services-user-data-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We only request the minimum calendar permissions necessary to provide our service and do not use Google user data for any purposes beyond those disclosed in this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Email:</strong> privacy@autoprep.ai
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Website:</strong> https://team.autoprep.ai
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 48 hours
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Consent</h2>
              <p className="text-gray-700 dark:text-gray-300">
                By using AutoPrep Team Dashboard, you consent to this Privacy Policy and agree to its terms. If you do not agree with this policy, please do not use our service.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                © 2025 AutoPrep Team Dashboard. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
