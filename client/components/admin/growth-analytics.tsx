'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Info, Loader2 } from 'lucide-react';
import { getAdminMarketingGrowthApi } from '@/lib/services/admin-service';

export const GrowthAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await getAdminMarketingGrowthApi('200d');
      if (res) {
        setData(res);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#CB9700]" />
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalSessions = 
    data.sessionsByTrafficType.direct + 
    data.sessionsByTrafficType.paid + 
    data.sessionsByTrafficType.organic + 
    data.sessionsByTrafficType.unknown;

  const getPct = (val: number) => totalSessions > 0 ? (val / totalSessions) * 100 : 0;

  const totalDevices = 
    (data.sessionsByDeviceType?.mobile || 0) + 
    (data.sessionsByDeviceType?.desktop || 0) + 
    (data.sessionsByDeviceType?.tablet || 0);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Donut chart calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  
  const mobile = data.sessionsByDeviceType?.mobile || 0;
  const desktop = data.sessionsByDeviceType?.desktop || 0;
  const tablet = data.sessionsByDeviceType?.tablet || 0;

  const mPct = totalDevices > 0 ? mobile / totalDevices : 0;
  const dPct = totalDevices > 0 ? desktop / totalDevices : 0;
  const tPct = totalDevices > 0 ? tablet / totalDevices : 0;

  const mDash = mPct * circumference;
  const dDash = dPct * circumference;
  const tDash = tPct * circumference;

  const mOffset = 0;
  const dOffset = -mDash;
  const tOffset = -(mDash + dDash);

  return (
    <div className="space-y-6 font-sans text-stone-900">
      <div className="flex flex-col mb-4">
        <h2 className="text-3xl font-bold font-serif mb-6">Growth</h2>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">Performance</h3>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-white border border-stone-200 px-3 py-1.5 rounded-md shadow-sm text-sm font-medium hover:bg-stone-50 transition-colors">
              <Calendar className="w-4 h-4 text-stone-500" />
              <span>Last 200 days</span>
              <ChevronDown className="w-4 h-4 text-stone-500" />
            </button>
            <button className="text-sm font-medium text-stone-700 hover:text-black">
              View details
            </button>
          </div>
        </div>
      </div>

      {/* Top 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales attributed to marketing */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13px] font-semibold text-stone-800 border-b border-dashed border-stone-300 pb-0.5">
                Sales attributed to marketing
              </h4>
              <button className="text-stone-400 hover:text-stone-600">
                <span className="sr-only">Menu</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
              </button>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight">{formatCurrency(data.salesAttributedToMarketing)}</span>
              <span className="text-sm text-stone-500 font-medium">of {formatCurrency(data.totalStoreSales)} total store sales</span>
            </div>
          </div>
          
          <div className="h-24 mt-6 border-b border-dashed border-[#85c8f2] relative flex items-end">
             <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" className="overflow-visible text-[#38bdf8]">
                <path d="M0,38 C20,38 30,35 40,30 C50,20 55,5 65,10 C75,15 85,35 100,38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
          </div>
        </div>

        {/* Sessions by traffic type */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[13px] font-semibold text-stone-800">
              Sessions by traffic type
            </h4>
            <Info className="w-4 h-4 text-stone-400" />
          </div>
          
          <div className="flex items-start space-x-6 mb-6">
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#1da1f2]"></div>
                <span className="text-xs text-stone-500 font-medium">Direct</span>
              </div>
              <div className="text-sm font-semibold">{data.sessionsByTrafficType.direct}</div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#7c3aed]"></div>
                <span className="text-xs text-stone-500 font-medium">Paid</span>
              </div>
              <div className="text-sm font-semibold">{data.sessionsByTrafficType.paid}</div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#6366f1]"></div>
                <span className="text-xs text-stone-500 font-medium">Organic</span>
              </div>
              <div className="text-sm font-semibold">{data.sessionsByTrafficType.organic}</div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#d946ef]"></div>
                <span className="text-xs text-stone-500 font-medium">Unknown</span>
              </div>
              <div className="text-sm font-semibold">{data.sessionsByTrafficType.unknown}</div>
            </div>
          </div>

          <div className="flex h-16 w-full rounded overflow-hidden space-x-1">
            <div className="bg-[#1da1f2]" style={{ width: `${getPct(data.sessionsByTrafficType.direct)}%` }}></div>
            <div className="bg-[#7c3aed]" style={{ width: `${getPct(data.sessionsByTrafficType.paid)}%` }}></div>
            <div className="bg-[#6366f1]" style={{ width: `${getPct(data.sessionsByTrafficType.organic)}%` }}></div>
            <div className="bg-[#d946ef]" style={{ width: `${getPct(data.sessionsByTrafficType.unknown)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Sessions by Device Type Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs relative">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[13px] font-semibold text-stone-800 border-b border-dashed border-stone-300 pb-0.5 inline-block">
            Sessions
          </h4>
          <Info className="w-4 h-4 text-stone-400" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-24 pb-4">
          
          {/* Donut Chart */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background track (if empty) */}
              {totalDevices === 0 && (
                <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f5f5f4" strokeWidth="16" />
              )}
              
              {totalDevices > 0 && (
                <>
                  {/* Mobile */}
                  <circle
                    cx="80" cy="80" r={radius} fill="transparent"
                    stroke="#0ea5e9" strokeWidth="16"
                    strokeDasharray={`${mDash > 2 ? mDash - 2 : mDash} ${circumference}`}
                    strokeDashoffset={mOffset}
                    strokeLinecap="round"
                  />
                  {/* Desktop */}
                  <circle
                    cx="80" cy="80" r={radius} fill="transparent"
                    stroke="#8b5cf6" strokeWidth="16"
                    strokeDasharray={`${dDash > 2 ? dDash - 2 : dDash} ${circumference}`}
                    strokeDashoffset={dOffset}
                    strokeLinecap="round"
                  />
                  {/* Tablet */}
                  <circle
                    cx="80" cy="80" r={radius} fill="transparent"
                    stroke="#6366f1" strokeWidth="16"
                    strokeDasharray={`${tDash > 2 ? tDash - 2 : tDash} ${circumference}`}
                    strokeDashoffset={tOffset}
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
            
            {/* Center Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-stone-800 tracking-tight">{formatNumber(totalDevices)}</span>
              <span className="text-stone-300">—</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col space-y-3 min-w-[120px]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm bg-[#0ea5e9]"></div>
                <span className="text-stone-500 font-medium">Mobile</span>
              </div>
              <span className="font-semibold text-stone-700">{formatNumber(mobile)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm bg-[#8b5cf6]"></div>
                <span className="text-stone-500 font-medium">Desktop</span>
              </div>
              <span className="font-semibold text-stone-700">{formatNumber(desktop)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-sm bg-[#6366f1]"></div>
                <span className="text-stone-500 font-medium">Tablet</span>
              </div>
              <span className="font-semibold text-stone-700">{formatNumber(tablet)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Grid of 4 Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.sources.map((src: any, index: number) => {
          let icon = null;
          if (src.name === 'Google Search') {
            icon = (
              <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">
                <span className="text-blue-500">G</span>
              </div>
            );
          } else if (src.name === 'Instagram') {
            icon = (
              <div className="w-4 h-4 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded flex items-center justify-center text-white p-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </div>
            );
          } else if (src.name === 'Direct') {
            icon = (
              <svg className="w-4 h-4 text-stone-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1a1 1 0 0 0 .71-1.71l-9-9a1 1 0 0 0-1.42 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4z"/></svg>
            );
          } else if (src.name === 'Facebook') {
            icon = (
              <div className="w-4 h-4 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-xs">
                f
              </div>
            );
          }

          return (
            <div key={src.name} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-48">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {icon}
                  <span className="text-[13px] font-semibold border-b border-dashed border-stone-300 pb-0.5">{src.name}</span>
                </div>
                <span className="text-xs text-stone-500 font-medium">{src.sessions.toLocaleString('en-IN')} sessions</span>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight mb-1">{formatCurrency(src.revenue)}</div>
                {src.orders > 0 && (
                  <p className="text-xs text-stone-500 leading-snug">
                    Order value for <span className="font-bold text-stone-700">{src.orders} {src.orders === 1 ? 'order' : 'orders'}</span> at <span className="font-bold text-stone-700">{src.conversionRate.toFixed(2)}%</span> conversion rate.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
