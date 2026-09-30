'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const faqs = [
  {
    question: "What is Le Damas?",
    answer: "Le Damas is a Dubai-based brand known for its premium Arabic sweets, pistachio-rich chocolates, baklava, maamoul, and gourmet nuts. Our story began in Damascus in 1951, and today everything we offer is freshly made in Dubai with the same attention to craftsmanship and quality."
  },
  {
    question: "Are your Products Certified?",
    answer: "Yes. Our production facility in Dubai is certified ISO 22000, HACCP, and Halal, which means we follow strict safety and hygiene standards at every step of the process."
  },
  {
    question: "What makes your Dubai Chocolate so popular?",
    answer: "Dubai Chocolate is one of our signature creations. It blends smooth chocolate with Middle Eastern flavors like pistachio cream, kunafa, and tahini. Many customers choose it as a unique Dubai gift or a special treat."
  },
  {
    question: "Where are your Chocolates produced?",
    answer: "Everything is produced locally in Dubai under internationally recognized food-safety certifications."
  },
  {
    question: "Do your products contain preservatives?",
    answer: "No. Our sweets and chocolates are prepared fresh and do not include added preservative."
  },
  {
    question: "Do you deliver across the India?",
    answer: "Yes. We deliver anywhere in the India. Most orders arrive within 24 to 48 hours, depending on the location."
  },
  {
    question: "Can you deliver to my Hotel?",
    answer: "Yes, absolutely. We deliver to all hotels in India, which is convenient for travelers or guests wanting to receive gifts or treats during their stay."
  },
  {
    question: "Do you offer same-day delivery?",
    answer: "In many cases, yes — especially for Dubai-based orders. Same-day delivery depends on the items ordered and the time the order is placed, such as Blinkit, Swiggy Instamart."
  },
  {
    question: "Do your products contain allergens?",
    answer: "Some items may contain ingredients like nuts, dairy, gluten, or sesame. Please check each product’s ingredient list or contact us if you have specific allergy concerns."
  },
  {
    question: "Do you have healthier or reduced-sugar options?",
    answer: "Yes. Our Healthy & Diet range features options made with dates, nuts, and lighter sweeteners for customers who prefer something less sweet."
  },
  {
    question: "How should I store your chocolates and sweets?",
    answer: "To keep them fresh, store them in a cool, dry area — ideally between 18°C and 22°C. Avoid heat, humidity, or leaving items in the car."
  },
  {
    question: "Do you offer gift boxes and customized packaging?",
    answer: "Yes. We prepare ready-made gift boxes and can also customize packaging for special occasions such as Diwali, Eid, birthdays, weddings, and corporate gifting."
  },
  {
    question: "Do you handle bulk and corporate orders?",
    answer: "Yes. We provide tailored solutions for companies and events, including branded boxes, customized packaging, and large-quantity orders. You can reach us at ledamas.in."
  },
  {
    question: "Are your products available in airports?",
    answer: "Our products are available in several regional airports, including:\n• Delhi\n• Hyderabad\n• Bangalore\n• Mumbai"
  },
  {
    question: "Do you offer franchise opportunities?",
    answer: "Yes, in selected markets. If you’re interested in opening a Le Damas location, please contact our business team."
  },
  {
    question: "Do you have customer reviews?",
    answer: "Yes. We receive hundreds of reviews across our website, Google, and social media. Customers often mention the richness of our pistachio flavors, the freshness of our sweets, and the quality of our packaging."
  },
  {
    question: "Do you offer WhatsApp support?",
    answer: "Yes. We’re available 7 days a week on WhatsApp to assist with orders, delivery questions, and general inquiries."
  },
  {
    question: "How can I reach your customer service team?",
    answer: "You can contact us through the form on our website or by emailing info@ledamas.in"
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-dark)]">
      <Header />
      <main className="flex-1 pt-[220px] pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
        <Heading 
          as="h1" 
          align="left" 
          className="mb-12 text-[var(--text-dark)]"
        >
          Frequently Asked Questions
        </Heading>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white border border-[var(--border-subtle)] rounded-xl overflow-hidden luxury-glow-hover transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                aria-expanded={openIndex === index}
              >
                <span className="type-subheading font-medium pr-8" style={{ color: 'var(--accent-teal-dark)' }}>
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-300 flex-shrink-0`}
                  style={{ 
                    color: 'var(--accent-teal-dark)', 
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)' 
                  }}
                />
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                      <p className="type-body text-[var(--text-muted)] whitespace-pre-line leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
