'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Store,
  Phone,
  Mail,
  Truck,
  DollarSign,
  Globe,
  Save,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const StoreSettingsManagement: React.FC = () => {
  const [storeName, setStoreName] = useState('LE DAMAS');
  const [supportEmail, setSupportEmail] = useState('concierge@ledamas.in');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [whatsappNumber, setWhatsappNumber] = useState('+919876543210');
  const [currency, setCurrency] = useState('INR (₹)');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2499);
  const [gstRate, setGstRate] = useState(18);
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/ledamas_official');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('LE DAMAS Store Settings & Business Configuration saved successfully!');
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            ⚙️ Business & Store Settings
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Global business configuration: Store details, WhatsApp API endpoints, Pan-India shipping rules, GST tax rates, and default SEO tags.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-black hover:bg-stone-800 text-white font-sans text-xs font-bold shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#CB9700]" />
          <span>Save Store Settings</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. General Business Info */}
        <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-black text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-[#CB9700]" /> General Store Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="type-label text-stone-700 block mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="type-label text-stone-700 block mb-1">Support Email *</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="type-label text-stone-700 block mb-1">WhatsApp Business Number *</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Shipping & Taxes */}
        <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-black text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#CB9700]" /> Shipping & Tax Configurations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="type-label text-stone-700 block mb-1">Pan-India Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="type-label text-stone-700 block mb-1">Applicable GST Tax Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="type-label text-stone-700 block mb-1">Base Currency</label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full bg-stone-200 text-stone-700 p-2.5 rounded-xl border border-stone-300 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3. Social & Marketing & Meta Pixel */}
        <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 space-y-4 shadow-xs">
          <h3 className="font-serif font-bold text-black text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#CB9700]" /> Social Channels & Tracking Pixels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="type-label text-stone-700 block mb-1">Official Instagram URL</label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="type-label text-stone-700 block mb-1">Meta (Facebook/Instagram) Pixel ID</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  disabled
                  value="981686768203314"
                  className="w-full bg-emerald-50 text-emerald-900 border border-emerald-300 p-2.5 rounded-xl font-mono font-bold"
                />
                <span className="shrink-0 px-3 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-stone-600 font-semibold border-b border-stone-100 pb-2">
              <span>Configured Pixel Events:</span>
              <span className="text-emerald-700 font-mono">100% Verified</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-stone-700">
                • PageView <span className="text-emerald-600 font-bold">(Auto)</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-stone-700">
                • AddToCart <span className="text-emerald-600 font-bold">(Active)</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-stone-700">
                • InitiateCheckout <span className="text-emerald-600 font-bold">(Active)</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-stone-700">
                • Purchase <span className="text-emerald-600 font-bold">(Razorpay)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-black text-white font-bold text-xs shadow-md hover:bg-stone-800 cursor-pointer"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};
