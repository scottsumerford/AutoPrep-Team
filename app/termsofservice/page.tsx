import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <CardDescription className="text-base">
              Last Updated: October 14, 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to AutoPrep Team Dashboard. By accessing or using our service, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our service.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                These Terms constitute a legally binding agreement between you and AutoPrep Team Dashboard (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We reserve the right to modify these Terms at any time, and your continued use of the service constitutes acceptance of any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                AutoPrep Team Dashboard is a calendar integration and pre-sales automation platform that provides:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Integration with Google Calendar and Microsoft Outlook</li>
                <li>Automated calendar event synchronization</li>
                <li>AI-powered pre-sales report generation</li>
                <li>Presentation slide creation based on meeting data</li>
                <li>Token usage tracking and analytics</li>
                <li>Team collaboration features</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Account Creation</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To use AutoPrep Team Dashboard, you must create an account by providing accurate and complete information, including your name, email address, and job title. You are responsible for maintaining the confidentiality of your account credentials.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account Eligibility</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You must be at least 18 years old and have the legal capacity to enter into contracts to use our service. By creating an account, you represent and warrant that you meet these requirements.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Account Security</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access or security breach</li>
                <li>Ensuring your account information remains accurate and up-to-date</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Account Termination</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason we deem appropriate. You may also terminate your account at any time by contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Calendar Integration and Data Access</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">4.1 OAuth Authorization</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By connecting your Google or Outlook calendar, you authorize us to access your calendar data through OAuth 2.0 authentication. You can revoke this access at any time through your account settings or directly through your calendar provider.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Data Usage</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We will only access and use your calendar data as described in our Privacy Policy and as necessary to provide the service. We do not sell or share your calendar data with third parties for marketing purposes.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Data Accuracy</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                While we strive to accurately sync and display your calendar data, we do not guarantee the accuracy, completeness, or timeliness of calendar information. You are responsible for verifying important meeting details through your primary calendar application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. AI-Generated Content</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Content Generation</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our service uses artificial intelligence to generate pre-sales reports, presentation slides, and other content based on your calendar events and meeting data. This content is provided as-is and should be reviewed and edited before use.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 No Warranty</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not warrant the accuracy, completeness, or suitability of AI-generated content for any particular purpose. You are solely responsible for reviewing, editing, and approving all content before using it in professional settings.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Content Ownership</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You retain ownership of all content you input into the service and all AI-generated content created from your data. We do not claim ownership of your content, but you grant us a license to use it as necessary to provide the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use Policy</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Prohibited Activities</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated scripts or bots to access the service</li>
                <li>Reverse engineer, decompile, or disassemble any part of the service</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or harvest user data without permission</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Compliance</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You agree to comply with all applicable laws and regulations when using our service, including data protection laws, export control laws, and intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Token Usage and Billing</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Token System</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our service tracks token usage for AI operations, including agent runs, pre-sales report generation, and slide creation. Token consumption varies based on the complexity and length of operations.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Usage Limits</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may impose usage limits or quotas on token consumption. If you exceed your allocated tokens, additional charges may apply or service may be temporarily restricted until the next billing cycle.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.3 Pricing Changes</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to modify our pricing structure at any time. We will provide reasonable notice of any pricing changes, and continued use of the service after such changes constitutes acceptance of the new pricing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Our Property</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The service, including all software, designs, text, graphics, logos, and other content (excluding user-generated content), is owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Your Content</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You retain all rights to your content. By using our service, you grant us a worldwide, non-exclusive, royalty-free license to use, store, process, and display your content solely for the purpose of providing and improving the service.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Feedback</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you provide feedback, suggestions, or ideas about the service, you grant us the right to use such feedback without any obligation to compensate you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Our service integrates with third-party services, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Google Calendar and Google APIs</li>
                <li>Microsoft Outlook and Microsoft Graph API</li>
                <li>AI service providers</li>
                <li>Cloud hosting and database services</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                Your use of these third-party services is subject to their respective terms of service and privacy policies. We are not responsible for the actions, content, or policies of third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">10.1 Service Availability</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or secure.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">10.2 No Warranties</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We disclaim all warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the service will meet your requirements or that any errors will be corrected.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">10.3 Limitation of Liability</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of the service.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our total liability for any claims arising from these Terms or your use of the service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">10.4 Force Majeure</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, labor disputes, or internet service provider failures.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You agree to indemnify, defend, and hold harmless AutoPrep Team Dashboard, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys&apos; fees) arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                <li>Your use of the service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your content or data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Privacy and Data Protection</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your use of the service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand how we collect, use, and protect your information.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We comply with applicable data protection laws, including GDPR and CCPA where applicable. You have certain rights regarding your personal data as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Termination</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">13.1 Termination by You</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination, your access to the service will cease immediately.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">13.2 Termination by Us</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may terminate or suspend your account immediately, without prior notice, for any reason, including but not limited to violation of these Terms, fraudulent activity, or extended periods of inactivity.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">13.3 Effect of Termination</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Upon termination, your right to use the service will immediately cease. We will delete or anonymize your data in accordance with our Privacy Policy, typically within 30 days. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">14.1 Informal Resolution</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any dispute with us, you agree to first contact us and attempt to resolve the dispute informally. We will work in good faith to resolve any disputes.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">14.2 Arbitration</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If we cannot resolve a dispute informally, any disputes arising from these Terms or your use of the service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the United States, and judgment on the award may be entered in any court having jurisdiction.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">14.3 Class Action Waiver</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You agree that any arbitration or proceeding shall be limited to the dispute between you and us individually. You waive any right to participate in a class action lawsuit or class-wide arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the United States and the State of [Your State], without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">16. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the &quot;Last Updated&quot; date. Your continued use of the service after such changes constitutes your acceptance of the new Terms.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                If you do not agree to the modified Terms, you must stop using the service and may terminate your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">17. Severability</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect. The invalid or unenforceable provision shall be replaced with a valid provision that most closely matches the intent of the original provision.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">18. Entire Agreement</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the service and supersede all prior agreements and understandings, whether written or oral.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">19. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Email:</strong> legal@autoprep.ai
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Website:</strong> https://team.autoprep.ai
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">20. Acknowledgment</h2>
              <p className="text-gray-700 dark:text-gray-300">
                By using AutoPrep Team Dashboard, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, you must not use our service.
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
