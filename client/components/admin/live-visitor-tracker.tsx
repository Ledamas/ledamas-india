'use client';

import React, { useState } from 'react';
import {
  Activity,
  Globe,
  Search,
  Smartphone,
  Monitor,
  Maximize2,
  Settings,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/products';
import { LiveGlobe3D } from './LiveGlobe3D';

export interface LiveVisitorSession {
  visitorId: string;
  sessionId: string;
  customerId?: string;
  customerName?: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  os: string;
  location: string;
  referrer: string;
  utmSource: string;
  currentPage: string;
  timeOnSiteSec: number;
  viewedProducts: string[];
  cartItems: string[];
  status: 'Browsing' | 'Viewing Product' | 'In Cart' | 'At Checkout' | 'Order Completed';
}

const INITIAL_VISITORS: LiveVisitorSession[] = [
  {
    visitorId: 'V-92831',
    sessionId: 'SESS-884910',
    deviceType: 'Mobile',
    browser: 'Chrome 128',
    os: 'Android 15',
    location: 'United States - None - Kansas City',
    referrer: 'Instagram Ad',
    utmSource: 'instagram',
    currentPage: '/products/kunafa-pistachio-dark-chocolate-200g',
    timeOnSiteSec: 222,
    viewedProducts: ['Kunafa Pistachio Dark Chocolate - 200gm'],
    cartItems: ['Kunafa Pistachio Dark Chocolate - 200gm'],
    status: 'In Cart',
  },
  {
    visitorId: 'V-92832',
    sessionId: 'SESS-884911',
    customerId: 'C-10291',
    customerName: 'Ananya Sharma',
    deviceType: 'Desktop',
    browser: 'Chrome 128',
    os: 'Windows 11',
    location: 'India - None - Delhi',
    referrer: 'Google Search',
    utmSource: 'google',
    currentPage: '/checkout',
    timeOnSiteSec: 410,
    viewedProducts: ['Royal Gold Collection Box (24 Pcs)'],
    cartItems: ['Royal Gold Collection Box (24 Pcs)'],
    status: 'At Checkout',
  },
  {
    visitorId: 'V-92833',
    sessionId: 'SESS-884912',
    deviceType: 'Mobile',
    browser: 'Safari Mobile',
    os: 'iOS 18',
    location: 'India - None - Varanasi',
    referrer: 'Direct / Bookmark',
    utmSource: 'direct',
    currentPage: '/collections/dubai-chocolate',
    timeOnSiteSec: 95,
    viewedProducts: ['Bueno White Dubai Chocolate - 200gm'],
    cartItems: [],
    status: 'Viewing Product',
  },
  {
    visitorId: 'V-92834',
    sessionId: 'SESS-884913',
    customerId: 'C-10292',
    customerName: 'Vikramaditya Rao',
    deviceType: 'Desktop',
    browser: 'Edge 128',
    os: 'Windows 11',
    location: 'India - None - Mumbai',
    referrer: 'Newsletter Email',
    utmSource: 'email_campaign',
    currentPage: '/thank-you',
    timeOnSiteSec: 612,
    viewedProducts: ['Kunafa & Pistachio Creme - 110gm'],
    cartItems: ['Kunafa & Pistachio Creme - 110gm'],
    status: 'Order Completed',
  },
];

export const LiveVisitorTracker: React.FC = () => {
  const [visitors] = useState<LiveVisitorSession[]>(INITIAL_VISITORS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredVisitors = visitors.filter((v) => {
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    const matchesSearch =
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCartsCount = visitors.filter((v) => v.status === 'In Cart').length;
  const checkingOutCount = visitors.filter((v) => v.status === 'At Checkout').length;
  const purchasedCount = visitors.filter((v) => v.status === 'Order Completed').length;

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Top Header Bar — Shopify Style */}
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600">
            <Globe className="w-4 h-4 animate-spin-slow text-sky-600" />
          </div>
          <h2 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
            Live View
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
              Just now
            </span>
          </h2>
        </div>

        {/* Right Search & Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 w-48 transition-all"
            />
          </div>
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors" title="Settings">
            <Settings className="w-4 h-4 text-slate-800" />
          </button>
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors" title="Layers">
            <Layers className="w-4 h-4 text-slate-800" />
          </button>
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors" title="Fullscreen">
            <Maximize2 className="w-4 h-4 text-slate-800" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Side Metric Cards + Right Side 3D Globe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Analytics Cards (5 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Visitors right now & Total sales & Sessions & Orders */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-xs font-extrabold text-slate-900 uppercase">Visitors right now</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{visitors.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-xs font-extrabold text-slate-900 uppercase">Total sales</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">₹1,498.00</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-900 uppercase">Sessions</p>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  4 • 100%
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">4</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-xs font-extrabold text-slate-900 uppercase">Orders</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">1</p>
            </div>
          </div>

          {/* Card 2: Customer behavior */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <p className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
              Customer behavior
            </p>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
              <div>
                <p className="text-[11px] font-extrabold text-slate-700">Active carts</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{activeCartsCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-700">Checking out</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{checkingOutCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-700">Purchased</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{purchasedCount}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Sessions by location */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                Sessions by location
              </p>
              <span className="text-[10px] font-bold text-slate-600">ⓘ Info</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>United States - None - Kansas City</span>
                  <span>1</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>India - None - Delhi</span>
                  <span>1</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>India - None - Varanasi</span>
                  <span>1</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>India - None - Mumbai</span>
                  <span>1</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: New vs returning customers */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <p className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
              New vs returning customers
            </p>
            <div className="flex items-center space-x-6 text-xs pt-1 border-t border-slate-100 font-bold text-slate-900">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span>New: <strong>3</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Returning: <strong>1</strong></span>
              </div>
            </div>
          </div>

          {/* Card 5: Total sales by product */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <p className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
              Total sales by product
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2.5">
                <img
                  src={PRODUCTS[0]?.images[0] || '/Le-Damas-Sweets-Logo-enhanced.png'}
                  alt="Product"
                  className="w-8 h-8 rounded border border-slate-200 object-cover"
                />
                <div>
                  <p className="text-xs font-extrabold text-slate-900 leading-tight">
                    Kunafa & Pistachio Creme - 110gm
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold">Ledamas • In Stock</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-slate-900">₹1,498.00</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Earth Globe (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs p-2 relative flex flex-col justify-between min-h-[620px]">
          {/* Top Info overlay */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-lg">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" /> Interactive Global Live Map
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Rotate globe or hover points to trace active sessions in real-time.
              </p>
            </div>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              ● Live Radar Active
            </span>
          </div>

          {/* 3D Globe Render */}
          <div className="flex-1 w-full relative">
            <LiveGlobe3D />
          </div>

          {/* Active Live Sessions Stream Table Below */}
          <div className="mt-2 border-t border-slate-200 pt-4 px-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-tight">
                Live Audit Trace Stream
              </h4>
              <div className="flex items-center space-x-1.5">
                {(['ALL', 'Viewing Product', 'In Cart', 'At Checkout', 'Order Completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2 py-0.5 rounded text-[11px] font-extrabold cursor-pointer transition-all ${
                      filterStatus === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] bg-slate-100">
                    <th className="py-2 px-3 font-mono">Visitor ID</th>
                    <th className="py-2 px-3">Location & Journey</th>
                    <th className="py-2 px-3">Device & Source</th>
                    <th className="py-2 px-3 font-mono">Time On Site</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
                  {filteredVisitors.map((v) => (
                    <tr key={v.visitorId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-mono text-xs font-extrabold text-slate-900">
                        {v.visitorId}
                        {v.customerName && (
                          <span className="block text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                            {v.customerName}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <p className="text-xs font-extrabold text-slate-900">{v.location}</p>
                        <p className="text-[10px] font-mono text-slate-500 font-semibold">{v.currentPage}</p>
                      </td>
                      <td className="py-2 px-3 text-xs">
                        <div className="flex items-center space-x-1 font-extrabold text-slate-900">
                          {v.deviceType === 'Mobile' ? (
                            <Smartphone className="w-3 h-3 text-amber-600" />
                          ) : (
                            <Monitor className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{v.deviceType} • {v.browser}</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500">Source: {v.utmSource}</p>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs font-extrabold text-slate-900">
                        {Math.floor(v.timeOnSiteSec / 60)}m {v.timeOnSiteSec % 60}s
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-block ${
                            v.status === 'Order Completed'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : v.status === 'At Checkout'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : v.status === 'In Cart'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

