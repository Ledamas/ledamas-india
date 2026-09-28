'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('ld_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (e) {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('ld_cookie_consent', 'accepted');
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#1A1817] text-white p-4 rounded-xl border border-stone-700 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-full bg-[#CB9700]/20 text-[#CB9700] shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-serif font-bold text-amber-100 tracking-wide uppercase">Privacy & Cookie Notice</h4>
          <p className="text-[11px] font-sans text-stone-300 leading-relaxed">
            We use anonymized cookies to analyze store traffic and enhance your luxury chocolate experience. IPs are strictly sanitized.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-full bg-[#CB9700] hover:bg-amber-500 text-stone-950 font-sans text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Accept Cookies
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-stone-400 hover:text-white text-xs font-sans transition-colors cursor-pointer"
            >
              Decline
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-stone-500 hover:text-stone-300 p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Close Notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
