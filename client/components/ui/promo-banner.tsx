import React from 'react';
import Link from 'next/link';

export function PromoBanner() {
  return (
    <div className="w-full px-6 lg:px-12 mb-6">
      <div className="max-w-[1480px] mx-auto bg-[#FFF8E7] border border-dashed border-[#F3D698] rounded-xl px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex-1">
          <h2 className="text-[#C5114F] text-xl sm:text-2xl font-bold font-sans tracking-tight mb-1">
            Festival of Lights, But Hurry! Save up to 30%
          </h2>
          <p className="text-stone-500 text-sm sm:text-[15px] font-medium">
            Our Diwali Sale is bursting with joy – and disappearing fast!
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          <Link href="/shop" className="block w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-[#FE825C] hover:bg-[#F27048] transition-colors text-white font-bold text-sm px-8 py-3 rounded-md shadow-sm">
              Grab Deals
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
