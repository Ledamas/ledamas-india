'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans flex flex-col justify-between">
      <Header />

      <main className="flex-1 pt-[110px] sm:pt-32 md:pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Back Option */}
          <div className="lg:col-span-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#CB9700] transition-colors py-1.5 px-4 rounded-full bg-[#FAF7F2] border border-stone-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
          {/* Info column */}
          <div>
            <p className="text-xs tracking-[0.25em] text-[#CB9700] mb-2 uppercase font-bold">
              GET IN TOUCH
            </p>
            <h1 className="font-serif type-page-title text-stone-900 font-normal leading-tight mb-4">
              We would love to hear from you
            </h1>
            <p className="font-sans type-body text-stone-600 font-light mb-10 max-w-md">
              Questions about an order, wholesale inquiries, or just want to tell us about your favorite flavor — reach out any time.
            </p>

            <div className="space-y-6">
              {/* Email Box */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-[#FAF7F2] border border-stone-200 shrink-0 text-[#3D2314]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#CB9700] block mb-0.5">
                    EMAIL US
                  </span>
                  <a href="mailto:info@ledamas.in" className="text-base font-semibold text-stone-900 hover:text-[#CB9700] transition-colors block">
                    info@ledamas.in
                  </a>
                  <p className="text-xs text-stone-500 font-light mt-0.5">24/7 Dedicated Support</p>
                </div>
              </div>

              {/* Phone Box */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-[#FAF7F2] border border-stone-200 shrink-0 text-[#3D2314]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#CB9700] block mb-0.5">
                    PHONE SUPPORT
                  </span>
                  <a href="tel:9311228575" className="text-base font-semibold text-stone-900 hover:text-[#CB9700] transition-colors block">
                    9311228575
                  </a>
                  <p className="text-xs text-stone-500 font-light mt-0.5">Mon-Fri: 9AM - 6PM</p>
                </div>
              </div>

              {/* Head Office Address Box */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-[#FAF7F2] border border-stone-200 shrink-0 text-[#3D2314]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#CB9700] block mb-0.5">
                    HEAD OFFICE
                  </span>
                  <p className="text-sm font-medium text-stone-800 leading-relaxed max-w-sm">
                    Unit no. 514, 5th floor, Manglam Paradise Mall, Sec-3, Rohini, New Delhi - 110085
                  </p>
                </div>
              </div>

              {/* Social Link */}
              <div className="flex items-start gap-4 pt-2">
                <div className="p-3 rounded-full bg-[#FAF7F2] border border-stone-200 shrink-0 text-[#3D2314]">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#CB9700] block mb-0.5">
                    INSTAGRAM
                  </span>
                  <a href="https://www.instagram.com/ledamasindia.official/" target="_blank" rel="noreferrer" className="text-sm font-semibold text-stone-900 hover:text-[#CB9700] transition-colors">
                    @ledamasindia.official
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form column */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onSubmit={handleSubmit}
            className="bg-white border border-stone-200 p-6 sm:p-8 rounded-2xl shadow-xl shadow-stone-900/5 space-y-5"
          >
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-3.5 rounded-xl bg-[#FAF7F2] border border-stone-200 focus:border-stone-900 focus:bg-white focus:outline-none text-stone-900 text-sm placeholder:text-stone-400 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full px-4 py-3.5 rounded-xl bg-[#FAF7F2] border border-stone-200 focus:border-stone-900 focus:bg-white focus:outline-none text-stone-900 text-sm placeholder:text-stone-400 transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-2">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-3.5 rounded-xl bg-[#FAF7F2] border border-stone-200 focus:border-stone-900 focus:bg-white focus:outline-none text-stone-900 text-sm placeholder:text-stone-400 transition-all"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-stone-900 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Enter your message"
                className="w-full px-4 py-3.5 rounded-xl bg-[#FAF7F2] border border-stone-200 focus:border-stone-900 focus:bg-white focus:outline-none text-stone-900 text-sm placeholder:text-stone-400 transition-all resize-none"
              />
            </div>

            {status === 'sent' && (
              <p className="text-xs text-[#2AD2C5] bg-[#2AD2C5]/10 border border-[#2AD2C5]/20 rounded-lg px-3 py-2 font-medium">
                Message sent — we will get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p role="alert" className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-4 rounded-full bg-stone-900 hover:bg-[#CB9700] disabled:opacity-60 text-white text-xs tracking-[0.2em] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-stone-900/10"
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
              {status !== 'sending' && <Send className="w-3.5 h-3.5" />}
            </button>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
