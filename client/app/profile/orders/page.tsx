'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '../../../components/layout/header';
import { Footer } from '../../../components/layout/footer';
import { useAuth } from '../../../lib/context/auth-context';
import { useCart } from '../../../lib/context/cart-context';
import { fetchApi } from '../../../lib/api-client';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  X,
  ChevronRight,
  Printer,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  FileText,
  CreditCard,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  total: number;
  subtotal: number;
  paymentMethod?: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayRefundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundReason?: string;
  refundedAt?: string;
}

export default function UserOrdersPage() {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { addItem } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Selected Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const userId = user?.id;
  const userPhone = user?.phone;
  const userEmail = user?.email;
  const fetchingRef = useRef(false);

  const fetchOrders = async (showLoading = true) => {
    if (!user || fetchingRef.current) {
      if (!user) setLoading(false);
      return;
    }

    try {
      fetchingRef.current = true;
      if (showLoading) setLoading(true);
      const params = new URLSearchParams();
      if (user.id) params.set('userId', user.id);
      if (user.email) params.set('email', user.email);
      if (user.phone && !user.phone.startsWith('google_')) {
        params.set('phone', user.phone);
      }

      const resData: any = await fetchApi(`/orders?${params.toString()}`).catch((err) => {
        console.warn('[SILENT FETCH ORDERS] Connection paused:', err?.message);
        return null;
      });

      if (Array.isArray(resData)) {
        setOrders(resData);
      } else if (resData?.data && Array.isArray(resData.data)) {
        setOrders(resData.data);
      } else if (resData?.orders && Array.isArray(resData.orders)) {
        setOrders(resData.orders);
      }
    } catch (err) {
      console.warn('[ORDERS PAGE] Fetch error:', err);
    } finally {
      fetchingRef.current = false;
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (userId || userPhone || userEmail) {
      fetchOrders(true);
    } else {
      setLoading(false);
    }
  }, [userId, userPhone, userEmail]);

  // Real-Time SSE Stream Connection for instant updates without reload
  useEffect(() => {
    if (!userId) return;

    let eventSource: EventSource | null = null;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      eventSource = new EventSource(`${apiBase}/orders/stream`, { withCredentials: true });

      eventSource.addEventListener('order_update', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload && payload.order) {
            const updatedOrder: Order = payload.order;
            setOrders((prevOrders) => {
              const exists = prevOrders.some((o) => o.id === updatedOrder.id);
              if (exists) {
                return prevOrders.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
              }
              return [updatedOrder, ...prevOrders];
            });

            setSelectedOrder((prevSelected) =>
              prevSelected && prevSelected.id === updatedOrder.id ? { ...prevSelected, ...updatedOrder } : prevSelected
            );
          }
        } catch (err) {
          console.error('[SSE PARSE ERROR]', err);
        }
      });
    } catch (err) {
      console.warn('[SSE CONNECTION NOTICE]', err);
    }

    return () => {
      eventSource?.close();
    };
  }, [userId]);

  // Tab counters
  const totalCount = orders.length;
  const shippedCount = orders.filter((o) => o.orderStatus === 'SHIPPED').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
  const refundedCount = orders.filter((o) => o.orderStatus === 'REFUNDED' || o.paymentStatus === 'REFUNDED').length;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNum = order.orderNumber.toLowerCase().includes(q);
          const matchItem = order.items?.some((i) => i.productName.toLowerCase().includes(q));
          if (!matchNum && !matchItem) return false;
        }

        if (activeTab === 'SHIPPED') return order.orderStatus === 'SHIPPED';
        if (activeTab === 'DELIVERED') return order.orderStatus === 'DELIVERED';
        if (activeTab === 'REFUNDED') return order.orderStatus === 'REFUNDED' || order.paymentStatus === 'REFUNDED';
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, activeTab]);

  const handleReorder = (order: Order) => {
    order.items?.forEach((item) => {
      addItem(
        {
          id: item.id || `prod_${Date.now()}`,
          name: item.productName,
          price: item.price,
          image: item.image,
          weight: item.variantName || '250g',
        },
        undefined,
        item.quantity || 1
      );
    });
  };

  const getProductImage = (img?: string, productName?: string) => {
    if (img && img !== '/logo.png' && !img.includes('logo') && !img.includes('placeholder')) {
      return img;
    }
    const nameLower = (productName || '').toLowerCase();
    if (nameLower.includes('mini')) {
      if (nameLower.includes('dark')) return '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-1.png';
      if (nameLower.includes('milk')) return '/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-1.png';
      if (nameLower.includes('speculoos')) return '/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-1.png';
      if (nameLower.includes('hazelnut')) return '/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-1.png';
      return '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-1.png';
    }
    if (nameLower.includes('dark')) return '/Kunafa-Pistachio-Dark-Chocolate-1.png';
    if (nameLower.includes('milk')) return '/Kunafa-Pistachio-Milk-Chocolate-1.png';
    if (nameLower.includes('speculoos')) return '/Crispy-Speculoos-Creme-Milk-Chocolate-1.png';
    if (nameLower.includes('hazelnut') || nameLower.includes('white')) return '/White-Chocolate-Hazelnut-Creme-1.png';
    if (nameLower.includes('bubu')) return '/Le-Bubu-1.png';
    return '/Kunafa-Pistachio-Dark-Chocolate-1.png';
  };


  const renderStatusBadge = (order: Order) => {
    const status = (order.orderStatus || 'NEW').toUpperCase();
    const payment = (order.paymentStatus || '').toUpperCase();

    if (status === 'REFUNDED' || payment === 'REFUNDED') {
      return (
        <div className="flex items-center space-x-2 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-full border border-amber-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-xs font-bold tracking-wide">💰 Refund Completed</span>
        </div>
      );
    }
    if (status === 'SHIPPED') {
      return (
        <div className="flex items-center space-x-2 bg-purple-50 text-purple-900 px-3 py-1.5 rounded-full border border-purple-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
          <span className="text-xs font-bold tracking-wide flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Shipped • On The Way</span>
          </span>
        </div>
      );
    }
    if (status === 'DELIVERED') {
      return (
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-full border border-emerald-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span className="text-xs font-bold tracking-wide flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered</span>
          </span>
        </div>
      );
    }
    if (status === 'PROCESSING' || status === 'PACKED') {
      return (
        <div className="flex items-center space-x-2 bg-blue-50 text-blue-900 px-3 py-1.5 rounded-full border border-blue-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-xs font-bold tracking-wide">Handcrafted & Packaging</span>
        </div>
      );
    }
    if (status === 'CANCELLED') {
      return (
        <div className="flex items-center space-x-2 bg-rose-50 text-rose-900 px-3 py-1.5 rounded-full border border-rose-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="text-xs font-bold tracking-wide">Cancelled</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2 bg-stone-100 text-stone-900 px-3 py-1.5 rounded-full border border-stone-300 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#CB9700]"></span>
        <span className="text-xs font-bold tracking-wide">Order Confirmed</span>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between font-sans">
        <Header />
        <main className="pt-56 sm:pt-64 pb-20 max-w-lg mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-10 border border-stone-200 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-[#CB9700]/15 text-[#CB9700] rounded-full flex items-center justify-center mx-auto border border-[#CB9700]/30">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-900">Sign In to View Orders</h1>
              <p className="text-xs text-stone-500 mt-2">
                Log in with your phone number or email to view past purchases and live delivery updates.
              </p>
            </div>
            <button
              onClick={openLoginModal}
              className="w-full py-3.5 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
            >
              Login / Sign Up
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between font-sans selection:bg-[#CB9700]/20">
      <Header />

      <main className="pt-56 sm:pt-64 lg:pt-72 pb-24 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">My Orders</h1>
            <p className="text-xs text-stone-500 mt-1">
              View and track all your luxury Le Damas confection purchases
            </p>
          </div>

          {/* Quick Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#CB9700] shadow-2xs"
            />
          </div>
        </div>

        {/* Flipkart / Amazon Style Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-stone-200 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#2C2927] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Orders ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('SHIPPED')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'SHIPPED'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>On The Way ({shippedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('DELIVERED')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'DELIVERED'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered ({deliveredCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('REFUNDED')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'REFUNDED'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refunds ({refundedCount})</span>
          </button>
        </div>

        {/* Orders Stacked List (Flipkart Style) */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#CB9700] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-stone-500">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-5 shadow-2xs max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-stone-900">No orders found</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {searchQuery || activeTab !== 'ALL'
                  ? 'No orders match your filter criteria.'
                  : 'You have not placed any orders yet. Explore our handcrafted Dubai chocolate collection!'}
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden hover:border-[#CB9700]/50 transition-all space-y-0"
              >
                {/* Flipkart Style Order Card Header Bar */}
                <div className="bg-stone-50/80 px-5 py-3.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-stone-900 text-sm">#{order.orderNumber}</span>
                    <span className="text-stone-300">&bull;</span>
                    <span className="text-stone-500">
                      Placed on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-stone-300">&bull;</span>
                    <span className="uppercase text-[11px] font-semibold text-stone-600 font-mono">
                      {order.paymentMethod || 'ONLINE'}
                    </span>
                  </div>

                  <div>{renderStatusBadge(order)}</div>
                </div>

                {/* Card Items Content Row */}
                <div className="p-5 divide-y divide-stone-100">
                  {((order.items && order.items.length > 0)
                    ? order.items
                    : [
                        {
                          id: `fallback_${order.id}`,
                          productName: 'Kunafa Pistachio Dark Chocolate',
                          variantName: '250g Box',
                          price: order.total || order.subtotal || 499,
                          quantity: 1,
                          image: '/Kunafa-Pistachio-Dark-Chocolate-1.png',
                        },
                      ]
                  ).map((item, idx) => {
                    const itemImg = getProductImage(item.image, item.productName);
                    return (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF6ED] shrink-0 border border-stone-200/80 shadow-2xs flex items-center justify-center p-1">
                            <Image
                              src={itemImg}
                              alt={item.productName || 'Kunafa Chocolate'}
                              fill
                              sizes="64px"
                              className="object-contain p-1 hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-serif font-bold text-stone-900 text-sm truncate">{item.productName}</h4>
                            <p className="text-stone-500 text-[11px] mt-0.5 font-medium">
                              {item.variantName || '250g Box'} &bull; Qty: {item.quantity || 1}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-mono font-bold text-stone-900 shrink-0 text-sm">
                          ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Flipkart Style Order Card Footer Action Bar */}
                <div className="bg-stone-50/50 px-5 py-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-stone-500 font-medium">Order Total:</span>
                    <span className="font-serif font-bold text-base text-stone-900">
                      ₹{Number(order.total || order.subtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-stone-900 text-stone-800 font-semibold transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#CB9700]" />
                      <span>Track Order</span>
                    </button>
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-4 py-2 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white font-semibold transition-all shadow-2xs cursor-pointer"
                    >
                      Buy Again
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Professional Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#CB9700] uppercase tracking-widest block">
                  LE DAMAS ORDER FULLFILLMENT
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Refund Notification Banner */}
            {(selectedOrder.orderStatus === 'REFUNDED' || selectedOrder.paymentStatus === 'REFUNDED' || selectedOrder.razorpayRefundId) && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300 space-y-2 text-xs text-amber-900">
                <div className="flex items-center space-x-2 font-bold text-amber-900">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>💰 Razorpay Refund Completed</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-stone-700">
                  {selectedOrder.razorpayRefundId && (
                    <p>Razorpay Refund ID: <strong>{selectedOrder.razorpayRefundId}</strong></p>
                  )}
                  <p>Amount Refunded: <strong>₹{Number(selectedOrder.refundAmount || selectedOrder.total || 0).toLocaleString('en-IN')}</strong></p>
                  {selectedOrder.refundReason && <p>Reason: <span className="italic">{selectedOrder.refundReason}</span></p>}
                </div>
              </div>
            )}

            {/* Clean 4-Step Flipkart Style Tracking Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Delivery Status Timeline</h4>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-4 text-xs">
                {/* Step 1: Confirmed */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Order Placed & Confirmed</p>
                      <p className="text-[11px] text-stone-500">Saved in PostgreSQL database</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">Completed</span>
                </div>

                {/* Step 2: Processing */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      ['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.orderStatus)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.orderStatus) ? '✓' : '2'}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Handcrafted & Cold-Chain Packed</p>
                      <p className="text-[11px] text-stone-500">Insulated temperature control</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600">
                    {['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.orderStatus) ? 'Done' : 'Pending'}
                  </span>
                </div>

                {/* Step 3: Shipped */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      ['SHIPPED', 'DELIVERED'].includes(selectedOrder.orderStatus)
                        ? 'bg-purple-600 text-white animate-bounce'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      🚚
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Shipped with Express Logistics</p>
                      <p className="text-[11px] text-stone-500">In transit to destination</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold ${
                    selectedOrder.orderStatus === 'SHIPPED' ? 'text-purple-700 uppercase tracking-wider' : 'text-stone-600'
                  }`}>
                    {selectedOrder.orderStatus === 'SHIPPED' ? 'In Transit' : ['DELIVERED'].includes(selectedOrder.orderStatus) ? 'Done' : 'Pending'}
                  </span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      selectedOrder.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">Delivered</p>
                      <p className="text-[11px] text-stone-500">Handed over to customer</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600">
                    {selectedOrder.orderStatus === 'DELIVERED' ? 'Delivered' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Order Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Items Ordered</h4>
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200 divide-y divide-stone-200/60 space-y-2.5">
                {((selectedOrder.items && selectedOrder.items.length > 0)
                  ? selectedOrder.items
                  : [
                      {
                        id: `modal_fallback_${selectedOrder.id}`,
                        productName: 'Kunafa Pistachio Dark Chocolate',
                        variantName: '250g Box',
                        price: selectedOrder.total || selectedOrder.subtotal || 499,
                        quantity: 1,
                        image: '/Kunafa-Pistachio-Dark-Chocolate-1.png',
                      },
                    ]
                ).map((item, idx) => {
                  const itemImg = getProductImage(item.image, item.productName);
                  return (
                    <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF6ED] shrink-0 border border-stone-200 p-1 flex items-center justify-center">
                          <Image
                            src={itemImg}
                            alt={item.productName}
                            fill
                            sizes="48px"
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-stone-900 truncate text-xs">{item.productName}</p>
                          <p className="text-[11px] text-stone-500 font-medium">
                            {item.variantName || '250g Box'} &bull; Qty: {item.quantity || 1}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-stone-900 text-xs shrink-0">
                        ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address & Payment Summary */}
            <div className="space-y-1 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <span className="font-bold text-stone-900 block mb-1">Shipping Address:</span>
              <p>{selectedOrder.customerName}</p>
              <p>{selectedOrder.street}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
              <p>Phone: +91 {selectedOrder.phone}</p>
              {selectedOrder.paymentId && (
                <p className="text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-200 mt-2">
                  Razorpay Payment ID: {selectedOrder.paymentId}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2C2927] text-white text-xs font-semibold hover:bg-[#CB9700] hover:text-black transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
