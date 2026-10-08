import React from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Terms & Conditions | Le Damas India',
  description: 'Terms and Conditions governing the use of the Le Damas India website and related services.',
  canonicalUrl: '/terms',
});

export default function TermsAndConditionsPage() {
  const breadcrumbs = [
    { name: 'Terms & Conditions', item: '/terms' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 font-sans">
      <Header />

      <main className="flex-1 pt-[110px] sm:pt-32 md:pt-36 pb-24">
        <section className="bg-[#FAF7F2] border-b border-stone-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbs} />

            <div className="mt-8 text-center max-w-4xl mx-auto space-y-4">
              <h1 className="font-serif type-page-title text-[#3D2314] font-normal leading-tight text-3xl sm:text-5xl">
                Terms & Conditions
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
              Welcome to Le Damas India. These Terms and Conditions (“Terms”) govern your use of our website <a href="https://ledamas.in" className="text-[#CB9700] hover:underline font-medium">https://ledamas.in</a> and all related services provided by Le Damas (“we”, “us”, or “our”). By placing an order, you agree to be bound by these Terms.
            </p>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">1. Eligibility & Account</h2>
              <p>You must be at least 18 years old or use our services under the supervision of a legal guardian. You are responsible for maintaining the confidentiality of your account and for all activities conducted under it.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">2. Payment Methods</h2>
              <p>We accept the following payment methods:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Visa / Mastercard (Credit & Debit Cards)</li>
                <li>Phone Pay</li>
                <li>Google Pay (GPay)</li>
                <li>All Indian Payment Accepted</li>
                <li>Cash on Delivery (COD) – available within the India only</li>
              </ul>
              <p>All prices are in INR (Indian Currency) and include GST where applicable.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">3. Order Processing & Delivery</h2>
              <p>Orders placed before 10:00 AM are eligible for same-day delivery (where applicable). Orders after that are processed for the next working day.</p>
              <p>Delivery fee: INR 99 within the India. The fee may vary depending on the city or delivery location in other emirates.</p>
              <p>You will receive order and shipping confirmation via email or SMS, including tracking if available.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">4. Product Availability</h2>
              <p>All products are subject to availability. If a product becomes unavailable after ordering, we will notify you and either process a refund or suggest an alternative.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">5. Cancellations</h2>
              <p>You may cancel an order before it is shipped by contacting us immediately. Once the order is dispatched, it can no longer be canceled, and our return policy will apply.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">6. Returns, Refunds & Replacements</h2>
              <p>If your order is damaged, missing, or not satisfactory, we offer a refund or replacement within 7 days of receiving the shipment.</p>
              <p>Conditions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contact us within 7 days of delivery with your order number and issue description.</li>
                <li>Provide photos in case of damage or incorrect item.</li>
                <li>Perishable products must be returned unused and in original packaging where applicable.</li>
                <li>Refunds will be issued to the original payment method. Cash-on-delivery orders will be refunded via bank transfer.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">7. Intellectual Property</h2>
              <p>All website content (text, images, graphics, logos) is owned by Le Damas and protected under applicable intellectual property laws. No content may be reused without written consent.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">8. Limitation of Liability</h2>
              <p>Le Damas is not responsible for any indirect or consequential damages arising from your use of our website or products. Our liability is limited to the order amount paid.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">9. Governing Law</h2>
              <p>These Terms are governed by the laws of the United Arab Emirates. Any disputes are subject to the exclusive jurisdiction of UAE courts.</p>
            </section>

            <section className="space-y-4 bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-stone-200 mt-8">
              <h2 className="font-serif text-2xl text-[#3D2314] font-medium">10. Contact Us</h2>
              <div className="space-y-2 mt-4">
                <p><strong className="font-medium text-stone-900">Le Damas India</strong></p>
                <p>
                  Email: <a href="mailto:info@ledamas.in" className="text-[#CB9700] hover:underline font-medium">info@ledamas.in</a>
                </p>
                <p>
                  Phone: <a href="tel:+919311228576" className="text-[#CB9700] hover:underline font-medium">+91 9311228576</a>
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
