'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Star, Lock, Truck, ShieldCheck, Clock } from 'lucide-react';

export function Footer() {
  return (
    <>
      {/* Professional High-Contrast Pre-Footer Trust & Service Guarantees Bar - Full Width Screen */}
      <section className="w-full bg-white border-t border-b border-[#E5E0D8] py-10 md:py-14 my-0 relative z-20 shadow-xs">
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-stone-300">
            
            {/* 1. 100% SECURED PAYMENTS */}
            <div className="flex flex-col items-center text-center px-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-full border-2 border-[#A86B2B] bg-[#FFF9F2] text-[#8C5219] flex items-center justify-center mb-3 shadow-xs">
                <Lock className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-[0.18em] text-black">
                100% SECURED PAYMENTS
              </h3>
              <p className="text-xs font-sans text-[#4A4540] font-medium mt-1 max-w-[220px] leading-snug">
                All payment types accepted
              </p>
            </div>

            {/* 2. FREE SHIPPING */}
            <div className="flex flex-col items-center text-center px-4 pt-6 sm:pt-0">
              <div className="w-12 h-12 rounded-full border-2 border-[#A86B2B] bg-[#FFF9F2] text-[#8C5219] flex items-center justify-center mb-3 shadow-xs">
                <Truck className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-[0.18em] text-black">
                FREE SHIPPING
              </h3>
              <p className="text-xs font-sans text-[#4A4540] font-medium mt-1 max-w-[220px] leading-snug">
                Free shipping on all orders PAN India.
              </p>
            </div>

            {/* 3. RATED 4.8 */}
            <div className="flex flex-col items-center text-center px-4 pt-6 lg:pt-0">
              <div className="w-12 h-12 rounded-full border-2 border-[#A86B2B] bg-[#FFF9F2] text-[#8C5219] flex items-center justify-center mb-3 shadow-xs">
                <ShieldCheck className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-[0.18em] text-black">
                RATED 4.8
              </h3>
              <p className="text-xs font-sans text-[#4A4540] font-medium mt-1 max-w-[220px] leading-snug">
                By 5k+ Customers
              </p>
            </div>

            {/* 4. 24 HOURS DISPATCH */}
            <div className="flex flex-col items-center text-center px-4 pt-6 lg:pt-0">
              <div className="w-12 h-12 rounded-full border-2 border-[#A86B2B] bg-[#FFF9F2] text-[#8C5219] flex items-center justify-center mb-3 shadow-xs">
                <Clock className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-[0.18em] text-black">
                24 HOURS DISPATCH
              </h3>
              <p className="text-xs font-sans text-[#4A4540] font-medium mt-1 max-w-[220px] leading-snug">
                Fast, reliable help anytime
              </p>
            </div>

          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#3D2314] text-[#FAF6ED] pt-8 sm:pt-10 pb-5 font-sans relative overflow-hidden border-t border-[#5A3822]">
      <div className="max-w-[1480px] w-full mx-auto px-6 sm:px-10 lg:px-12 relative z-10 space-y-8">

        {/* Top Navigation & Google Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Column 1: Brand Logo & Damascus Heritage Description */}
          <div className="lg:col-span-4 space-y-3.5 pr-0 lg:pr-4">
            <Link href="/" className="inline-block group">
              <div className="relative h-16 w-48">
                <Image
                  src="/Le-Damas-Sweets-Logo-enhanced.png"
                  alt="Le Damas Sweets Logo"
                  fill
                  className="object-contain filter contrast-125 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            <p className="text-xs sm:text-sm font-sans text-[#D6C2B4] leading-relaxed font-light">
              Rooted in Damascus since 1951, perfected in Dubai since 2014 — a legacy of handcrafted Dubai chocolates & pistachio cremes passed down through generations.
            </p>
          </div>

          {/* Column 2: CATEGORIES */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D5B268]">
              CATEGORIES
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#E6D5C9] font-light">
              <li>
                <Link href="/shop" className="hover:text-[#D5B268] transition-colors">
                  Gift & Offers
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D5B268] transition-colors">
                  Chocolate
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D5B268] transition-colors">
                  Nuts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ABOUT */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D5B268]">
              ABOUT
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#E6D5C9] font-light">
              <li>
                <Link href="/about" className="hover:text-[#D5B268] transition-colors">
                  About Le Damas
                </Link>
              </li>
              <li>
                <Link href="/why-trust-ledamas" className="hover:text-[#D5B268] transition-colors">
                  Why Trust Le Damas
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D5B268] transition-colors">
                  Le Damas Events
                </Link>
              </li>
              <li>
                <Link href="/franchise" className="hover:text-[#D5B268] transition-colors">
                  Franchise
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D5B268] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#D5B268] transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: LINKS & Google Reviews Box */}
          <div className="lg:col-span-3 space-y-4 lg:border-l lg:border-[#5A3822] lg:pl-6">
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D5B268]">
                LINKS
              </h4>
              <ul className="space-y-1.5 text-xs text-[#E6D5C9] font-light">
                <li>
                  <Link href="/faq" className="hover:text-[#D5B268] transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/track-order" className="hover:text-[#D5B268] transition-colors">
                    Track My Order
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#D5B268] transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[#D5B268] transition-colors">
                    Privacy policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Google Reviews Badge */}
            <div className="pt-2.5 border-t border-[#5A3822] space-y-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold font-serif text-white">4.7</span>
                <span className="text-xs font-sans text-stone-400">/5</span>
                <div className="flex items-center space-x-1 ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D5B268] text-[#D5B268]" />
                  ))}
                </div>
              </div>

              <a
                href="#testimonials"
                className="text-[11px] text-[#D6C2B4] underline hover:text-[#D5B268] transition-colors block"
              >
                Based on 148 Google reviews
              </a>

              <button
                onClick={() => {
                  const el = document.getElementById('testimonials');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-1.5 rounded-full border border-[#D5B268]/60 text-[#FAF6ED] text-xs font-medium hover:bg-[#D5B268] hover:text-[#3D2314] transition-all duration-300 cursor-pointer"
              >
                Write A Review
              </button>
            </div>
          </div>

        </div>

        {/* Middle Support & Contact Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-5 border-y border-[#5A3822] items-start">
          
          {/* Email Box */}
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-full border border-[#D5B268]/50 flex items-center justify-center text-[#D5B268] shrink-0 bg-[#4A2E1C]">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D5B268] font-bold block mb-0.5">
                EMAIL US
              </span>
              <a href="mailto:info@ledamas.in" className="text-xs sm:text-sm font-medium text-[#FAF6ED] hover:text-[#D5B268] transition-colors block">
                info@ledamas.in
              </a>
              <span className="text-[11px] text-[#D6C2B4] font-light">24/7 Dedicated Support</span>
            </div>
          </div>

          {/* Phone Box */}
          <div className="flex items-start space-x-3.5 md:border-l md:border-[#5A3822] md:px-5">
            <div className="w-10 h-10 rounded-full border border-[#D5B268]/50 flex items-center justify-center text-[#D5B268] shrink-0 bg-[#4A2E1C]">
              <Phone className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D5B268] font-bold block mb-0.5">
                PHONE SUPPORT
              </span>
              <a href="tel:9311228575" className="text-xs sm:text-sm font-medium text-[#FAF6ED] hover:text-[#D5B268] transition-colors block">
                9311228575
              </a>
              <span className="text-[11px] text-[#D6C2B4] font-light">Mon-Fri: 9AM - 6PM</span>
            </div>
          </div>

          {/* Office Address Box */}
          <div className="flex items-start space-x-3.5 md:border-l md:border-[#5A3822] md:pl-5">
            <div className="w-10 h-10 rounded-full border border-[#D5B268]/50 flex items-center justify-center text-[#D5B268] shrink-0 bg-[#4A2E1C]">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D5B268] font-bold block mb-0.5">
                HEAD OFFICE
              </span>
              <p className="text-xs text-[#E6D5C9] font-light leading-relaxed">
                Unit no. 514, 5th floor, Manglam Paradise Mall, Sec-3, Rohini, New Delhi - 110085
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Utility Bar: Payments & Follow Our Journey */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-1">
          
          {/* Indian Payment Systems */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D5B268] font-bold block">
              SECURE INDIAN PAYMENTS
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* UPI */}
              <div className="h-6.5 px-2.5 rounded bg-[#4A2E1C] border border-[#5A3822] flex items-center justify-center space-x-1 shadow-sm" title="UPI - Unified Payments Interface">
                <span className="text-[10px] font-black text-[#00BFA5] tracking-tight">UPI</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6F00]" />
              </div>

              {/* PhonePe */}
              <div className="h-6.5 px-2.5 rounded bg-[#5f259f] border border-white/20 flex items-center justify-center space-x-1 shadow-sm" title="PhonePe">
                <span className="text-[10px] font-bold text-white tracking-tight">PhonePe</span>
              </div>

              {/* GPay */}
              <div className="h-6.5 px-2.5 rounded bg-black/60 border border-white/20 flex items-center justify-center space-x-1 shadow-sm" title="Google Pay">
                <span className="text-xs font-bold text-white">G Pay</span>
              </div>

              {/* Paytm */}
              <div className="h-6.5 px-2.5 rounded bg-[#002E6E] border border-white/20 flex items-center justify-center space-x-1 shadow-sm" title="Paytm">
                <span className="text-[10px] font-bold text-[#00B9F1] tracking-tight">Pay<span className="text-white">tm</span></span>
              </div>

              {/* RuPay */}
              <div className="h-6.5 px-2.5 rounded bg-white text-black border border-white/20 flex items-center justify-center space-x-0.5 shadow-sm" title="RuPay">
                <span className="text-[10px] font-black text-[#005B9C] italic">Ru</span>
                <span className="text-[10px] font-black text-[#F47920] italic">Pay</span>
              </div>

              {/* Visa & Mastercard */}
              <div className="h-6.5 px-2.5 rounded bg-black/60 border border-white/20 flex items-center justify-center space-x-1 shadow-sm" title="Visa & Mastercard">
                <span className="text-[9px] font-black text-[#1A1F71] bg-white px-1 rounded italic">VISA</span>
                <div className="flex items-center -space-x-1">
                  <div className="w-2 h-2 rounded-full bg-[#EB001B]" />
                  <div className="w-2 h-2 rounded-full bg-[#F79E1B]" />
                </div>
              </div>

              {/* Razorpay */}
              <div className="h-6.5 px-2.5 rounded bg-[#0C2340] border border-[#0284C7]/50 flex items-center justify-center space-x-1 shadow-sm" title="Razorpay Secure">
                <span className="text-[9px] font-extrabold text-[#0284C7]">Razorpay</span>
              </div>
            </div>
          </div>

          {/* Social Media Links: FOLLOW OUR JOURNEY */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D5B268] font-bold block">
              FOLLOW OUR JOURNEY
            </span>
            <div className="flex items-center space-x-2">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/ledamasindia.official/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-7.5 h-7.5 rounded-full border border-[#D5B268]/50 bg-[#4A2E1C] text-[#D5B268] flex items-center justify-center hover:bg-[#CB9700] hover:text-[#3D2314] hover:border-[#CB9700] transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="w-7.5 h-7.5 rounded-full border border-[#D5B268]/50 bg-[#4A2E1C] text-[#D5B268] flex items-center justify-center hover:bg-[#CB9700] hover:text-[#3D2314] hover:border-[#CB9700] transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                title="Twitter / X"
                className="w-7.5 h-7.5 rounded-full border border-[#D5B268]/50 bg-[#4A2E1C] text-[#D5B268] flex items-center justify-center hover:bg-[#CB9700] hover:text-[#3D2314] hover:border-[#CB9700] transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="w-7.5 h-7.5 rounded-full border border-[#D5B268]/50 bg-[#4A2E1C] text-[#D5B268] flex items-center justify-center hover:bg-[#CB9700] hover:text-[#3D2314] hover:border-[#CB9700] transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                title="YouTube"
                className="w-7.5 h-7.5 rounded-full border border-[#D5B268]/50 bg-[#4A2E1C] text-[#D5B268] flex items-center justify-center hover:bg-[#CB9700] hover:text-[#3D2314] hover:border-[#CB9700] transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* CarbonSmith-Style Edge-to-Edge Typography Brand Banner */}
      <div className="w-full overflow-hidden px-2 text-center select-none pt-2 pb-1">
        <h1 className="font-serif text-[16.5vw] sm:text-[17.5vw] leading-[0.82] font-light tracking-tight text-[#FAF6ED] uppercase w-full block hover:text-[#2AD2C5] transition-colors duration-500">
          Le Damas
        </h1>

        {/* 'Delicious Since 1951' placed between two lines */}
        <div className="flex items-center justify-center gap-4 mt-2 mb-1 max-w-xl mx-auto px-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#5A3822] to-[#D5B268]/60" />
          <span className="font-serif italic text-xs sm:text-sm tracking-[0.25em] text-[#CB9700] uppercase font-normal shrink-0">
            Delicious Since 1951
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#5A3822] to-[#D5B268]/60" />
        </div>
      </div>

      {/* CarbonSmith-Style Minimal Sub-Footer Utility Row */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-3 pb-2 border-t border-[#5A3822]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] font-sans text-[#D6C2B4] font-light tracking-wider uppercase">
        <p className="select-none">
          &copy; {new Date().getFullYear()} LE DAMAS. ALL RIGHTS RESERVED.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[#E6D5C9]">
          <Link href="/privacy" className="hover:text-[#D5B268] transition-colors">
            PRIVACY POLICY
          </Link>
          <Link href="/terms" className="hover:text-[#D5B268] transition-colors">
            TERMS & CONDITIONS
          </Link>
          <Link href="/faq" className="hover:text-[#D5B268] transition-colors">
            FAQ & CARE
          </Link>
          <Link href="/contact" className="hover:text-[#D5B268] transition-colors">
            CONTACT US
          </Link>
        </div>
      </div>
    </footer>
    </>
  );
}



