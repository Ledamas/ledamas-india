'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { fetchApi } from '@/lib/api-client';
import { calculateCodDetails } from '@/lib/utils/cod-calculator';
import { initiatePaymentApi, verifyAndCreateOrderApi } from '@/lib/services/product-service';
import { trackInitiateCheckout, trackPurchase } from '@/lib/meta-pixel';
import { ArrowLeft, ShieldCheck, Truck, CheckCircle2, Info, Loader2, AlertTriangle, Lock, ArrowRight, Tag, Sparkles, X, Gift } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const totalPrice = subtotal;

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    paymentMethod: 'upi',
  });

  // Promo / Referral Code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    type: 'COUPON' | 'REFERRAL';
    code: string;
    discountAmount: number;
    message: string;
    ownerName?: string;
  } | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [savedRefCode, setSavedRefCode] = useState<string | null>(null);

  // Read saved referral code from localStorage on mount
  useEffect(() => {
    try {
      const ref = localStorage.getItem('ledamas_referral_code');
      if (ref && ref.trim()) {
        setSavedRefCode(ref.trim().toUpperCase());
      }
    } catch (e) {}
  }, []);

  // Pre-fill user data upon authentication
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setForm((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone?.replace('google_', '') || '',
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
      }));
    }
  }, [user]);

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');
  const [createdOrderDetails, setCreatedOrderDetails] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleApplyCode = async (codeToTest?: string) => {
    const targetCode = (codeToTest || promoInput).trim();
    if (!targetCode) {
      setCodeError('Please enter a valid coupon or referral code.');
      return;
    }

    setIsValidatingCode(true);
    setCodeError(null);

    try {
      const res: any = await fetchApi('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: targetCode,
          subtotal: totalPrice,
          userId: user?.id,
          phone: form.phone,
          email: form.email,
        }),
      });

      const resData = res?.data || res;
      if (resData && resData.valid) {
        setAppliedDiscount({
          type: resData.type,
          code: resData.code,
          discountAmount: resData.discountAmount,
          message: resData.message,
          ownerName: resData.ownerName,
        });
        setPromoInput(resData.code);
        setCodeError(null);
      } else {
        throw new Error(res?.message || 'Invalid discount code.');
      }
    } catch (err: any) {
      setCodeError(err?.message || 'Invalid coupon or referral code.');
      setAppliedDiscount(null);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setPromoInput('');
    setCodeError(null);
  };

  const discountAmount = appliedDiscount?.discountAmount || 0;
  const shippingCost = 0; // Free shipping
  const baseOrderTotal = Math.max(0, totalPrice - discountAmount);
  const codDetails = calculateCodDetails(baseOrderTotal, form.paymentMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setPaymentError(null);

    // Track Meta Pixel InitiateCheckout
    trackInitiateCheckout(items, baseOrderTotal);

    try {
      // 1. Enforce server-side calculation and Razorpay order creation
      const initRes: any = await initiatePaymentApi(baseOrderTotal, form.paymentMethod);
      const initData = initRes?.data || initRes;

      if (!initData || !initData.razorpayOrderId) {
        throw new Error(initRes?.message || 'Failed to initiate payment with server.');
      }

      const { razorpayOrderId, onlineAmount, keyId } = initData;

      // 2. Load Razorpay SDK Script
      const scriptLoaded = await loadRazorpayScript();

      const processOrderVerification = async (paymentId: string, signature: string) => {
        const verifyRes: any = await verifyAndCreateOrderApi({
          razorpayOrderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          customerName: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          street: form.address,
          apartment: form.apartment,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          items: items.map((item) => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            name: item.product.name,
            variantName: item.variant?.name || item.variant?.weight,
            price: item.variant ? item.variant.price : item.product.price,
            quantity: item.quantity,
            image: item.product.images?.[0] || '/Kunafa Pistachio Dark Chocolate 1.png',
          })),
          subtotal: totalPrice,
          discount: discountAmount,
          couponCode: appliedDiscount?.type === 'COUPON' ? appliedDiscount.code : null,
          referralCode: appliedDiscount?.type === 'REFERRAL' ? appliedDiscount.code : null,
          orderTotal: baseOrderTotal,
          paymentMethod: form.paymentMethod.toUpperCase(),
          userId: user?.id || undefined,
        });

        const verifyData = verifyRes?.data || verifyRes;
        const confirmedOrder = verifyData?.order || (verifyData?.orderNumber ? verifyData : null);

        if (confirmedOrder) {
          // Track Meta Pixel Purchase event
          trackPurchase({
            orderId: confirmedOrder.orderNumber || razorpayOrderId,
            paymentId,
            value: baseOrderTotal,
            items,
          });

          setCreatedOrderDetails(confirmedOrder);
          setCreatedOrderNumber(confirmedOrder.orderNumber);
          setOrderSubmitted(true);
          clearCart();
        } else {
          throw new Error(verifyRes?.message || 'Payment signature verification failed.');
        }
      };

      if (!scriptLoaded || typeof (window as any).Razorpay === 'undefined') {
        console.warn('[CHECKOUT NOTICE] Razorpay SDK unavailable or test mode. Running direct verification.');
        await processOrderVerification(`pay_mock_${Date.now()}`, 'mock_signature_passed');
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: Math.round(onlineAmount * 100),
        currency: 'INR',
        name: 'LE DAMAS INDIA',
        description:
          form.paymentMethod === 'cod'
            ? baseOrderTotal < 3000
              ? '₹99 COD Confirmation Fee'
              : '₹99 COD Advance Payment'
            : 'Order Payment',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await processOrderVerification(
              response.razorpay_payment_id || `pay_mock_${Date.now()}`,
              response.razorpay_signature || 'mock_signature_passed'
            );
          } catch (err: any) {
            setPaymentError(err?.message || 'Payment verification failed.');
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setPaymentError('Payment was cancelled. COD order was NOT confirmed. Please complete payment to confirm order.');
          },
        },
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: '#3D2314',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setIsSubmitting(false);
        setPaymentError(`Payment Failed: ${response.error?.description || 'Payment was unsuccessful.'}. COD order was NOT confirmed.`);
      });
      rzp.open();
    } catch (err: any) {
      console.error('[CHECKOUT SUBMIT ERROR]', err);
      setPaymentError(err?.message || 'Failed to initialize payment process.');
      setIsSubmitting(false);
    }
  };

  if (orderSubmitted) {
    const isCod = (createdOrderDetails?.paymentMethod || form.paymentMethod.toUpperCase()) === 'COD';
    const orderTotalVal = createdOrderDetails?.orderTotal ?? baseOrderTotal;
    const isUnder3k = orderTotalVal < 3000;
    const codConfirmationChargeVal = createdOrderDetails?.codConfirmationCharge ?? (isCod && isUnder3k ? 99 : 0);
    const codAdvanceVal = createdOrderDetails?.codAdvance ?? (isCod && !isUnder3k ? 99 : 0);
    const codAmountVal = createdOrderDetails?.codAmount ?? (isCod ? (isUnder3k ? orderTotalVal : orderTotalVal - 99) : 0);
    const customerTotalExpense = createdOrderDetails?.total ?? (isCod ? (isUnder3k ? orderTotalVal + 99 : orderTotalVal) : orderTotalVal);

    return (
      <div className="min-h-screen bg-[#FAF6ED] text-[#3D2314] pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white border border-[#CB9700]/40 rounded-2xl p-8 text-center space-y-6 shadow-xl shadow-[#3D2314]/10">
          <div className="w-16 h-16 bg-[#CB9700]/10 rounded-full flex items-center justify-center mx-auto text-[#CB9700]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-2xl text-[#3D2314]">
            {isCod ? 'COD Order Confirmed' : 'Order Placed Successfully!'}
          </h1>
          <p className="text-[#5A3822] text-sm leading-relaxed font-light">
            Thank you for choosing LE DAMAS. Your luxury chocolate box is being prepared for cold-chain dispatch.
          </p>

          <div className="bg-[#FAF6ED] p-5 rounded-xl border border-[#E8DCCB] text-left text-xs space-y-3 text-[#5A3822]">
            <div className="flex justify-between border-b border-[#E8DCCB] pb-2 font-mono">
              <span className="text-stone-400">ORDER NO:</span>
              <span className="font-bold text-[#3D2314]">#{createdOrderNumber || createdOrderDetails?.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8DCCB] pb-2 font-mono">
              <span className="text-stone-400">PAYMENT METHOD:</span>
              <span className="font-semibold text-[#3D2314]">{isCod ? 'Cash on Delivery (COD)' : 'Prepaid (Online)'}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8DCCB] pb-2 font-mono">
              <span className="text-stone-400">ORDER VALUE:</span>
              <span className="font-semibold text-[#3D2314]">₹{orderTotalVal.toLocaleString('en-IN')}</span>
            </div>

            {isCod ? (
              <>
                <div className="flex justify-between border-b border-[#E8DCCB] pb-2">
                  <span className="text-stone-500 font-sans">
                    {isUnder3k ? 'COD Confirmation Charge (Paid Online):' : 'COD Advance Payment (Paid Online):'}
                  </span>
                  <span className="font-bold text-[#CB9700] font-mono">
                    ₹{isUnder3k ? codConfirmationChargeVal : codAdvanceVal}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#E8DCCB] pb-2 bg-[#CB9700]/10 p-2 rounded-lg">
                  <span className="text-[#3D2314] font-bold font-sans">Payable at Delivery (COD):</span>
                  <span className="text-[#CB9700] font-bold text-base font-mono">
                    ₹{codAmountVal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between font-mono pt-1">
                  <span className="text-stone-500 font-sans">Total Customer Expense:</span>
                  <span className="font-bold text-[#3D2314]">₹{customerTotalExpense.toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between border-b border-[#E8DCCB] pb-2">
                <span className="text-stone-500 font-sans">Total Paid Online:</span>
                <span className="font-bold text-[#CB9700] font-mono">₹{customerTotalExpense.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between font-mono pt-1">
              <span className="text-stone-400">STATUS:</span>
              <span className="text-[#CB9700] font-semibold uppercase tracking-wider">
                {createdOrderDetails?.paymentStatus || (isCod ? 'ADVANCE_PAID' : 'PAID')}
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block w-full py-3.5 rounded-full bg-[#3D2314] hover:bg-[#5A3822] text-[#FAF6ED] font-bold text-xs uppercase tracking-widest transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6ED] text-[#3D2314] font-sans">
        <Header />
        <main className="pt-44 sm:pt-48 lg:pt-52 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="w-full max-w-lg bg-[#FDFBF7] rounded-2xl shadow-2xl p-8 border border-[#EBE3D3] text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#CB9700]/15 text-[#CB9700] border border-[#CB9700]/40 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <span className="text-[10px] font-sans tracking-[0.25em] text-[#CB9700] font-bold uppercase block mb-1">
                AUTHENTICATION REQUIRED
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#3D2314]">
                Log In to Access Checkout
              </h2>
              <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                To protect your luxury order, enable express COD calculations, and receive instant delivery updates, please sign in with Google or Mobile OTP.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={openLoginModal}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2B2825] hover:bg-[#CB9700] text-white hover:text-black font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>LOGIN WITH GOOGLE OR PHONE OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/shop"
                className="block text-xs text-[#8C5E3C] hover:underline font-semibold uppercase tracking-wider pt-2"
              >
                Continue Browsing Collection
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6ED] text-[#3D2314] font-sans selection:bg-[#CB9700]/30 selection:text-[#3D2314]">
      <Header />

      <main className="pt-44 sm:pt-48 lg:pt-52 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation back link */}
          <div className="mb-6">
            <Link
              href="/shop"
              className="inline-flex items-center text-xs text-[#8C5E3C] hover:text-[#3D2314] transition-colors gap-2 tracking-wider uppercase font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          <h1 className="font-serif type-page-title text-[#3D2314] font-normal mb-8 pb-4 border-b border-[#E8DCCB]">
            Luxury Express Checkout
          </h1>

          {paymentError && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Payment Notification</p>
                <p className="mt-0.5 leading-relaxed">{paymentError}</p>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="bg-white border border-[#E8DCCB] rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-lg shadow-[#3D2314]/5">
              <p className="text-[#5A3822] text-base font-light">Your cart is currently empty.</p>
              <Link
                href="/shop"
                className="inline-block px-8 py-3 rounded-full bg-[#3D2314] text-[#FAF6ED] text-xs font-bold uppercase tracking-widest hover:bg-[#5A3822] transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Form Column */}
              <div className="lg:col-span-7 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-4 shadow-lg shadow-[#3D2314]/5">
                    <h2 className="text-sm uppercase tracking-widest text-[#CB9700] font-bold">
                      1. Contact Details
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#3D2314] uppercase tracking-wider mb-1.5">
                          Email Address for Order Tracking *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-4 shadow-lg shadow-[#3D2314]/5">
                    <h2 className="text-sm uppercase tracking-widest text-[#CB9700] font-bold">
                      2. Delivery Address (India)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#3D2314] uppercase tracking-wider mb-1.5">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#3D2314] uppercase tracking-wider mb-1.5">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3D2314] uppercase tracking-wider mb-1.5">Phone Number (For Delivery OTP) *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3D2314] uppercase tracking-wider mb-1.5">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Enter street address"
                        className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#3D2314] uppercase tracking-wider mb-1.5">City *</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Enter city"
                          className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#3D2314] uppercase tracking-wider mb-1.5">State *</label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={form.state}
                          onChange={handleChange}
                          placeholder="Enter state"
                          className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#3D2314] uppercase tracking-wider mb-1.5">PIN Code *</label>
                        <input
                          type="text"
                          name="pincode"
                          required
                          value={form.pincode}
                          onChange={handleChange}
                          placeholder="Enter PIN code"
                          className="w-full bg-[#FAF6ED] border border-[#D6C2B4] rounded-xl px-4 py-3 text-sm text-[#3D2314] placeholder-stone-400 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 space-y-4 shadow-lg shadow-[#3D2314]/5">
                    <h2 className="text-sm uppercase tracking-widest text-[#CB9700] font-bold">
                      3. Select Payment Method
                    </h2>
                    <div className="space-y-3">
                      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'upi' ? 'bg-[#CB9700]/10 border-[#CB9700]' : 'bg-[#FAF6ED] border-[#E8DCCB]'}`}>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="upi"
                            checked={form.paymentMethod === 'upi'}
                            onChange={handleChange}
                            className="accent-[#CB9700]"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#3D2314]">Instant UPI (GPay / PhonePe / Paytm / QR)</p>
                            <p className="text-xs text-[#5A3822]">Fastest checkout with instant verification</p>
                          </div>
                        </div>
                        <span className="text-xs bg-[#CB9700] text-[#FAF6ED] px-2.5 py-1 rounded-full font-bold">RECOMMENDED</span>
                      </label>

                      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'card' ? 'bg-[#CB9700]/10 border-[#CB9700]' : 'bg-[#FAF6ED] border-[#E8DCCB]'}`}>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={form.paymentMethod === 'card'}
                            onChange={handleChange}
                            className="accent-[#CB9700]"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#3D2314]">Credit / Debit Card</p>
                            <p className="text-xs text-[#5A3822]">Visa, Mastercard, RuPay, Amex</p>
                          </div>
                        </div>
                      </label>

                      <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'cod' ? 'bg-[#CB9700]/10 border-[#CB9700]' : 'bg-[#FAF6ED] border-[#E8DCCB]'}`}>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={form.paymentMethod === 'cod'}
                            onChange={handleChange}
                            className="accent-[#CB9700]"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#3D2314]">Cash on Delivery (COD)</p>
                            <p className="text-xs text-[#5A3822]">Pay ₹99 online now to confirm COD delivery</p>
                          </div>
                        </div>
                      </label>

                      {/* COD Breakdown Banner */}
                      {form.paymentMethod === 'cod' && (
                        <div className="mt-3 p-4 rounded-xl bg-[#FAF6ED] border border-[#CB9700]/40 text-xs space-y-3">
                          <div className="flex items-center space-x-2 text-[#CB9700] font-bold uppercase tracking-wider">
                            <Info className="w-4 h-4 shrink-0" />
                            <span>{codDetails.badgeText}</span>
                          </div>
                          <p className="text-[#5A3822] leading-relaxed font-normal">
                            {codDetails.descriptionText}
                          </p>
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E8DCCB]">
                            <div className="bg-white p-3 rounded-xl border border-[#E8DCCB]">
                              <span className="text-stone-500 block text-[11px] uppercase tracking-wider font-semibold">Collect Online Now</span>
                              <span className="text-[#CB9700] font-bold text-base font-mono">₹{codDetails.onlinePayableAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-[#E8DCCB]">
                              <span className="text-stone-500 block text-[11px] uppercase tracking-wider font-semibold">Payable on Delivery</span>
                              <span className="text-[#3D2314] font-bold text-base font-mono">₹{codDetails.codAmountToCollect.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full bg-[#3D2314] hover:bg-[#5A3822] active:scale-[0.99] disabled:opacity-50 text-[#FAF6ED] font-bold text-xs tracking-[0.15em] uppercase transition-all shadow-xl shadow-[#3D2314]/20 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#CB9700]" />
                        <span>Verifying & Initiating Payment...</span>
                      </>
                    ) : form.paymentMethod === 'cod' ? (
                      `Pay ₹99 Online • ₹${codDetails.codAmountToCollect.toLocaleString('en-IN')} on Delivery`
                    ) : (
                      `Complete Order • ₹${codDetails.totalCustomerPays.toLocaleString('en-IN')}`
                    )}
                  </button>
                </form>
              </div>

              {/* Right Summary Column */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 sticky top-36 space-y-6 shadow-lg shadow-[#3D2314]/5">
                  <h2 className="text-sm uppercase tracking-widest text-[#CB9700] font-bold border-b border-[#E8DCCB] pb-3">
                    Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
                  </h2>

                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {items.map((item) => {
                      const itemPrice = item.variant ? item.variant.price : item.product.price;
                      const itemImage = item.product.images?.[0] || '/Kunafa Pistachio Dark Chocolate 1.png';
                      const variantName = item.variant?.name || item.variant?.weight;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3.5 p-3 rounded-xl bg-[#FAF6ED] border border-[#E8DCCB]"
                        >
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white border border-[#E8DCCB]">
                            <Image src={itemImage} alt={item.product.name} fill className="object-contain p-1" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-[#3D2314] line-clamp-2 leading-tight">
                              {item.product.name}
                            </p>
                            {variantName && <p className="text-[11px] text-[#5A3822] truncate">{variantName}</p>}
                            <div className="flex items-center justify-between mt-1 text-xs">
                              <span className="text-stone-500 font-mono">Qty: {item.quantity}</span>
                              <span className="text-[#CB9700] font-bold">
                                ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo / Referral Code Box */}
                  <div className="bg-[#FAF6ED] p-4 rounded-xl border border-[#E8DCCB] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#3D2314] flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#CB9700]" />
                        <span>Coupon / Referral Code</span>
                      </label>
                      <span className="text-[10px] text-stone-500 italic">Either referral OR coupon</span>
                    </div>

                    {appliedDiscount ? (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {appliedDiscount.type === 'REFERRAL' ? 'Referral Discount' : 'Coupon Code'} ({appliedDiscount.code})
                            </span>
                          </div>
                          <p className="text-emerald-700 text-[11px] mt-0.5">{appliedDiscount.message}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveDiscount}
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded cursor-pointer"
                          title="Remove discount"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                            placeholder="Enter Coupon Code"
                            className="flex-1 bg-white border border-[#D6C2B4] rounded-lg px-3 py-2 text-xs font-mono uppercase text-[#3D2314] focus:outline-none focus:border-[#CB9700]"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyCode()}
                            disabled={isValidatingCode || !promoInput.trim()}
                            className="px-4 py-2 rounded-lg bg-[#3D2314] hover:bg-[#CB9700] hover:text-black disabled:opacity-50 text-white font-semibold text-xs transition-all cursor-pointer shrink-0"
                          >
                            {isValidatingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Apply'}
                          </button>
                        </div>

                        {codeError && <p className="text-[11px] text-red-600 font-medium">{codeError}</p>}

                        {savedRefCode && !appliedDiscount && (
                          <div className="bg-[#CB9700]/10 border border-[#CB9700]/30 rounded-lg p-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2 text-[#3D2314]">
                              <Gift className="w-4 h-4 text-[#CB9700] shrink-0" />
                              <span>Referral active: <strong>{savedRefCode}</strong></span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplyCode(savedRefCode)}
                              className="text-[11px] font-bold text-[#CB9700] hover:underline uppercase tracking-wider cursor-pointer"
                            >
                              Apply 20% Off
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#E8DCCB] text-xs text-[#5A3822]">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Items Subtotal</span>
                      <span className="font-semibold text-[#3D2314]">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>
                          {appliedDiscount?.type === 'REFERRAL' ? `Referral Discount (${appliedDiscount.code})` : `Coupon Discount (${appliedDiscount?.code})`}
                        </span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Express Cold-Chain Shipping</span>
                      <span className="text-[#2AD2C5] font-bold uppercase tracking-wider">FREE</span>
                    </div>

                    <div className="flex justify-between border-t border-[#E8DCCB] pt-2">
                      <span className="text-stone-500 font-medium">Order Subtotal</span>
                      <span className="font-semibold text-[#3D2314]">₹{baseOrderTotal.toLocaleString('en-IN')}</span>
                    </div>

                    {codDetails.isCod && (
                      <div className="bg-[#FAF6ED] p-3 rounded-xl border border-[#E8DCCB] space-y-2 mt-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-600 font-medium">
                            {codDetails.codFeeType === 'CONFIRMATION_CHARGE'
                              ? 'COD Confirmation Charge (Additional)'
                              : 'COD Advance Payment (Toward Total)'}
                          </span>
                          <span className="font-bold text-[#CB9700]">₹99</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-[#E8DCCB]">
                          <span className="text-stone-500">Online Paid Now:</span>
                          <span className="font-bold text-[#CB9700]">₹{codDetails.onlinePayableAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-500">Balance on Delivery (COD):</span>
                          <span className="font-bold text-[#3D2314]">₹{codDetails.codAmountToCollect.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-3 border-t border-[#E8DCCB] text-sm font-serif">
                      <span className="text-[#3D2314] font-semibold">Total Customer Pays</span>
                      <span className="text-lg text-[#CB9700] font-bold">
                        ₹{codDetails.totalCustomerPays.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-4 border-t border-[#E8DCCB] grid grid-cols-2 gap-3 text-[11px] text-[#5A3822]">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-[#CB9700] shrink-0" />
                      <span>Cold-Chain Insulated Box</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-[#CB9700] shrink-0" />
                      <span>100% Damage Protection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
