import React from 'react';
import Link from 'next/link';

interface PromoBannerProps {
  isMinimized?: boolean;
}

export function PromoBanner({ isMinimized = false }: PromoBannerProps) {
  return (
    <div className={`w-full ${isMinimized ? 'mb-3' : 'mb-6'}`}>
      <div className={`w-full bg-[#FFF8E7] border border-dashed border-[#F3D698] rounded-xl flex flex-col sm:flex-row items-center justify-between shadow-sm ${isMinimized ? 'px-4 py-3 sm:px-5 sm:py-3 gap-2' : 'px-6 py-5 sm:px-8 sm:py-6 gap-4'}`}>
        <div className="flex-1">
          <h2 className={`text-[#C5114F] font-bold font-sans tracking-tight ${isMinimized ? 'text-[15px] sm:text-base leading-tight mb-0.5' : 'text-xl sm:text-2xl mb-1'}`}>
            Festival of Lights, But Hurry! Save up to 30%
          </h2>
          <p className={`text-stone-500 font-medium ${isMinimized ? 'text-[11px] sm:text-xs leading-tight' : 'text-sm sm:text-[15px]'}`}>
            Our Diwali Sale is bursting with joy – and disappearing fast!
          </p>
        </div>
        <div className={`flex-shrink-0 w-full sm:w-auto ${isMinimized ? 'mt-2 sm:mt-0' : 'mt-2 sm:mt-0'}`}>
          <Link href="/shop" className="block w-full sm:w-auto">
            <button className={`w-full sm:w-auto bg-[#FE825C] hover:bg-[#F27048] transition-colors text-white font-bold rounded-md shadow-sm ${isMinimized ? 'text-xs px-5 py-2' : 'text-sm px-8 py-3'}`}>
              Grab Deals
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
