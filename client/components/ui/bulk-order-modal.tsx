'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Hash, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkOrderModal({ isOpen, onClose }: BulkOrderModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '',
    message: 'I am interested in placing a bulk order.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs"
          />

          {/* Modal Overlay Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-300 overflow-hidden my-auto"
            >
              {/* Header - High Contrast Light Top */}
              <div className="p-6 pb-4 flex items-start justify-between bg-[#F8F5EE] border-b border-stone-200">
                <div>
                  <h3 className="font-serif text-2xl text-[#1A1817] font-bold tracking-tight">
                    Bulk Order Enquiry
                  </h3>
                  <p className="text-xs text-[#444444] font-sans font-medium mt-1">
                    We&apos;ll get back to you soon
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 text-[#1A1817] hover:text-[#CB9700] rounded-lg bg-stone-200/80 hover:bg-stone-300 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              {submitted ? (
                <div className="p-10 text-center space-y-4 bg-white">
                  <div className="w-14 h-14 rounded-full bg-[#CB9700]/15 text-[#CB9700] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-2xl text-[#1A1817] font-bold">Enquiry Sent!</h4>
                  <p className="text-xs text-[#333333] font-sans font-medium max-w-xs mx-auto">
                    Thank you, {formData.name || 'Valued Patron'}. Our concierge team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-sans font-extrabold text-[#1A1817]">
                      Name <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-stone-300 bg-white text-xs font-semibold text-[#1A1817] placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-[#CB9700] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-sans font-extrabold text-[#1A1817]">
                      Email <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="Your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-stone-300 bg-white text-xs font-semibold text-[#1A1817] placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-[#CB9700] transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-sans font-extrabold text-[#1A1817]">
                      Phone <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="Your phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-stone-300 bg-white text-xs font-semibold text-[#1A1817] placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-[#CB9700] transition-all"
                      />
                    </div>
                  </div>

                  {/* Quantity Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-sans font-extrabold text-[#1A1817]">
                      Required Quantity
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. 50, 100, 500..."
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-stone-300 bg-white text-xs font-semibold text-[#1A1817] placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-[#CB9700] transition-all"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-sans font-extrabold text-[#1A1817]">
                      Message <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-stone-600 absolute left-3.5 top-3" />
                      <textarea
                        rows={3}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-stone-300 bg-white text-xs font-semibold text-[#1A1817] placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-[#CB9700] transition-all"
                      />
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="pt-4 flex items-center justify-between space-x-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-lg border-2 border-stone-400 text-[#1A1817] text-xs font-extrabold hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#1A1817] hover:bg-[#CB9700] text-white text-xs font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 shadow-md cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Enquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
