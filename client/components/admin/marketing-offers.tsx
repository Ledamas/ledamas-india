'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Truck,
  Calendar,
  Zap,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  Share2,
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import {
  getAdminCouponsApi,
  createAdminCouponApi,
  deleteAdminCouponApi,
  getAdminReferralsApi,
  createAdminReferralApi,
} from '@/lib/services/admin-service';

export interface CouponItem {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'FREE_SHIPPING';
  value: string;
  minOrderValue?: number;
  timesUsed: number;
  usageLimit?: number;
  expiryDate: string;
  isActive: boolean;
  ordersCount?: number;
  unitsSold?: number;
  grossSales?: number;
  totalDiscount?: number;
  netSales?: number;
  aov?: number;
}

export interface ReferralItem {
  id: string;
  code: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  discountPercent: number;
  timesUsed: number;
  ordersCount: number;
  unitsSold: number;
  grossSales: number;
  referralDiscount: number;
  netSales: number;
  createdAt: string;
}

export const MarketingOffers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'coupons' | 'referrals'>('coupons');
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<any>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 2000,
    maxDiscount: 1000,
    usageLimit: 500,
    expiryDate: '2026-12-31',
    isActive: true,
  });

  // Referral Modal State
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [refForm, setRefForm] = useState<any>({
    code: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    discountPercent: 20,
  });
  const [refError, setRefError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [couponRes, refRes] = await Promise.all([getAdminCouponsApi(), getAdminReferralsApi()]);

      if (couponRes?.coupons && Array.isArray(couponRes.coupons)) {
        const mappedCoupons: CouponItem[] = couponRes.coupons.map((c: any) => ({
          id: c.id,
          code: c.code,
          type: (c.discountType as any) || 'PERCENTAGE',
          value: c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`,
          minOrderValue: c.minOrderValue || 0,
          timesUsed: c.timesUsed || 0,
          usageLimit: c.usageLimit || undefined,
          expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '2026-12-31',
          isActive: c.isActive !== false,
          ordersCount: c.ordersCount || 0,
          unitsSold: c.unitsSold || 0,
          grossSales: c.grossSales || 0,
          totalDiscount: c.totalDiscount || 0,
          netSales: c.netSales || 0,
          aov: c.aov || 0,
        }));
        setCoupons(mappedCoupons);
      }

      if (refRes?.referrals && Array.isArray(refRes.referrals)) {
        setReferrals(refRes.referrals);
      }
    } catch (err) {
      console.error('[MARKETING FETCH ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateCoupon = () => {
    setCouponForm({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 2000,
      maxDiscount: 1000,
      usageLimit: 500,
      expiryDate: '2026-12-31',
      isActive: true,
    });
    setIsCouponModalOpen(true);
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon '${code}'?`)) {
      await deleteAdminCouponApi(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;

    const res = await createAdminCouponApi(couponForm);
    if (res) {
      fetchData();
      setIsCouponModalOpen(false);
    }
  };

  const handleSaveReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refForm.code || !refForm.ownerName) {
      setRefError('Referral code and owner name are required.');
      return;
    }

    setRefError(null);
    try {
      await createAdminReferralApi(refForm);
      fetchData();
      setIsRefModalOpen(false);
      setRefForm({ code: '', ownerName: '', ownerPhone: '', ownerEmail: '', discountPercent: 20 });
    } catch (err: any) {
      setRefError(err?.message || 'Failed to create referral code.');
    }
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-2xl sm:text-3xl font-serif font-bold text-black tracking-wide">
            🎟 Offers, Coupons & Referral Management
          </h2>
          <p className="type-body text-stone-600 text-xs sm:text-sm font-medium mt-1">
            Manage coupon codes, referral links, backend calculations, and sales analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-black text-white shadow-md'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'referrals'
                ? 'bg-[#CB9700] text-black font-extrabold shadow-md'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Referrals ({referrals.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'coupons' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-black">Coupon Section & Analytics</h3>
            <button
              onClick={handleOpenCreateCoupon}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-black hover:bg-stone-800 text-white font-sans text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-[#CB9700]" />
              <span>Create Coupon Code</span>
            </button>
          </div>

          {/* Super Admin Coupon Analytics Table */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-black font-serif">
                Super Admin Coupon Performance Matrix
              </span>
              <span className="text-[11px] text-stone-500 font-mono">Backend Auto-Validated</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-stone-100 text-stone-700 uppercase text-[11px] font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Coupon Code</th>
                    <th className="p-3.5">Discount % / Value</th>
                    <th className="p-3.5 text-center">Orders</th>
                    <th className="p-3.5 text-center">Units Sold</th>
                    <th className="p-3.5 text-right">Gross Sales</th>
                    <th className="p-3.5 text-right">Total Discount</th>
                    <th className="p-3.5 text-right">Net Sales</th>
                    <th className="p-3.5 text-right">AOV</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-stone-500 text-xs">
                        No coupon codes found. Click "Create Coupon Code" to add one.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-stone-900 text-sm">{coupon.code}</td>
                        <td className="p-3.5 font-semibold text-[#CB9700]">{coupon.value}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-stone-800">
                          {coupon.ordersCount || coupon.timesUsed || 0}
                        </td>
                        <td className="p-3.5 text-center font-mono text-stone-700">{coupon.unitsSold || 0}</td>
                        <td className="p-3.5 text-right font-mono text-stone-800">
                          ₹{(coupon.grossSales || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                          -₹{(coupon.totalDiscount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-stone-900">
                          ₹{(coupon.netSales || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-mono text-stone-800">
                          ₹{(coupon.aov || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Referral Section */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-black">Super Admin Referral Section</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Track customer referral codes, owners, converted orders, units sold, and referral discounts (up to 20%).
              </p>
            </div>
            <button
              onClick={() => setIsRefModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#CB9700] hover:bg-[#b08300] text-black font-sans text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Referral</span>
            </button>
          </div>

          {/* Super Admin Referral Performance Matrix */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-black font-serif flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-[#CB9700]" />
                <span>Referral Performance Analytics</span>
              </span>
              <span className="text-[11px] text-emerald-800 font-mono font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Self-Referral Protected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-stone-100 text-stone-700 uppercase text-[11px] font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Referral Code</th>
                    <th className="p-3.5">Referral Owner</th>
                    <th className="p-3.5 text-center">Discount %</th>
                    <th className="p-3.5 text-center">Orders / Customers</th>
                    <th className="p-3.5 text-center">Units Sold</th>
                    <th className="p-3.5 text-right">Gross Sales</th>
                    <th className="p-3.5 text-right">Referral Discount</th>
                    <th className="p-3.5 text-right">Net Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {referrals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-500 text-xs">
                        No active referral codes yet. Click "Create Custom Referral" or share referral links (`?ref=AKHIL20`).
                      </td>
                    </tr>
                  ) : (
                    referrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-stone-900 text-sm">{ref.code}</td>
                        <td className="p-3.5">
                          <p className="font-bold text-stone-900">{ref.ownerName}</p>
                          <p className="text-[11px] text-stone-500 font-mono">{ref.ownerPhone || ref.ownerEmail}</p>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-[#CB9700]">
                          {ref.discountPercent}%
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-stone-800">
                          {ref.ordersCount || ref.timesUsed || 0}
                        </td>
                        <td className="p-3.5 text-center font-mono text-stone-700">{ref.unitsSold || 0}</td>
                        <td className="p-3.5 text-right font-mono text-stone-800">
                          ₹{(ref.grossSales || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                          -₹{(ref.referralDiscount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-stone-900">
                          ₹{(ref.netSales || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="text-xl font-serif font-bold text-black">Create Promotional Coupon Code</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-stone-500 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-sans text-stone-900 font-bold block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAHUL10"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans text-stone-900 font-bold block mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-sans text-stone-900 font-bold block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans text-stone-900 font-bold block mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-sans text-stone-900 font-bold block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800"
                >
                  Save Coupon Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {isRefModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-stone-900 font-sans">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="text-xl font-serif font-bold text-black">Create Custom Referral Code</h3>
              <button onClick={() => setIsRefModalOpen(false)} className="text-stone-500 hover:text-black font-bold">✕</button>
            </div>

            {refError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {refError}
              </div>
            )}

            <form onSubmit={handleSaveReferral} className="space-y-4">
              <div>
                <label className="text-xs text-stone-900 font-bold block mb-1">Referral Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AKHIL20"
                  value={refForm.code}
                  onChange={(e) => setRefForm({ ...refForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-xs text-stone-900 font-bold block mb-1">Referral Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Akhil Kumar"
                  value={refForm.ownerName}
                  onChange={(e) => setRefForm({ ...refForm, ownerName: e.target.value })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-900 font-bold block mb-1">Owner Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9628781235"
                    value={refForm.ownerPhone}
                    onChange={(e) => setRefForm({ ...refForm, ownerPhone: e.target.value })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-900 font-bold block mb-1">Discount % (Max 20%)</label>
                  <input
                    type="number"
                    max={20}
                    value={refForm.discountPercent}
                    onChange={(e) => setRefForm({ ...refForm, discountPercent: Number(e.target.value) })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRefModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#CB9700] hover:bg-[#b08300] text-black text-xs font-bold"
                >
                  Create Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
