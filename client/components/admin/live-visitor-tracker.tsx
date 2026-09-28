'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Smartphone,
  Monitor,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { LiveGlobe3D, GlobeMarker } from './LiveGlobe3D';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface LiveAuditSession {
  id: string;
  visitorId: string;
  sessionId: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  os: string;
  referrer: string;
  utmSource: string;
  currentPage: string;
  status: string;
  timeOnSiteSec: number;
  lastSeenAt: string;
}

export interface LiveViewData {
  visitorsRightNow: number;
  totalSales: number;
  sessionsCount: number;
  sessionsChangePct: string;
  ordersCount: number;
  customerBehavior: {
    activeCarts: number;
    checkingOut: number;
    purchased: number;
  };
  sessionsByLocation: { country: string; state: string; city: string; count: number }[];
  newVsReturning: { new: number; returning: number };
  totalSalesByProduct: { name: string; totalRevenue: number; quantitySold: number; image?: string }[];
  liveAuditStream: LiveAuditSession[];
  mapPoints: { id: string; type: 'visitor' | 'order'; lat: number; lng: number; city: string; state: string; country: string; currentPage?: string; status?: string }[];
  timestamp: string;
}

export const LiveVisitorTracker: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7d' | '30d'>('today');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [data, setData] = useState<LiveViewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdatedSecAgo, setLastUpdatedSecAgo] = useState<number>(0);

  // Fetch real database metrics
  const fetchLiveViewMetrics = async (range: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/analytics/live-view?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          setLastUpdatedSecAgo(0);
        }
      }
    } catch (err) {
      console.error('[LIVE VIEW FETCH ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveViewMetrics(dateRange);

    // 5-second polling interval for real-time live view updates
    const interval = setInterval(() => {
      fetchLiveViewMetrics(dateRange);
    }, 5000);

    return () => clearInterval(interval);
  }, [dateRange]);

  // "Updated Xs ago" ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSecAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveSessions = data?.liveAuditStream || [];
  const mapPoints = data?.mapPoints || [];

  const filteredSessions = liveSessions.filter((s) => {
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'Viewing Product' && s.status === 'VIEWING') ||
      (filterStatus === 'In Cart' && s.status === 'IN_CART') ||
      (filterStatus === 'At Checkout' && s.status === 'CHECKOUT') ||
      (filterStatus === 'Order Completed' && s.status === 'PURCHASED');

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      s.city.toLowerCase().includes(searchLower) ||
      s.state.toLowerCase().includes(searchLower) ||
      s.country.toLowerCase().includes(searchLower) ||
      s.visitorId.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const markersForGlobe: GlobeMarker[] = mapPoints.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    label: `${p.city}, ${p.country}`,
    count: 1,
    type: p.type,
  }));

  const maxLocationCount = Math.max(1, ...(data?.sessionsByLocation || []).map((l) => l.count));

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Top Bar with Date Range Selector & Real-Time Pulse */}
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600">
            <Globe className="w-4 h-4 animate-spin-slow text-sky-600" />
          </div>
          <h2 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
            Live View
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></span>
            <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
              {lastUpdatedSecAgo <= 2 ? 'Just now' : `Updated ${lastUpdatedSecAgo}s ago`}
            </span>
          </h2>
        </div>

        {/* Controls: Date Range Selector & Location Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            <button
              onClick={() => setDateRange('today')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                dateRange === 'today' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('yesterday')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                dateRange === 'yesterday' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                dateRange === '7d' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                dateRange === '30d' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          {/* Search Location */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 w-44 transition-all"
            />
          </div>

          <button
            onClick={() => fetchLiveViewMetrics(dateRange)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-slate-800 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Metric Cards + Right 3D Globe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Metric Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Visitors right now & Total sales & Sessions & Orders */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-xs font-extrabold text-slate-900 uppercase">Visitors right now</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {data?.visitorsRightNow ?? 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-xs font-extrabold text-slate-900 uppercase">Total sales</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{(data?.totalSales ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-900 uppercase">Sessions</p>
                <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  {data?.sessionsChangePct || '—'}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{data?.sessionsCount ?? 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <p className="text-xs font-extrabold text-slate-900 uppercase">Orders</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{data?.ordersCount ?? 0}</p>
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
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {data?.customerBehavior?.activeCarts ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-700">Checking out</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {data?.customerBehavior?.checkingOut ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-700">Purchased</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {data?.customerBehavior?.purchased ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Sessions by location */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                Sessions by location
              </p>
              <span className="text-[10px] font-bold text-slate-500">Live active</span>
            </div>

            {(!data?.sessionsByLocation || data.sessionsByLocation.length === 0) ? (
              <p className="text-xs text-slate-500 font-medium italic py-3 text-center">No sessions yet</p>
            ) : (
              <div className="space-y-2.5">
                {data.sessionsByLocation.map((loc, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                      <span>{loc.country} - {loc.state} - {loc.city}</span>
                      <span>{loc.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round((loc.count / maxLocationCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: New vs returning customers */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <p className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
              New vs returning customers
            </p>
            {(!data?.newVsReturning || (data.newVsReturning.new === 0 && data.newVsReturning.returning === 0)) ? (
              <p className="text-xs text-slate-500 font-medium italic pt-1">No data for this date range</p>
            ) : (
              <div className="flex items-center space-x-6 text-xs pt-1 border-t border-slate-100 font-bold text-slate-900">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>New: <strong>{data.newVsReturning.new}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span>Returning: <strong>{data.newVsReturning.returning}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Total sales by product */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <p className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
              Total sales by product
            </p>
            {(!data?.totalSalesByProduct || data.totalSalesByProduct.length === 0) ? (
              <p className="text-xs text-slate-500 font-medium italic py-3 text-center">No orders in this date range</p>
            ) : (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                {data.totalSalesByProduct.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={p.image || '/Le-Damas-Sweets-Logo-enhanced.png'}
                        alt={p.name}
                        className="w-7 h-7 rounded border border-slate-200 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 leading-tight truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold">{p.quantitySold} units sold</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 shrink-0 ml-2">
                      ₹{p.totalRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
              ● Live Database Sync
            </span>
          </div>

          {/* 3D Globe Render */}
          <div className="flex-1 w-full relative">
            <LiveGlobe3D markers={markersForGlobe} />
          </div>

          {/* Active Live Sessions Stream Table Below */}
          <div className="mt-2 border-t border-slate-200 pt-4 px-3">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-tight">
                Live Audit Trace Stream
              </h4>
              <div className="flex items-center space-x-1.5 flex-wrap">
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
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-slate-500 font-medium">
                        No live sessions recorded yet
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono text-xs font-extrabold text-slate-900">
                          {v.visitorId}
                        </td>
                        <td className="py-2 px-3">
                          <p className="text-xs font-extrabold text-slate-900">{v.country} - {v.state} - {v.city}</p>
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
                              v.status === 'PURCHASED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : v.status === 'CHECKOUT'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : v.status === 'IN_CART'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {v.status === 'PURCHASED'
                              ? 'Order Completed'
                              : v.status === 'CHECKOUT'
                              ? 'At Checkout'
                              : v.status === 'IN_CART'
                              ? 'In Cart'
                              : 'Viewing Product'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
