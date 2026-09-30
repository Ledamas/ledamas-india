import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy | Le Damas India',
  description: 'Privacy Policy of Le Damas Sweets in accordance with UAE Federal Decree Law No. 45 of 2021 on the Protection of Personal Data (PDPL).',
  canonicalUrl: '/privacy',
});

export default function PrivacyPolicyPage() {
  const breadcrumbs = [
    { name: 'Privacy Policy', item: '/privacy' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 font-sans">
      <Header />

      <main className="flex-1 pt-44 sm:pt-48 md:pt-52 pb-24">
        <section className="bg-[#FAF7F2] border-b border-stone-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbs} />

            <div className="mt-8 text-center max-w-4xl mx-auto space-y-4">
              <h1 className="font-serif type-page-title text-[#3D2314] font-normal leading-tight text-3xl sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="text-sm sm:text-base text-[#CB9700] font-serif italic max-w-2xl mx-auto">
                Effective Date: 01/07/2025
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="space-y-8 text-stone-700 font-light leading-relaxed">
            <p>
              Le Damas Sweets (“Le Damas”, “we”, “us”, or “our”) is committed to protecting your privacy in accordance with UAE Federal Decree Law No. 45 of 2021 on the Protection of Personal Data (PDPL). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you visit or use our website <a href="https://ledamas.in" className="text-[#CB9700] hover:underline font-medium">https://ledamas.in</a>
            </p>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">1. Information We Collect</h2>
              <p>We collect the following categories of personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="font-medium text-stone-900">Identifying Information:</strong> Name, email, phone number, shipping/billing address.</li>
                <li><strong className="font-medium text-stone-900">Transaction Information:</strong> Orders, payment details (we do not store full card data).</li>
                <li><strong className="font-medium text-stone-900">Technical Information:</strong> IP address, browser type, device info, OS.</li>
                <li><strong className="font-medium text-stone-900">Behavioral Data:</strong> Pages visited, browsing behavior, cookies, and analytics tools.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">2. Legal Basis for Processing</h2>
              <p>Under the PDPL, we process your data based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contractual necessity (e.g., order fulfillment);</li>
                <li>Consent (e.g., receiving marketing updates);</li>
                <li>Legitimate interest (e.g., improving website performance);</li>
                <li>Legal compliance (e.g., tax, financial reporting).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">3. Use of Your Information</h2>
              <p>We use your personal data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill orders;</li>
                <li>Manage accounts and customer inquiries;</li>
                <li>Send order confirmations and promotions (where consented);</li>
                <li>Enhance website performance and security;</li>
                <li>Fulfill legal obligations.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">4. Sharing and Disclosure</h2>
              <p>We share your information only when necessary:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With payment processors and logistics partners to fulfill your purchase;</li>
                <li>With analytics services (e.g., Google Analytics) to improve our site;</li>
                <li>With regulators if required by UAE law;</li>
                <li>During business transfers such as a merger or acquisition.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">5. International Data Transfers</h2>
              <p>If we transfer your data outside the UAE, we apply safeguards such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transfer to approved countries;</li>
                <li>Use of standard contractual clauses or equivalent protections.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">6. Data Retention</h2>
              <p>We retain your data as long as required to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Complete transactions;</li>
                <li>Fulfill legal and contractual obligations;</li>
                <li>Enforce our terms and resolve disputes.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">7. Your Rights Under UAE Law</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, correct, or delete your personal data;</li>
                <li>Withdraw consent at any time;</li>
                <li>Object to certain types of processing;</li>
                <li>File a complaint with the UAE Data Office.</li>
              </ul>
              <p>
                <strong className="font-medium text-stone-900">Contact:</strong>{' '}
                <a href="mailto:info@ledamas.in" className="text-[#CB9700] hover:underline font-medium">info@ledamas.in</a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">8. Data Security</h2>
              <p>We apply industry-standard security measures such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encrypted communications (HTTPS);</li>
                <li>Secure server environments;</li>
                <li>Restricted access to sensitive data.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">9. Cookies Policy</h2>
              <p>We use cookies to enhance your user experience and ensure the website functions properly. Cookies fall into the following categories:</p>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="font-serif text-xl text-[#3D2314] font-medium">a. Strictly Necessary Cookies</h3>
                  <p className="mt-2">These cookies are essential for site functionality—e.g., shopping cart management, payment processing, and user authentication. They cannot be turned off.</p>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl text-[#3D2314] font-medium">b. Analytics Cookies</h3>
                  <p className="mt-2">Used to collect anonymized data on how visitors use our site—such as page views, traffic sources, and bounce rates—to help us improve performance and user experience.</p>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl text-[#3D2314] font-medium">c. Marketing Cookies</h3>
                  <p className="mt-2">These cookies are used to deliver relevant advertising across platforms and measure the effectiveness of campaigns. They may be set by third-party advertisers.</p>
                </div>
                
                <div className="pt-2">
                  <h4 className="font-serif text-lg text-[#3D2314] font-medium">Cookie Preferences</h4>
                  <p className="mt-2">You can manage or disable cookies through your browser settings. Continued use of our site implies consent to our use of cookies in accordance with this policy.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">10. Children’s Privacy</h2>
              <p>We do not knowingly collect personal data from anyone under the age of 16. If you believe we have, please contact us to delete it.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">11. Policy Updates</h2>
              <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated “Effective Date.”</p>
            </section>

            <section className="space-y-4 bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-stone-200 mt-8">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">12. Contact Us</h2>
              <div className="space-y-2 mt-4">
                <p><strong className="font-medium text-stone-900">Le Damas Sweets</strong></p>
                <p>
                  Email: <a href="mailto:info@ledamas.in" className="text-[#CB9700] hover:underline font-medium">info@ledamas.in</a>
                </p>
                <p>
                  Website: <a href="https://ledamas.in" className="text-[#CB9700] hover:underline font-medium">https://ledamas.in</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
