'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function DiscountPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState('Applying your discount code...');

  useEffect(() => {
    if (params.code) {
      const discountCode = decodeURIComponent(params.code).toUpperCase().trim();
      
      // Save code to localStorage so checkout page can automatically pick it up
      localStorage.setItem('ledamas_referral_code', discountCode);
      
      setStatus(`Discount code ${discountCode} applied! Redirecting to shop...`);
      
      // Redirect to shop page after a brief delay
      setTimeout(() => {
        router.push('/shop');
      }, 1500);
    } else {
      setStatus('Invalid discount code. Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  }, [params.code, router]);

  return (
    <div className="min-h-screen bg-[#FAF6ED] text-[#3D2314] font-sans flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-24 pb-20 px-4">
        <div className="bg-white border border-[#E8DCCB] rounded-2xl p-10 max-w-md w-full text-center shadow-lg space-y-6">
          <div className="w-16 h-16 bg-[#CB9700]/10 rounded-full flex items-center justify-center mx-auto text-[#CB9700]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#3D2314] mb-2">Exclusive Offer</h1>
            <p className="text-[#5A3822] text-sm">{status}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
