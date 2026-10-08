'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';

export default function FranchisePage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    location: '',
    ownsBusiness: '',
    franchiseExperience: '',
    chocolateExperience: '',
    upholdBrand: '',
    startupCapital: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#FAF6ED] text-[#3D2314] font-sans selection:bg-[#CB9700]/30 selection:text-[#3D2314]">
      <Header />

      <main className="pt-[110px] sm:pt-32 md:pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back Option */}
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C5E3C] hover:text-[#3D2314] transition-colors py-1.5 px-4 rounded-full bg-white border border-[#E8DCCB] shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Header Banner */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-[#3D2314]/5 border border-[#3D2314]/15 px-4 py-1.5 rounded-full text-xs font-serif text-[#8C5E3C] tracking-[0.2em] uppercase font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#CB9700]" />
              <span>Global Opportunities</span>
            </div>
            <h1 className="font-serif type-page-title text-[#3D2314] font-normal tracking-tight">
              Le Damas Franchise
            </h1>
            <p className="font-serif text-xl sm:text-2xl text-[#CB9700] italic font-normal">
              Franchise With Us
            </p>
            <p className="font-sans type-body text-[#5A3822] font-light max-w-2xl mx-auto leading-relaxed pt-2">
              Partner with a trusted name in Arabic chocolates — franchise with Le Damas and share a legacy of quality and tradition since 1951.
            </p>
          </div>

          {/* Intro Notice Card */}
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 sm:p-8 space-y-3 text-[#5A3822] text-xs sm:text-sm font-light leading-relaxed relative overflow-hidden shadow-lg shadow-[#3D2314]/5">
            <p className="text-[#3D2314] font-medium text-base">
              Thank you for your interest in joining the Le Damas Chocolates family.
            </p>
            <p>
              To explore franchise opportunities, please fill out the form below.
            </p>
            <p className="text-stone-500">
              Once we receive your inquiry, our team will reach out via email to discuss the next steps.
            </p>
          </div>

          {/* Form / Submission State */}
          {submitted ? (
            <div className="bg-white border border-[#CB9700]/50 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xl shadow-[#3D2314]/5">
              <div className="w-16 h-16 bg-[#CB9700]/10 rounded-full flex items-center justify-center mx-auto text-[#CB9700]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl text-[#3D2314]">Franchise Inquiry Submitted</h3>
              <p className="text-[#5A3822] text-sm max-w-lg mx-auto leading-relaxed font-light">
                Thank you, <span className="text-[#3D2314] font-semibold">{formData.fullName || 'Valued Partner'}</span>. Our franchise review committee has received your details.
              </p>
              <div className="bg-[#FAF6ED] p-5 rounded-xl border border-[#E8DCCB] text-left text-xs font-mono space-y-2 text-[#5A3822] max-w-md mx-auto">
                <p><span className="text-stone-400">REF ID:</span> #FR-{Math.floor(100000 + Math.random() * 900000)}</p>
                <p><span className="text-stone-400">EMAIL:</span> {formData.email}</p>
                <p><span className="text-stone-400">LOCATION:</span> {formData.location}</p>
                <p><span className="text-stone-400">REVIEW WINDOW:</span> 10 – 14 Business Days</p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-3 rounded-full bg-[#3D2314] hover:bg-[#5A3822] text-[#FAF6ED] text-xs font-bold uppercase tracking-widest transition-all"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-[#E8DCCB] rounded-2xl p-6 sm:p-10 space-y-6 shadow-xl shadow-[#3D2314]/5">
              <div className="border-b border-[#E8DCCB] pb-4 mb-2">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#CB9700]">
                  Franchise Application Form
                </h2>
                <p className="text-xs text-stone-500 font-light mt-1">
                  Please complete all required fields (*).
                </p>
              </div>

              {/* First & Last Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  First & Last Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                />
              </div>

              {/* Phone Number with Country Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  Phone Number *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="sm:col-span-5 bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-xs text-[#3D2314] focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700]"
                  >
                    <option value="+91">India +91</option>
                    <option value="+971">United Arab Emirates +971</option>
                    <option value="+966">Saudi Arabia +966</option>
                    <option value="+974">Qatar +974</option>
                    <option value="+965">Kuwait +965</option>
                    <option value="+968">Oman +968</option>
                    <option value="+973">Bahrain +973</option>
                    <option value="+1">United States +1</option>
                    <option value="+44">United Kingdom +44</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="sm:col-span-7 bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                  />
                </div>
              </div>

              {/* Your Location / Country */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  Your Location / Country *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter location / country"
                  className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                />
              </div>

              {/* Do you currently own a business? */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  Do you currently own a business? *
                </label>
                <select
                  name="ownsBusiness"
                  required
                  value={formData.ownsBusiness}
                  onChange={handleChange}
                  className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-xs text-[#3D2314] focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700]"
                >
                  <option value="">Please select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Do you have experience operating as a Franchisee? */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  Do you have experience operating as a Franchisee? *
                </label>
                <select
                  name="franchiseExperience"
                  required
                  value={formData.franchiseExperience}
                  onChange={handleChange}
                  className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-xs text-[#3D2314] focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700]"
                >
                  <option value="">Please select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Do you have experience working in the chocolate industry? */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  Do you have experience working in the chocolate industry? *
                </label>
                <select
                  name="chocolateExperience"
                  required
                  value={formData.chocolateExperience}
                  onChange={handleChange}
                  className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-xs text-[#3D2314] focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700]"
                >
                  <option value="">Please select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Are you willing to work with our franchise team and uphold market identity and brand? */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  Are you willing to work with our franchise team and uphold market identity and brand? *
                </label>
                <select
                  name="upholdBrand"
                  required
                  value={formData.upholdBrand}
                  onChange={handleChange}
                  className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-xs text-[#3D2314] focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700]"
                >
                  <option value="">Please select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* What is your approximate start-up capital? */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D2314] mb-2">
                  What is your approximate start-up capital? *
                </label>
                <input
                  type="text"
                  name="startupCapital"
                  required
                  value={formData.startupCapital}
                  onChange={handleChange}
                  placeholder="Enter approximate start-up capital"
                  className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3.5 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                />
              </div>

              {/* Send Message CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#3D2314] hover:bg-[#5A3822] active:scale-[0.99] text-[#FAF6ED] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all shadow-xl shadow-[#3D2314]/20"
                >
                  Send Message
                </button>
              </div>
            </form>
          )}

          {/* Initial Application Procedure Section */}
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg shadow-[#3D2314]/5">
            <h2 className="font-serif text-xl sm:text-2xl text-[#3D2314] font-normal">
              Initial Application Procedure
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-[#FAF6ED] border border-[#E8DCCB]">
                <div className="w-8 h-8 rounded-full bg-[#3D2314] text-[#FAF6ED] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-xs sm:text-sm text-[#5A3822] leading-relaxed font-light">
                  After submitting your interest form, our franchise team will review your application.
                </p>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl bg-[#FAF6ED] border border-[#E8DCCB]">
                <div className="w-8 h-8 rounded-full bg-[#3D2314] text-[#FAF6ED] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-xs sm:text-sm text-[#5A3822] leading-relaxed font-light">
                  Our franchise team will be in touch between 10 and 14 business working days and will inform you if your application has been successful.
                </p>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl bg-[#FAF6ED] border border-[#E8DCCB]">
                <div className="w-8 h-8 rounded-full bg-[#3D2314] text-[#FAF6ED] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-xs sm:text-sm text-[#5A3822] leading-relaxed font-light">
                  If your application is successful one of our franchise managers will provide further details on how to continue with your application.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
